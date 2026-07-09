export interface OklchColor {
  l: number
  c: number
  h: number
  a?: number
}

export function oklchValidate(color: string): OklchColor | false {
  const match = color.trim().match(
    /^oklch\(\s*(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)(?:\s*\/\s*(\d+(?:\.\d+)?)(%?))?\s*\)$/i,
  )

  if (!match) {
    return false
  }

  const [, l, c, h, alpha, alphaIsPercent] = match

  const result: OklchColor = {
    l: Number(l),
    c: Number(c),
    h: Number(h),
  }

  if (alpha !== undefined) {
    result.a = alphaIsPercent
      ? Number(alpha) / 100
      : Number(alpha)
  }

  // Validaciones de rango
  if (
    result.l < 0 ||
    result.l > 100 ||
    result.c < 0 ||
    result.h < 0 ||
    result.h > 360
  ) {
    return false
  }

  if (
    result.a !== undefined &&
    (result.a < 0 || result.a > 1)
  ) {
    return false
  }

  return result
}
export interface RgbColor {
  r: number
  g: number
  b: number
}

export function rgbValidate(color: string): RgbColor | false {
  const match = color
    .trim()
    .match(/^#([A-Fa-f0-9]{6})$/)

  if (!match) {
    return false
  }

  const hex = match[1]

  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  }
}