"use client"

import { TrendingUp, Briefcase, Users } from "lucide-react"
import { cn } from "@/lib/utils"

type Persona = "macro" | "career" | "client"

interface PersonaToggleProps {
  activePersona: Persona
  onPersonaChange: (persona: Persona) => void
}

export function PersonaToggle({ activePersona, onPersonaChange }: PersonaToggleProps) {
  const personas = [
    { id: "macro" as const, label: "Macro Intelligence", icon: TrendingUp },
    { id: "career" as const, label: "Career Alpha", icon: Briefcase },
    { id: "client" as const, label: "Client Intelligence", icon: Users },
  ]

  return (
    <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
      {personas.map((persona) => {
        const Icon = persona.icon
        return (
          <button
            key={persona.id}
            onClick={() => onPersonaChange(persona.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
              activePersona === persona.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{persona.label}</span>
            <span className="sm:hidden">
              {persona.id === "macro" ? "Macro" : persona.id === "career" ? "Career" : "Client"}
            </span>
          </button>
        )
      })}
    </div>
  )
}
