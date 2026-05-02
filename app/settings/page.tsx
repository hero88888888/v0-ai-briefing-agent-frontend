import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getPlan } from "@/lib/plans"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { TerminalSquare, ArrowLeft, CreditCard, User, Activity } from "lucide-react"
import { ManageBillingButton } from "@/components/manage-billing-button"

export const metadata = {
  title: "Settings — Alpha Agent",
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, full_name, email, current_period_end, subscription_status, stripe_customer_id")
    .eq("id", user.id)
    .single()

  const plan = getPlan(profile?.plan)

  // Usage
  const now = new Date()
  const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`
  const { data: usageRow } = await supabase
    .from("usage")
    .select("briefs_count")
    .eq("user_id", user.id)
    .eq("month", month)
    .maybeSingle()
  const used = usageRow?.briefs_count ?? 0

  // Total briefs all-time
  const { count: totalBriefs } = await supabase
    .from("briefs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
              <TerminalSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">Alpha Agent</span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/app">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back to terminal
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account, plan, and usage.</p>
        </div>

        {/* Account */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row label="Name" value={profile?.full_name || "—"} />
            <Row label="Email" value={profile?.email || user.email || "—"} mono />
            <Row label="User ID" value={user.id} mono />
          </CardContent>
        </Card>

        {/* Plan & Billing */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Plan & Billing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row
              label="Current plan"
              value={
                <span className="inline-flex items-center gap-2">
                  <span className="font-medium">{plan.name}</span>
                  <span className="text-xs text-muted-foreground">{plan.priceLabel}{plan.priceInCents > 0 ? "/mo" : ""}</span>
                </span>
              }
            />
            {profile?.subscription_status && (
              <Row label="Status" value={<span className="capitalize">{profile.subscription_status}</span>} />
            )}
            {profile?.current_period_end && (
              <Row
                label="Renews on"
                value={new Date(profile.current_period_end).toLocaleDateString()}
              />
            )}
            <div className="pt-2 flex flex-wrap gap-2">
              {plan.id === "free" ? (
                <Button asChild>
                  <Link href="/pricing">Upgrade plan</Link>
                </Button>
              ) : (
                <>
                  <ManageBillingButton hasCustomer={!!profile?.stripe_customer_id} />
                  <Button asChild variant="outline">
                    <Link href="/pricing">Change plan</Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usage */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row
              label="Briefs this month"
              value={
                <span className="font-mono">
                  {used}
                  {plan.monthlyBriefLimit !== null ? ` / ${plan.monthlyBriefLimit}` : " (unlimited)"}
                </span>
              }
            />
            <Row label="Briefs all-time" value={<span className="font-mono">{totalBriefs ?? 0}</span>} />
            <Row label="Live data" value={plan.id === "free" ? "Disabled" : "Bright Data — enabled"} />
            <Row label="Memory" value={plan.id === "free" ? "Disabled" : "Mubit — enabled"} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-foreground text-right ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  )
}
