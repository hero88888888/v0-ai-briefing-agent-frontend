"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { Activity, Zap } from "lucide-react"
import { PersonaToggle } from "@/components/persona-toggle"
import { MacroDashboard } from "@/components/macro-dashboard"
import { CareerDashboard } from "@/components/career-dashboard"
import { ClientDashboard } from "@/components/client-dashboard"
import { BriefModal } from "@/components/brief-modal"
import { ApiKeyInput } from "@/components/api-key-input"
import { BriefHistory, type SavedBrief } from "@/components/brief-history"
import { useLocalStorage } from "@/hooks/use-local-storage"
import {
  generateBrief,
  type BriefDataSources,
  type Persona,
} from "./actions/generate-brief"
import type { Citation } from "@/lib/bright-data"

interface DashboardData {
  macro: { portfolios: string[]; assetClasses: string[]; context: string }
  career: { companies: string[]; roles: string[]; context: string }
  client: { accounts: string[]; competitors: string[]; context: string }
}

const personaConfig = {
  macro: { title: "Macro Intelligence", description: "Track markets, portfolios, and macro events" },
  career: { title: "Career Alpha", description: "Monitor opportunities, companies, and career moves" },
  client: { title: "Client Intelligence", description: "Track accounts, competitors, and sales triggers" },
}

const DEFAULT_DASHBOARD_DATA: DashboardData = {
  macro: {
    portfolios: ["Global Macro Fund", "EM Opportunities"],
    assetClasses: ["US Treasuries", "EUR/USD", "Crude Oil"],
    context: `Q1 2024 Trade Memo (March 15):
- Predicted BoJ would delay rate hikes until Q3 due to weak wage growth data
- Positioned long USD/JPY at 148.50, target 155
- Flagged China property sector as key EM risk factor

Q4 2023 Review (Dec 20):
- Called the Fed pivot correctly, trimmed duration underweight in Nov
- Crude oil positioning was wrong - expected $90+ but got $70s
- EM local currency bonds outperformed, should have had larger allocation

Weekly Note (April 2):
- ECB likely to cut before Fed based on inflation trajectory
- Watch German manufacturing PMI for EUR direction
- Treasury 10Y resistance at 4.50%, support at 4.20%`,
  },
  career: {
    companies: ["OpenAI", "Anthropic", "Google DeepMind"],
    roles: ["Chief of Staff", "VP Strategy", "Head of BD"],
    context: `Network Intel - April 2024:

John (ex-Stripe):
- Interviewed at Stripe last week for VP Ops role
- Said they're pausing mid-level hires but still backfilling senior roles
- Hiring manager mentioned Q3 IPO prep is driving urgency

Sarah (Google DeepMind):
- DeepMind spinning up new enterprise sales team
- Looking for people with both technical + GTM experience
- Dario from Anthropic apparently poaching their safety researchers

LinkedIn Notes:
- OpenAI posted 12 Chief of Staff adjacent roles in past 30 days
- Anthropic's Head of BD left in March, role still open
- Noticed 3 Google PMs moved to Perplexity this quarter

Coffee Chat - Mike (VC partner):
- Said AI infra companies are the hot ticket right now
- Recommended looking at Series B/C stage for best equity upside`,
  },
  client: {
    accounts: ["Snowflake", "Palantir", "Databricks"],
    competitors: ["Microsoft Azure", "AWS", "Google Cloud"],
    context: `CRM Notes - Q1 2024:

Snowflake (Last touch: March 28):
- Met with CTO Sarah Chen at AWS re:Invent afterparty
- She mentioned concern about rising cloud compute costs
- Currently evaluating cost optimization vendors
- Champion: VP Data Platform (David Kim) - reports to Sarah
- Blocker: Procurement wants 3 competitive bids

Palantir (Last touch: April 1):
- New CRO started in February, reorganizing sales team
- Our contact (James) moved to different division
- Need to rebuild relationship with new stakeholders
- Heard they're doubling down on commercial sector

Databricks (Last touch: Feb 15):
- Lost deal to Microsoft Fabric last quarter
- CFO concerned about total cost of ownership
- Technical team loves us, finance team skeptical
- Renewal coming up in Q3 - high churn risk

Competitive Intel:
- AWS announced 15% price cut on data services
- Azure pushing hard on AI integration narrative
- Google Cloud offering migration credits aggressively`,
  },
}

