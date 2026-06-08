import { createAdminClient } from "@/lib/supabase/server";
import { ADMIN_REVALIDATE_SECONDS } from "@/lib/admin-cache";
import { deriveCaseStatus } from "@/lib/case-status";
import { getPatientProfile } from "@/lib/patients";
import { FootScanGallery } from "@/components/FootScanGallery";
import { IntakeSummary } from "@/components/IntakeSummary";
import { PatientCaseHeader } from "@/components/PatientCaseHeader";
import { PatientCaseOverview } from "@/components/PatientCaseOverview";
import { SectionCard } from "@/components/SectionCard";
import { TechnicalDetails } from "@/components/TechnicalDetails";
import { ErrorBlock } from "@/components/ui";
import type { Metadata } from "next";
import { attachSignedImageUrls, fetchFootScansForUser } from "@/lib/foot-scans";

export const revalidate = ADMIN_REVALIDATE_SECONDS;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createAdminClient();
  const patient = await getPatientProfile(supabase, params.id);
  const title = patient.fullName ?? patient.email ?? "Patient case";
  return { title };
}

export default async function UserCasePage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const userId = params.id;

  const [
    patient,
    { data: assessments, error: aErr },
    { data: recs, error: rErr },
    { data: orders, error: oErr },
  ] = await Promise.all([
    getPatientProfile(supabase, userId),
    supabase
      .from("assessments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("recommendations")
      .select("id, created_at, assessment_id, was_referred_out, primary_category, confidence, refer_out_reason")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("orders")
      .select("id, created_at, status, product_sku, amount_cents, currency, recommendation_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  let footScans: Awaited<ReturnType<typeof attachSignedImageUrls>> = [];
  try {
    const rows = await fetchFootScansForUser(supabase, userId);
    footScans = await attachSignedImageUrls(supabase, rows);
  } catch {
    footScans = [];
  }

  if (aErr) return <ErrorBlock message={aErr.message} />;
  if (rErr) return <ErrorBlock message={rErr.message} />;
  if (oErr) return <ErrorBlock message={oErr.message} />;

  const latestAssessment = assessments?.[0] ?? null;
  const latestRec = recs?.[0] ?? null;
  const latestOrder = orders?.[0] ?? null;

  const hasPaidOrder = latestOrder?.status === "paid";
  const caseStatus = deriveCaseStatus({
    hasPaidOrder,
    hasPendingOrder: latestOrder?.status === "pending",
    wasReferredOut: latestRec?.was_referred_out ?? false,
    footScanCount: footScans.length,
    hasAssessment: Boolean(latestAssessment),
  });

  return (
    <div>
      <PatientCaseHeader patient={patient} caseStatus={caseStatus} />

      <div style={{ display: "grid", gap: 20 }}>
        <PatientCaseOverview recommendation={latestRec} order={latestOrder} />

        <SectionCard title="Foot scans">
          <p className="muted" style={{ margin: "0 0 14px", fontSize: 14, lineHeight: 1.5 }}>
            Review foot images below. When a 3D scan is available, use <strong>Download 3D scan for lab</strong> to
            import into your lab software.
          </p>
          <FootScanGallery scans={footScans} />
        </SectionCard>

        <IntakeSummary assessment={latestAssessment} />

        <TechnicalDetails userId={userId} />
      </div>
    </div>
  );
}
