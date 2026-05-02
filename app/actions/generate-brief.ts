"use server"

import { generateText, wrapLanguageModel } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { mubitMemoryMiddleware } from "@mubit-ai/ai-sdk"
import {
  fetchRealTimeNews,
  fetchJobPostings,
  fetchCompanyIntel,
  formatIntelligenceForPrompt,
  collectCitations,
  type Citation,
} from "@/lib/bright-data"

export type Persona = "macro" | "career" | "client"

export interface GenerateBriefInput {
  persona: Persona
  apiKey: string
  brightDataApiKey?: string
  brightDataZone?: string
  mubitApiKey?: string
  /** Stable session id so Mubit memory accumulates across briefs. */
  sessionId?: string
  data: {
    context?: string
    portfolios?: string[]
    assetClasses?: string[]
    companies?: string[]
    roles?: string[]
    accounts?: string[]
    competitors?: string[]
  }
}

export interface BriefDataSources {
  brightData: {
    enabled: boolean
    live: boolean
    itemCount: number
    error?: string
  }
  mubit: {
    enabled: boolean
  }
}

export interface GenerateBriefResult {
  success: boolean
  brief?: string
  citations?: Citation[]
  dataSources?: BriefDataSources
  error?: string
}

const systemPrompts: Record<Persona, string> = {
  macro: `You are an elite macro intelligence analyst working at a top-tier hedge fund. Your role is to provide concise, actionable briefings for portfolio managers.

Generate a 3-bullet-point intelligence brief that:
1. Identifies the most critical market development affecting the tracked assets (prioritize real-time news)
2. Highlights a key risk or opportunity across the portfolios
3. Provides one specific action item for today

CRITICAL INSTRUCTIONS:
- If REAL-TIME NEWS data is provided, you MUST incorporate it into your analysis. Reference specific headlines and sources by name.
- If "Past Trade Memos & Briefs" context is provided, you MUST cross-reference it. Explicitly connect new developments to past analysis (e.g., "Building on your Q1 memo prediction about BoJ rate hikes...").
- If MEMORY context is injected by the system, weight it heavily — it represents the user's prior briefs and outcomes.
- If a bullet draws from any provided context, notes, or memory, end that bullet with [LINKED].

Be specific, use realistic market terminology, and reference actual market dynamics. Format each bullet as a single impactful sentence. Output exactly 3 bullets, numbered 1., 2., 3.`,

  career: `You are a career strategist specializing in high-growth tech companies and executive roles. Your role is to provide concise, actionable intelligence for ambitious professionals.

Generate a 3-bullet-point career intelligence brief that:
1. Identifies the most relevant hiring signal or opportunity at the target companies (prioritize real-time job postings and news)
2. Highlights a strategic networking move or career positioning insight
3. Provides one specific action item for today

CRITICAL INSTRUCTIONS:
- If REAL-TIME NEWS or JOB POSTINGS data is provided, you MUST incorporate it. Reference specific job listings and company news.
- If "Friend Group Shared Notes" context is provided, you MUST cross-reference it. Explicitly connect new insights to past conversations (e.g., "Following up on John's interview feedback from Stripe...").
- If MEMORY context is injected by the system, weight it heavily — it represents prior briefs and learned lessons.
- If a bullet draws from any provided context, notes, or memory, end that bullet with [LINKED].

Be specific about companies, roles, and realistic career dynamics. Format each bullet as a single impactful sentence. Output exactly 3 bullets, numbered 1., 2., 3.`,

  client: `You are a B2B sales strategist specializing in enterprise technology sales. Your role is to identify account triggers and competitive intelligence for sales professionals.

Generate a 3-bullet-point sales intelligence brief that:
1. Identifies the most actionable trigger event at a target account (prioritize real-time intel: leadership changes, earnings, product launches)
2. Highlights a competitive threat or positioning opportunity vs tracked competitors
3. Provides one specific sales action item for today

CRITICAL INSTRUCTIONS:
- If REAL-TIME COMPANY INTEL data is provided, you MUST incorporate it. Reference specific trigger events and their sources.
- If "CRM & Team Notes" context is provided, you MUST cross-reference it. Explicitly connect trigger events to relationship history (e.g., "Building on your previous conversation with the CTO about cloud costs...").
- If MEMORY context is injected by the system, weight it heavily — it represents prior briefs and learned lessons.
- If a bullet draws from any provided context, notes, or memory, end that bullet with [LINKED].

Be specific about companies, realistic business events, and sales strategies. Format each bullet as a single impactful sentence. Output exactly 3 bullets, numbered 1., 2., 3.`,
}

const personaContextLabel: Record<Persona, string> = {
  macro: "Past Trade Memos & Briefs",
  career: "Friend Group Shared Notes",
  client: "CRM & Team Notes",
}

