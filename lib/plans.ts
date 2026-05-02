// Single source of truth for all plans

export type Plan = "free" | "pro" | "team"

export interface PlanConfig {
  id: Plan
  name: string
  description: string
  priceInCents: number
  priceLabel: string
  monthlyBriefLimit: number | null // null = unlimited
  features: string[]
  cta: string
  highlight?: boolean
  stripePriceEnv?: string // env var name for Stripe price ID
}

export const PLANS: Record<Plan, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    description: "For curious analysts kicking the tires.",
    priceInCents: 0,
    priceLabel: "$0",
    monthlyBriefLimit: 5,
    features: [
      "5 AI-generated briefs per month",
      "All 3 personas (Macro, Career, Client)",
      "7-day brief history",
      "Basic context notes",
    ],
    cta: "Get started",
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "For senior operators who run on signal.",
    priceInCents: 9900,
    priceLabel: "$99",
    monthlyBriefLimit: null,
    features: [
      "Unlimited briefs",
      "Real-time intel via Bright Data",
      "Persistent memory via Mubit",
      "Unlimited brief history with citations",
      "Priority generation queue",
      "Email digest delivery",
    ],
    cta: "Start Pro",
    highlight: true,
    stripePriceEnv: "STRIPE_PRO_PRICE_ID",
  },
  team: {
    id: "team",
    name: "Team",
    description: "For desks, pods, and GTM teams.",
    priceInCents: 29900,
    priceLabel: "$299",
    monthlyBriefLimit: null,
    features: [
      "Everything in Pro",
      "Up to 10 seats included",
      "Shared context & team notes",
      "Centralized billing",
      "SSO (SAML / Google Workspace)",
      "Dedicated success manager",
    ],
    cta: "Start Team",
    stripePriceEnv: "STRIPE_TEAM_PRICE_ID",
  },
}

export function getPlan(plan: string | null | undefined): PlanConfig {
  if (plan === "pro") return PLANS.pro
  if (plan === "team") return PLANS.team
  return PLANS.free
}

export function canUseBrightData(plan: Plan): boolean {
  return plan === "pro" || plan === "team"
}

export function canUseMubit(plan: Plan): boolean {
  return plan === "pro" || plan === "team"
}

export function canUseUnlimitedHistory(plan: Plan): boolean {
  return plan === "pro" || plan === "team"
}
