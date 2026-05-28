import { createAdminClient } from "@/lib/supabase/server";
import { ADMIN_REVALIDATE_SECONDS } from "@/lib/admin-cache";
import { orderStatusTone } from "@/lib/order-status";
import { listQuery } from "@/lib/list-url";
import type { OrderRow } from "@/lib/types";
import { formatMoney } from "@/lib/types";
import Link from "next/link";
import { clamp, getInt, getString } from "@/lib/query";
import { FilterChips, type FilterChip } from "@/components/FilterChips";
import { Pagination } from "@/components/Pagination";
import { UserLink } from "@/components/UserLink";
import { Badge, Code, EmptyState, ErrorBlock, PageHeader, formatDate, shortId } from "@/components/ui";
import type { Metadata } from "next";

export const revalidate = ADMIN_REVALIDATE_SECONDS;

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const supabase = createAdminClient();
  const q = getString(searchParams?.q, "").trim();
  const status = getString(searchParams?.status, "");
  const sku = getString(searchParams?.sku, "");
  const page = clamp(getInt(searchParams?.page, 1), 1, 1000);
  const pageSize = 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("orders")
    .select(
      "id, user_id, recommendation_id, product_sku, status, amount_cents, currency, stripe_payment_intent_id, created_at"
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status) query = query.eq("status", status);
  if (sku) query = query.eq("product_sku", sku);
  if (q) query = query.or(`user_id.ilike.${q}%,stripe_payment_intent_id.ilike.${q}%,id.ilike.${q}%`);

  const { data, error } = await query;
  if (error) {
    const hint =
      error.message.includes("does not exist") || error.code === "42P01"
        ? " Run migration 0003_milestone3_commerce.sql in Supabase first."
        : "";
    return <ErrorBlock message={error.message + hint} />;
  }

  const rows = (data ?? []) as OrderRow[];
  const baseQuery = { q, status, sku, page: page > 1 ? page : undefined };
  const chips: FilterChip[] = [];
  if (q) chips.push({ label: `Search: ${q}`, clearHref: `/orders${listQuery({ status, sku })}` });
  if (status) chips.push({ label: `Status: ${status}`, clearHref: `/orders${listQuery({ q, sku })}` });
  if (sku) chips.push({ label: `SKU: ${sku}`, clearHref: `/orders${listQuery({ q, status })}` });

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="Read-only commerce records. Filter by status or SKU."
        actions={
          <form action="/orders" className="list-toolbar">
            <input name="q" defaultValue={q} placeholder="User / PI / id…" className="input" style={{ width: 200 }} />
            <select name="status" defaultValue={status} className="input">
              <option value="">All statuses</option>
              <option value="pending">pending</option>
              <option value="paid">paid</option>
              <option value="failed">failed</option>
              <option value="canceled">canceled</option>
            </select>
            <select name="sku" defaultValue={sku} className="input">
              <option value="">All SKUs</option>
              <option value="STABILITY-001">STABILITY-001</option>
              <option value="PRESSURE-001">PRESSURE-001</option>
              <option value="SPORT-001">SPORT-001</option>
              <option value="WORK-001">WORK-001</option>
              <option value="DIABETIC-001">DIABETIC-001</option>
              <option value="DRESS-001">DRESS-001</option>
            </select>
            <button type="submit" className="button">
              Apply
            </button>
          </form>
        }
      />

      <FilterChips chips={chips} clearAllHref="/orders" />

      <Pagination
        page={page}
        rowCount={rows.length}
        prevHref={`/orders${listQuery({ ...baseQuery, page: page - 1 })}`}
        nextHref={`/orders${listQuery({ ...baseQuery, page: page + 1 })}`}
      />

      {rows.length === 0 ? (
        <EmptyState
          message={
            q || status || sku
              ? "No results."
              : "No orders yet. Complete a test purchase in the iOS app."
          }
        />
      ) : (
        <table>
          <thead>
            <tr>
              <th scope="col">Created</th>
              <th scope="col">Status</th>
              <th scope="col">SKU</th>
              <th scope="col">Amount</th>
              <th scope="col">User</th>
              <th scope="col">Stripe PI</th>
              <th scope="col">ID</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{formatDate(row.created_at)}</td>
                <td>
                  <Badge tone={orderStatusTone(row.status)}>{row.status}</Badge>
                </td>
                <td>{row.product_sku}</td>
                <td>{formatMoney(row.amount_cents, row.currency)}</td>
                <td>
                  <UserLink userId={row.user_id} />
                </td>
                <td>
                  <Code>{row.stripe_payment_intent_id ? shortId(row.stripe_payment_intent_id) : "—"}</Code>
                </td>
                <td>
                  <Link href={`/orders/${row.id}`} prefetch>
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
