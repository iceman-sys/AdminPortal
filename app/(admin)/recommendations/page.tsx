import { createAdminClient } from "@/lib/supabase/server";
import { ADMIN_REVALIDATE_SECONDS } from "@/lib/admin-cache";
import { labelCategory } from "@/lib/labels";
import { listQuery } from "@/lib/list-url";
import type { RecommendationRow } from "@/lib/types";
import Link from "next/link";
import { clamp, getInt, getString } from "@/lib/query";
import { FilterChips, type FilterChip } from "@/components/FilterChips";
import { Pagination } from "@/components/Pagination";
import { UserLink } from "@/components/UserLink";
import { Badge, Code, EmptyState, ErrorBlock, PageHeader, formatDate, shortId } from "@/components/ui";
import type { Metadata } from "next";

export const revalidate = ADMIN_REVALIDATE_SECONDS;

export const metadata: Metadata = { title: "Recommendations" };

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const supabase = createAdminClient();
  const q = getString(searchParams?.q, "").trim();
  const referred = getString(searchParams?.referred, "");
  const category = getString(searchParams?.category, "");
  const page = clamp(getInt(searchParams?.page, 1), 1, 1000);
  const pageSize = 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("recommendations")
    .select(
      "id, user_id, assessment_id, primary_category, confidence, was_referred_out, refer_out_reason, rules_engine_version, created_at"
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (referred === "yes") query = query.eq("was_referred_out", true);
  if (referred === "no") query = query.eq("was_referred_out", false);
  if (category) query = query.eq("primary_category", category);
  if (q) query = query.or(`user_id.ilike.${q}%,assessment_id.ilike.${q}%,id.ilike.${q}%`);

  const { data, error } = await query;
  if (error) return <ErrorBlock message={error.message} />;

  const rows = (data ?? []) as RecommendationRow[];
  const baseQuery = { q, referred, category, page: page > 1 ? page : undefined };
  const chips: FilterChip[] = [];
  if (q) chips.push({ label: `Search: ${q}`, clearHref: `/recommendations${listQuery({ referred, category })}` });
  if (referred === "yes") chips.push({ label: "Refer-out", clearHref: `/recommendations${listQuery({ q, category })}` });
  if (referred === "no") chips.push({ label: "Matched", clearHref: `/recommendations${listQuery({ q, category })}` });
  if (category) chips.push({ label: `Category: ${category}`, clearHref: `/recommendations${listQuery({ q, referred })}` });

  return (
    <div>
      <PageHeader
        title="Recommendations"
        subtitle="Read-only outcomes from the rules engine."
        actions={
          <form action="/recommendations" className="list-toolbar">
            <input name="q" defaultValue={q} placeholder="User / assessment / id…" className="input" style={{ width: 220 }} />
            <select name="referred" defaultValue={referred} className="input">
              <option value="">All outcomes</option>
              <option value="no">Matched</option>
              <option value="yes">Refer-out</option>
            </select>
            <select name="category" defaultValue={category} className="input">
              <option value="">All categories</option>
              <option value="stability">stability</option>
              <option value="pressure">pressure</option>
              <option value="sport">sport</option>
              <option value="work">work</option>
              <option value="diabetic">diabetic</option>
              <option value="dress">dress</option>
            </select>
            <button type="submit" className="button">
              Apply
            </button>
          </form>
        }
      />

      <FilterChips chips={chips} clearAllHref="/recommendations" />

      <Pagination
        page={page}
        rowCount={rows.length}
        prevHref={`/recommendations${listQuery({ ...baseQuery, page: page - 1 })}`}
        nextHref={`/recommendations${listQuery({ ...baseQuery, page: page + 1 })}`}
      />

      {rows.length === 0 ? (
        <EmptyState message={q || referred || category ? "No results." : "No recommendations yet."} />
      ) : (
        <table>
          <thead>
            <tr>
              <th scope="col">Created</th>
              <th scope="col">Outcome</th>
              <th scope="col">User</th>
              <th scope="col">Assessment</th>
              <th scope="col">Engine</th>
              <th scope="col">ID</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{formatDate(row.created_at)}</td>
                <td>
                  <Badge tone={row.was_referred_out ? "danger" : "default"}>
                    {row.was_referred_out ? "Refer-out" : labelCategory(row.primary_category)}
                  </Badge>
                  {row.confidence && !row.was_referred_out ? (
                    <span className="muted" style={{ fontSize: 12, marginLeft: 6 }}>
                      {row.confidence}
                    </span>
                  ) : null}
                </td>
                <td>
                  <UserLink userId={row.user_id} />
                </td>
                <td>
                  <Link href={`/assessments/${row.assessment_id}`} prefetch>
                    <Code>{shortId(row.assessment_id)}</Code>
                  </Link>
                </td>
                <td className="muted" style={{ fontSize: 13 }}>
                  v{row.rules_engine_version}
                </td>
                <td>
                  <Link href={`/recommendations/${row.id}`} prefetch>
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
