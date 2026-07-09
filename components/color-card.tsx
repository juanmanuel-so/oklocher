"use client"

import { useState } from "react"
import { Check, Copy, Trash2 } from "lucide-react"
import { type OklchColor, oklchString, readableTextColor } from "@/lib/oklch"
import { Button } from "@/components/ui/button"

type ColorCardProps = {
  color: OklchColor
  onRemove: (id: string) => void
}

export function ColorCard({ color, onRemove }: ColorCardProps) {
  const [copied, setCopied] = useState(false)
  const css = oklchString(color)
  const textColor = readableTextColor(color)

  function handleCopy() {
    navigator.clipboard.writeText(css).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    })
  }

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div
        className="flex h-28 items-start justify-end p-2"
        style={{ backgroundColor: css, color: textColor }}
      >
        <button
          type="button"
          onClick={() => onRemove(color.id)}
          aria-label={`Remove ${color.name}`}
          className="rounded-md p-1.5 opacity-0 transition-opacity hover:bg-black/10 focus-visible:opacity-100 group-hover:opacity-100"
          style={{ color: textColor }}
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-card-foreground">{color.name}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">{css}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          aria-label={`Copy ${color.name} value`}
          className="shrink-0"
        >
          {copied ? <Check className="size-4 text-foreground" /> : <Copy className="size-4" />}
        </Button>
      </div>
    </div>
  )
}
