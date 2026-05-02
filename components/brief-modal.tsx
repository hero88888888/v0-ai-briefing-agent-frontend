"use client"

import { X, FileText, Sparkles, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Persona = "macro" | "career" | "client"

interface BriefModalProps {
  isOpen: boolean
  onClose: () => void
  persona: Persona
  briefContent: string | null
  error?: string | null
}

const personaTitles: Record<Persona, string> = {
  macro: "Macro Intelligence Brief",
  career: "Career Alpha Brief",
  client: "Client Intelligence Brief"
}

export function BriefModal({ isOpen, onClose, persona, briefContent, error }: BriefModalProps) {
  if (!isOpen) return null

  const title = personaTitles[persona]
  const date = new Date().toLocaleDateString("en-US", { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  })

  // Parse bullet points from the AI response
  const parseBulletPoints = (content: string): string[] => {
    // Split by common bullet patterns
    const lines = content.split(/\n/).filter(line => line.trim())
    
    // Clean up each line
    return lines.map(line => {
      // Remove leading numbers, bullets, dashes, asterisks
      return line.replace(/^[\d\.\)\-\*\•]+\s*/, "").trim()
    }).filter(line => line.length > 0)
  }

  const bulletPoints = briefContent ? parseBulletPoints(briefContent) : []

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
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  {title}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {date}
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
          <CardContent className="pt-6">
            {error ? (
              <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Error</p>
                  <p className="text-sm text-destructive/80 mt-1">{error}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>AI-Generated Intelligence Brief</span>
                </div>
                
                <ul className="space-y-4">
                  {bulletPoints.map((point, index) => (
                    <li 
                      key={index}
                      className="flex items-start gap-3 p-4 bg-secondary/50 rounded-lg border border-border"
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-semibold shrink-0">
                        {index + 1}
                      </span>
                      <p className="text-sm text-secondary-foreground leading-relaxed">
                        {point}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="pt-6 mt-6 border-t border-border">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  Powered by GPT-4o Mini
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
