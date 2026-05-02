"use client"

import { TrendingUp, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

type Persona = "macro" | "career"

interface PersonaToggleProps {
  activePersona: Persona
  onPersonaChange: (persona: Persona) => void
}

export function PersonaToggle({ activePersona, onPersonaChange }: PersonaToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
      <button
        onClick={() => onPersonaChange("macro")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
          activePersona === "macro"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <TrendingUp className="w-4 h-4" />
        <span>Macro Intelligence</span>
      </button>
      <button
        onClick={() => onPersonaChange("career")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
          activePersona === "career"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <Briefcase className="w-4 h-4" />
        <span>Career Alpha</span>
      </button>
    </div>
  )
}
