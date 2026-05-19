export const CATEGORIES = [
  "Elemental",
  "Construct/Artificial",
  "Anomaly/Phenomenon",
  "Nature/Organic",
  "Celestial/Cosmic",
  "Spirit/Ethereal",
] as const;

export type Category = (typeof CATEGORIES)[number];
