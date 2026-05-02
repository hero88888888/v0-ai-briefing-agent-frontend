"use client"

import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Activity, Zap, Sparkles, Lock } from "lucide-react"
import { PersonaToggle } from "@/components/persona-toggle"
import { MacroDashboard } from "@/components/macro-dashboard"
import { CareerDashboard } from "@/components/career-dashboard"
import { ClientDashboard } from "@/components/client-dashboard"
import { BriefModal } from "@/components/brief-modal"
import { BriefHistory, type SavedBrief } from "@/components/brief-history"
import { Button } from "@/components/ui/button"
import {
  generateBrief,
  saveDashboardConfig,
  deleteBrief as deleteBriefAction,
  type BriefDataSources,
  type Persona,
} from "@/app/actions/generate-brief"
import type { Citation } from "@/lib/bright-data"
import type { Plan } from "@/lib/plans"

interface DashboardData {
  macro: { portfolios: string[]; assetClasses: string[]; context: string }
  career: { companies: string[]; roles: string[]; context: string }
  client: { accounts: string[]; competitors: string[]; context: string }
}

interface BriefRow {
  id: string
  persona: Persona
  content: string
  created_at: string
  data_sources: { brightData?: { live?: boolean }; mubit?: { enabled?: boolean } } | null
}

interface DashboardShellProps {
  plan: Plan
  planName: string
  monthlyBriefLimit: number | null
  initialDashboardData: DashboardData
  initialBriefs: BriefRow[]
}

const personaConfig = {
  macro: { title: "Macro Intelligence", description: "Track markets, portfolios, and macro events" },
  career: { title: "Career Alpha", description: "Monitor opportunities, companies, and career moves" },
  client: { title: "Client Intelligence", description: "Track accounts, competitors, and sales triggers" },
}

function rowToSavedBrief(row: BriefRow): SavedBrief {
  return {
    id: row.id,
    persona: row.persona,
    content: row.content,
    createdAt: new Date(row.created_at).getTime(),
    preview: row.content.replace(/\s*\[(LINKED|SOURCE:[^\]]*)\]\s*/g, "").slice(0, 110).trim(),
    liveData: !!row.data_sources?.brightData?.live,
    memoryUsed: !!row.data_sources?.mubit?.enabled,
  }
}

