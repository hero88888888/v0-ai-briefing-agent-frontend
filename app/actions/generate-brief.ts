"use server"

import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { fetchRealTimeNews, fetchJobPostings, fetchCompanyIntel, formatIntelligenceForPrompt } from "@/lib/bright-data"
import { storeMemory, recallMemories, formatMemoryForDisplay } from "@/lib/mubit-memory"

type Persona = "macro" | "career" | "client"

interface GenerateBriefInput {
  persona: Persona
  apiKey: string
  brightDataApiKey?: string
  mubitApiKey?: string
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

const systemPrompts: Record<Persona, string> = {
  macro: `You are an elite macro intelligence analyst working at a top-tier hedge fund. Your role is to provide concise, actionable briefings for portfolio managers.

Based on the provided portfolios/PMs, tracked asset classes, and REAL-TIME MARKET DATA, generate a 3-bullet-point intelligence brief that:
1. Identifies the most critical market development affecting the tracked assets (prioritize real-time news)
2. Highlights a key risk or opportunity across the portfolios
3. Provides one specific action item for today

CRITICAL INSTRUCTIONS:
- If REAL-TIME NEWS data is provided, you MUST incorporate it into your analysis. Reference specific headlines and sources.
- If "Past Trade Memos & Briefs" context is provided, you MUST cross-reference with those notes. Explicitly connect new developments to past analysis (e.g., "Building on your Q1 memo prediction about BoJ rate hikes...").
- If MUBIT MEMORY context is provided, leverage past brief outcomes to inform current recommendations.
- If a bullet draws from the provided context/notes, end that bullet with [LINKED] marker.

Be specific, use realistic market terminology, and reference actual market dynamics. Format each bullet as a single impactful sentence.`,

  career: `You are a career strategist specializing in high-growth tech companies and executive roles. Your role is to provide concise, actionable intelligence for ambitious professionals.

Based on the provided target companies, target roles, and REAL-TIME JOB MARKET DATA, generate a 3-bullet-point career intelligence brief that:
1. Identifies the most relevant hiring signal or opportunity at the target companies (prioritize real-time job postings and news)
2. Highlights a strategic networking move or career positioning insight
3. Provides one specific action item for today

CRITICAL INSTRUCTIONS:
- If REAL-TIME NEWS or JOB POSTINGS data is provided, you MUST incorporate it. Reference specific job listings and company news.
- If "Friend Group Shared Notes" context is provided, you MUST cross-reference with those notes. Explicitly connect new insights to past conversations (e.g., "Following up on John's interview feedback from Stripe...").
- If MUBIT MEMORY context is provided, leverage past brief outcomes to inform current recommendations.
- If a bullet draws from the provided context/notes, end that bullet with [LINKED] marker.

Be specific about companies, roles, and realistic career dynamics. Format each bullet as a single impactful sentence.`,

  client: `You are a B2B sales strategist specializing in enterprise technology sales. Your role is to identify account triggers and competitive intelligence for sales professionals.

Based on the provided target accounts, tracked competitors, and REAL-TIME COMPANY INTELLIGENCE, generate a 3-bullet-point sales intelligence brief that:
1. Identifies the most actionable trigger event at a target account (prioritize real-time company intel: leadership changes, earnings, product launches)
2. Highlights a competitive threat or positioning opportunity vs tracked competitors
3. Provides one specific sales action item for today

CRITICAL INSTRUCTIONS:
- If REAL-TIME COMPANY INTEL data is provided, you MUST incorporate it. Reference specific trigger events and their sources.
- If "CRM & Team Notes" context is provided, you MUST cross-reference with those notes. Explicitly connect trigger events to relationship history (e.g., "Building on your previous conversation with the CTO about cloud costs...").
- If MUBIT MEMORY context is provided, leverage past brief outcomes to inform current recommendations.
- If a bullet draws from the provided context/notes, end that bullet with [LINKED] marker.

Be specific about companies, realistic business events, and sales strategies. Format each bullet as a single impactful sentence.`
}

async function buildEnhancedPrompt(
  persona: Persona, 
  data: GenerateBriefInput["data"],
  brightDataApiKey?: string,
  mubitApiKey?: string
): Promise<string> {
  let prompt = ""
  
  // Fetch real-time data from Bright Data
  const brightDataConfig = brightDataApiKey ? { apiToken: brightDataApiKey } : undefined
  
  let realTimeSection = ""
  
  if (persona === "macro") {
    const keywords = [...(data.assetClasses || []), ...(data.portfolios || [])]
    const news = await fetchRealTimeNews("macro", keywords, brightDataConfig)
    realTimeSection = formatIntelligenceForPrompt(news)
    
    prompt = `Generate my daily macro intelligence brief.

Target Portfolios/PMs: ${data.portfolios?.join(", ") || "Global Macro Fund, EM Opportunities"}
Tracked Asset Classes: ${data.assetClasses?.join(", ") || "US Treasuries, EUR/USD, Crude Oil"}`
  } else if (persona === "career") {
    const news = await fetchRealTimeNews("career", data.companies || [], brightDataConfig)
    const jobs = await fetchJobPostings(data.companies || [], data.roles || [], brightDataConfig)
    realTimeSection = formatIntelligenceForPrompt(news, jobs)
    
    prompt = `Generate my daily career alpha brief.

Target Companies: ${data.companies?.join(", ") || "OpenAI, Anthropic, Google DeepMind"}
Target Roles: ${data.roles?.join(", ") || "Chief of Staff, VP Strategy, Head of BD"}`
  } else {
    const news = await fetchRealTimeNews("client", data.accounts || [], brightDataConfig)
    const companyIntel = await fetchCompanyIntel(data.accounts || [], data.competitors || [], brightDataConfig)
    realTimeSection = formatIntelligenceForPrompt(news, undefined, companyIntel)
    
    prompt = `Generate my daily client intelligence brief.

Target Accounts: ${data.accounts?.join(", ") || "Snowflake, Palantir, Databricks"}
Tracked Competitors: ${data.competitors?.join(", ") || "Microsoft Azure, AWS, Google Cloud"}`
  }
  
  // Add real-time data section
  if (realTimeSection) {
    prompt += `\n\n${realTimeSection}`
  }
  
  // Recall relevant memories from Mubit
  if (mubitApiKey) {
    const targets = persona === "macro" 
      ? [...(data.portfolios || []), ...(data.assetClasses || [])]
      : persona === "career"
        ? [...(data.companies || []), ...(data.roles || [])]
        : [...(data.accounts || []), ...(data.competitors || [])]
    
    const memories = await recallMemories(targets.join(", "), persona, mubitApiKey)
    if (memories.length > 0) {
      prompt += `\n\n=== MUBIT MEMORY (Past Briefs & Outcomes) ===\n${formatMemoryForDisplay(memories)}\n===`
    }
  }
  
  // Add user's manual context/notes
  const contextLabel = persona === "macro" 
    ? "Past Trade Memos & Briefs"
    : persona === "career"
      ? "Friend Group Shared Notes"
      : "CRM & Team Notes"
  
  if (data.context?.trim()) {
    prompt += `\n\n--- ${contextLabel} (Cross-reference this in your analysis) ---\n${data.context}\n---`
  }
  
  prompt += `\n\nProvide exactly 3 bullet points, each as a single sentence. If you reference the historical context, notes, or Mubit memory, end that bullet with [LINKED].`
  
  return prompt
}

export async function generateBrief(input: GenerateBriefInput): Promise<{ 
  success: boolean
  brief?: string
  briefId?: string
  dataSources?: {
    brightData: boolean
    mubit: boolean
  }
  error?: string 
}> {
  try {
    if (!input.apiKey || input.apiKey.trim() === "") {
      return { 
        success: false, 
        error: "OpenAI API key is required. Please enter your API key in the header." 
      }
    }

    const openai = createOpenAI({
      apiKey: input.apiKey,
    })

    // Build enhanced prompt with real-time data and memory
    const enhancedPrompt = await buildEnhancedPrompt(
      input.persona,
      input.data,
      input.brightDataApiKey,
      input.mubitApiKey
    )

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompts[input.persona],
      prompt: enhancedPrompt,
      maxOutputTokens: 600,
    })

