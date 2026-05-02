"use server"

import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

type Persona = "macro" | "career" | "client"

interface GenerateBriefInput {
  persona: Persona
  apiKey: string
  data: {
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

Based on the provided portfolios/PMs and tracked asset classes, generate a 3-bullet-point intelligence brief that:
1. Identifies the most critical market development affecting the tracked assets
2. Highlights a key risk or opportunity across the portfolios
3. Provides one specific action item for today

Be specific, use realistic market terminology, and reference actual market dynamics. Format each bullet as a single impactful sentence.`,

  career: `You are a career strategist specializing in high-growth tech companies and executive roles. Your role is to provide concise, actionable intelligence for ambitious professionals.

Based on the provided target companies and target roles, generate a 3-bullet-point career intelligence brief that:
1. Identifies the most relevant hiring signal or opportunity at the target companies
2. Highlights a strategic networking move or career positioning insight
3. Provides one specific action item for today

Be specific about companies, roles, and realistic career dynamics. Format each bullet as a single impactful sentence.`,

  client: `You are a B2B sales strategist specializing in enterprise technology sales. Your role is to identify account triggers and competitive intelligence for sales professionals.

Based on the provided target accounts and tracked competitors, generate a 3-bullet-point sales intelligence brief that:
1. Identifies the most actionable trigger event at a target account (leadership change, earnings, product launch, etc.)
2. Highlights a competitive threat or positioning opportunity vs tracked competitors
3. Provides one specific sales action item for today

Be specific about companies, realistic business events, and sales strategies. Format each bullet as a single impactful sentence.`
}

function buildUserPrompt(persona: Persona, data: GenerateBriefInput["data"]): string {
  switch (persona) {
    case "macro":
      return `Generate my daily macro intelligence brief.

Target Portfolios/PMs: ${data.portfolios?.join(", ") || "Global Macro Fund, EM Opportunities"}
Tracked Asset Classes: ${data.assetClasses?.join(", ") || "US Treasuries, EUR/USD, Crude Oil"}

Provide exactly 3 bullet points, each as a single sentence.`

    case "career":
      return `Generate my daily career alpha brief.

Target Companies: ${data.companies?.join(", ") || "OpenAI, Anthropic, Google DeepMind"}
Target Roles: ${data.roles?.join(", ") || "Chief of Staff, VP Strategy, Head of BD"}

Provide exactly 3 bullet points, each as a single sentence.`

    case "client":
      return `Generate my daily client intelligence brief.

Target Accounts: ${data.accounts?.join(", ") || "Snowflake, Palantir, Databricks"}
Tracked Competitors: ${data.competitors?.join(", ") || "Microsoft Azure, AWS, Google Cloud"}

Provide exactly 3 bullet points, each as a single sentence.`
  }
}

export async function generateBrief(input: GenerateBriefInput): Promise<{ 
  success: boolean
  brief?: string
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

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompts[input.persona],
      prompt: buildUserPrompt(input.persona, input.data),
      maxOutputTokens: 500,
    })

    return { success: true, brief: text }
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
