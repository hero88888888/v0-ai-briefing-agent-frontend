"use client"

import { DashboardShell } from "@/components/dashboard-shell"

// Hackathon demo page — bypasses auth entirely.
// Remove or gate this route before going to production.
const DEMO_USER = {
  id: "demo-user",
  email: "judge@hackathon.demo",
  plan: "pro" as const,
  full_name: "Demo Judge",
  briefs_used: 0,
  briefs_limit: -1,
}

const DEMO_CONFIGS = {
  macro: {
    portfolios: ["Global Macro Fund", "EM Opportunities"],
    assetClasses: ["US Treasuries", "EUR/USD", "Crude Oil"],
    context: `Q1 2024 Trade Memo (March 15):
- Predicted BoJ would delay rate hikes until Q3 due to weak wage growth data
- Positioned long USD/JPY at 148.50, target 155
- Flagged China property sector as key EM risk factor

Q4 2023 Review (Dec 20):
- Called the Fed pivot correctly, trimmed duration underweight in Nov
- Crude oil positioning was wrong — expected $90+ but got $70s

Weekly Note (April 2):
- ECB likely to cut before Fed based on inflation trajectory
- Watch German manufacturing PMI for EUR direction`,
  },
  career: {
    companies: ["OpenAI", "Anthropic", "Google DeepMind"],
    roles: ["Chief of Staff", "VP Strategy", "Head of BD"],
    context: `Network Intel — April 2024:

John (ex-Stripe):
- Interviewed at Stripe last week for VP Ops role
- Said they're pausing mid-level hires but still backfilling senior roles

Sarah (Google DeepMind):
- DeepMind spinning up new enterprise sales team
- Looking for people with both technical + GTM experience

LinkedIn Notes:
- OpenAI posted 12 Chief of Staff adjacent roles in past 30 days
- Anthropic's Head of BD left in March, role still open`,
  },
  client: {
    accounts: ["Snowflake", "Palantir", "Databricks"],
    competitors: ["Microsoft Azure", "AWS", "Google Cloud"],
    context: `CRM Notes — Q1 2024:

Snowflake (Last touch: March 28):
- Met with CTO Sarah Chen at AWS re:Invent afterparty
- She mentioned concern about rising cloud compute costs
- Champion: VP Data Platform (David Kim)

Palantir (Last touch: April 1):
- New CRO started in February, reorganising sales team
- Our contact (James) moved to different division

Databricks (Last touch: Feb 15):
- Lost deal to Microsoft Fabric last quarter
- Renewal coming up in Q3 — high churn risk`,
  },
}

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Demo banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-mono font-semibold tracking-widest">
          HACKATHON DEMO
        </span>
        <p className="text-xs text-amber-400/80">
          Running in demo mode — all features unlocked, Pro plan active, no login required.
        </p>
      </div>

      <DashboardShell
        user={DEMO_USER}
        savedConfigs={DEMO_CONFIGS}
        isDemo={true}
      />
    </div>
  )
}