export default function Home() {
  const [activePersona, setActivePersona] = useState<Persona>("macro")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showBrief, setShowBrief] = useState(false)
  const [briefContent, setBriefContent] = useState<string | null>(null)
  const [briefError, setBriefError] = useState<string | null>(null)
  const [dataSources, setDataSources] = useState<BriefDataSources | undefined>(undefined)
  const [citations, setCitations] = useState<Citation[] | undefined>(undefined)
  const [generatedAt, setGeneratedAt] = useState<number | undefined>(undefined)

  // Persisted API keys
  const [openaiKey, setOpenaiKey] = useLocalStorage<string>("ai-briefing:openai-key", "")
  const [brightDataKey, setBrightDataKey] = useLocalStorage<string>("ai-briefing:brightdata-key", "")
  const [brightDataZone, setBrightDataZone] = useLocalStorage<string>("ai-briefing:brightdata-zone", "serp_api1")
  const [mubitKey, setMubitKey] = useLocalStorage<string>("ai-briefing:mubit-key", "")

  // Persisted dashboard data + brief history
  const [dashboardData, setDashboardData] = useLocalStorage<DashboardData>(
    "ai-briefing:dashboard-data",
    DEFAULT_DASHBOARD_DATA,
  )
  const [briefHistory, setBriefHistory] = useLocalStorage<SavedBrief[]>("ai-briefing:brief-history", [])

  // Stable session id for Mubit memory across briefs
  const [sessionId, setSessionId] = useLocalStorage<string>(
    "ai-briefing:session-id",
    `briefing-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
  )

  const [currentTime, setCurrentTime] = useState<string | null>(null)
  useEffect(() => {
    const update = () =>
      setCurrentTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }))
    update()
    const interval = setInterval(update, 60_000)
    return () => clearInterval(interval)
  }, [])

  const updateDashboardData = useCallback(
    <K extends Persona>(persona: K, data: Partial<DashboardData[K]>) => {
      setDashboardData((prev) => ({
        ...prev,
        [persona]: { ...prev[persona], ...data },
      }))
    },
    [setDashboardData],
  )

  const handleClearAllKeys = useCallback(() => {
    setOpenaiKey("")
    setBrightDataKey("")
    setBrightDataZone("serp_api1")
    setMubitKey("")
  }, [setOpenaiKey, setBrightDataKey, setBrightDataZone, setMubitKey])

  const handleGenerateBrief = async () => {
    setIsGenerating(true)
    setBriefError(null)
    setBriefContent(null)
    setCitations(undefined)
    setDataSources(undefined)
    setGeneratedAt(Date.now())
    setShowBrief(true) // Open immediately to show loading state

    try {
      const currentData = dashboardData[activePersona]

      const result = await generateBrief({
        persona: activePersona,
        apiKey: openaiKey,
        brightDataApiKey: brightDataKey || undefined,
        brightDataZone: brightDataZone || undefined,
        mubitApiKey: mubitKey || undefined,
        sessionId,
        data: {
          context: currentData.context,
          ...(activePersona === "macro" && {
            portfolios: (currentData as DashboardData["macro"]).portfolios,
            assetClasses: (currentData as DashboardData["macro"]).assetClasses,
          }),
          ...(activePersona === "career" && {
            companies: (currentData as DashboardData["career"]).companies,
            roles: (currentData as DashboardData["career"]).roles,
          }),
          ...(activePersona === "client" && {
            accounts: (currentData as DashboardData["client"]).accounts,
            competitors: (currentData as DashboardData["client"]).competitors,
          }),
        },
      })

      if (result.success && result.brief) {
        setBriefContent(result.brief)
        setDataSources(result.dataSources)
        setCitations(result.citations)

        // Save to history
        const preview = result.brief
          .replace(/\s*\[LINKED\]\s*/gi, "")
          .replace(/^[\d.)\-*•]+\s*/gm, "")
          .replace(/\n+/g, " ")
          .trim()
          .slice(0, 140)

        const saved: SavedBrief = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          persona: activePersona,
          content: result.brief,
          createdAt: Date.now(),
          preview,
          liveData: !!result.dataSources?.brightData.live,
          memoryUsed: !!result.dataSources?.mubit.enabled,
        }
        setBriefHistory((prev) => [saved, ...prev].slice(0, 30))
      } else {
        setBriefError(result.error || "Failed to generate brief")
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred."
      setBriefError(msg)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectBrief = useCallback((brief: SavedBrief) => {
    setActivePersona(brief.persona)
    setBriefContent(brief.content)
    setBriefError(null)
    setCitations(undefined)
    setDataSources(undefined)
    setGeneratedAt(brief.createdAt)
    setShowBrief(true)
  }, [])

  const handleDeleteBrief = useCallback(
    (id: string) => {
      setBriefHistory((prev) => prev.filter((b) => b.id !== id))
    },
    [setBriefHistory],
  )

  const handleClearHistory = useCallback(() => {
    setBriefHistory([])
  }, [setBriefHistory])

  const filteredHistory = useMemo(
    () => briefHistory.filter((b) => b.persona === activePersona),
    [briefHistory, activePersona],
  )

  const renderDashboard = () => {
    switch (activePersona) {
      case "macro":
        return (
          <MacroDashboard
            onGenerateBrief={handleGenerateBrief}
            isGenerating={isGenerating}
            portfolios={dashboardData.macro.portfolios}
            assetClasses={dashboardData.macro.assetClasses}
            context={dashboardData.macro.context}
            onPortfoliosChange={(portfolios) => updateDashboardData("macro", { portfolios })}
            onAssetClassesChange={(assetClasses) => updateDashboardData("macro", { assetClasses })}
            onContextChange={(context) => updateDashboardData("macro", { context })}
          />
        )
      case "career":
        return (
          <CareerDashboard
            onGenerateBrief={handleGenerateBrief}
            isGenerating={isGenerating}
            companies={dashboardData.career.companies}
            roles={dashboardData.career.roles}
            context={dashboardData.career.context}
            onCompaniesChange={(companies) => updateDashboardData("career", { companies })}
            onRolesChange={(roles) => updateDashboardData("career", { roles })}
            onContextChange={(context) => updateDashboardData("career", { context })}
          />
        )
      case "client":
        return (
          <ClientDashboard
            onGenerateBrief={handleGenerateBrief}
            isGenerating={isGenerating}
            accounts={dashboardData.client.accounts}
            competitors={dashboardData.client.competitors}
            context={dashboardData.client.context}
            onAccountsChange={(accounts) => updateDashboardData("client", { accounts })}
            onCompetitorsChange={(competitors) => updateDashboardData("client", { competitors })}
            onContextChange={(context) => updateDashboardData("client", { context })}
          />
        )
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-foreground tracking-tight truncate">
                  AI Briefing Agent
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Intelligence at your fingertips</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ApiKeyInput
                openaiKey={openaiKey}
                brightDataKey={brightDataKey}
                brightDataZone={brightDataZone}
                mubitKey={mubitKey}
                onOpenaiKeyChange={setOpenaiKey}
                onBrightDataKeyChange={setBrightDataKey}
                onBrightDataZoneChange={setBrightDataZone}
                onMubitKeyChange={setMubitKey}
                onClearAll={handleClearAllKeys}
              />

              <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="w-3 h-3 text-primary animate-pulse" />
                <span>Online</span>
                {currentTime && (
                  <>
                    <span className="text-border">|</span>
                    <span className="font-mono">{currentTime}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{personaConfig[activePersona].title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{personaConfig[activePersona].description}</p>
          </div>
          <PersonaToggle activePersona={activePersona} onPersonaChange={setActivePersona} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 transition-all duration-300 ease-in-out">{renderDashboard()}</div>
          <aside className="lg:col-span-1">
            <BriefHistory
              briefs={filteredHistory}
              onSelect={handleSelectBrief}
              onDelete={handleDeleteBrief}
              onClearAll={handleClearHistory}
            />
          </aside>
        </div>
      </div>

      <BriefModal
        isOpen={showBrief}
        onClose={() => setShowBrief(false)}
        persona={activePersona}
        briefContent={briefContent}
        error={briefError}
        dataSources={dataSources}
        citations={citations}
        isLoading={isGenerating}
        generatedAt={generatedAt}
      />

      <footer className="border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>AI Briefing Agent | Built for institutional workflows</p>
            <div className="flex items-center gap-4">
              <span className="font-mono">v3.0.0</span>
              <span>|</span>
              <span>GPT-4o mini · Bright Data · Mubit</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
