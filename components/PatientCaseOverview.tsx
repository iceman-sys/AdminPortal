import Link from "next/link";
import { SectionCard } from "@/components/SectionCard";
import { Badge, formatDate } from "@/components/ui";
import { labelCategory, labelConfidence, labelOrderStatus, labelProductSku } from "@/lib/labels";
import { orderStatusTone } from "@/lib/order-status";
import { formatMoney } from "@/lib/types";

type Rec = {
  id: string;
  was_referred_out: boolean;
  primary_category: string | null;
  confidence: string | null;
  refer_out_reason: string | null;
  created_at: string;
};

type Order = {
  id: string;
  status: string;
  product_sku: string;
  amount_cents: number;
  currency: string;
  created_at: string;
};

export function PatientCaseOverview({
  recommendation,
  order,
}: {
  recommendation: Rec | null;
  order: Order | null;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 16,
      }}
    >
      <SectionCard title="Orthotic recommendation">
        {!recommendation ? (
          <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
            No recommendation yet — the patient may not have finished the questionnaire.
          </p>
        ) : recommendation.was_referred_out ? (
          <div style={{ display: "grid", gap: 8 }}>
            <Badge tone="danger">Referred to podiatrist</Badge>
            {recommendation.refer_out_reason ? (
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{recommendation.refer_out_reason}</p>
            ) : (
              <p className="muted" style={{ margin: 0, fontSize: 14 }}>
                This patient was not matched to a product in the app.
              </p>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              {labelCategory(recommendation.primary_category)}
            </div>
            {labelConfidence(recommendation.confidence) ? (
              <p className="muted" style={{ margin: 0, fontSize: 14 }}>
                {labelConfidence(recommendation.confidence)}
              </p>
            ) : null}
            <p className="muted" style={{ margin: 0, fontSize: 13 }}>
              Recommended {formatDate(recommendation.created_at)}
            </p>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Purchase">
        {!order ? (
          <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
            {recommendation?.was_referred_out
              ? "No purchase — patient was referred to a podiatrist."
              : "No purchase yet — recommendation was shown but checkout was not completed."}
          </p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <Badge tone={orderStatusTone(order.status)}>{labelOrderStatus(order.status)}</Badge>
              {order.status === "paid" ? (
                <span style={{ fontWeight: 600, color: "#15803d" }}>Ready for lab review</span>
              ) : null}
            </div>
            <div style={{ fontSize: 15 }}>
              <strong>{labelProductSku(order.product_sku)}</strong>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>
              {formatMoney(order.amount_cents, order.currency)}
            </div>
            <p className="muted" style={{ margin: 0, fontSize: 13 }}>
              Ordered {formatDate(order.created_at)}
            </p>
            <Link href={`/orders/${order.id}`} prefetch style={{ fontSize: 13, fontWeight: 600 }}>
              View purchase details →
            </Link>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
