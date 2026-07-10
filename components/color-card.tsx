"use client"

import { useState } from "react"
import { Check, Copy, Trash2 } from "lucide-react"
import { type OklchColor, oklchString, readableTextColor } from "@/lib/oklch"
import { Button } from "@/components/ui/button"
import { BeakerIcon } from "@heroicons/react/24/outline"

type ColorCardProps = {
  color: OklchColor
  onRemove: (id: string) => void
  onInterpolate: () => void
  isLast?: boolean
}

export function ColorCard({ color, isLast, onRemove, onInterpolate }: ColorCardProps) {
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
    <div className="relative group  border-v border-border bg-card animate-grow">
      <div
        className="relative flex h-28 items-start justify-end p-2 z-10"
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
      <div className="flex items-center justify-between gap-2 p-3  border shadow-md ">
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
      {
        !isLast && (
          <Button
            variant="outline"
            className="cursor-pointer rounded-full absolute -translate-y-32! right-[-1.1rem] z-20  transition-none  active:-translate-y-32! opacity-0 hover:opacity-100 focus-visible:opacity-100 group-hover:opacity-100 active:bg-slate-200 "
            translate="no"
            aria-haspopup="true"
            aria-label={`Interpolate ${color.name} with next color`}
            onClick={() => onInterpolate()}
          >
            <BeakerIcon />
          </Button>
        )
      }
    </div>
  )
}
