import "server-only"
import Stripe from "stripe"

// Stripe requires a secret key to initialize. During build time (when building for deployment),
// the key may not be set yet. Provide a dummy key to allow build to succeed; the webhook
// handler will reject requests if the real key isn't configured at runtime.
const secretKey = process.env.STRIPE_SECRET_KEY || "sk_test_dummy_key_for_build"

export const stripe = new Stripe(secretKey, {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
})