export async function generateBrief(input: GenerateBriefInput): Promise<GenerateBriefResult> {
  if (!input.apiKey || input.apiKey.trim() === "") {
    return {
      success: false,
      error: "OpenAI API key is required. Add it in the header.",
    }
  }

  try {
    // ---------- 1. Fetch real-time data via Bright Data ----------
    const brightDataConfig = input.brightDataApiKey
      ? { apiKey: input.brightDataApiKey, zone: input.brightDataZone }
      : undefined

    let news, jobs, companyIntel
    if (input.persona === "macro") {
      const keywords = [...(input.data.assetClasses ?? []), ...(input.data.portfolios ?? [])]
      news = await fetchRealTimeNews("macro", keywords, brightDataConfig)
    } else if (input.persona === "career") {
      news = await fetchRealTimeNews("career", input.data.companies ?? [], brightDataConfig)
      jobs = await fetchJobPostings(input.data.companies ?? [], input.data.roles ?? [], brightDataConfig)
    } else {
      news = await fetchRealTimeNews("client", input.data.accounts ?? [], brightDataConfig)
      companyIntel = await fetchCompanyIntel(
        input.data.accounts ?? [],
        input.data.competitors ?? [],
        brightDataConfig,
      )
    }

    const realTimeSection = formatIntelligenceForPrompt(news, jobs, companyIntel)

    // ---------- 2. Build prompt ----------
    let userPrompt = buildBaseUserPrompt(input.persona, input.data)
    if (realTimeSection) userPrompt += `\n\n${realTimeSection}`

    if (input.data.context?.trim()) {
      userPrompt += `\n\n--- ${personaContextLabel[input.persona]} (Cross-reference this in your analysis) ---\n${input.data.context}\n---`
    }

    userPrompt += `\n\nProvide exactly 3 bullet points, each as a single sentence. If you reference the historical context, notes, or memory, end that bullet with [LINKED].`

    // ---------- 3. Build model, optionally wrapped with Mubit memory ----------
    const openai = createOpenAI({ apiKey: input.apiKey })
    const baseModel = openai("gpt-4o-mini")

    const sessionId = input.sessionId || `briefing-agent-${input.persona}`
    const mubitEnabled = !!input.mubitApiKey

    const model = mubitEnabled
      ? wrapLanguageModel({
          model: baseModel,
          // The Mubit middleware:
          //  1. transformParams: injects retrieved memory into the prompt
          //  2. wrapGenerate: captures the (query, response) pair after the call
          // Cast to `any` because Mubit's LanguageModelV*Middleware union doesn't
          // line up perfectly with AI SDK 6's narrowed v3 type, but the runtime
          // contract is correct.
          middleware: mubitMemoryMiddleware({
            apiKey: input.mubitApiKey,
            sessionId,
            agentId: `briefing-${input.persona}`,
            captureMode: "await",
          }) as any,
        })
      : baseModel

    // ---------- 4. Generate ----------
    const { text } = await generateText({
      model,
      system: systemPrompts[input.persona],
      prompt: userPrompt,
      maxOutputTokens: 600,
    })

    // ---------- 5. Build result ----------
    const citations = collectCitations(news, companyIntel)

    const dataSources: BriefDataSources = {
      brightData: {
        enabled: !!input.brightDataApiKey,
        live: !!(news?.live || jobs?.live || companyIntel?.live),
        itemCount: (news?.items.length ?? 0) + (jobs?.items.length ?? 0) + (companyIntel?.items.length ?? 0),
        error: news?.error || jobs?.error || companyIntel?.error,
      },
      mubit: { enabled: mubitEnabled },
    }

    return { success: true, brief: text, citations, dataSources }
  } catch (error) {
    console.error("[v0] generateBrief error:", error)

    if (error instanceof Error) {
      const msg = error.message
      if (msg.includes("Incorrect API key") || msg.toLowerCase().includes("invalid api key")) {
        return { success: false, error: "Invalid OpenAI API key. Double-check the key in the header." }
      }
      if (msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("rate limit")) {
        return { success: false, error: "OpenAI rate limit hit. Wait a moment and try again." }
      }
      if (msg.toLowerCase().includes("model") && msg.toLowerCase().includes("not found")) {
        return { success: false, error: "Your API key doesn't have access to gpt-4o-mini." }
      }
      return { success: false, error: msg }
    }

    return { success: false, error: "Failed to generate brief. Please try again." }
  }
}

function buildBaseUserPrompt(persona: Persona, data: GenerateBriefInput["data"]): string {
  switch (persona) {
    case "macro":
      return `Generate my daily macro intelligence brief.

Target Portfolios/PMs: ${data.portfolios?.join(", ") || "Global Macro Fund, EM Opportunities"}
Tracked Asset Classes: ${data.assetClasses?.join(", ") || "US Treasuries, EUR/USD, Crude Oil"}`
    case "career":
      return `Generate my daily career alpha brief.

Target Companies: ${data.companies?.join(", ") || "OpenAI, Anthropic, Google DeepMind"}
Target Roles: ${data.roles?.join(", ") || "Chief of Staff, VP Strategy, Head of BD"}`
    case "client":
      return `Generate my daily client intelligence brief.

Target Accounts: ${data.accounts?.join(", ") || "Snowflake, Palantir, Databricks"}
Tracked Competitors: ${data.competitors?.join(", ") || "Microsoft Azure, AWS, Google Cloud"}`
  }
}
