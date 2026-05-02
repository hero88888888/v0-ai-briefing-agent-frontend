"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { TerminalSquare, LogOut, Settings, CreditCard, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import type { Plan } from "@/lib/plans"

interface AppHeaderProps {
  userEmail: string
  userName: string | null
  planName: string
  planId: Plan
  usageUsed: number
  usageLimit: number | null
}

export function AppHeader({
  userEmail,
  userName,
  planName,
  planId,
  usageUsed,
  usageLimit,
}: AppHeaderProps) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const initials = (userName || userEmail).slice(0, 2).toUpperCase()
  const usageLabel = usageLimit === null ? "Unlimited" : `${usageUsed} / ${usageLimit}`
  const usagePct = usageLimit === null ? 0 : Math.min(100, (usageUsed / usageLimit) * 100)
  const nearLimit = usageLimit !== null && usageUsed / usageLimit >= 0.8

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
        <Link href="/app" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
            <TerminalSquare className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight hidden sm:inline">Alpha Agent</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Usage indicator */}
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-md border border-border bg-card">
            <div className="flex items-center gap-1.5">
              <Activity className={`w-3.5 h-3.5 ${nearLimit ? "text-destructive" : "text-primary"}`} />
              <span className="text-xs font-medium text-muted-foreground">Briefs:</span>
              <span className={`text-xs font-mono ${nearLimit ? "text-destructive" : "text-foreground"}`}>
                {usageLabel}
              </span>
            </div>
            {usageLimit !== null && (
              <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${nearLimit ? "bg-destructive" : "bg-primary"}`}
                  style={{ width: `${usagePct}%` }}
                />
              </div>
            )}
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              {planName}
            </span>
          </div>

          {planId === "free" && (
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/pricing">Upgrade</Link>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center w-9 h-9 rounded-full bg-secondary border border-border hover:border-primary/40 transition text-sm font-medium">
                {initials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col">
                  <span className="text-sm font-medium truncate">{userName || "Operator"}</span>
                  <span className="text-xs text-muted-foreground truncate">{userEmail}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/pricing" className="cursor-pointer">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing & Plan
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
