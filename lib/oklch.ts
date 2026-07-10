import { Color, inGamut, interpolate } from "culori"

export type OklchColor = {
  id: string
  name: string
  l: number // lightness 0 - 1
  c: number // chroma 0 - 0.37
  h: number // hue 0 - 360
}

// Reasonable UI bounds for the sliders.
export const L_MIN = 0
export const L_MAX = 1
export const C_MIN = 0
export const C_MAX = 0.37
export const H_MIN = 0
export const H_MAX = 360

export function oklchString({ l, c, h }: Pick<OklchColor, "l" | "c" | "h">): string {
  const ll = round(l, 4)
  const cc = round(c, 4)
  const hh = round(h, 2)
  return `oklch(${ll} ${cc} ${hh})`
}

export function round(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

// Pick a readable text color (near-black or near-white) for a given swatch.
// Uses the OKLCH lightness which is perceptually uniform, so a simple
// threshold works well.
export function readableTextColor({ l }: Pick<OklchColor, "l">): string {
  return l > 0.62 ? "oklch(0.15 0 0)" : "oklch(0.98 0 0)"
}

export function readableDestroyColor({ l }: Pick<OklchColor, "l">): string {
  return l > 0.62 ? "oklch(0.15 0 0)" : "oklch(0.8081 0.3583 15.55)"
}
let counter = 0
export function createId(): string {
  counter += 1
  return `color-${Date.now().toString(36)}-${counter}`
}

export function defaultPalette(): OklchColor[] {
  return [
    { id: createId(), name: "Primary", l: 0.55, c: 0.22, h: 264 },
    { id: createId(), name: "Accent", l: 0.72, c: 0.17, h: 32 },
    { id: createId(), name: "Success", l: 0.7, c: 0.16, h: 152 },
    { id: createId(), name: "Surface", l: 0.96, c: 0.01, h: 264 },
    { id: createId(), name: "Ink", l: 0.22, c: 0.02, h: 264 },
  ]
}

export function oklchToRgb({ l, c, h }: Pick<OklchColor, "l" | "c" | "h">): { r: number; g: number; b: number } {
  // Convert OKLCH to OKLab
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const L = l
  const A = a
  const B = b

  // Convert OKLab to linear RGB
  const l_ = L + 0.3963377774 * A + 0.2158037573 * B
  const m_ = L - 0.1055613458 * A - 0.0638541728 * B
  const s_ = L - 0.0894841775 * A - 1.2914855480 * B

  const r_ = l_ ** 3
  const g_ = m_ ** 3
  const b_ = s_ ** 3

  // Convert linear RGB to sRGB
  function linearToSrgb(x: number): number {
    return x <= 0.0031308 ? x * 12.92 : (1.055 * x ** (1 / 2.4)) - 0.055
  }

  return {
    r: linearToSrgb(r_) * 255,
    g: linearToSrgb(g_) * 255,
    b: linearToSrgb(b_) * 255,
  }
}
export function rgbToString({ r, g, b }: { r: number; g: number; b: number }): string {
  const rr = Math.round(r)
  const gg = Math.round(g)
  const bb = Math.round(b)
  return `rgb(${rr}, ${gg}, ${bb})`
}
//to format #000000
export function rgbToStringSharp({ r, g, b }: { r: number; g: number; b: number }): string {
  const rr = Math.round(r).toString(16).padStart(2, "0")
  const gg = Math.round(g).toString(16).padStart(2, "0")
  const bb = Math.round(b).toString(16).padStart(2, "0")
  return `#${rr}${gg}${bb}`
}

export function interpolateColors(c1: OklchColor, c2: OklchColor, t: number): OklchColor {
  const mix = interpolate(
    [
      { l: c1.l, c: c1.c, h: c1.h, mode: 'oklch' } as Color,
      { l: c2.l, c: c2.c, h: c2.h, mode: 'oklch' } as Color
    ],
    "oklch",
  );

  const middle = mix(t);
  return {
    id: createId(),
    name: `Mix of ${c1.name} and ${c2.name}`,
    l: middle.l,
    c: middle.c,
    h: middle.h ?? 0,
  }
}
export function getProblemMessage(color: {l: number, c:number, h:number, a?: number}): string | false {
  const parameter = {
    mode: "oklch",
    l: color.l,
    c: color.c,
    h: color.h,
  }
  const srgb = inGamut("rgb")(parameter as Color);
  const p3 = inGamut("p3")(parameter  as Color);
  const rec2020 = inGamut("rec2020")(parameter  as Color);

  if (srgb) {
    return false;
  } else if (p3) {
    return "Solo pantallas Display P3";
  } else if (rec2020) {
    return "Solo pantallas Rec.2020";
  } else {
    return "No reproducible exactamente en dispositivos actuales";
  }
}