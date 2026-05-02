"use server"

// Mubit integration for persistent operational memory
// Provides: Execution history, associative retrieval, outcome tracking

import { remember, recall, getContext } from "@mubit-ai/ai-sdk"

export interface MemoryItem {
  id: string
  type: "brief" | "decision" | "outcome" | "note"
  persona: "macro" | "career" | "client"
  content: string
  metadata: {
    createdAt: string
    targets?: string[]
    outcome?: "success" | "failure" | "pending"
    linkedBriefs?: string[]
  }
}

// Store a new memory item (brief, decision, outcome)
export async function storeMemory(
  item: Omit<MemoryItem, "id">,
  mubitApiKey?: string
): Promise<string> {
  if (!mubitApiKey) {
    // Return mock ID when no API key
    return `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  }

  try {
    const result = await remember({
      content: item.content,
      metadata: {
        type: item.type,
        persona: item.persona,
        ...item.metadata
      }
    })
    return result.id
  } catch (error) {
    console.error("Mubit store error:", error)
    return `mem_local_${Date.now()}`
  }
}

// Recall relevant memories based on query
export async function recallMemories(
  query: string,
  persona: "macro" | "career" | "client",
  mubitApiKey?: string
): Promise<MemoryItem[]> {
  if (!mubitApiKey) {
    // Return empty when no API key - will use local context instead
    return []
  }

  try {
    const results = await recall({
      query,
      filter: { persona },
      limit: 5
    })
    
    return results.map((r: { id: string; content: string; metadata: Record<string, unknown> }) => ({
      id: r.id,
      type: r.metadata.type as MemoryItem["type"],
      persona: r.metadata.persona as MemoryItem["persona"],
      content: r.content,
      metadata: {
        createdAt: r.metadata.createdAt as string,
        targets: r.metadata.targets as string[],
        outcome: r.metadata.outcome as MemoryItem["metadata"]["outcome"],
        linkedBriefs: r.metadata.linkedBriefs as string[]
      }
    }))
  } catch (error) {
    console.error("Mubit recall error:", error)
    return []
  }
}

// Get model-ready context from memory
export async function getMemoryContext(
  persona: "macro" | "career" | "client",
  targets: string[],
  mubitApiKey?: string
): Promise<string> {
  if (!mubitApiKey) {
    return ""
  }

  try {
    const context = await getContext({
      filter: { persona },
      relevantTo: targets.join(", "),
      maxTokens: 2000
    })
    
    return context.formattedContext || ""
  } catch (error) {
    console.error("Mubit context error:", error)
    return ""
  }
}

// Format memory for display in UI
export function formatMemoryForDisplay(memories: MemoryItem[]): string {
  if (memories.length === 0) return ""
  
  return memories.map(m => {
    const typeLabel = {
      brief: "Past Brief",
      decision: "Decision",
      outcome: "Outcome",
      note: "Note"
    }[m.type]
    
    const outcomeIcon = m.metadata.outcome === "success" ? "+" : 
                        m.metadata.outcome === "failure" ? "-" : "?"
    
    return `[${typeLabel}] ${m.metadata.createdAt}\n${m.content}${m.metadata.outcome ? ` (${outcomeIcon})` : ""}`
  }).join("\n\n")
}

// Track brief generation outcome for learning
export async function trackOutcome(
  briefId: string,
  outcome: "success" | "failure" | "pending",
  notes?: string,
  mubitApiKey?: string
): Promise<void> {
  if (!mubitApiKey) return

  try {
    await remember({
      content: notes || `Brief ${briefId} marked as ${outcome}`,
      metadata: {
        type: "outcome",
        linkedBriefId: briefId,
        outcome,
        createdAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error("Mubit outcome tracking error:", error)
  }
}
