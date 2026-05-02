"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { createPortalSession } from "@/app/actions/billing"

export function ManageBillingButton({ hasCustomer }: { hasCustomer: boolean }) {
  const [isPending, startTransition] = useTransition()

  if (!hasCustomer) {
    return (
      <Button disabled variant="outline">
        No billing account
      </Button>
    )
  }

  return (
    <Button
      onClick={() =>
        startTransition(async () => {
          const result = await createPortalSession()
          if (result?.error) {
            alert(result.error)
          }
        })
      }
      disabled={isPending}
    >
      {isPending ? (
        <>
          <Spinner className="mr-2 h-3 w-3" />
          Opening...
        </>
      ) : (
        "Manage billing"
      )}
    </Button>
  )
}
