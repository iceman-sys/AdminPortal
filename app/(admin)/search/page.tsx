import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { findUserByEmail } from "@/lib/patients";
import { ADMIN_REVALIDATE_SECONDS } from "@/lib/admin-cache";
import { orderStatusTone } from "@/lib/order-status";
import { getString } from "@/lib/query";
import { CopyButton } from "@/components/CopyButton";
import { SectionCard } from "@/components/SectionCard";
import { UserLink } from "@/components/UserLink";
import { Badge, Code, EmptyState, ErrorBlock, PageHeader, formatDate, shortId } from "@/components/ui";
import type { Metadata } from "next";

export const revalidate = ADMIN_REVALIDATE_SECONDS;

export const metadata: Metadata = { title: "Find patient" };

function looksLikeUuid(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const qRaw = getString(searchParams?.q, "").trim();
  const q = qRaw.replaceAll(" ", "");
  const supabase = createAdminClient();

  if (!q) {
    return (
      <div>
        <PageHeader
          title="Find a patient"
          subtitle="Enter a patient email in the search bar above, or search by record ID if you have one from support."
        />
        <EmptyState message="Enter a patient email address in the header search bar, then press Find." />
      </div>
    );
  }

  const header = (
    <PageHeader title="Search results" subtitle={`Matches for “${qRaw}”`} />
  );

  if (looksLikeUuid(q)) {
    const [assessment, rec, order] = await Promise.all([
      supabase.from("assessments").select("id, user_id, created_at").eq("id", q).maybeSingle(),
      supabase
        .from("recommendations")
        .select("id, user_id, assessment_id, created_at, was_referred_out, primary_category")
        .eq("id", q)
        .maybeSingle(),
      supabase
        .from("orders")
        .select("id, user_id, status, created_at, product_sku")
        .eq("id", q)
        .maybeSingle(),
    ]);

    if (assessment.data?.id) {
      return (
        <div>
          {header}
          <SectionCard title="Assessment">
            <Link href={`/assessments/${assessment.data.id}`} prefetch>
              <Code>{assessment.data.id}</Code>
            </Link>
            <div className="meta-list" style={{ marginTop: 10 }}>
              <div>
                User: <UserLink userId={assessment.data.user_id} />
              </div>
              <div>Created {formatDate(assessment.data.created_at)}</div>
            </div>
          </SectionCard>
        </div>
      );
    }

    if (rec.data?.id) {
      return (
        <div>
          {header}
          <SectionCard title="Recommendation">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <Badge tone={rec.data.was_referred_out ? "danger" : "default"}>
                {rec.data.was_referred_out ? "Refer-out" : rec.data.primary_category ?? "Matched"}
              </Badge>
              <Link href={`/recommendations/${rec.data.id}`} prefetch>
                <Code>{rec.data.id}</Code>
              </Link>
            </div>
            <div className="meta-list" style={{ marginTop: 10 }}>
              <div>
                User: <UserLink userId={rec.data.user_id} />
              </div>
              <div>
                Assessment:{" "}
                <Link href={`/assessments/${rec.data.assessment_id}`} prefetch>
                  <Code>{shortId(rec.data.assessment_id)}</Code>
                </Link>
              </div>
            </div>
          </SectionCard>
        </div>
      );
    }

    if (order.data?.id) {
      return (
        <div>
          {header}
          <SectionCard title="Order">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <Badge tone={orderStatusTone(order.data.status)}>{order.data.status}</Badge>
              <Link href={`/orders/${order.data.id}`} prefetch>
                <Code>{order.data.id}</Code>
              </Link>
            </div>
            <div className="meta-list" style={{ marginTop: 10 }}>
              <div>
                User: <UserLink userId={order.data.user_id} />
              </div>
              <div>SKU {order.data.product_sku}</div>
            </div>
          </SectionCard>
        </div>
      );
    }
  }

  if (q.startsWith("pi_")) {
    const { data, error } = await supabase
      .from("orders")
      .select("id, user_id, status, stripe_payment_intent_id, created_at")
      .eq("stripe_payment_intent_id", q)
      .limit(1);
    if (error) return <ErrorBlock message={error.message} />;
    if (!data?.length) {
      return (
        <div>
          {header}
          <EmptyState message="No order found for that Stripe PaymentIntent id." />
        </div>
      );
    }
    const row = data[0];
    return (
      <div>
        {header}
        <SectionCard title="Order">
          <Link href={`/orders/${row.id}`} prefetch>
            <Code>{row.id}</Code>
          </Link>
          <div className="meta-list" style={{ marginTop: 10 }}>
            <div>
              User: <UserLink userId={row.user_id} />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <CopyButton value={row.stripe_payment_intent_id!} label="Copy PI" />
              <CopyButton value={row.user_id} label="Copy user" />
            </div>
          </div>
        </SectionCard>
      </div>
    );
  }

  if (qRaw.includes("@")) {
    const authUser = await findUserByEmail(supabase, qRaw);
    if (authUser) {
      return (
        <div>
          {header}
          <SectionCard title="Patient found">
            <div style={{ fontSize: 18, fontWeight: 700 }}>{authUser.user_metadata?.full_name ?? authUser.email}</div>
            <p className="muted" style={{ margin: "8px 0 0", fontSize: 14 }}>
              {authUser.email}
            </p>
            <Link href={`/users/${authUser.id}`} prefetch className="btn-primary" style={{ display: "inline-flex", marginTop: 16 }}>
              Open patient case →
            </Link>
          </SectionCard>
        </div>
      );
    }
  }

  const [assessments, recs, orders] = await Promise.all([
    supabase.from("assessments").select("id, user_id, created_at").ilike("user_id", `${q}%`).order("created_at", { ascending: false }).limit(10),
    supabase
      .from("recommendations")
      .select("id, user_id, created_at, was_referred_out, primary_category")
      .ilike("user_id", `${q}%`)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("orders")
      .select("id, user_id, status, created_at")
      .ilike("user_id", `${q}%`)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (assessments.error) return <ErrorBlock message={assessments.error.message} />;
  if (recs.error) return <ErrorBlock message={recs.error.message} />;
  if (orders.error) return <ErrorBlock message={orders.error.message} />;

  const a = assessments.data ?? [];
  const r = recs.data ?? [];
  const o = orders.data ?? [];

  if (!a.length && !r.length && !o.length) {
    return (
      <div>
        {header}
        <EmptyState message="No patient found. Try the full email address, or contact support if you need help locating a case." />
      </div>
    );
  }

  return (
    <div>
      {header}
      <div style={{ display: "grid", gap: 16 }}>
        {a.length ? (
          <SectionCard title="Assessments">
            <div className="entity-list">
              {a.map((row) => (
                <Link key={row.id} href={`/assessments/${row.id}`} prefetch>
                  <Code>{shortId(row.user_id)}</Code>
                  <Code>{shortId(row.id)}</Code>
                  <span className="muted" style={{ fontSize: 13 }}>
                    {formatDate(row.created_at)}
                  </span>
                </Link>
              ))}
            </div>
          </SectionCard>
        ) : null}
        {r.length ? (
          <SectionCard title="Recommendations">
            <div className="entity-list">
              {r.map((row) => (
                <Link key={row.id} href={`/recommendations/${row.id}`} prefetch>
                  <Badge tone={row.was_referred_out ? "danger" : "default"}>
                    {row.was_referred_out ? "Refer-out" : row.primary_category ?? "Matched"}
                  </Badge>
                  <Code>{shortId(row.id)}</Code>
                  <span className="muted" style={{ fontSize: 13 }}>
                    {formatDate(row.created_at)}
                  </span>
                </Link>
              ))}
            </div>
          </SectionCard>
        ) : null}
        {o.length ? (
          <SectionCard title="Orders">
            <div className="entity-list">
              {o.map((row) => (
                <Link key={row.id} href={`/orders/${row.id}`} prefetch>
                  <Badge tone={orderStatusTone(row.status)}>{row.status}</Badge>
                  <Code>{shortId(row.id)}</Code>
                  <span className="muted" style={{ fontSize: 13 }}>
                    {formatDate(row.created_at)}
                  </span>
                </Link>
              ))}
            </div>
          </SectionCard>
        ) : null}
      </div>
    </div>
  );
}
