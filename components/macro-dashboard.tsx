"use client"

import { useState } from "react"
import { Plus, X, Calendar, Clock, Users, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MacroDashboardProps {
  onGenerateBrief: () => void
  isGenerating: boolean
  portfolios: string[]
  assetClasses: string[]
  onPortfoliosChange: (portfolios: string[]) => void
  onAssetClassesChange: (assetClasses: string[]) => void
}

const mockMeetings = [
  {
    id: 1,
    title: "Weekly Macro Review",
    time: "09:00 AM",
    date: "Today",
    attendees: 8,
    type: "recurring"
  },
  {
    id: 2,
    title: "Fed Policy Deep Dive",
    time: "02:30 PM",
    date: "Today",
    attendees: 12,
    type: "one-time"
  },
  {
    id: 3,
    title: "EM Currency Outlook",
    time: "10:00 AM",
    date: "Tomorrow",
    attendees: 6,
    type: "recurring"
  },
  {
    id: 4,
    title: "Q2 Positioning Call",
    time: "04:00 PM",
    date: "Tomorrow",
    attendees: 15,
    type: "one-time"
  }
]

export function MacroDashboard({ 
  onGenerateBrief, 
  isGenerating,
  portfolios,
  assetClasses,
  onPortfoliosChange,
  onAssetClassesChange
}: MacroDashboardProps) {
  const [newPortfolio, setNewPortfolio] = useState("")
  const [newAssetClass, setNewAssetClass] = useState("")

  const addPortfolio = () => {
    if (newPortfolio.trim()) {
      onPortfoliosChange([...portfolios, newPortfolio.trim()])
      setNewPortfolio("")
    }
  }

  const removePortfolio = (index: number) => {
    onPortfoliosChange(portfolios.filter((_, i) => i !== index))
  }

  const addAssetClass = () => {
    if (newAssetClass.trim()) {
      onAssetClassesChange([...assetClasses, newAssetClass.trim()])
      setNewAssetClass("")
    }
  }

  const removeAssetClass = (index: number) => {
    onAssetClassesChange(assetClasses.filter((_, i) => i !== index))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Input Forms */}
      <div className="space-y-6">
        {/* Target Portfolios/PMs */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <TrendingUp className="w-4 h-4 text-primary" />
              Target Portfolios / PMs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add portfolio or PM..."
                value={newPortfolio}
                onChange={(e) => setNewPortfolio(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPortfolio()}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
              <Button 
                onClick={addPortfolio} 
                size="icon" 
                variant="secondary"
                className="shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {portfolios.map((portfolio, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-md text-sm text-secondary-foreground"
                >
                  <span>{portfolio}</span>
                  <button
                    onClick={() => removePortfolio(index)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tracked Asset Classes */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <TrendingUp className="w-4 h-4 text-accent" />
              Tracked Asset Classes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add asset class..."
                value={newAssetClass}
                onChange={(e) => setNewAssetClass(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addAssetClass()}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
              <Button 
                onClick={addAssetClass} 
                size="icon" 
                variant="secondary"
                className="shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {assetClasses.map((assetClass, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-md text-sm text-secondary-foreground"
                >
                  <span>{assetClass}</span>
                  <button
                    onClick={() => removeAssetClass(index)}
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

      {/* Right Column - Calendar Meetings */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Calendar className="w-4 h-4 text-primary" />
            Upcoming Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-start justify-between p-4 bg-secondary/50 rounded-lg border border-border hover:bg-secondary/80 transition-colors"
              >
                <div className="space-y-1">
                  <h4 className="font-medium text-foreground">{meeting.title}</h4>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {meeting.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {meeting.attendees}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    meeting.date === "Today" 
                      ? "bg-primary/20 text-primary" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {meeting.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
