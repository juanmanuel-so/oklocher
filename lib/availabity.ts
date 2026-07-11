// ---------- Oklab <-> linear sRGB (Ottosson's reference matrices) ----------

function oklchToOklab(l: number, c: number, h: number) {
  const hRad = (h * Math.PI) / 180;
  return {
    L: l,
    a: c * Math.cos(hRad),
    b: c * Math.sin(hRad),
  };
}

function oklabToLinearSrgb(L: number, a: number, b: number) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
}

// ---------- linear sRGB -> XYZ -> linear P3 / Rec2020 ----------

function linearSrgbToXyz(r: number, g: number, b: number) {
  return {
    x: 0.4124564 * r + 0.3575761 * g + 0.1804375 * b,
    y: 0.2126729 * r + 0.7151522 * g + 0.072175 * b,
    z: 0.0193339 * r + 0.119192 * g + 0.9503041 * b,
  };
}

function xyzToLinearP3(x: number, y: number, z: number) {
  return {
    r: 2.4934969119 * x - 0.9313836179 * y - 0.4027107845 * z,
    g: -0.8294889696 * x + 1.7626640603 * y + 0.0236246858 * z,
    b: 0.0358458302 * x - 0.0761723893 * y + 0.956884524 * z,
  };
}

function xyzToLinearRec2020(x: number, y: number, z: number) {
  return {
    r: 1.716651188 * x - 0.3556707838 * y - 0.2533662814 * z,
    g: -0.6666843518 * x + 1.6164812366 * y + 0.0157685458 * z,
    b: 0.0176398574 * x - 0.0427706133 * y + 0.9421031212 * z,
  };
}

// ---------- gamut test ----------

const EPS = 1e-4; // pure float-noise tolerance, not a perceptual fudge factor

function isInLinearGamut({ r, g, b }: { r: number; g: number; b: number }) {
  return (
    r >= -EPS && r <= 1 + EPS &&
    g >= -EPS && g <= 1 + EPS &&
    b >= -EPS && b <= 1 + EPS
  );
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

// ---------- public function ----------

export function getProblemMessage(color: {
  l: number;
  c: number;
  h: number;
  a?: number;
}): string | false {
  // Sanitize the *input* the same way as before — this is orthogonal
  // to the gamut math below, and still necessary for garbage-in cases.
  const l = clamp01(color.l);
  const cRaw = Math.max(0, color.c);
  const c = cRaw < EPS ? 0 : cRaw;
  const h = c === 0 ? 0 : (((color.h ?? 0) % 360) + 360) % 360;

  const { L, a: aComp, b: bComp } = oklchToOklab(l, c, h);
  const linearSrgb = oklabToLinearSrgb(L, aComp, bComp);

  if (isInLinearGamut(linearSrgb)) return false;

  const xyz = linearSrgbToXyz(linearSrgb.r, linearSrgb.g, linearSrgb.b);

  const linearP3 = xyzToLinearP3(xyz.x, xyz.y, xyz.z);
  if (isInLinearGamut(linearP3)) return 'Solo pantallas Display P3';

  const linearRec2020 = xyzToLinearRec2020(xyz.x, xyz.y, xyz.z);
  if (isInLinearGamut(linearRec2020)) return 'Solo pantallas Rec.2020';

  return 'No reproducible exactamente en dispositivos actuales';
}