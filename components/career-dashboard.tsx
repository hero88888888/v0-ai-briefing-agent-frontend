"use client"

import { useState } from "react"
import { Plus, X, Building2, Briefcase, TrendingUp, DollarSign, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CareerDashboardProps {
  onGenerateBrief: () => void
  isGenerating: boolean
  companies: string[]
  roles: string[]
  onCompaniesChange: (companies: string[]) => void
  onRolesChange: (roles: string[]) => void
}

const mockFundingAlerts = [
  {
    id: 1,
    company: "Anthropic",
    amount: "$750M",
    round: "Series E",
    date: "2 hours ago",
    relevance: "high"
  },
  {
    id: 2,
    company: "Stripe",
    amount: "$6.5B",
    round: "Series I",
    date: "1 day ago",
    relevance: "medium"
  },
  {
    id: 3,
    company: "Databricks",
    amount: "$500M",
    round: "Series J",
    date: "2 days ago",
    relevance: "high"
  },
  {
    id: 4,
    company: "Figma",
    amount: "$200M",
    round: "Secondary",
    date: "3 days ago",
    relevance: "low"
  },
  {
    id: 5,
    company: "Scale AI",
    amount: "$325M",
    round: "Series F",
    date: "5 days ago",
    relevance: "medium"
  }
]

export function CareerDashboard({ 
  onGenerateBrief, 
  isGenerating,
  companies,
  roles,
  onCompaniesChange,
  onRolesChange
}: CareerDashboardProps) {
  const [newCompany, setNewCompany] = useState("")
  const [newRole, setNewRole] = useState("")

  const addCompany = () => {
    if (newCompany.trim()) {
      onCompaniesChange([...companies, newCompany.trim()])
      setNewCompany("")
    }
  }

  const removeCompany = (index: number) => {
    onCompaniesChange(companies.filter((_, i) => i !== index))
  }

  const addRole = () => {
    if (newRole.trim()) {
      onRolesChange([...roles, newRole.trim()])
      setNewRole("")
    }
  }

  const removeRole = (index: number) => {
    onRolesChange(roles.filter((_, i) => i !== index))
  }

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case "high":
        return "bg-primary/20 text-primary"
      case "medium":
        return "bg-accent/20 text-accent"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Input Forms */}
      <div className="space-y-6">
        {/* Target Companies */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Building2 className="w-4 h-4 text-primary" />
              Target Companies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add target company..."
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCompany()}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
              <Button 
                onClick={addCompany} 
                size="icon" 
                variant="secondary"
                className="shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {companies.map((company, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-md text-sm text-secondary-foreground"
                >
                  <span>{company}</span>
                  <button
                    onClick={() => removeCompany(index)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Target Roles */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Briefcase className="w-4 h-4 text-accent" />
              Target Roles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add target role..."
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addRole()}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
              <Button 
                onClick={addRole} 
                size="icon" 
                variant="secondary"
                className="shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {roles.map((role, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-md text-sm text-secondary-foreground"
                >
                  <span>{role}</span>
                  <button
                    onClick={() => removeRole(index)}
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
            "Generate AI Brief"
          )}
        </Button>
      </div>

      {/* Right Column - Funding Alerts */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <TrendingUp className="w-4 h-4 text-primary" />
            Recent Funding Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockFundingAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start justify-between p-4 bg-secondary/50 rounded-lg border border-border hover:bg-secondary/80 transition-colors"
              >
                <div className="space-y-1">
                  <h4 className="font-medium text-foreground">{alert.company}</h4>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {alert.amount}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 bg-muted rounded">
                      {alert.round}
                    </span>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${getRelevanceColor(alert.relevance)}`}>
                    {alert.relevance.charAt(0).toUpperCase() + alert.relevance.slice(1)}
                  </span>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                    <Calendar className="w-3 h-3" />
                    {alert.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
