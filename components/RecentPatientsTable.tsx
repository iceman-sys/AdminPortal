import Link from "next/link";
import { CaseStatusBadge } from "@/components/CaseStatusBadge";
import { EmptyState, formatDate } from "@/components/ui";
import { labelCategory } from "@/lib/labels";
import type { RecentPatientRow } from "@/lib/patients";

export function RecentPatientsTable({ rows }: { rows: RecentPatientRow[] }) {
  if (!rows.length) {
    return (
      <EmptyState message="No patient cases yet. When someone completes the OrthoticHub app, they will appear here." />
    );
  }

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <table>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Status</th>
            <th>Foot scans</th>
            <th>Recommendation</th>
            <th>Last activity</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.userId}>
              <td>
                <div style={{ fontWeight: 600 }}>{row.fullName ?? "—"}</div>
                <div className="muted" style={{ fontSize: 13 }}>
                  {row.email ?? "No email on file"}
                </div>
              </td>
              <td>
                <CaseStatusBadge status={row.caseStatus} />
              </td>
              <td>
                {row.footScanCount === 0 ? (
                  <span className="muted">Skipped / none</span>
                ) : (
                  <span>
                    {row.footScanCount} scan{row.footScanCount === 1 ? "" : "s"}
                  </span>
                )}
              </td>
              <td>
                {row.wasReferredOut ? (
                  <span style={{ color: "var(--danger)", fontWeight: 500 }}>Referred out</span>
                ) : row.latestRecommendation ? (
                  labelCategory(row.latestRecommendation)
                ) : (
                  <span className="muted">—</span>
                )}
              </td>
              <td className="muted">{formatDate(row.lastActivityAt)}</td>
              <td>
                <Link href={`/users/${row.userId}`} prefetch style={{ fontWeight: 600, fontSize: 13 }}>
                  View case →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
