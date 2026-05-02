import { createClient } from "@/lib/supabase/server"
import { PLANS, getPlan } from "@/lib/plans"
import { PricingCards } from "@/components/pricing-cards"
import Link from "next/link"
import { TerminalSquare, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Pricing — Alpha Agent",
  description: "Simple, transparent pricing. Start free. Upgrade when you need the edge.",
}

export default async function PricingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let currentPlan: "free" | "pro" | "team" = "free"
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single()
    currentPlan = getPlan(profile?.plan).id
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
              <TerminalSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">Alpha Agent</span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href={user ? "/app" : "/"}>
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              {user ? "Back to terminal" : "Back to home"}
            </Link>
          </Button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-sm text-primary font-medium uppercase tracking-wider mb-3">Pricing</p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-balance">
            One brief from now, you&apos;ll know which plan you need.
          </h1>
          <p className="mt-4 text-muted-foreground text-pretty">
            Start free with 5 briefs/month. Upgrade when live signals and memory matter.
          </p>
        </div>

        <PricingCards plans={Object.values(PLANS)} currentPlan={currentPlan} isAuthed={!!user} />

        <div className="mt-12 text-center text-sm text-muted-foreground">
          Need SSO, custom limits, or invoicing?{" "}
          <a href="mailto:hello@alpha-agent.com" className="text-primary hover:underline">
            Talk to sales
          </a>
        </div>
      </section>

      <section className="border-t border-border bg-card/30">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-semibold tracking-tight text-center mb-8">FAQ</h2>
          <div className="space-y-6">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes. Cancel from the Stripe customer portal in one click. You keep Pro access through the end of the billing period.",
              },
              {
                q: "What happens if I hit my free brief limit?",
                a: "You'll see an upgrade prompt. No surprise charges — you must actively upgrade to Pro to keep generating.",
              },
              {
                q: "Is my data private?",
                a: "Your notes and briefs are encrypted at rest, locked to your account via row-level security, and never used to train models.",
              },
              {
                q: "Do you really pull live data?",
                a: "Yes. On Pro & Team, every brief calls Bright Data SERP at generation time and pulls from Reuters, Bloomberg, LinkedIn, and 50+ live sources.",
              },
            ].map((item) => (
              <div key={item.q} className="rounded-lg border border-border bg-card p-5">
                <h3 className="font-medium tracking-tight">{item.q}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