    // Store the generated brief in Mubit memory for future reference
    let briefId: string | undefined
    if (input.mubitApiKey) {
      const targets = input.persona === "macro"
        ? [...(input.data.portfolios || []), ...(input.data.assetClasses || [])]
        : input.persona === "career"
          ? [...(input.data.companies || []), ...(input.data.roles || [])]
          : [...(input.data.accounts || []), ...(input.data.competitors || [])]
      
      briefId = await storeMemory({
        type: "brief",
        persona: input.persona,
        content: text,
        metadata: {
          createdAt: new Date().toISOString(),
          targets,
          outcome: "pending"
        }
      }, input.mubitApiKey)
    }

    return { 
      success: true, 
      brief: text,
      briefId,
      dataSources: {
        brightData: !!input.brightDataApiKey || true, // Always true since we use mock data
        mubit: !!input.mubitApiKey
      }
    }
  } catch (error) {
    console.error("Error generating brief:", error)
    
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return { success: false, error: "Invalid API key. Please check your OpenAI API key." }
      }
      if (error.message.includes("quota") || error.message.includes("rate")) {
        return { success: false, error: "API rate limit exceeded. Please try again later." }
      }
      return { success: false, error: error.message }
    }
    
    return { success: false, error: "Failed to generate brief. Please try again." }
  }
}
