import { createAdminClient } from "@/lib/supabase/server";
import { ADMIN_REVALIDATE_SECONDS } from "@/lib/admin-cache";
import { labelActivity, labelFootType } from "@/lib/labels";
import { listQuery } from "@/lib/list-url";
import type { AssessmentRow } from "@/lib/types";
import Link from "next/link";
import { clamp, getInt, getString } from "@/lib/query";
import { FilterChips } from "@/components/FilterChips";
import { Pagination } from "@/components/Pagination";
import { UserLink } from "@/components/UserLink";
import { Code, EmptyState, ErrorBlock, PageHeader, formatDate, shortId } from "@/components/ui";
import type { Metadata } from "next";

export const revalidate = ADMIN_REVALIDATE_SECONDS;

export const metadata: Metadata = { title: "Assessments" };

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
    return <ErrorBlock message={error.message + (q ? " (tip: use a user_id/id prefix)" : "")} />;
  }

  const rows = (data ?? []) as AssessmentRow[];
  const baseQuery = { q, page: page > 1 ? page : undefined };
  const chips = q ? [{ label: `Search: ${q}`, clearHref: "/assessments" }] : [];

  return (
    <div>
      <PageHeader
        title="Assessments"
        subtitle="Read-only intake records. Search by user id or assessment id prefix."
        actions={
          <form action="/assessments" className="list-toolbar">
            <input name="q" defaultValue={q} placeholder="Search user_id / id…" className="input" style={{ width: 280 }} />
            <button type="submit" className="button">
              Apply
            </button>
          </form>
        }
      />

      <FilterChips chips={chips} clearAllHref="/assessments" />

      <Pagination
        page={page}
        rowCount={rows.length}
        prevHref={`/assessments${listQuery({ ...baseQuery, page: page - 1 })}`}
        nextHref={`/assessments${listQuery({ ...baseQuery, page: page + 1 })}`}
      />

      {rows.length === 0 ? (
        <EmptyState message={q ? "No results." : "No assessments yet."} />
      ) : (
        <table>
          <thead>
            <tr>
              <th scope="col">Created</th>
              <th scope="col">User</th>
              <th scope="col">Foot type</th>
              <th scope="col">Activity</th>
              <th scope="col">Pain zones</th>
              <th scope="col">ID</th>
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
                    <Code>{shortId(row.id)}</Code>
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
