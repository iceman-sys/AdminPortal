import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { ADMIN_REVALIDATE_SECONDS } from "@/lib/admin-cache";
import { labelActivity, labelFootType } from "@/lib/labels";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CollapsibleRaw } from "@/components/CollapsibleRaw";
import { DetailGrid } from "@/components/DetailGrid";
import { DetailHeader } from "@/components/DetailHeader";
import { SectionCard } from "@/components/SectionCard";
import { UserLink } from "@/components/UserLink";
import { Badge, Code, ErrorBlock, formatDate, shortId } from "@/components/ui";
import type { Metadata } from "next";

export const revalidate = ADMIN_REVALIDATE_SECONDS;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return { title: `Assessment ${shortId(params.id)}` };
}

export default async function AssessmentDetailPage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const id = params.id;

  const { data, error } = await supabase.from("assessments").select("*").eq("id", id).maybeSingle();
  if (error) return <ErrorBlock message={error.message} />;
  if (!data) return <ErrorBlock message="Assessment not found." />;

  const row = data as Record<string, unknown>;
  const userId = String(row.user_id);

  const { data: recs } = await supabase
    .from("recommendations")
    .select("id, created_at, was_referred_out, primary_category, confidence")
    .eq("assessment_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Assessments", href: "/assessments" },
          { label: shortId(id) },
        ]}
      />
      <DetailHeader
        title="Assessment"
        subtitle={`Created ${formatDate(row.created_at as string)}`}
        backHref="/assessments"
        backLabel="Assessments"
        entityId={id}
      />

      <DetailGrid>
        <SectionCard title="Summary">
          <div className="meta-list">
            <div>
              User: <UserLink userId={userId} />
            </div>
            <div>
              Foot type: <strong>{labelFootType(row.foot_type as string)}</strong>
            </div>
            <div>
              Activity: <strong>{labelActivity(row.daily_activity_level as string)}</strong>
            </div>
            <div>
              Pain zones:{" "}
              <strong>
                {Array.isArray(row.pain_zones) ? (row.pain_zones as string[]).join(", ") : "—"}
              </strong>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Related recommendations">
          {recs?.length ? (
            <div className="entity-list">
              {recs.map((r) => (
                <Link key={r.id} href={`/recommendations/${r.id}`} prefetch>
                  <Badge tone={r.was_referred_out ? "danger" : "default"}>
                    {r.was_referred_out ? "Refer-out" : (r.primary_category ?? "Matched")}
                  </Badge>
                  <span className="muted" style={{ fontSize: 13 }}>
                    {formatDate(r.created_at)}
                  </span>
                  <Code>{shortId(r.id)}</Code>
                </Link>
              ))}
            </div>
          ) : (
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>
              No recommendations for this assessment yet.
            </p>
          )}
        </SectionCard>
      </DetailGrid>

      <CollapsibleRaw value={row} />
    </div>
  );
}
