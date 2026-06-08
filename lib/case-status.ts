/** Plain-language patient case status for clinician-facing UI. */

export type CaseStatus =
  | "paid"
  | "scans_ready"
  | "referred"
  | "awaiting_purchase"
  | "incomplete";

export function deriveCaseStatus(input: {
  hasPaidOrder: boolean;
  hasPendingOrder: boolean;
  wasReferredOut: boolean;
  footScanCount: number;
  hasAssessment: boolean;
}): CaseStatus {
  if (input.wasReferredOut) return "referred";
  if (input.hasPaidOrder) return "paid";
  if (input.footScanCount > 0 && (input.hasPendingOrder || input.hasAssessment)) return "scans_ready";
  if (input.hasAssessment) return "awaiting_purchase";
  return "incomplete";
}

export function labelCaseStatus(status: CaseStatus): string {
  switch (status) {
    case "paid":
      return "Paid";
    case "scans_ready":
      return "Scans uploaded";
    case "referred":
      return "Referred to podiatrist";
    case "awaiting_purchase":
      return "Awaiting purchase";
    case "incomplete":
      return "Incomplete";
  }
}

export function caseStatusTone(status: CaseStatus): "success" | "warning" | "danger" | "default" {
  switch (status) {
    case "paid":
      return "success";
    case "scans_ready":
      return "warning";
    case "referred":
      return "danger";
    default:
      return "default";
  }
}
