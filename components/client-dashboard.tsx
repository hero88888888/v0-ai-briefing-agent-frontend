"use client"

import { useState } from "react"
import { Plus, X, Building2, Target, AlertTriangle, UserCheck, Package, TrendingDown, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ClientDashboardProps {
  onGenerateBrief: () => void
  isGenerating: boolean
}

const mockAccountTriggers = [
  {
    id: 1,
    company: "Snowflake",
    event: "Leadership Change: New CTO appointed",
    detail: "Former Google Cloud VP taking the helm",
    date: "3 hours ago",
    type: "leadership"
  },
  {
    id: 2,
    company: "Palantir",
    event: "New Product Launch: AIP Platform 2.0",
    detail: "Enterprise AI deployment expansion",
    date: "1 day ago",
    type: "product"
  },
  {
    id: 3,
    company: "Databricks",
    event: "Earnings Beat: Q4 revenue up 35% YoY",
    detail: "Raised full-year guidance significantly",
    date: "2 days ago",
    type: "earnings"
  },
  {
    id: 4,
    company: "Confluent",
    event: "Earnings Miss: Guidance below expectations",
    detail: "Stock down 12% after-hours",
    date: "3 days ago",
    type: "earnings-miss"
  },
  {
    id: 5,
    company: "MongoDB",
    event: "Strategic Partnership: AWS expanded deal",
    detail: "Multi-year enterprise agreement signed",
    date: "4 days ago",
    type: "partnership"
  }
]

export function ClientDashboard({ onGenerateBrief, isGenerating }: ClientDashboardProps) {
  const [accounts, setAccounts] = useState<string[]>(["Snowflake", "Palantir", "Databricks"])
  const [competitors, setCompetitors] = useState<string[]>(["Microsoft Azure", "AWS", "Google Cloud"])
  const [newAccount, setNewAccount] = useState("")
  const [newCompetitor, setNewCompetitor] = useState("")

  const addAccount = () => {
    if (newAccount.trim()) {
      setAccounts([...accounts, newAccount.trim()])
      setNewAccount("")
    }
  }

  const removeAccount = (index: number) => {
    setAccounts(accounts.filter((_, i) => i !== index))
  }

  const addCompetitor = () => {
    if (newCompetitor.trim()) {
      setCompetitors([...competitors, newCompetitor.trim()])
      setNewCompetitor("")
    }
  }

  const removeCompetitor = (index: number) => {
    setCompetitors(competitors.filter((_, i) => i !== index))
  }

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case "leadership":
        return <UserCheck className="w-4 h-4 text-primary" />
      case "product":
        return <Package className="w-4 h-4 text-accent" />
      case "earnings":
        return <TrendingDown className="w-4 h-4 text-primary" />
      case "earnings-miss":
        return <AlertTriangle className="w-4 h-4 text-destructive" />
      default:
        return <Building2 className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getTriggerBadge = (type: string) => {
    switch (type) {
      case "leadership":
        return { label: "Leadership", className: "bg-primary/20 text-primary" }
      case "product":
        return { label: "Product", className: "bg-accent/20 text-accent" }
      case "earnings":
        return { label: "Earnings", className: "bg-primary/20 text-primary" }
      case "earnings-miss":
        return { label: "Alert", className: "bg-destructive/20 text-destructive" }
      default:
        return { label: "News", className: "bg-muted text-muted-foreground" }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Input Forms */}
      <div className="space-y-6">
        {/* Target Accounts */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Building2 className="w-4 h-4 text-primary" />
              Target Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add target account (e.g., Snowflake)..."
                value={newAccount}
                onChange={(e) => setNewAccount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addAccount()}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
              <Button 
                onClick={addAccount} 
                size="icon" 
                variant="secondary"
                className="shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {accounts.map((account, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-md text-sm text-secondary-foreground"
                >
                  <span>{account}</span>
                  <button
                    onClick={() => removeAccount(index)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tracked Competitors */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Target className="w-4 h-4 text-accent" />
              Tracked Competitors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add tracked competitor..."
                value={newCompetitor}
                onChange={(e) => setNewCompetitor(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCompetitor()}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
              <Button 
                onClick={addCompetitor} 
                size="icon" 
                variant="secondary"
                className="shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {competitors.map((competitor, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-md text-sm text-secondary-foreground"
                >
                  <span>{competitor}</span>
                  <button
                    onClick={() => removeCompetitor(index)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Button 
          onClick={onGenerateBrief}
          disabled={isGenerating}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-6"
          size="lg"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Generating Brief...
            </span>
          ) : (
            "Generate Mock Brief"
          )}
        </Button>
      </div>

      {/* Right Column - Account Triggers */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <AlertTriangle className="w-4 h-4 text-primary" />
            Recent Account Triggers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockAccountTriggers.map((trigger) => {
              const badge = getTriggerBadge(trigger.type)
              return (
                <div
                  key={trigger.id}
                  className="flex items-start justify-between p-4 bg-secondary/50 rounded-lg border border-border hover:bg-secondary/80 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getTriggerIcon(trigger.type)}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium text-foreground">{trigger.company}</h4>
                      <p className="text-sm text-secondary-foreground">{trigger.event}</p>
                      <p className="text-xs text-muted-foreground">{trigger.detail}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1 shrink-0 ml-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${badge.className}`}>
                      {badge.label}
                    </span>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                      <Calendar className="w-3 h-3" />
                      {trigger.date}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
