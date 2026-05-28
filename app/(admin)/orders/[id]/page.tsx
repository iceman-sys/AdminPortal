import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { ADMIN_REVALIDATE_SECONDS } from "@/lib/admin-cache";
import { orderStatusTone } from "@/lib/order-status";
import { formatMoney } from "@/lib/types";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CollapsibleRaw } from "@/components/CollapsibleRaw";
import { CopyButton } from "@/components/CopyButton";
import { DetailGrid } from "@/components/DetailGrid";
import { DetailHeader } from "@/components/DetailHeader";
import { SectionCard } from "@/components/SectionCard";
import { UserLink } from "@/components/UserLink";
import { Badge, Code, ErrorBlock, formatDate, shortId } from "@/components/ui";
import type { Metadata } from "next";

export const revalidate = ADMIN_REVALIDATE_SECONDS;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return { title: `Order ${shortId(params.id)}` };
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const id = params.id;

  const { data, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (error) return <ErrorBlock message={error.message} />;
  if (!data) return <ErrorBlock message="Order not found." />;

  const row = data as Record<string, unknown>;
  const tone = orderStatusTone(String(row.status));

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Orders", href: "/orders" },
          { label: shortId(id) },
        ]}
      />
      <DetailHeader
        title="Order"
        subtitle={`Created ${formatDate(row.created_at as string)}`}
        backHref="/orders"
        backLabel="Orders"
        entityId={id}
      />

      <DetailGrid>
        <SectionCard title="Status">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Badge tone={tone}>{String(row.status)}</Badge>
            <span className="muted" style={{ fontSize: 14 }}>
              Amount{" "}
              <strong style={{ color: "var(--text)" }}>
                {formatMoney(Number(row.amount_cents), String(row.currency ?? "usd"))}
              </strong>
            </span>
          </div>
          {row.paid_at ? (
            <div className="meta-list" style={{ marginTop: 10 }}>
              <div>
                Paid at <strong>{formatDate(row.paid_at as string)}</strong>
              </div>
            </div>
          ) : null}
        </SectionCard>

        <SectionCard title="Related">
          <div className="meta-list">
            <div>
              User: <UserLink userId={String(row.user_id)} />
            </div>
            <div>
              Recommendation:{" "}
              <Link href={`/recommendations/${row.recommendation_id}`} prefetch>
                <Code>{shortId(String(row.recommendation_id))}</Code>
              </Link>
            </div>
            <div>
              SKU: <Code>{String(row.product_sku)}</Code>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              Stripe PI: <Code>{row.stripe_payment_intent_id ? String(row.stripe_payment_intent_id) : "—"}</Code>
              {row.stripe_payment_intent_id ? (
                <CopyButton value={String(row.stripe_payment_intent_id)} label="Copy PI" />
              ) : null}
            </div>
          </div>
        </SectionCard>
      </DetailGrid>

      <CollapsibleRaw value={row} />
    </div>
  );
}
