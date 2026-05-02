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
  macro: { portfolios: string[]; assetClasses: string[] }
  career: { companies: string[]; roles: string[] }
  client: { accounts: string[]; competitors: string[] }
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
  const [apiKey, setApiKey] = useState("")
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
  
  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    macro: {
      portfolios: ["Global Macro Fund", "EM Opportunities"],
      assetClasses: ["US Treasuries", "EUR/USD", "Crude Oil"]
    },
    career: {
      companies: ["OpenAI", "Anthropic", "Google DeepMind"],
      roles: ["Chief of Staff", "VP Strategy", "Head of BD"]
    },
    client: {
      accounts: ["Snowflake", "Palantir", "Databricks"],
      competitors: ["Microsoft Azure", "AWS", "Google Cloud"]
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
        apiKey,
        data: {
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
            onPortfoliosChange={(portfolios) => updateDashboardData("macro", { portfolios })}
            onAssetClassesChange={(assetClasses) => updateDashboardData("macro", { assetClasses })}
          />
        )
      case "career":
        return (
          <CareerDashboard 
            onGenerateBrief={handleGenerateBrief}
            isGenerating={isGenerating}
            companies={dashboardData.career.companies}
            roles={dashboardData.career.roles}
            onCompaniesChange={(companies) => updateDashboardData("career", { companies })}
            onRolesChange={(roles) => updateDashboardData("career", { roles })}
          />
        )
      case "client":
        return (
          <ClientDashboard 
            onGenerateBrief={handleGenerateBrief}
            isGenerating={isGenerating}
            accounts={dashboardData.client.accounts}
            competitors={dashboardData.client.competitors}
            onAccountsChange={(accounts) => updateDashboardData("client", { accounts })}
            onCompetitorsChange={(competitors) => updateDashboardData("client", { competitors })}
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
              <ApiKeyInput apiKey={apiKey} onApiKeyChange={setApiKey} />
              
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
