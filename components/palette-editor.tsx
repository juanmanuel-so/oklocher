"use client"

import { useMemo, useState } from "react"
import { Check, Copy, Palette } from "lucide-react"
import { type OklchColor, oklchString, defaultPalette, interpolateColors } from "@/lib/oklch"
import { ColorCard } from "@/components/color-card"
import { AddColorForm } from "@/components/add-color-form"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"

export function PaletteEditor() {
  const [colors, setColors] = useState<OklchColor[]>(() => defaultPalette())
  const [copiedAll, setCopiedAll] = useState(false)

  function addColor(color: OklchColor) {
    console.log('adding color ', color)
    setColors((prev) => [...prev, color])
  }
  function addColorAfter(index: number, color: OklchColor) {
    setColors((prev) => {
      const newColors = [...prev]
      newColors.splice(index + 1, 0, color)
      return newColors
    })
  }

  function removeColor(id: string) {
    setColors((prev) => prev.filter((c) => c.id !== id))
  }
  function onInterpolate(index: number){
    console.log('interpolating between', colors[index], colors[index + 1])  
    const leftColor = colors[index]
    const rightColor = colors[index + 1]
    if (!leftColor || !rightColor) return
    const newColor = interpolateColors(leftColor, rightColor, 0.5)
    addColorAfter(index, newColor)
  }

  const cssBlock = useMemo(
    () =>
      colors
        .map((c) => `  --${slug(c.name)}: ${oklchString(c)};`)
        .join("\n"),
    [colors],
  )

  function copyAll() {
    navigator.clipboard.writeText(`:root {\n${cssBlock}\n}`).then(() => {
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 1400)
    })
  }

  return (
    <main className="mx-auto w-screen h-full px-4 py-10 md:py-16 flex flex-col md:flex-row justify-center items-start md:space-x-10 ">
      
      <div className="min-w-1/3">
        <header className="mb-10 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Palette className="size-5" />
            <span className="text-sm font-medium uppercase tracking-widest">OKLoCHer Studio</span>
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Palette editor
          </h1>
          <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Build and refine a color palette using the perceptually uniform OKLCH color space.
            Adjust lightness, chroma, and hue, then copy the CSS custom properties into your project.
          </p>
        </header>
        <Card className="sticky top-8">
          <CardHeader>
            
          </CardHeader>
          <CardContent>
            <AddColorForm onAdd={addColor} />
          </CardContent>
        </Card>
      </div>
      <section aria-labelledby="palette-heading" className="flex flex-col justify-center items-start">
        <div className="w-full mb-4 flex items-center justify-between">
          <div>
            <h2 id="palette-heading" className="text-lg font-medium">
              Current palette
            </h2>
            <p className="text-sm text-muted-foreground">
              {colors.length} {colors.length === 1 ? "color" : "colors"}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={copyAll} disabled={colors.length === 0}>
            {copiedAll ? <Check className="size-4" /> : <Copy className="size-4" />}
            Copy CSS
          </Button>
        </div>

        {colors.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
            Your palette is empty. Add a color to get started.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-y-4 md:grid-cols-3 lg:grid-cols-4">
            {colors.map((color, index) => (
              <ColorCard key={color.id} color={color} onRemove={removeColor} onInterpolate={()=>onInterpolate(index)} isLast={index===colors.length-1}/>
            ))}
            
          </div>
        )}

        {colors.length > 0 && (
          <pre className="w-full  mt-6 overflow-x-auto  border border-border bg-muted/50 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
            <code>{`:root {\n${cssBlock}\n}`}</code>
          </pre>
        )}
      </section>

    </main>
  )
}

function slug(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "color"
  )
}
