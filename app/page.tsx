"use client"

import { useState, useCallback, useEffect } from "react"
import { Activity, Zap } from "lucide-react"
import { PersonaToggle } from "@/components/persona-toggle"
import { MacroDashboard } from "@/components/macro-dashboard"
import { CareerDashboard } from "@/components/career-dashboard"
import { ClientDashboard } from "@/components/client-dashboard"
import { BriefModal } from "@/components/brief-modal"
import { ApiKeyInput } from "@/components/api-key-input"
import { generateBrief } from "./actions/generate-brief"

type Persona = "macro" | "career" | "client"

interface DashboardData {
  macro: { portfolios: string[]; assetClasses: string[]; context: string }
  career: { companies: string[]; roles: string[]; context: string }
  client: { accounts: string[]; competitors: string[]; context: string }
}

const personaConfig = {
  macro: {
    title: "Macro Intelligence",
    description: "Track markets, portfolios, and macro events"
  },
  career: {
    title: "Career Alpha",
    description: "Monitor opportunities, companies, and career moves"
  },
  client: {
    title: "Client Intelligence",
    description: "Track accounts, competitors, and sales triggers"
  }
}

export default function Home() {
  const [activePersona, setActivePersona] = useState<Persona>("macro")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showBrief, setShowBrief] = useState(false)
  const [briefContent, setBriefContent] = useState<string | null>(null)
  const [briefError, setBriefError] = useState<string | null>(null)
  const [dataSources, setDataSources] = useState<{ brightData: boolean; mubit: boolean } | undefined>(undefined)
  const [openaiKey, setOpenaiKey] = useState("")
  const [brightDataKey, setBrightDataKey] = useState("")
  const [mubitKey, setMubitKey] = useState("")
  const [currentTime, setCurrentTime] = useState<string | null>(null)

  // Hydration-safe time display
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }))
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])
  
  // Dashboard data state with realistic pre-populated context
  const [dashboardData, setDashboardData] = useState<DashboardData>({
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
- Treasury 10Y resistance at 4.50%, support at 4.20%`
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
- Recommended looking at Series B/C stage for best equity upside`
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
- Google Cloud offering migration credits aggressively`
    }
  })

  const updateDashboardData = useCallback((persona: Persona, data: Partial<DashboardData[typeof persona]>) => {
    setDashboardData(prev => ({
      ...prev,
      [persona]: { ...prev[persona], ...data }
    }))
  }, [])

  const handleGenerateBrief = async () => {
    setIsGenerating(true)
    setBriefError(null)
    setBriefContent(null)

    try {
      const currentData = dashboardData[activePersona]
      
      const result = await generateBrief({
        persona: activePersona,
        apiKey: openaiKey,
        brightDataApiKey: brightDataKey || undefined,
        mubitApiKey: mubitKey || undefined,
        data: {
          context: currentData.context,
          ...(activePersona === "macro" && {
            portfolios: currentData.portfolios,
            assetClasses: currentData.assetClasses
          }),
          ...(activePersona === "career" && {
            companies: currentData.companies,
            roles: currentData.roles
          }),
          ...(activePersona === "client" && {
            accounts: currentData.accounts,
            competitors: currentData.competitors
          })
        }
      })

      if (result.success && result.brief) {
        setBriefContent(result.brief)
        setDataSources(result.dataSources)
      } else {
        setBriefError(result.error || "Failed to generate brief")
      }
    } catch {
      setBriefError("An unexpected error occurred. Please try again.")
    } finally {
      setIsGenerating(false)
      setShowBrief(true)
    }
  }

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
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground tracking-tight">
                  AI Briefing Agent
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Intelligence at your fingertips
                </p>
              </div>
            </div>

            {/* Right side - API Key + Status */}
            <div className="flex items-center gap-4">
              <ApiKeyInput 
                openaiKey={openaiKey}
                brightDataKey={brightDataKey}
                mubitKey={mubitKey}
                onOpenaiKeyChange={setOpenaiKey}
                onBrightDataKeyChange={setBrightDataKey}
                onMubitKeyChange={setMubitKey}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Persona Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {personaConfig[activePersona].title}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {personaConfig[activePersona].description}
            </p>
          </div>
          <PersonaToggle 
            activePersona={activePersona} 
            onPersonaChange={setActivePersona} 
          />
        </div>

        {/* Dashboard Content */}
        <div className="transition-all duration-300 ease-in-out">
          {renderDashboard()}
        </div>
      </div>

      {/* Brief Modal */}
      <BriefModal 
        isOpen={showBrief}
        onClose={() => setShowBrief(false)}
        persona={activePersona}
        briefContent={briefContent}
        error={briefError}
        dataSources={dataSources}
      />

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>AI Briefing Agent | Built for institutional workflows</p>
            <div className="flex items-center gap-4">
              <span className="font-mono">v2.0.0</span>
              <span>|</span>
              <span>GPT-4o Mini</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
