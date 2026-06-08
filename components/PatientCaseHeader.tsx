import { BackLink } from "@/components/BackLink";
import { CaseStatusBadge } from "@/components/CaseStatusBadge";
import { PageHeader, formatDate } from "@/components/ui";
import type { CaseStatus } from "@/lib/case-status";
import type { PatientProfile } from "@/lib/patients";

export function PatientCaseHeader({
  patient,
  caseStatus,
}: {
  patient: PatientProfile;
  caseStatus: CaseStatus;
}) {
  const displayName = patient.fullName ?? patient.email ?? "Patient";
  const subtitleParts: string[] = [];
  if (patient.email) subtitleParts.push(patient.email);
  if (patient.memberSince) subtitleParts.push(`Member since ${formatDate(patient.memberSince)}`);

  return (
    <PageHeader
      title={displayName}
      subtitle={subtitleParts.join(" · ") || undefined}
      actions={
        <>
          <CaseStatusBadge status={caseStatus} />
          <BackLink href="/dashboard" label="Back to home" />
        </>
      }
    />
  );
}
