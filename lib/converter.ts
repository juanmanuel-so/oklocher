import { clampChroma, converter, Oklch, Rgb, toGamut } from "culori";
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

const toOklchConv = converter('oklch');
const toRgbConv = converter('rgb');

// ---------- hex -> oklch ----------
// Hex is ALWAYS in-gamut already. No toGamut needed here.
// Just clamp float noise, never round the stored value.
export function hexToOklch(hex: string) {
  const rgb = toRgbConv(hex);
  if (!rgb) return { l: 0, c: 0, h: 0, a: 1 };

  // clamp channel noise from parsing (harmless, cheap insurance)
  const r = clamp01(rgb.r);
  const g = clamp01(rgb.g);
  const b = clamp01(rgb.b);

  const oklch = toOklchConv({ mode: 'rgb', r, g, b, alpha: rgb.alpha });
  console.log('result okclh', oklch)
  return sanitizeOklch(oklch);
}

// ---------- oklch -> hex ----------
// THIS is where gamut mapping actually belongs.
export function oklchToHex(color: Oklch): string {
  // clampChroma reduces chroma at fixed L/H until in-gamut —
  // better than toGamut's default (which can also nudge L/H).
  const fitted = clampChroma(color, 'oklch');
  const rgb = toRgbConv(fitted) as Rgb;

  // The critical trick: round at the INTEGER byte level, not in
  // continuous oklch/rgb float space. 0-255 rounding absorbs any
  // remaining float noise with zero risk of leaving gamut, because
  // there's no "in-between" byte value to fall into.
  const toByte = (v: number) =>
    Math.round(clamp01(v) * 255).toString(16).padStart(2, '0');

  return `#${toByte(rgb.r)}${toByte(rgb.g)}${toByte(rgb.b)}`;
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

// ---------- sanitize (clamp, don't round) ----------
const EPS = 1e-4; // big enough to swallow FP noise, small enough to be imperceptible

function sanitizeOklch(color: Oklch) {
  const l = clamp01(color.l);
  let c = Math.max(0, color.c);
  if (c < EPS) c = 0;

  const h = c === 0 ? 0 : (((color.h ?? 0) % 360) + 360) % 360;

  return {
    l,
    c,
    h,
    a: color.alpha ?? 1,
  };
}