import { converter, toGamut } from "culori";
import { parse } from "culori"

export interface OklchColor {
  l: number
  c: number
  h: number
  a?: number
}

export function oklchValidate(color: string): OklchColor | false {
  const parsed = parse(color)

  if (!parsed || parsed.mode !== "oklch") {
    return false
  }

  return {
    l: parsed.l,
    c: parsed.c,
    h: parsed.h ?? 0,
    ...(parsed.alpha !== undefined && { a: parsed.alpha }),
  }
}

export interface RgbColor {
  r: number
  g: number
  b: number
  a?: number
}

export function rgbValidate(color: string): RgbColor | false {
  const parsed = parse(color)

  if (!parsed || parsed.mode !== "rgb") {
    return false
  }

  return {
    r: Math.round(parsed.r * 255),
    g: Math.round(parsed.g * 255),
    b: Math.round(parsed.b * 255),
    ...(parsed.alpha !== undefined ? { a: parsed.alpha } : {}),
  }
}

const toRgb = converter("rgb");
const toOklch = converter("oklch");

export function oklchToRgb(color: {
  l: number;
  c: number;
  h: number;
  a?: number;
}) {
  const rgb = toRgb(
    toGamut("rgb", "oklch")({
      mode: "oklch",
      l: color.l,
      c: color.c,
      h: color.h,
      alpha: color.a,
    })
  )

  if (!rgb) return {
    r: 0,
    g: 0,
    b: 0,
    a: 1,
  };

  return {
    r: rgb.r * 255,
    g: rgb.g * 255,
    b: rgb.b * 255,
    a: rgb.alpha,
  };
}

export function rgbToOklch(color: {
  r: number;
  g: number;
  b: number;
  a?: number;
}) {
  const oklch = toOklch({
    mode: "rgb",
    r: color.r / 255,
    g: color.g / 255,
    b: color.b / 255,
    alpha: color.a,
  });

  if (!oklch) return {
    l: 0,
    c: 0,
    h: 0,
    a: 1,
  };

  return {
    l: oklch.l,
    c: oklch.c,
    h: oklch.h ?? 0,
    a: oklch.alpha,
  };
}