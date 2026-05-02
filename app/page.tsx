"use client"

import { useState } from "react"
import { Activity, Zap } from "lucide-react"
import { PersonaToggle } from "@/components/persona-toggle"
import { MacroDashboard } from "@/components/macro-dashboard"
import { CareerDashboard } from "@/components/career-dashboard"
import { ClientDashboard } from "@/components/client-dashboard"
import { BriefModal } from "@/components/brief-modal"

type Persona = "macro" | "career" | "client"

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

  const handleGenerateBrief = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setShowBrief(true)
    }, 1500)
  }

  const renderDashboard = () => {
    switch (activePersona) {
      case "macro":
        return (
          <MacroDashboard 
            onGenerateBrief={handleGenerateBrief}
            isGenerating={isGenerating}
          />
        )
      case "career":
        return (
          <CareerDashboard 
            onGenerateBrief={handleGenerateBrief}
            isGenerating={isGenerating}
          />
        )
      case "client":
        return (
          <ClientDashboard 
            onGenerateBrief={handleGenerateBrief}
            isGenerating={isGenerating}
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
                <p className="text-xs text-muted-foreground">
                  Intelligence at your fingertips
                </p>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="w-3 h-3 text-primary animate-pulse" />
              <span>System Online</span>
              <span className="text-border">|</span>
              <span className="font-mono">
                {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </span>
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
      />

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>AI Briefing Agent | Built for institutional workflows</p>
            <div className="flex items-center gap-4">
              <span className="font-mono">v1.1.0</span>
              <span>|</span>
              <span>Mock Data Mode</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
