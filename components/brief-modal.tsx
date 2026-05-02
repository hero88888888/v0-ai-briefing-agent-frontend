"use client"

import { useEffect, useState } from "react"
import {
  X,
  FileText,
  Sparkles,
  AlertCircle,
  Link2,
  Database,
  Brain,
  Copy,
  Check,
  ExternalLink,
  Radio,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { BriefDataSources, Persona } from "@/app/actions/generate-brief"
import type { Citation } from "@/lib/bright-data"

interface BriefModalProps {
  isOpen: boolean
  onClose: () => void
  persona: Persona
  briefContent: string | null
  error?: string | null
  dataSources?: BriefDataSources
  citations?: Citation[]
  /** True when the brief is currently being generated. */
  isLoading?: boolean
  /** ISO timestamp the brief was generated; defaults to now if absent. */
  generatedAt?: number
}

const personaTitles: Record<Persona, string> = {
  macro: "Macro Intelligence Brief",
  career: "Career Alpha Brief",
  client: "Client Intelligence Brief",
}

interface ParsedBullet {
  text: string
  isLinked: boolean
}

function parseBulletPoints(content: string): ParsedBullet[] {
  return content
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      let cleaned = line.replace(/^[\d.)\-*•]+\s*/, "").trim()
      const isLinked = /\[LINKED\]/i.test(cleaned)
      cleaned = cleaned.replace(/\s*\[LINKED\]\s*/gi, "").trim()
      return { text: cleaned, isLinked }
    })
    .filter((b) => b.text.length > 0)
}

export function BriefModal({
  isOpen,
  onClose,
  persona,
  briefContent,
  error,
  dataSources,
  citations,
  isLoading,
  generatedAt,
}: BriefModalProps) {
  const [copied, setCopied] = useState(false)

  // Reset copied state when content changes or modal closes
  useEffect(() => {
    if (!isOpen) setCopied(false)
  }, [isOpen, briefContent])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const title = personaTitles[persona]
  const ts = generatedAt ?? Date.now()
  const date = new Date(ts).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const time = new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

  const bullets = briefContent ? parseBulletPoints(briefContent) : []

  const handleCopy = async () => {
    if (!briefContent) return
    try {
      const cleaned = briefContent.replace(/\s*\[LINKED\]\s*/gi, "").trim()
      await navigator.clipboard.writeText(cleaned)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.warn("[v0] Copy failed:", err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-auto mx-4">
        <Card className="border-border bg-card shadow-2xl">
          <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-xl font-semibold text-foreground truncate">{title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {date} <span className="text-border mx-1">|</span> {time}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {briefContent && !isLoading && !error && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
                  aria-label="Copy brief"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-xs hidden sm:inline">Copy</span>
                    </>
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground h-8 w-8"
                aria-label="Close brief"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Loading state */}
            {isLoading && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  <span>Synthesizing intelligence&hellip;</span>
                </div>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 bg-secondary/50 rounded-lg border border-border animate-pulse"
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    <div className="w-6 h-6 rounded-full bg-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {!isLoading && error && (
              <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-medium text-destructive">Generation Failed</p>
                  <p className="text-sm text-destructive/80 mt-1 break-words">{error}</p>
                </div>
              </div>
            )}

            {/* Success state */}
            {!isLoading && !error && briefContent && (
              <div className="space-y-4">
                {/* Data source badges */}
                {dataSources && (
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      <span>AI-Generated</span>
                    </div>
                    {dataSources.brightData.enabled && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border ${
                          dataSources.brightData.live
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                        title={
                          dataSources.brightData.error
                            ? `Bright Data error: ${dataSources.brightData.error}`
                            : undefined
                        }
                      >
                        {dataSources.brightData.live ? (
                          <Radio className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        Bright Data
                        {dataSources.brightData.live
                          ? ` · ${dataSources.brightData.itemCount} live`
                          : " · fallback"}
                      </span>
                    )}
                    {dataSources.mubit.enabled && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs font-medium rounded border border-purple-500/20">
                        <Brain className="w-3 h-3" />
                        Mubit Memory
                      </span>
                    )}
                  </div>
                )}

                {/* Bullets */}
                <ul className="space-y-3">
                  {bullets.map((b, index) => (
                    <li
                      key={index}
                      className={`flex items-start gap-3 p-4 rounded-lg border ${
                        b.isLinked ? "bg-accent/10 border-accent/30" : "bg-secondary/50 border-border"
                      }`}
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-semibold shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-relaxed">{b.text}</p>
                        {b.isLinked && (
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

                {/* Citations panel */}
                {citations && citations.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-border">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Database className="w-3 h-3" />
                      Sources Used ({citations.length})
                    </h4>
                    <ul className="space-y-2">
                      {citations.slice(0, 6).map((c, i) => {
                        const inner = (
                          <div className="flex items-start gap-2 p-2 rounded hover:bg-secondary/50 transition-colors">
                            <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5 font-mono w-4">
                              {i + 1}.
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-foreground line-clamp-1">{c.title}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {c.source} <span className="text-border mx-1">|</span> {c.publishedAt}
                              </p>
                            </div>
                            {c.url && <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />}
                          </div>
                        )
                        return (
                          <li key={i}>
                            {c.url ? (
                              <a href={c.url} target="_blank" rel="noopener noreferrer" className="block">
                                {inner}
                              </a>
                            ) : (
                              inner
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="pt-6 mt-6 border-t border-border">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  Powered by GPT-4o mini
                </p>
                <Button onClick={onClose} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Close
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
