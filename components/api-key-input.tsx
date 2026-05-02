"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Key, Eye, EyeOff, Check, Database, Brain, ChevronDown, Settings2, Trash2, Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ApiKeyInputProps {
  openaiKey: string
  brightDataKey: string
  brightDataZone: string
  mubitKey: string
  onOpenaiKeyChange: (key: string) => void
  onBrightDataKeyChange: (key: string) => void
  onBrightDataZoneChange: (zone: string) => void
  onMubitKeyChange: (key: string) => void
  /** Called when user clicks "Clear all keys" */
  onClearAll?: () => void
}

interface SingleKeyInputProps {
  icon: React.ReactNode
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  validator?: (value: string) => boolean
  hint?: string
  type?: "password" | "text"
  width?: "narrow" | "wide"
}

function SingleKeyInput({
  icon,
  label,
  placeholder,
  value,
  onChange,
  validator,
  hint,
  type = "password",
  width = "narrow",
}: SingleKeyInputProps) {
  const [showKey, setShowKey] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const hasKey = value.length > 0
  const isValid = validator ? validator(value) : hasKey
  const widthClass = width === "wide" ? "w-full" : "w-32"

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</label>
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
          isFocused ? "border-primary bg-card" : hasKey ? "border-primary/50 bg-card" : "border-border bg-card/50"
        }`}
      >
        <span className={`shrink-0 ${isValid ? "text-primary" : "text-muted-foreground"}`}>{icon}</span>
        <Input
          type={type === "text" ? "text" : showKey ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`border-0 bg-transparent p-0 h-auto text-xs ${widthClass} focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground`}
        />
        {hasKey && type === "password" && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-5 w-5 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => setShowKey(!showKey)}
            aria-label={showKey ? "Hide key" : "Show key"}
          >
            {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </Button>
        )}
        {isValid && hasKey && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
      </div>
      {hint && <span className="text-[9px] text-muted-foreground">{hint}</span>}
    </div>
  )
}

export function ApiKeyInput({
  openaiKey,
  brightDataKey,
  brightDataZone,
  mubitKey,
  onOpenaiKeyChange,
  onBrightDataKeyChange,
  onBrightDataZoneChange,
  onMubitKeyChange,
  onClearAll,
}: ApiKeyInputProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const hasOpenAI = openaiKey.length > 0
  const hasBrightData = brightDataKey.length > 0
  const hasMubit = mubitKey.length > 0
  const integrationCount = [hasBrightData, hasMubit].filter(Boolean).length

  // Close panel on outside click
  useEffect(() => {
    if (!isExpanded) return
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsExpanded(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isExpanded])

  // Close on escape
  useEffect(() => {
    if (!isExpanded) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsExpanded(false)
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [isExpanded])

  return (
    <div className="relative" ref={panelRef}>
      <div className="flex items-center gap-2">
        <SingleKeyInput
          icon={<Key className="w-3.5 h-3.5" />}
          label="OpenAI"
          placeholder="sk-..."
          value={openaiKey}
          onChange={onOpenaiKeyChange}
          validator={(v) => v.startsWith("sk-") && v.length > 20}
        />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1.5 self-end"
          aria-expanded={isExpanded}
          aria-label="Toggle integrations panel"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Integrations</span>
          {integrationCount > 0 && (
            <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">
              {integrationCount}
            </span>
          )}
          <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </Button>
      </div>

      {isExpanded && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-card border border-border rounded-lg p-4 shadow-2xl w-[340px] sm:w-[380px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-medium text-foreground">Data Integrations</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">Optional. Enhances briefs with live data + memory.</p>
            </div>
            {(hasBrightData || hasMubit || hasOpenAI) && onClearAll && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="h-7 text-[10px] text-muted-foreground hover:text-destructive gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear all
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {/* Bright Data section */}
            <div className="rounded-lg border border-border bg-card/50 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground">Bright Data</span>
                {hasBrightData && (
                  <span className="ml-auto text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">CONNECTED</span>
                )}
              </div>
              <div className="space-y-2">
                <SingleKeyInput
                  icon={<Key className="w-3 h-3" />}
                  label="API Token"
                  placeholder="API Token"
                  value={brightDataKey}
                  onChange={onBrightDataKeyChange}
                  width="wide"
                />
                <SingleKeyInput
                  icon={<Settings2 className="w-3 h-3" />}
                  label="SERP Zone Name"
                  placeholder="serp_api1"
                  value={brightDataZone}
                  onChange={onBrightDataZoneChange}
                  type="text"
                  width="wide"
                  hint="Found under Zones in your Bright Data control panel"
                />
              </div>
            </div>

            {/* Mubit section */}
            <div className="rounded-lg border border-border bg-card/50 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground">Mubit Memory</span>
                {hasMubit && (
                  <span className="ml-auto text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">CONNECTED</span>
                )}
              </div>
              <SingleKeyInput
                icon={<Key className="w-3 h-3" />}
                label="API Key"
                placeholder="mbt_..."
                value={mubitKey}
                onChange={onMubitKeyChange}
                validator={(v) => v.startsWith("mbt_") && v.length > 20}
                width="wide"
                hint="Persistent agent memory across sessions"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-start gap-2">
            <Lock className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Keys are stored only in your browser&apos;s localStorage and sent directly to provider APIs. They never
              touch our servers&apos; logs.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
