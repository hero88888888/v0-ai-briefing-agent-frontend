"use client"

import { useState } from "react"
import { Key, Eye, EyeOff, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ApiKeyInputProps {
  apiKey: string
  onApiKeyChange: (key: string) => void
}

export function ApiKeyInput({ apiKey, onApiKeyChange }: ApiKeyInputProps) {
  const [showKey, setShowKey] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const hasKey = apiKey.length > 0
  const isValidFormat = apiKey.startsWith("sk-") && apiKey.length > 20

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
          isFocused 
            ? "border-primary bg-card" 
            : hasKey 
              ? "border-primary/50 bg-card" 
              : "border-border bg-card/50"
        }`}>
          <Key className={`w-3.5 h-3.5 shrink-0 ${
            isValidFormat ? "text-primary" : "text-muted-foreground"
          }`} />
          <Input
            type={showKey ? "text" : "password"}
            placeholder="OpenAI API Key"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="border-0 bg-transparent p-0 h-auto text-xs w-32 sm:w-40 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
          />
          {hasKey && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-5 w-5 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? (
                <EyeOff className="w-3 h-3" />
              ) : (
                <Eye className="w-3 h-3" />
              )}
            </Button>
          )}
          {isValidFormat && (
            <Check className="w-3.5 h-3.5 text-primary shrink-0" />
          )}
        </div>
      </div>
    </div>
  )
}
