"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import {
  type OklchColor,
  oklchString,
  readableTextColor,
  createId,
  C_MAX,
  H_MAX,
} from "@/lib/oklch"
import { OklchChannel } from "@/components/oklch-channel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Draft = Pick<OklchColor, "l" | "c" | "h">

type AddColorFormProps = {
  onAdd: (color: OklchColor) => void
}

export function AddColorForm({ onAdd }: AddColorFormProps) {
  const [name, setName] = useState("")
  const [draft, setDraft] = useState<Draft>({ l: 0.65, c: 0.18, h: 264 })

  const css = oklchString(draft)
  const textColor = readableTextColor(draft)

  function update(patch: Partial<Draft>) {
    setDraft((prev) => ({ ...prev, ...patch }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onAdd({ id: createId(), name: name.trim() || "Untitled", ...draft })
    setName("")
  }

  // Build gradient tracks that reflect the other two channels.
  const lTrack = `linear-gradient(to right, oklch(0 ${draft.c} ${draft.h}), oklch(1 ${draft.c} ${draft.h}))`
  const cTrack = `linear-gradient(to right, oklch(${draft.l} 0 ${draft.h}), oklch(${draft.l} ${C_MAX} ${draft.h}))`
  const hTrack =
    "linear-gradient(to right, oklch(0.7 0.18 0), oklch(0.7 0.18 60), oklch(0.7 0.18 120), oklch(0.7 0.18 180), oklch(0.7 0.18 240), oklch(0.7 0.18 300), oklch(0.7 0.18 360))"

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div
        className="flex h-32 flex-col justify-end rounded-xl border border-border p-4"
        style={{ backgroundColor: css, color: textColor }}
      >
        <span className="text-xs font-medium uppercase tracking-wide opacity-80">Live preview</span>
        <span className="font-mono text-sm">{css}</span>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="color-name">Color name</Label>
        <Input
          id="color-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Brand Blue"
        />
      </div>

      <OklchChannel
        id="channel-l"
        label="Lightness"
        hint="0 – 1"
        value={draft.l}
        min={0}
        max={1}
        step={0.005}
        decimals={3}
        trackGradient={lTrack}
        onChange={(l) => update({ l })}
      />
      <OklchChannel
        id="channel-c"
        label="Chroma"
        hint={`0 – ${C_MAX}`}
        value={draft.c}
        min={0}
        max={C_MAX}
        step={0.005}
        decimals={3}
        trackGradient={cTrack}
        onChange={(c) => update({ c })}
      />
      <OklchChannel
        id="channel-h"
        label="Hue"
        hint={`0 – ${H_MAX}`}
        value={draft.h}
        min={0}
        max={H_MAX}
        step={1}
        decimals={0}
        trackGradient={hTrack}
        onChange={(h) => update({ h })}
      />

      <Button type="submit" className="w-full">
        <Plus className="size-4" />
        Add to palette
      </Button>
    </form>
  )
}
