import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { ADMIN_REVALIDATE_SECONDS } from "@/lib/admin-cache";
import { labelCategory } from "@/lib/labels";
import { orderStatusTone } from "@/lib/order-status";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CollapsibleRaw } from "@/components/CollapsibleRaw";
import { DetailGrid } from "@/components/DetailGrid";
import { DetailHeader } from "@/components/DetailHeader";
import { SectionCard } from "@/components/SectionCard";
import { UserLink } from "@/components/UserLink";
import { Badge, Code, ErrorBlock, JsonViewer, formatDate, shortId } from "@/components/ui";
import type { Metadata } from "next";

export const revalidate = ADMIN_REVALIDATE_SECONDS;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return { title: `Recommendation ${shortId(params.id)}` };
}

export default async function RecommendationDetailPage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const id = params.id;

  const [{ data, error }, { data: linkedOrder }] = await Promise.all([
    supabase.from("recommendations").select("*").eq("id", id).maybeSingle(),
    supabase.from("orders").select("id, status, created_at").eq("recommendation_id", id).maybeSingle(),
  ]);

  if (error) return <ErrorBlock message={error.message} />;
  if (!data) return <ErrorBlock message="Recommendation not found." />;

  const row = data as Record<string, unknown>;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Recommendations", href: "/recommendations" },
          { label: shortId(id) },
        ]}
      />
      <DetailHeader
        title="Recommendation"
        subtitle={`Created ${formatDate(row.created_at as string)} · engine v${row.rules_engine_version}`}
        backHref="/recommendations"
        backLabel="Recommendations"
        entityId={id}
      />

      <DetailGrid>
        <SectionCard title="Outcome">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Badge tone={row.was_referred_out ? "danger" : "default"}>
              {row.was_referred_out ? "Refer-out" : labelCategory(row.primary_category as string)}
            </Badge>
            {row.confidence && !row.was_referred_out ? (
              <Badge>{String(row.confidence)} confidence</Badge>
            ) : null}
          </div>
          {row.was_referred_out && row.refer_out_reason ? (
            <p style={{ margin: "12px 0 0", fontSize: 14 }}>{String(row.refer_out_reason)}</p>
          ) : null}
          <div className="meta-list" style={{ marginTop: 12 }}>
            <div>
              Assessment:{" "}
              <Link href={`/assessments/${row.assessment_id}`} prefetch>
                <Code>{shortId(String(row.assessment_id))}</Code>
              </Link>
            </div>
            <div>
              User: <UserLink userId={String(row.user_id)} />
            </div>
            {linkedOrder ? (
              <div>
                Order:{" "}
                <Link href={`/orders/${linkedOrder.id}`} prefetch>
                  <Code>{shortId(linkedOrder.id)}</Code>
                </Link>{" "}
                <Badge tone={orderStatusTone(linkedOrder.status)}>{linkedOrder.status}</Badge>
              </div>
            ) : (
              <div className="muted">No order linked yet.</div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Rules output">
          <details className="raw-details">
            <summary>Fired rules</summary>
            <JsonViewer value={row.fired_rules} />
          </details>
          <details className="raw-details" style={{ marginTop: 12 }}>
            <summary>Modifiers</summary>
            <JsonViewer value={row.modifiers} />
          </details>
        </SectionCard>
      </DetailGrid>

      <CollapsibleRaw value={row} />
    </div>
  );
}
