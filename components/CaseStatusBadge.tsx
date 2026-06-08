import { Badge } from "@/components/ui";
import { caseStatusTone, labelCaseStatus, type CaseStatus } from "@/lib/case-status";

export function CaseStatusBadge({ status }: { status: CaseStatus }) {
  return <Badge tone={caseStatusTone(status)}>{labelCaseStatus(status)}</Badge>;
}
