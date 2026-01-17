function hexToOklch(hex: string): { l: number; c: number; h: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);

  const l_ = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m_ = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s_ = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l = Math.cbrt(l_);
  const m = Math.cbrt(m_);
  const s = Math.cbrt(s_);

  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bVal = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const C = Math.sqrt(a * a + bVal * bVal);
  let H = (Math.atan2(bVal, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  return { l: L, c: C, h: H };
}

function oklchToHex(l: number, c: number, h: number): string {
  const toSrgb = (x: number) =>
    x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;

  const computeRgb = (l: number, c: number, h: number) => {
    const a = c * Math.cos((h * Math.PI) / 180);
    const b = c * Math.sin((h * Math.PI) / 180);

    const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = l - 0.0894841775 * a - 1.291485548 * b;

    return {
      r: toSrgb(
        4.0767416621 * l_ ** 3 -
          3.3077115913 * m_ ** 3 +
          0.2309699292 * s_ ** 3,
      ),
      g: toSrgb(
        -1.2684380046 * l_ ** 3 +
          2.6097574011 * m_ ** 3 -
          0.3413193965 * s_ ** 3,
      ),
      b: toSrgb(
        -0.0041960863 * l_ ** 3 -
          0.7034186147 * m_ ** 3 +
          1.707614701 * s_ ** 3,
      ),
    };
  };

  let { r, g, b: bVal } = computeRgb(l, c, h);

  // Gamut mapping - reduce chroma if out of sRGB
  if (Math.max(r, g, bVal) > 1 || Math.min(r, g, bVal) < 0) {
    let lo = 0;
    let hi = c;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      const rgb = computeRgb(l, mid, h);
      if (
        Math.max(rgb.r, rgb.g, rgb.b) > 1 ||
        Math.min(rgb.r, rgb.g, rgb.b) < 0
      ) {
        hi = mid;
      } else {
        lo = mid;
      }
    }
    ({ r, g, b: bVal } = computeRgb(l, lo, h));
  }

  const toHex = (x: number) =>
    Math.round(Math.max(0, Math.min(1, x)) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(bVal)}`;
}

export function generateColorScale(hex: string): Record<string, string> {
  const { l: inputL, c, h } = hexToOklch(hex);

  // Lightness offsets from the input color (500 = input)
  const lightnessOffsets: Record<number, number> = {
    50: +0.42,
    100: +0.35,
    200: +0.25,
    300: +0.15,
    400: +0.07,
    500: 0,
    600: -0.08,
    700: -0.16,
    800: -0.24,
    900: -0.32,
    950: -0.4,
  };

  const scale: Record<string, string> = {};

  for (const [step, offset] of Object.entries(lightnessOffsets)) {
    let lightness = Math.max(0.08, Math.min(0.97, inputL + offset));

    // Reduce chroma at extremes for better gamut coverage
    let adjustedChroma = c;
    if (lightness > 0.88) {
      adjustedChroma = c * ((0.97 - lightness) / 0.09);
    } else if (lightness < 0.25) {
      adjustedChroma = c * (lightness / 0.25);
    }

    scale[step] = oklchToHex(lightness, Math.max(0, adjustedChroma), h);
  }

  return scale;
}
