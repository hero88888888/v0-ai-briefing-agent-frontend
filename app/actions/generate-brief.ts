"use server"

import { generateText, wrapLanguageModel } from "ai"
import { mubitMemoryMiddleware } from "@mubit-ai/ai-sdk"
import { createClient } from "@/lib/supabase/server"
import { canUseBrightData, canUseMubit, getPlan } from "@/lib/plans"
import {
  fetchRealTimeNews,
  fetchJobPostings,
  fetchCompanyIntel,
  formatIntelligenceForPrompt,
  collectCitations,
  type Citation,
  type FetchResult,
  type NewsItem,
  type JobPosting,
  type CompanyIntel,
} from "@/lib/bright-data"

export type Persona = "macro" | "career" | "client"

export interface GenerateBriefInput {
  persona: Persona
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
  brightData: { enabled: boolean; live: boolean; itemCount: number; error?: string }
  mubit: { enabled: boolean }
}

export interface GenerateBriefResult {
  success: boolean
  brief?: string
  briefId?: string
  citations?: Citation[]
  dataSources?: BriefDataSources
  usage?: { used: number; limit: number | null }
  error?: string
  errorCode?:
    | "not_authenticated"
    | "limit_reached"
    | "ai_error"
    | "internal"
}

// ------------------ System prompts ------------------

const SYSTEM_PROMPTS: Record<Persona, string> = {
  macro: `You are an elite macro intelligence analyst at a top-tier hedge fund. Generate a sharp, actionable 3-bullet briefing for portfolio managers.

Each bullet must:
- Be a single dense sentence with specific numbers, names, or levels
- Identify a market development, risk/opportunity, or actionable trade
- Use real market terminology

If the user provided "Past Trade Memos & Briefs", you MUST cross-reference them and tag those bullets with [LINKED] (e.g. "Building on your Q1 BoJ memo...").
If REAL-TIME NEWS is provided, you MUST weave in the most relevant items and tag those bullets with [SOURCE: <source name>].

Output exactly 3 bullets, numbered 1., 2., 3. — no preamble, no closing remarks.`,

  career: `You are a career strategist for ambitious operators in high-growth tech. Generate a sharp 3-bullet briefing.

Each bullet must:
- Be a single dense sentence with specific company names, roles, and signals
- Identify a hiring signal, networking move, or career action

If "Friend Group Shared Notes" are provided, you MUST cross-reference them and tag those bullets with [LINKED].
If REAL-TIME JOB POSTINGS or NEWS are provided, weave them in and tag those bullets with [SOURCE: <source name>].

Output exactly 3 bullets, numbered 1., 2., 3. — no preamble, no closing remarks.`,

  client: `You are a B2B sales strategist focused on enterprise tech. Generate a sharp 3-bullet briefing.

Each bullet must:
- Be a single dense sentence with specific account names, trigger events, and a sales motion
- Identify a trigger event, competitive threat, or sales action

If "CRM & Team Notes" are provided, you MUST cross-reference them and tag those bullets with [LINKED] (e.g. "Building on your conversation with the CTO about cloud costs...").
If REAL-TIME ACCOUNT TRIGGERS or COMPETITIVE INTEL are provided, weave them in and tag those bullets with [SOURCE: <source name>].

Output exactly 3 bullets, numbered 1., 2., 3. — no preamble, no closing remarks.`,
}

const PERSONA_CONTEXT_LABEL: Record<Persona, string> = {
  macro: "Past Trade Memos & Briefs",
  career: "Friend Group Shared Notes",
  client: "CRM & Team Notes",
}

// ------------------ Helpers ------------------

