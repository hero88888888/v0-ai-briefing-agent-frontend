"use server"

import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"
import { PLANS, type Plan } from "@/lib/plans"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

/**
 * Create a Stripe Checkout session for the given plan.
 * Returns the URL to redirect to (or the user is redirected directly).
 */
export async function createCheckoutSession(plan: Plan): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const planConfig = PLANS[plan]
  if (!planConfig.stripePriceEnv) {
    return { error: "This plan is not purchasable" }
  }

  const priceId = process.env[planConfig.stripePriceEnv]
  if (!priceId) {
    return {
      error: `Stripe price ID not configured. Set ${planConfig.stripePriceEnv} in your environment.`,
    }
  }

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email")
    .eq("id", user.id)
    .single()

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? profile?.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id)
  }

  const headersList = await headers()
  const host = headersList.get("host") ?? "localhost:3000"
  const protocol = host.includes("localhost") ? "http" : "https"
  const origin = `${protocol}://${host}`

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/app?upgraded=true`,
    cancel_url: `${origin}/pricing?canceled=true`,
    metadata: { supabase_user_id: user.id, plan },
    subscription_data: {
      metadata: { supabase_user_id: user.id, plan },
    },
    allow_promotion_codes: true,
  })

  if (!session.url) {
    return { error: "Failed to create checkout session" }
  }

  redirect(session.url)
}

/**
 * Create a Stripe Customer Portal session for self-service billing management.
 */
export async function createPortalSession(): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    return { error: "No billing account found" }
  }

  const headersList = await headers()
  const host = headersList.get("host") ?? "localhost:3000"
  const protocol = host.includes("localhost") ? "http" : "https"
  const origin = `${protocol}://${host}`

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${origin}/settings`,
  })

  redirect(session.url)
}
