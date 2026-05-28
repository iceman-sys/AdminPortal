import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { ADMIN_REVALIDATE_SECONDS } from "@/lib/admin-cache";
import { labelCategory } from "@/lib/labels";
import { orderStatusTone } from "@/lib/order-status";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CopyButton } from "@/components/CopyButton";
import { DetailHeader } from "@/components/DetailHeader";
import { SectionCard } from "@/components/SectionCard";
import { Badge, Code, ErrorBlock, formatDate, shortId } from "@/components/ui";
import type { Metadata } from "next";

export const revalidate = ADMIN_REVALIDATE_SECONDS;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return { title: `Case ${shortId(params.id)}` };
}

export default async function UserCasePage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const userId = params.id;

  const [{ data: assessments, error: aErr }, { data: recs, error: rErr }, { data: orders, error: oErr }] =
    await Promise.all([
      supabase
        .from("assessments")
        .select("id, created_at, foot_type, daily_activity_level")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("recommendations")
        .select("id, created_at, assessment_id, was_referred_out, primary_category, confidence")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("orders")
        .select("id, created_at, status, product_sku, stripe_payment_intent_id, recommendation_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  if (aErr) return <ErrorBlock message={aErr.message} />;
  if (rErr) return <ErrorBlock message={rErr.message} />;
  if (oErr) return <ErrorBlock message={oErr.message} />;

  const a = assessments ?? [];
  const r = recs ?? [];
  const o = orders ?? [];

  return (
    <div>
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: `Case ${shortId(userId)}` }]} />
      <DetailHeader
        title="Case view"
        subtitle={`${a.length} assessments · ${r.length} recommendations · ${o.length} orders`}
        backHref="/dashboard"
        backLabel="Dashboard"
        entityId={userId}
        copyLabel="Copy user_id"
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        <SectionCard title="Assessments" action={{ href: `/assessments?q=${encodeURIComponent(userId)}`, label: "View in list →" }}>
          {a.length ? (
            <div className="entity-list">
              {a.map((row) => (
                <Link key={row.id} href={`/assessments/${row.id}`} prefetch>
                  <Code>{shortId(row.id)}</Code>
                  <span className="muted" style={{ fontSize: 13 }}>
                    {formatDate(row.created_at)}
                  </span>
                  <Badge>{row.foot_type ?? "—"}</Badge>
                </Link>
              ))}
            </div>
          ) : (
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>
              No assessments.
            </p>
          )}
        </SectionCard>

        <SectionCard
          title="Recommendations"
          action={{ href: `/recommendations?q=${encodeURIComponent(userId)}`, label: "View in list →" }}
        >
          {r.length ? (
            <div className="entity-list">
              {r.map((row) => (
                <Link key={row.id} href={`/recommendations/${row.id}`} prefetch>
                  <Badge tone={row.was_referred_out ? "danger" : "default"}>
                    {row.was_referred_out ? "Refer-out" : labelCategory(row.primary_category)}
                  </Badge>
                  <span className="muted" style={{ fontSize: 13 }}>
                    {formatDate(row.created_at)}
                  </span>
                  <Code>{shortId(row.id)}</Code>
                </Link>
              ))}
            </div>
          ) : (
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>
              No recommendations.
            </p>
          )}
        </SectionCard>

        <SectionCard title="Orders" action={{ href: `/orders?q=${encodeURIComponent(userId)}`, label: "View in list →" }}>
          {o.length ? (
            <div className="entity-list">
              {o.map((row) => (
                <Link key={row.id} href={`/orders/${row.id}`} prefetch>
                  <Badge tone={orderStatusTone(row.status)}>{row.status}</Badge>
                  <span className="muted" style={{ fontSize: 13 }}>
                    {formatDate(row.created_at)}
                  </span>
                  <Badge>{row.product_sku}</Badge>
                  <Code>{shortId(row.id)}</Code>
                  {row.stripe_payment_intent_id ? (
                    <CopyButton value={row.stripe_payment_intent_id} label="Copy PI" />
                  ) : null}
                </Link>
              ))}
            </div>
          ) : (
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>
              No orders.
            </p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