function currentMonthKey(): string {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`
}

function buildBaseUserPrompt(persona: Persona, data: GenerateBriefInput["data"]): string {
  switch (persona) {
    case "macro":
      return `Generate today's macro intelligence brief.

Target Portfolios/PMs: ${data.portfolios?.join(", ") || "Global Macro Fund"}
Tracked Asset Classes: ${data.assetClasses?.join(", ") || "US Treasuries, EUR/USD"}`
    case "career":
      return `Generate today's career alpha brief.

Target Companies: ${data.companies?.join(", ") || "OpenAI, Anthropic"}
Target Roles: ${data.roles?.join(", ") || "Chief of Staff"}`
    case "client":
      return `Generate today's client intelligence brief.

Target Accounts: ${data.accounts?.join(", ") || "Snowflake, Palantir"}
Tracked Competitors: ${data.competitors?.join(", ") || "Microsoft Azure"}`
  }
}

// ------------------ Main action ------------------

export async function generateBrief(input: GenerateBriefInput): Promise<GenerateBriefResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated", errorCode: "not_authenticated" }
  }

  // Load profile for plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single()

  const plan = getPlan(profile?.plan)

  // ------ Enforce monthly brief limit ------
  const month = currentMonthKey()
  const { data: usageRow } = await supabase
    .from("usage")
    .select("briefs_count")
    .eq("user_id", user.id)
    .eq("month", month)
    .maybeSingle()

  const used = usageRow?.briefs_count ?? 0
  if (plan.monthlyBriefLimit !== null && used >= plan.monthlyBriefLimit) {
    return {
      success: false,
      errorCode: "limit_reached",
      error: `You've used all ${plan.monthlyBriefLimit} briefs on the ${plan.name} plan this month. Upgrade to Pro for unlimited briefs.`,
      usage: { used, limit: plan.monthlyBriefLimit },
    }
  }

  // ------ Optionally fetch live intel (Pro/Team only) ------
  const brightDataApiKey = process.env.BRIGHT_DATA_API_KEY
  const brightDataZone = process.env.BRIGHT_DATA_ZONE
  const brightDataAllowed = canUseBrightData(plan.id) && Boolean(brightDataApiKey)
  const bdConfig = brightDataAllowed
    ? { apiKey: brightDataApiKey!, zone: brightDataZone }
    : undefined

  let news: FetchResult<NewsItem> | undefined
  let jobs: FetchResult<JobPosting> | undefined
  let companyIntel: FetchResult<CompanyIntel> | undefined

  try {
    if (input.persona === "macro") {
      const keywords = [
        ...(input.data.assetClasses ?? []),
        ...(input.data.portfolios ?? []),
      ]
      news = await fetchRealTimeNews("macro", keywords, bdConfig)
    } else if (input.persona === "career") {
      news = await fetchRealTimeNews("career", input.data.companies ?? [], bdConfig)
      jobs = await fetchJobPostings(input.data.companies ?? [], input.data.roles ?? [], bdConfig)
    } else {
      news = await fetchRealTimeNews("client", input.data.accounts ?? [], bdConfig)
      companyIntel = await fetchCompanyIntel(
        input.data.accounts ?? [],
        input.data.competitors ?? [],
        bdConfig,
      )
    }
  } catch (err) {
    console.error("[v0] Bright Data fetch failed:", err)
  }

  // ------ Build prompt ------
  const intelSection = formatIntelligenceForPrompt(news, jobs, companyIntel)
  let userPrompt = buildBaseUserPrompt(input.persona, input.data)
  if (intelSection) userPrompt += `\n\n${intelSection}`
  if (input.data.context?.trim()) {
    userPrompt += `\n\n--- ${PERSONA_CONTEXT_LABEL[input.persona]} (cross-reference; mark [LINKED] when used) ---\n${input.data.context.trim()}\n---`
  }
  userPrompt += `\n\nProvide exactly 3 bullets, numbered 1., 2., 3. Use [LINKED] for context references and [SOURCE: <name>] for live data citations.`

  // ------ Build model (with optional Mubit memory middleware) ------
  const mubitApiKey = process.env.MUBIT_API_KEY
  const mubitAllowed = canUseMubit(plan.id) && Boolean(mubitApiKey)

  // Use AI Gateway by default (zero-config); model is just a string
  const baseModel = "openai/gpt-4o-mini"

  // The Mubit middleware union doesn't quite line up with AI SDK 6's narrowed
  // v3 type, but the runtime contract is correct.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelToUse: any = mubitAllowed
    ? wrapLanguageModel({
        model: baseModel,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        middleware: mubitMemoryMiddleware({
          apiKey: mubitApiKey!,
          sessionId: `briefing-${input.persona}-${user.id}`,
          agentId: `briefing-${input.persona}`,
          captureMode: "await",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any,
      })
    : baseModel

  // ------ Generate ------
  let briefContent: string
  try {
    const result = await generateText({
      model: modelToUse,
      system: SYSTEM_PROMPTS[input.persona],
      prompt: userPrompt,
      maxOutputTokens: 600,
    })
    briefContent = result.text.trim()
  } catch (err) {
    console.error("[v0] AI generation error:", err)
    const message = err instanceof Error ? err.message : "AI generation failed"
    return { success: false, error: message, errorCode: "ai_error" }
  }

  if (!briefContent) {
    return { success: false, error: "Empty response from AI", errorCode: "ai_error" }
  }

  // ------ Persist brief & bump usage ------
  const citations = collectCitations(news, companyIntel)
  const dataSources: BriefDataSources = {
    brightData: {
      enabled: brightDataAllowed,
      live: !!(news?.live || jobs?.live || companyIntel?.live),
      itemCount: (news?.items.length ?? 0) + (jobs?.items.length ?? 0) + (companyIntel?.items.length ?? 0),
      error: news?.error || jobs?.error || companyIntel?.error,
    },
    mubit: { enabled: mubitAllowed },
  }

  const { data: insertedBrief } = await supabase
    .from("briefs")
    .insert({
      user_id: user.id,
      persona: input.persona,
      content: briefContent,
      citations: citations as unknown as object[],
      data_sources: dataSources as unknown as object,
      inputs: input.data as unknown as object,
    })
    .select("id")
    .single()

  await supabase
    .from("usage")
    .upsert(
      { user_id: user.id, month, briefs_count: used + 1, updated_at: new Date().toISOString() },
      { onConflict: "user_id,month" },
    )

  return {
    success: true,
    brief: briefContent,
    briefId: insertedBrief?.id,
    citations,
    dataSources,
    usage: { used: used + 1, limit: plan.monthlyBriefLimit },
  }
}

// ------------------ Persistence helpers ------------------

export async function saveDashboardConfig(
  persona: Persona,
  config: Record<string, unknown>,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }

  const { error } = await supabase.from("dashboard_configs").upsert(
    {
      user_id: user.id,
      persona,
      config,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,persona" },
  )

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function deleteBrief(briefId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }

  const { error } = await supabase.from("briefs").delete().eq("id", briefId).eq("user_id", user.id)
  if (error) return { success: false, error: error.message }
  return { success: true }
}
