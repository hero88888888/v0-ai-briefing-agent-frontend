import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { getPlan } from "@/lib/plans"

export const dynamic = "force-dynamic"

interface DashboardConfigRow {
  persona: "macro" | "career" | "client"
  config: Record<string, unknown>
}

interface BriefRow {
  id: string
  persona: "macro" | "career" | "client"
  content: string
  created_at: string
  data_sources: { brightData?: { live?: boolean }; mubit?: { enabled?: boolean } } | null
}

const DEFAULT_CONFIGS = {
  macro: {
    portfolios: ["Global Macro Fund", "EM Opportunities"],
    assetClasses: ["US Treasuries", "EUR/USD", "Crude Oil"],
    context: "",
  },
  career: {
    companies: ["OpenAI", "Anthropic", "Google DeepMind"],
    roles: ["Chief of Staff", "VP Strategy", "Head of BD"],
    context: "",
  },
  client: {
    accounts: ["Snowflake", "Palantir", "Databricks"],
    competitors: ["Microsoft Azure", "AWS", "Google Cloud"],
    context: "",
  },
}

export default async function AppPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single()
  const plan = getPlan(profile?.plan)

  // Load saved per-persona configs
  const { data: configs } = await supabase
    .from("dashboard_configs")
    .select("persona, config")
    .eq("user_id", user.id)

  const configsByPersona = (configs as DashboardConfigRow[] | null)?.reduce(
    (acc, row) => {
      acc[row.persona] = row.config
      return acc
    },
    {} as Record<string, Record<string, unknown>>,
  ) ?? {}

  // Merge with defaults for any persona not yet configured
  const dashboardData = {
    macro: { ...DEFAULT_CONFIGS.macro, ...(configsByPersona.macro ?? {}) },
    career: { ...DEFAULT_CONFIGS.career, ...(configsByPersona.career ?? {}) },
    client: { ...DEFAULT_CONFIGS.client, ...(configsByPersona.client ?? {}) },
  }

  // Load recent briefs (limit by plan)
  const briefLimit = plan.id === "free" ? 10 : 50
  const { data: briefs } = await supabase
    .from("briefs")
    .select("id, persona, content, created_at, data_sources")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(briefLimit)

  const recentBriefs = (briefs as BriefRow[] | null) ?? []

  return (
    <DashboardShell
      plan={plan.id}
      planName={plan.name}
      monthlyBriefLimit={plan.monthlyBriefLimit}
      initialDashboardData={dashboardData}
      initialBriefs={recentBriefs}
    />
  )
}