export function DashboardShell({
  plan,
  planName,
  monthlyBriefLimit,
  initialDashboardData,
  initialBriefs,
}: DashboardShellProps) {
  const router = useRouter()
  const [activePersona, setActivePersona] = useState<Persona>("macro")
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialDashboardData)
  const [savedBriefs, setSavedBriefs] = useState<SavedBrief[]>(
    initialBriefs.map(rowToSavedBrief),
  )

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [briefContent, setBriefContent] = useState<string | null>(null)
  const [briefError, setBriefError] = useState<string | null>(null)
  const [briefDataSources, setBriefDataSources] = useState<BriefDataSources | undefined>(undefined)
  const [briefCitations, setBriefCitations] = useState<Citation[] | undefined>(undefined)
  const [briefGeneratedAt, setBriefGeneratedAt] = useState<number | undefined>(undefined)
  const [isGenerating, setIsGenerating] = useState(false)
  const [, startSaveTransition] = useTransition()

  // Persist config changes (debounced via per-update server action)
  const persistConfig = useCallback(
    (persona: Persona, next: Record<string, unknown>) => {
      startSaveTransition(async () => {
        await saveDashboardConfig(persona, next)
      })
    },
    [],
  )

  const updateMacro = useCallback(
    (patch: Partial<DashboardData["macro"]>) => {
      setDashboardData((prev) => {
        const next = { ...prev, macro: { ...prev.macro, ...patch } }
        persistConfig("macro", next.macro)
        return next
      })
    },
    [persistConfig],
  )
  const updateCareer = useCallback(
    (patch: Partial<DashboardData["career"]>) => {
      setDashboardData((prev) => {
        const next = { ...prev, career: { ...prev.career, ...patch } }
        persistConfig("career", next.career)
        return next
      })
    },
    [persistConfig],
  )
  const updateClient = useCallback(
    (patch: Partial<DashboardData["client"]>) => {
      setDashboardData((prev) => {
        const next = { ...prev, client: { ...prev.client, ...patch } }
        persistConfig("client", next.client)
        return next
      })
    },
    [persistConfig],
  )

  const personaInfo = personaConfig[activePersona]

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true)
    setIsModalOpen(true)
    setBriefContent(null)
    setBriefError(null)
    setBriefDataSources(undefined)
    setBriefCitations(undefined)
    setBriefGeneratedAt(Date.now())

    const inputData =
      activePersona === "macro"
        ? {
            portfolios: dashboardData.macro.portfolios,
            assetClasses: dashboardData.macro.assetClasses,
            context: dashboardData.macro.context,
          }
        : activePersona === "career"
          ? {
              companies: dashboardData.career.companies,
              roles: dashboardData.career.roles,
              context: dashboardData.career.context,
            }
          : {
              accounts: dashboardData.client.accounts,
              competitors: dashboardData.client.competitors,
              context: dashboardData.client.context,
            }

    try {
      const result = await generateBrief({ persona: activePersona, data: inputData })

      if (!result.success) {
        setBriefError(result.error ?? "Failed to generate brief.")
        if (result.errorCode === "limit_reached") {
          // refresh nav usage display
          router.refresh()
        }
        return
      }

      setBriefContent(result.brief ?? null)
      setBriefDataSources(result.dataSources)
      setBriefCitations(result.citations)

      // Add to local list, then refresh server data
      if (result.brief && result.briefId) {
        const newBrief: SavedBrief = {
          id: result.briefId,
          persona: activePersona,
          content: result.brief,
          createdAt: Date.now(),
          preview: result.brief.replace(/\s*\[(LINKED|SOURCE:[^\]]*)\]\s*/g, "").slice(0, 110).trim(),
          liveData: !!result.dataSources?.brightData.live,
          memoryUsed: !!result.dataSources?.mubit.enabled,
        }
        setSavedBriefs((prev) => [newBrief, ...prev])
      }
      router.refresh()
    } catch (err) {
      console.error("[v0] Generate failed:", err)
      setBriefError(err instanceof Error ? err.message : "Unexpected error")
    } finally {
      setIsGenerating(false)
    }
  }, [activePersona, dashboardData, router])

  const handleSelectBrief = useCallback((brief: SavedBrief) => {
    setActivePersona(brief.persona)
    setBriefContent(brief.content)
    setBriefError(null)
    setBriefDataSources({
      brightData: { enabled: brief.liveData, live: brief.liveData, itemCount: 0 },
      mubit: { enabled: brief.memoryUsed },
    })
    setBriefCitations(undefined)
    setBriefGeneratedAt(brief.createdAt)
    setIsGenerating(false)
    setIsModalOpen(true)
  }, [])

  const handleDeleteBrief = useCallback(async (id: string) => {
    setSavedBriefs((prev) => prev.filter((b) => b.id !== id))
    await deleteBriefAction(id)
  }, [])

  const handleClearAll = useCallback(async () => {
    const ids = savedBriefs.map((b) => b.id)
    setSavedBriefs([])
    await Promise.all(ids.map((id) => deleteBriefAction(id)))
  }, [savedBriefs])

  const filteredBriefs = useMemo(
    () => savedBriefs.filter((b) => b.persona === activePersona),
    [savedBriefs, activePersona],
  )

  // Detect ?upgraded=true and refresh
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get("upgraded") === "true") {
      url.searchParams.delete("upgraded")
      window.history.replaceState({}, "", url.toString())
      router.refresh()
    }
  }, [router])

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* Title bar */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              {personaInfo.title}
            </h1>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-primary/10 text-primary border border-primary/20">
              <Activity className="w-2.5 h-2.5" />
              LIVE
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{personaInfo.description}</p>
        </div>
        <PersonaToggle activePersona={activePersona} onPersonaChange={setActivePersona} />
      </div>

      {/* Free plan upgrade nudge */}
      {plan === "free" && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              You&apos;re on the {planName} plan
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {monthlyBriefLimit} briefs/month, no live data, no memory. Upgrade to Pro for real-time intel via Bright Data and persistent memory via Mubit.
            </p>
          </div>
          <Button asChild size="sm" className="shrink-0">
            <Link href="/pricing">Upgrade</Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main */}
        <div>
          {activePersona === "macro" && (
            <MacroDashboard
              onGenerateBrief={handleGenerate}
              isGenerating={isGenerating}
              portfolios={dashboardData.macro.portfolios}
              assetClasses={dashboardData.macro.assetClasses}
              context={dashboardData.macro.context}
              onPortfoliosChange={(portfolios) => updateMacro({ portfolios })}
              onAssetClassesChange={(assetClasses) => updateMacro({ assetClasses })}
              onContextChange={(context) => updateMacro({ context })}
            />
          )}
          {activePersona === "career" && (
            <CareerDashboard
              onGenerateBrief={handleGenerate}
              isGenerating={isGenerating}
              companies={dashboardData.career.companies}
              roles={dashboardData.career.roles}
              context={dashboardData.career.context}
              onCompaniesChange={(companies) => updateCareer({ companies })}
              onRolesChange={(roles) => updateCareer({ roles })}
              onContextChange={(context) => updateCareer({ context })}
            />
          )}
          {activePersona === "client" && (
            <ClientDashboard
              onGenerateBrief={handleGenerate}
              isGenerating={isGenerating}
              accounts={dashboardData.client.accounts}
              competitors={dashboardData.client.competitors}
              context={dashboardData.client.context}
              onAccountsChange={(accounts) => updateClient({ accounts })}
              onCompetitorsChange={(competitors) => updateClient({ competitors })}
              onContextChange={(context) => updateClient({ context })}
            />
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card text-sm">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-medium">Tip</span>
            <span className="text-muted-foreground text-xs">
              Add notes to make briefs more personal.
            </span>
          </div>
          <BriefHistory
            briefs={filteredBriefs}
            onSelect={handleSelectBrief}
            onDelete={handleDeleteBrief}
            onClearAll={handleClearAll}
          />
          {plan === "free" && (
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Pro features locked</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>&middot; Real-time signals (Bright Data)</li>
                <li>&middot; Persistent memory (Mubit)</li>
                <li>&middot; Unlimited briefs</li>
              </ul>
              <Button asChild size="sm" className="w-full mt-3">
                <Link href="/pricing">Upgrade to Pro</Link>
              </Button>
            </div>
          )}
        </aside>
      </div>

      <BriefModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        persona={activePersona}
        briefContent={briefContent}
        error={briefError}
        dataSources={briefDataSources}
        citations={briefCitations}
        isLoading={isGenerating}
        generatedAt={briefGeneratedAt}
      />
    </main>
  )
}
