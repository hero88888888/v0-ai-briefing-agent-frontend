"use client"

import { Clock, FileText, TrendingUp, Briefcase, Target, Trash2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Persona } from "@/app/actions/generate-brief"

export interface SavedBrief {
  id: string
  persona: Persona
  content: string
  createdAt: number
  /** Brief preview (first ~80 chars). */
  preview: string
  /** Whether real-time data was used. */
  liveData: boolean
  /** Whether memory was used. */
  memoryUsed: boolean
}

interface BriefHistoryProps {
  briefs: SavedBrief[]
  onSelect: (brief: SavedBrief) => void
  onDelete: (id: string) => void
  onClearAll: () => void
}

const personaConfig: Record<Persona, { label: string; Icon: typeof TrendingUp; color: string }> = {
  macro: { label: "Macro", Icon: TrendingUp, color: "text-emerald-400" },
  career: { label: "Career", Icon: Briefcase, color: "text-amber-400" },
  client: { label: "Client", Icon: Target, color: "text-sky-400" },
}

function formatTimestamp(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(ts).toLocaleDateString()
}

export function BriefHistory({ briefs, onSelect, onDelete, onClearAll }: BriefHistoryProps) {
  if (briefs.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <h3 className="text-sm font-medium text-foreground mb-1">No briefs yet</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Generated briefs will appear here. They&apos;re stored in your browser only.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Brief History</h3>
          <span className="text-[10px] text-muted-foreground">({briefs.length})</span>
        </div>
        {briefs.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-6 text-[10px] text-muted-foreground hover:text-destructive gap-1 px-2"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </Button>
        )}
      </div>
      <div className="max-h-[420px] overflow-y-auto">
        <ul className="divide-y divide-border">
          {briefs.map((brief) => {
            const cfg = personaConfig[brief.persona]
            const Icon = cfg.Icon
            return (
              <li key={brief.id} className="group">
                <button
                  type="button"
                  onClick={() => onSelect(brief)}
                  className="w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 shrink-0 ${cfg.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-foreground">{cfg.label}</span>
                        <span className="text-[10px] text-muted-foreground">{formatTimestamp(brief.createdAt)}</span>
                        {brief.liveData && (
                          <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                            LIVE
                          </span>
                        )}
                        {brief.memoryUsed && <Sparkles className="w-3 h-3 text-purple-400" />}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">{brief.preview}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(brief.id)
                      }}
                      className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-1"
                      aria-label="Delete brief"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
