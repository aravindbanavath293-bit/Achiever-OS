import type { CSSProperties } from 'react';

// Maps legacy or default event colors to the AchieverOS Luxury Palette
// (Rose Gold / Copper, Deep Purple / Plum, Light Gold, Sapphire Blue, Coral Red).
const LEGACY_TO_VIBRANT: Record<string, string> = {
  '#203451': '#4A2574', // navy -> Deep Plum
  '#4f46e5': '#A85B49', // indigo -> Rose Gold / Copper
  '#7c3aed': '#5E359E', // violet -> Royal Plum
  '#8b5cf6': '#5E359E', // purple -> Royal Plum
  '#c9a34e': '#C29526', // gold -> Light Gold / Amber
  '#f59e0b': '#C29526', // amber -> Light Gold / Amber
  '#4c9b73': '#1D4ED8', // muted green -> Sapphire Blue
  '#10b981': '#0D9488', // emerald -> Refined Teal-Sapphire
  '#059669': '#0D9488',
  '#d94b50': '#E11D48', // red -> Coral Red
  '#ef4444': '#E11D48',
  '#f43f5e': '#E11D48',
  '#e7a23b': '#B86B58', // orange -> Rose Gold
  '#f97316': '#B86B58',
  '#0284c7': '#1E40AF', // sky -> Deep Sapphire
  '#06b6d4': '#1D4ED8', // cyan -> Sapphire Blue
  '#2563eb': '#1D4ED8', // blue -> Sapphire Blue
  '#3b82f6': '#2563EB',
  '#ec4899': '#A85B49', // pink -> Rose Gold
};

export function vibrantColor(color?: string): string {
  if (!color) return '#A85B49';
  return LEGACY_TO_VIBRANT[color.toLowerCase()] || color;
}

/** Style for a colored event card: subtle luxury tint, solid metallic/jewel accent bar. */
export function eventCardStyle(color?: string): CSSProperties {
  const c = vibrantColor(color);
  return {
    backgroundColor: `${c}18`, // ~10% refined luxury wash
    borderColor: `${c}4D`,
    borderLeftWidth: '4px',
    borderLeftColor: c,
  };
}
