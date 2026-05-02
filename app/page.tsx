import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  TerminalSquare,
  TrendingUp,
  Briefcase,
  Target,
  Zap,
  Database,
  Brain,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Activity,
} from "lucide-react"
import { PLANS } from "@/lib/plans"
import { createClient } from "@/lib/supabase/server"

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
              <TerminalSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">Alpha Agent</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#personas" className="hover:text-foreground transition">Personas</Link>
            <Link href="#how" className="hover:text-foreground transition">How it works</Link>
            <Link href="/pricing" className="hover:text-foreground transition">Pricing</Link>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild size="sm">
                <Link href="/app">Open terminal</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/login">Log in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/sign-up">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium mb-6">
              <Activity className="w-3 h-3" />
              <span>Live intel + persistent memory + your context</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-balance leading-tight">
              The intelligence brief your <span className="text-primary">desk</span> wishes it had.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground text-pretty max-w-2xl">
              Alpha Agent generates Bloomberg-grade morning briefs in 30 seconds. Real-time signals from Bright Data, persistent memory via Mubit, all cross-referenced with your private notes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
              <Button asChild size="lg" className="text-base px-6">
                <Link href="/auth/sign-up">
                  Start free
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-6">
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              5 free briefs every month. No credit card required.
            </p>
          </div>

          {/* Hero terminal mock */}
          <div className="mt-16 max-w-4xl mx-auto rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/50">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary/60" />
              </div>
              <span className="text-xs font-mono text-muted-foreground ml-2">alpha-agent ~ macro-intelligence</span>
              <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-primary">
                <Activity className="w-3 h-3 animate-pulse" />
                LIVE
              </span>
            </div>
            <div className="p-6 md:p-8 font-mono text-sm space-y-4">
              <div className="text-muted-foreground">$ alpha generate --persona=macro</div>
              <div className="space-y-3 text-foreground">
                <div className="flex items-start gap-3">
                  <span className="text-primary shrink-0">1.</span>
                  <p className="leading-relaxed">
                    Fed officials pushed back on aggressive easing this week with services CPI sticky above 3%, supporting your Q1 memo&apos;s thesis on a delayed pivot
                    <span className="text-primary text-xs ml-2">[LINKED]</span>
                    <span className="text-accent text-xs ml-1">[SOURCE: Reuters]</span>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary shrink-0">2.</span>
                  <p className="leading-relaxed">
                    BoJ holds steady; yen slides to 158, validating long USD/JPY positioning — consider trimming above 160 with intervention risk rising
                    <span className="text-accent text-xs ml-1">[SOURCE: Bloomberg]</span>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary shrink-0">3.</span>
                  <p className="leading-relaxed">
                    Action: scale into 5Y Treasury longs near 4.45% resistance ahead of Friday&apos;s NFP miss setup
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-border flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">
                  <Database className="w-3 h-3" /> 6 live sources
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded border border-purple-500/20">
                  <Brain className="w-3 h-3" /> Memory active
                </span>
                <span className="ml-auto text-muted-foreground">Generated in 4.2s</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personas */}
      <section id="personas" className="border-t border-border bg-card/30">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm text-primary font-medium uppercase tracking-wider mb-3">Three modes</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-balance">
              One agent. Three operator workflows.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: TrendingUp,
                title: "Macro Intelligence",
                user: "For PMs & macro analysts",
                desc: "Track portfolios, asset classes, and Fed/ECB dynamics. Cross-references your past trade memos.",
              },
              {
                icon: Briefcase,
                title: "Career Alpha",
                user: "For ambitious operators",
                desc: "Monitor target companies and roles. Surfaces hiring signals and friend-network intel.",
              },
              {
                icon: Target,
                title: "Client Intelligence",
                user: "For B2B sales pros",
                desc: "Track named accounts and competitors. Maps trigger events to your CRM relationship history.",
              },
            ].map((p) => (
              <Card key={p.title} className="border-border bg-card hover:border-primary/40 transition">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                    <p.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold tracking-tight mb-1">{p.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">{p.user}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm text-primary font-medium uppercase tracking-wider mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-balance">
              Real-time signal. Memory. Your context. Synthesized.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Database,
                title: "Pulls live intel",
                desc: "Bright Data scrapes Reuters, Bloomberg, LinkedIn, and 50+ sources for the freshest signal on your tracked entities.",
              },
              {
                icon: Brain,
                title: "Remembers what matters",
                desc: "Mubit operational memory captures every brief, decision, and outcome — so insights compound instead of resetting.",
              },
              {
                icon: Zap,
                title: "Synthesizes in 30 seconds",
                desc: "GPT-4o cross-references real-time data, your historical context, and your past briefs into a tight 3-bullet brief with citations.",
              },
            ].map((step, i) => (
              <div key={step.title} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <step.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">STEP {i + 1}</span>
                </div>
                <h3 className="font-semibold tracking-tight">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="border-t border-border bg-card/30">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm text-primary font-medium uppercase tracking-wider mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-balance">
              Start free. Upgrade when you need the edge.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {Object.values(PLANS).map((plan) => (
              <Card
                key={plan.id}
                className={`border-border bg-card ${plan.highlight ? "ring-2 ring-primary" : ""}`}
              >
                <CardContent className="p-6">
                  {plan.highlight && (
                    <span className="inline-block px-2 py-0.5 mb-3 text-xs font-medium bg-primary text-primary-foreground rounded">
                      Most popular
                    </span>
                  )}
                  <h3 className="font-semibold tracking-tight">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-semibold">{plan.priceLabel}</span>
                    {plan.priceInCents > 0 && (
                      <span className="text-sm text-muted-foreground">/mo</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                  <ul className="mt-5 space-y-2">
                    {plan.features.slice(0, 4).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href="/pricing">See full plan comparison</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold tracking-tight">Your data stays yours</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Notes are encrypted, RLS-locked to your account, and never used for training.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold tracking-tight">Citations on every claim</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Live items show source name and link. No hallucinated headlines.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold tracking-tight">Memory that compounds</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Every brief sharpens the next. Your edge grows over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-border bg-card/30">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-balance">
            Get tomorrow&apos;s edge today.
          </h2>
          <p className="mt-4 text-muted-foreground text-pretty">
            Five free briefs. Two minutes to set up. Zero credit card.
          </p>
          <Button asChild size="lg" className="mt-8 text-base">
            <Link href="/auth/sign-up">
              Start free
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary">
              <TerminalSquare className="w-3 h-3 text-primary-foreground" />
            </div>
            <span>Alpha Agent &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="hover:text-foreground transition">Pricing</Link>
            <Link href="/auth/login" className="hover:text-foreground transition">Log in</Link>
            <Link href="/auth/sign-up" className="hover:text-foreground transition">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
