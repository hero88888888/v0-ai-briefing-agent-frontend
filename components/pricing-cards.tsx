"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Sparkles } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { createCheckoutSession, createPortalSession } from "@/app/actions/billing"
import type { PlanConfig, Plan } from "@/lib/plans"

interface PricingCardsProps {
  plans: PlanConfig[]
  currentPlan: Plan
  isAuthed: boolean
}

export function PricingCards({ plans, currentPlan, isAuthed }: PricingCardsProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSelect(plan: Plan) {
    if (!isAuthed) {
      router.push(`/auth/sign-up?next=/pricing`)
      return
    }

    if (plan === "free") {
      router.push("/app")
      return
    }

    if (currentPlan !== "free") {
      // Send to Stripe portal for upgrades/downgrades/cancellations
      startTransition(async () => {
        const result = await createPortalSession()
        if (result?.error) {
          console.error("[v0] Portal error:", result.error)
          alert(result.error)
        }
      })
      return
    }

    // New paid subscription
    startTransition(async () => {
      const result = await createCheckoutSession(plan)
      if (result?.error) {
        console.error("[v0] Checkout error:", result.error)
        alert(result.error)
      }
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {plans.map((plan) => {
        const isCurrent = currentPlan === plan.id
        return (
          <Card
            key={plan.id}
            className={`relative flex flex-col border-border bg-card ${
              plan.highlight ? "ring-2 ring-primary" : ""
            }`}
          >
            <CardContent className="p-6 flex flex-col flex-1">
              {plan.highlight && (
                <span className="inline-flex w-fit items-center gap-1 px-2 py-0.5 mb-3 text-xs font-medium bg-primary text-primary-foreground rounded">
                  <Sparkles className="w-3 h-3" />
                  Most popular
                </span>
              )}
              <h3 className="font-semibold tracking-tight text-lg">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-semibold">{plan.priceLabel}</span>
                {plan.priceInCents > 0 && (
                  <span className="text-sm text-muted-foreground">/mo</span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground min-h-10">{plan.description}</p>

              <ul className="mt-5 space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground/90 leading-snug">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {isCurrent ? (
                  <Button disabled className="w-full" variant="outline">
                    Current plan
                  </Button>
                ) : plan.id === "free" ? (
                  isAuthed ? (
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/app">Open terminal</Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/auth/sign-up">{plan.cta}</Link>
                    </Button>
                  )
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.highlight ? "default" : "outline"}
                    onClick={() => handleSelect(plan.id)}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Spinner className="mr-2 h-3 w-3" />
                        Redirecting...
                      </>
                    ) : currentPlan === "free" ? (
                      plan.cta
                    ) : (
                      "Manage plan"
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
