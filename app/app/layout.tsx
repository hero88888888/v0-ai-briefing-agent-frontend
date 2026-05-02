import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { getPlan } from "@/lib/plans"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, full_name, email")
    .eq("id", user.id)
    .single()

  const plan = getPlan(profile?.plan)

  // Current month usage
  const now = new Date()
  const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`
  const { data: usageRow } = await supabase
    .from("usage")
    .select("briefs_count")
    .eq("user_id", user.id)
    .eq("month", month)
    .maybeSingle()

  const used = usageRow?.briefs_count ?? 0

  return (
    <div className="min-h-svh bg-background">
      <AppHeader
        userEmail={profile?.email ?? user.email ?? ""}
        userName={profile?.full_name ?? null}
        planName={plan.name}
        planId={plan.id}
        usageUsed={used}
        usageLimit={plan.monthlyBriefLimit}
      />
      {children}
    </div>
  )
}
