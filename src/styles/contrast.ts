/**
 * Colour maths for template theming.
 *
 * Every template owns its own palette and takes exactly one value from the client:
 * theme.accentColor. That value lands on fills, labels, and link text, so whether a
 * site is legible is arithmetic — not taste. This module is that arithmetic, shared
 * by whichever templates want it.
 *
 * HISTORY, BECAUSE THE SHAPE LOOKS ODD OTHERWISE
 * This file is what remains of a preset system that carried five named skins
 * (fresh / stealth / chrome / bold / noir), structural motifs applied as data
 * attributes, and a token-to-CSS generator. None of it was ever wired: both
 * templates read accentColor straight into their own custom property and defined
 * their own surfaces. The skins were removed rather than adopted, because a template
 * owning its design language is the engine's actual model — see each template's
 * styles/global.css. The contrast helpers survived because they were the part with
 * real value, and they are now used by detailers-guild/theme.ts and favicon.svg.ts.
 */

/** WCAG AA thresholds: normal text, and large text or non-text elements. */
export const AA_NORMAL = 4.5;
export const AA_LARGE = 3;

function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

export function contrastRatio(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

function toRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

function toHex([r, g, b]: [number, number, number]): string {
  return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}

export function deriveTextSafe(color: string, backgrounds: string[], min = AA_NORMAL): string {
  const lightestBg = Math.max(...backgrounds.map(luminance));
  const towardWhite = lightestBg < 0.18;
  let rgb = toRgb(color);
  for (let i = 0; i < 40; i++) {
    const hex = toHex(rgb);
    if (backgrounds.every((bg) => contrastRatio(hex, bg) >= min)) return hex;
    rgb = towardWhite
      ? ([
          rgb[0] + (255 - rgb[0]) * 0.06,
          rgb[1] + (255 - rgb[1]) * 0.06,
          rgb[2] + (255 - rgb[2]) * 0.06,
        ] as [number, number, number])
      : ([rgb[0] * 0.94, rgb[1] * 0.94, rgb[2] * 0.94] as [number, number, number]);
  }
  return towardWhite ? '#ffffff' : '#000000';
}

export function pickOnAccent(accent: string, preferred: string): string {
  if (contrastRatio(preferred, accent) >= AA_NORMAL) return preferred;
  const [dark, light] = ['#0c0c0c', '#ffffff'];
  return contrastRatio(dark, accent) >= contrastRatio(light, accent) ? dark : light;
}

export function mixHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = toRgb(a);
  const [br, bg, bb] = toRgb(b);
  return toHex([ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t]);
}
