/** Human-readable labels for DB enum / code values (display only). */

const FOOT_TYPE: Record<string, string> = {
  flat: "Flat",
  neutral: "Neutral",
  high_arch: "High arch",
};

const ACTIVITY: Record<string, string> = {
  mostly_sitting: "Mostly sitting",
  light: "Light activity",
  on_feet: "On feet most of the day",
  very_active: "Very active",
};

const CATEGORY: Record<string, string> = {
  stability: "Stability",
  pressure: "Pressure relief",
  sport: "Sport",
  work: "Work",
  diabetic: "Diabetic",
  dress: "Dress",
  hallux: "Hallux",
  achilles: "Achilles",
  plantar_fasciitis: "Plantar fasciitis",
  bunion: "Bunion",
};

export function labelFootType(value: string | null | undefined) {
  if (!value) return "—";
  return FOOT_TYPE[value] ?? value.replaceAll("_", " ");
}

export function labelActivity(value: string | null | undefined) {
  if (!value) return "—";
  return ACTIVITY[value] ?? value.replaceAll("_", " ");
}

export function labelCategory(value: string | null | undefined) {
  if (!value) return "—";
  return CATEGORY[value] ?? value.replaceAll("_", " ");
}

export function labelOrderStatus(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
