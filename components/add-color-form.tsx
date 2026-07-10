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
  rgbToStringSharp,
  getProblemMessage,
} from "@/lib/oklch"
import { OklchChannel } from "@/components/oklch-channel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardDescription, CardTitle } from "./ui/card"
import { ArrowsRightLeftIcon } from "@heroicons/react/16/solid"
import { oklchToRgb, oklchValidate, rgbToOklch, rgbValidate } from "@/lib/converter"
import { DraftableInput } from "./draftable-input"

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

  const onOklchBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    const parsed = oklchValidate(value)
    console.log("parsed", parsed)
    if (parsed) {
      update(parsed)
    }
  }
  const onRgbBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();

    const parsed = rgbValidate(value);

    if (!parsed) return;

    const oklch = rgbToOklch(parsed);

    if (!oklch) return;

    const { l, c, h } = oklch;

    update({ l, c, h });
  };
  const message = getProblemMessage(draft);
  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="flex flex-row items-center justify-center h-56 space-x-4">

        <div className="h-full flex flex-col justify-between">
          <CardTitle>Add a color</CardTitle>
          <CardDescription>Dial in a new OKLCH color.</CardDescription>
          <div className="grid space-y-2">
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
        </div>
        <div
          className="flex h-full flex-col justify-between border border-border p-4 w-2/3 max-w-2/3"
          style={{ backgroundColor: css, color: textColor }}
        >
          {
            message && (
              <div className="text-xs text-rose-600 font-mono rounded-xl p-2 bg-red-100/20 max-w-60">
                {message}
              </div>
            )
          }
          <span className="text-xs font-medium uppercase tracking-wide opacity-80">Live preview</span>
          <span className="font-mono text-sm">{css}</span>
        </div>



      </div>
      <div className="flex flex-row items-center justify-between space-x-4">
        <DraftableInput placeholder="oklch(0 0 0)" value={css} onBlur={onOklchBlur} />
        <ArrowsRightLeftIcon className="size-8" />
        <DraftableInput placeholder="#000000" value={rgbToStringSharp(oklchToRgb(draft))} onBlur={onRgbBlur} />
      </div>

      <Button type="submit" className="w-full" >
        <Plus className="size-4" />
        Add to palette
      </Button>
    </form>
  )
}
