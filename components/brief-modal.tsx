"use client"

import { X, FileText, Sparkles, AlertCircle, Link2, Database, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Persona = "macro" | "career" | "client"

interface BriefModalProps {
  isOpen: boolean
  onClose: () => void
  persona: Persona
  briefContent: string | null
  error?: string | null
  dataSources?: {
    brightData: boolean
    mubit: boolean
  }
}

const personaTitles: Record<Persona, string> = {
  macro: "Macro Intelligence Brief",
  career: "Career Alpha Brief",
  client: "Client Intelligence Brief"
}

export function BriefModal({ isOpen, onClose, persona, briefContent, error, dataSources }: BriefModalProps) {
  if (!isOpen) return null

  const title = personaTitles[persona]
  const date = new Date().toLocaleDateString("en-US", { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  })

  // Parse bullet points from the AI response and detect linked items
  const parseBulletPoints = (content: string): Array<{ text: string; isLinked: boolean }> => {
    // Split by common bullet patterns
    const lines = content.split(/\n/).filter(line => line.trim())
    
    // Clean up each line and check for [LINKED] marker
    return lines.map(line => {
      // Remove leading numbers, bullets, dashes, asterisks
      let cleanedLine = line.replace(/^[\d\.\)\-\*\•]+\s*/, "").trim()
      
      // Check for [LINKED] marker
      const isLinked = cleanedLine.includes("[LINKED]")
      
      // Remove the marker from display
      cleanedLine = cleanedLine.replace(/\s*\[LINKED\]\s*/g, "").trim()
      
      return { text: cleanedLine, isLinked }
    }).filter(item => item.text.length > 0)
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
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>AI-Generated Intelligence Brief</span>
                  </div>
                  {dataSources && (
                    <div className="flex items-center gap-2 ml-2">
                      {dataSources.brightData && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-medium rounded border border-blue-500/20">
                          <Database className="w-3 h-3" />
                          Bright Data
                        </span>
                      )}
                      {dataSources.mubit && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs font-medium rounded border border-purple-500/20">
                          <Brain className="w-3 h-3" />
                          Mubit Memory
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <ul className="space-y-4">
                  {bulletPoints.map((item, index) => (
                    <li 
                      key={index}
                      className={`flex items-start gap-3 p-4 rounded-lg border ${
                        item.isLinked 
                          ? "bg-accent/10 border-accent/30" 
                          : "bg-secondary/50 border-border"
                      }`}
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-semibold shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-secondary-foreground leading-relaxed">
                          {item.text}
                        </p>
                        {item.isLinked && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/20 text-accent text-xs font-medium rounded">
                              <Link2 className="w-3 h-3" />
                              Linked to Notes
                            </span>
                          </div>
                        )}
                      </div>
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
