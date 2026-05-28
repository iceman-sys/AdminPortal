export type AssessmentRow = {
  id: string;
  user_id: string;
  foot_type: string | null;
  daily_activity_level: string | null;
  pain_zones: string[] | null;
  created_at: string;
};

export type RecommendationRow = {
  id: string;
  user_id: string;
  assessment_id: string;
  primary_category: string | null;
  confidence: string | null;
  was_referred_out: boolean;
  refer_out_reason: string | null;
  rules_engine_version: string;
  fired_rules: unknown;
  modifiers: unknown;
  created_at: string;
};

export type OrderRow = {
  id: string;
  user_id: string;
  recommendation_id: string;
  product_sku: string;
  status: string;
  amount_cents: number;
  currency: string;
  stripe_payment_intent_id: string | null;
  created_at: string;
};

export function formatMoney(cents: number, currency: string) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  });
}
