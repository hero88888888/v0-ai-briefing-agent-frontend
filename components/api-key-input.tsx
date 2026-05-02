"use client"

import { useState } from "react"
import { Key, Eye, EyeOff, Check, Database, Brain, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ApiKeyInputProps {
  openaiKey: string
  brightDataKey: string
  mubitKey: string
  onOpenaiKeyChange: (key: string) => void
  onBrightDataKeyChange: (key: string) => void
  onMubitKeyChange: (key: string) => void
}

interface SingleKeyInputProps {
  icon: React.ReactNode
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  validator?: (value: string) => boolean
  hint?: string
}

function SingleKeyInput({ icon, label, placeholder, value, onChange, validator, hint }: SingleKeyInputProps) {
  const [showKey, setShowKey] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const hasKey = value.length > 0
  const isValid = validator ? validator(value) : hasKey

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</label>
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
        isFocused 
          ? "border-primary bg-card" 
          : hasKey 
            ? "border-primary/50 bg-card" 
            : "border-border bg-card/50"
      }`}>
        <span className={`shrink-0 ${isValid ? "text-primary" : "text-muted-foreground"}`}>
          {icon}
        </span>
        <Input
          type={showKey ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="border-0 bg-transparent p-0 h-auto text-xs w-28 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
        />
        {hasKey && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-5 w-5 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </Button>
        )}
        {isValid && hasKey && (
          <Check className="w-3.5 h-3.5 text-primary shrink-0" />
        )}
      </div>
      {hint && <span className="text-[9px] text-muted-foreground">{hint}</span>}
    </div>
  )
}

export function ApiKeyInput({ 
  openaiKey, 
  brightDataKey, 
  mubitKey, 
  onOpenaiKeyChange, 
  onBrightDataKeyChange, 
  onMubitKeyChange 
}: ApiKeyInputProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const hasOpenAI = openaiKey.length > 0
  const hasBrightData = brightDataKey.length > 0
  const hasMubit = mubitKey.length > 0
  const activeCount = [hasOpenAI, hasBrightData, hasMubit].filter(Boolean).length

  return (
    <div className="relative">
      {/* Collapsed view - just OpenAI + expand button */}
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
          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
        >
          <span className="hidden sm:inline">Integrations</span>
          {activeCount > 1 && (
            <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">
              {activeCount - 1}
            </span>
          )}
          <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </Button>
      </div>

      {/* Expanded integrations panel */}
      {isExpanded && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-card border border-border rounded-lg p-4 shadow-xl min-w-[320px]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-medium text-foreground">Data Integrations</h4>
            <span className="text-[10px] text-muted-foreground">Optional - enhances briefs</span>
          </div>
          
          <div className="space-y-3">
            <SingleKeyInput
              icon={<Database className="w-3.5 h-3.5" />}
              label="Bright Data"
              placeholder="API Token"
              value={brightDataKey}
              onChange={onBrightDataKeyChange}
              hint="Real-time news, jobs, company intel"
            />
            
            <SingleKeyInput
              icon={<Brain className="w-3.5 h-3.5" />}
              label="Mubit"
              placeholder="mbt_..."
              value={mubitKey}
              onChange={onMubitKeyChange}
              validator={(v) => v.startsWith("mbt_") && v.length > 10}
              hint="Persistent memory across sessions"
            />
          </div>
          
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Without API keys, the dashboard uses realistic mock data for demonstration. 
              Add your keys for live data feeds.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
