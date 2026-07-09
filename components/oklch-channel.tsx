"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

type OklchChannelProps = {
  id: string
  label: string
  hint: string
  value: number
  min: number
  max: number
  step: number
  decimals: number
  trackGradient: string
  onChange: (value: number) => void
}

export function OklchChannel({
  id,
  label,
  hint,
  value,
  min,
  max,
  step,
  decimals,
  trackGradient,
  onChange,
}: OklchChannelProps) {
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          <span className="ml-2 text-xs font-normal text-muted-foreground">{hint}</span>
        </Label>
        <span className="font-mono text-sm tabular-nums text-foreground">
          {Number.isFinite(value) ? value.toFixed(decimals) : (0).toFixed(decimals)}
        </span>
      </div>
      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full border border-border"
          style={{ backgroundImage: trackGradient }}
        />
        <Slider
          id={id}
          value={[Number.isFinite(value) ? value : min]}
          min={min}
          max={max}
          step={step}
          onValueChange={(v) => {
            const next = Array.isArray(v) ? v[0] : v
            if (Number.isFinite(next)) {
              // Snap to the channel's precision to avoid float drift (e.g. 0.6499999).
              onChange(Number(Number(next).toFixed(decimals)))
            }
          }}
          className="relative [&_[data-slot=slider-track]]:bg-transparent [&_[data-slot=slider-range]]:bg-transparent"
        />
      </div>
    </div>
  )
}
