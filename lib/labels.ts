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
  stability: "Stability orthotic",
  pressure: "Pressure relief orthotic",
  sport: "Sport orthotic",
  work: "Work orthotic",
  diabetic: "Diabetic foot orthotic",
  dress: "Dress orthotic",
  hallux: "Hallux orthotic",
  achilles: "Achilles support orthotic",
  plantar_fasciitis: "Plantar fasciitis orthotic",
  bunion: "Bunion orthotic",
};

const SKU: Record<string, string> = {
  "ORTH-STABILITY-001": "Stability — standard",
  "ORTH-PRESSURE-001": "Pressure relief — standard",
  "ORTH-SPORT-001": "Sport — performance",
  "ORTH-WORK-001": "Work — all-day support",
  "ORTH-DIABETIC-001": "Diabetic — protective",
  "ORTH-DRESS-001": "Dress — slim profile",
};

const CONFIDENCE: Record<string, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

/** Clinician-facing navigation labels (routes unchanged). */
export const NAV = {
  home: "Home",
  intakes: "Patient intakes",
  matches: "Orthotic matches",
  purchases: "Purchases",
  search: "Find patient",
} as const;

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

export function labelProductSku(value: string | null | undefined) {
  if (!value) return "—";
  return SKU[value] ?? value;
}

export function labelConfidence(value: string | null | undefined) {
  if (!value) return null;
  return CONFIDENCE[value] ?? `${value.charAt(0).toUpperCase()}${value.slice(1)} confidence`;
}

export function labelOrderStatus(value: string) {
  switch (value) {
    case "paid":
      return "Paid";
    case "pending":
      return "Payment pending";
    case "failed":
      return "Payment failed";
    case "canceled":
      return "Canceled";
    default:
      return value.charAt(0).toUpperCase() + value.slice(1);
  }
}

export function labelPainZones(zones: string[] | null | undefined): string {
  if (!zones?.length) return "None reported";
  return zones.map((z) => z.replaceAll("_", " ")).join(", ");
}
