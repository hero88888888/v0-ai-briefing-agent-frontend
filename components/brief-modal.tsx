"use client"

import { X, FileText, TrendingUp, Briefcase, Calendar, AlertCircle, Users, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Persona = "macro" | "career" | "client"

interface BriefModalProps {
  isOpen: boolean
  onClose: () => void
  persona: Persona
}

const macroBriefContent = {
  title: "Daily Macro Intelligence Brief",
  date: new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
  sections: [
    {
      title: "Market Pulse",
      icon: TrendingUp,
      items: [
        "US 10Y yields up 8bps to 4.52% on hawkish Fed commentary",
        "EUR/USD testing 1.0850 support after ECB rate decision",
        "Crude Oil rallying +2.3% on Middle East supply concerns"
      ]
    },
    {
      title: "Key Meetings Today",
      icon: Calendar,
      items: [
        "09:00 - Weekly Macro Review (8 attendees)",
        "02:30 - Fed Policy Deep Dive with Chief Economist",
        "04:00 - PM sync on Q2 positioning adjustments"
      ]
    },
    {
      title: "Action Items",
      icon: AlertCircle,
      items: [
        "Review EM currency exposure ahead of tomorrow's CPI print",
        "Prepare talking points for Fed policy implications",
        "Update Global Macro Fund allocation memo"
      ]
    }
  ]
}

const careerBriefContent = {
  title: "Daily Career Alpha Brief",
  date: new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
  sections: [
    {
      title: "Hot Opportunities",
      icon: Briefcase,
      items: [
        "Anthropic: Chief of Staff role opened - Series E momentum",
        "OpenAI: VP Strategy position - org restructuring underway",
        "Google DeepMind: Head of BD expansion in London office"
      ]
    },
    {
      title: "Funding Intelligence",
      icon: TrendingUp,
      items: [
        "Anthropic raised $750M Series E - likely hiring spree incoming",
        "Databricks $500M raise signals enterprise AI push",
        "Scale AI Series F suggests expansion into new verticals"
      ]
    },
    {
      title: "Networking Actions",
      icon: AlertCircle,
      items: [
        "Reach out to Sarah Chen (ex-Stripe) re: Anthropic intro",
        "Follow up on DeepMind coffee chat from last week",
        "Prepare talking points for VC dinner Thursday"
      ]
    }
  ]
}

const clientBriefContent = {
  title: "Daily Client Intelligence Brief",
  date: new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
  sections: [
    {
      title: "Priority Account Triggers",
      icon: Users,
      items: [
        "Snowflake: New CTO from Google Cloud - schedule intro call",
        "Palantir: AIP Platform 2.0 launch creates upsell opportunity",
        "Databricks: Q4 earnings beat - budget expansion likely"
      ]
    },
    {
      title: "Competitive Intelligence",
      icon: Target,
      items: [
        "AWS announced 15% price cut on data services - prepare counter",
        "Microsoft Azure expanding enterprise AI partnerships",
        "Google Cloud aggressive on migration incentives"
      ]
    },
    {
      title: "Sales Actions",
      icon: AlertCircle,
      items: [
        "Reach out to Snowflake new CTO within 48 hours",
        "Prepare Confluent win-back strategy after earnings miss",
        "Schedule QBR with MongoDB following AWS partnership news"
      ]
    }
  ]
}

const briefContents = {
  macro: macroBriefContent,
  career: careerBriefContent,
  client: clientBriefContent
}

export function BriefModal({ isOpen, onClose, persona }: BriefModalProps) {
  if (!isOpen) return null

  const content = briefContents[persona]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-auto mx-4">
        <Card className="border-border bg-card shadow-2xl">
          <CardHeader className="flex flex-row items-start justify-between border-b border-border pb-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  {content.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {content.date}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {content.sections.map((section, index) => (
              <div key={index} className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground uppercase tracking-wider">
                  <section.icon className="w-4 h-4 text-primary" />
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li 
                      key={itemIndex}
                      className="flex items-start gap-2 text-sm text-secondary-foreground pl-6"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Generated by AI Briefing Agent | Mock Data
                </p>
                <Button 
                  onClick={onClose}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Close Brief
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
