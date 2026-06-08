import { createAdminClient } from "@/lib/supabase/server";
import { ADMIN_REVALIDATE_SECONDS } from "@/lib/admin-cache";
import { labelActivity, labelFootType } from "@/lib/labels";
import { listQuery } from "@/lib/list-url";
import type { AssessmentRow } from "@/lib/types";
import Link from "next/link";
import { clamp, getInt, getString } from "@/lib/query";
import { FilterChips } from "@/components/FilterChips";
import { FilterField, FilterSearchInput, ListFilterPanel } from "@/components/ListFilterPanel";
import { Pagination } from "@/components/Pagination";
import { UserLink } from "@/components/UserLink";
import { Code, EmptyState, ErrorBlock, PageHeader, formatDate } from "@/components/ui";
import type { Metadata } from "next";

export const revalidate = ADMIN_REVALIDATE_SECONDS;

export const metadata: Metadata = { title: "Patient intakes" };

export default async function AssessmentsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const supabase = createAdminClient();
  const q = getString(searchParams?.q, "").trim();
  const page = clamp(getInt(searchParams?.page, 1), 1, 1000);
  const pageSize = 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("assessments")
    .select("id, user_id, foot_type, daily_activity_level, pain_zones, created_at")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) query = query.or(`user_id.ilike.${q}%,id.ilike.${q}%`);

  const { data, error } = await query;
  if (error) {
    return <ErrorBlock message={error.message + (q ? " (tip: use a patient or intake ID prefix)" : "")} />;
  }

  const rows = (data ?? []) as AssessmentRow[];
  const baseQuery = { q, page: page > 1 ? page : undefined };
  const chips = q ? [{ label: `Search: ${q}`, clearHref: "/assessments" }] : [];

  return (
    <div>
      <PageHeader
        title="Patient intakes"
        subtitle="Questionnaire answers submitted through the app. Open a patient case for foot scans and purchases."
      />

      <ListFilterPanel action="/assessments" layout="single" clearHref={q ? "/assessments" : undefined}>
        <FilterField
          label="Search intakes"
          hint="Patient ID or intake record prefix — for email search use Find patient in the header"
          wide
        >
          <FilterSearchInput
            name="q"
            defaultValue={q}
            placeholder="Search by patient or intake ID…"
            aria-label="Search patient intakes"
          />
        </FilterField>
      </ListFilterPanel>

      <FilterChips chips={chips} clearAllHref="/assessments" />

      <Pagination
        page={page}
        rowCount={rows.length}
        prevHref={`/assessments${listQuery({ ...baseQuery, page: page - 1 })}`}
        nextHref={`/assessments${listQuery({ ...baseQuery, page: page + 1 })}`}
      />

      {rows.length === 0 ? (
        <EmptyState message={q ? "No intakes match this search." : "No patient intakes yet."} />
      ) : (
        <table>
          <thead>
            <tr>
              <th scope="col">Completed</th>
              <th scope="col">Patient</th>
              <th scope="col">Foot type</th>
              <th scope="col">Activity</th>
              <th scope="col">Pain areas</th>
              <th scope="col">Intake</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{formatDate(row.created_at)}</td>
                <td>
                  <UserLink userId={row.user_id} />
                </td>
                <td>{labelFootType(row.foot_type)}</td>
                <td>{labelActivity(row.daily_activity_level)}</td>
                <td>{(row.pain_zones ?? []).join(", ") || "—"}</td>
                <td>
                  <Link href={`/assessments/${row.id}`} prefetch>
                    View intake →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
