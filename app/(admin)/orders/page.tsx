import { createAdminClient } from "@/lib/supabase/server";
import { ADMIN_REVALIDATE_SECONDS } from "@/lib/admin-cache";
import { labelOrderStatus, labelProductSku } from "@/lib/labels";
import { orderStatusTone } from "@/lib/order-status";
import { listQuery } from "@/lib/list-url";
import type { OrderRow } from "@/lib/types";
import { formatMoney } from "@/lib/types";
import Link from "next/link";
import { clamp, getInt, getString } from "@/lib/query";
import { FilterChips, type FilterChip } from "@/components/FilterChips";
import {
  FilterField,
  FilterSearchInput,
  FilterSelect,
  ListFilterPanel,
} from "@/components/ListFilterPanel";
import { Pagination } from "@/components/Pagination";
import { UserLink } from "@/components/UserLink";
import { Badge, Code, EmptyState, ErrorBlock, PageHeader, formatDate, shortId } from "@/components/ui";
import type { Metadata } from "next";

export const revalidate = ADMIN_REVALIDATE_SECONDS;

export const metadata: Metadata = { title: "Purchases" };

const PRODUCT_SKUS = [
  "STABILITY-001",
  "PRESSURE-001",
  "SPORT-001",
  "WORK-001",
  "DIABETIC-001",
  "DRESS-001",
] as const;

const ORDER_STATUSES = ["pending", "paid", "failed", "canceled"] as const;

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
  if (status) chips.push({ label: `Status: ${labelOrderStatus(status)}`, clearHref: `/orders${listQuery({ q, sku })}` });
  if (sku) chips.push({ label: `Product: ${labelProductSku(sku) !== "—" ? labelProductSku(sku) : sku}`, clearHref: `/orders${listQuery({ q, status })}` });

  const hasFilters = Boolean(q || status || sku);

  return (
    <div>
      <PageHeader
        title="Purchases"
        subtitle="In-app checkout records. Filter by payment status or product."
      />

      <ListFilterPanel action="/orders" clearHref={hasFilters ? "/orders" : undefined}>
        <FilterField label="Search" hint="Patient ID, payment reference, or record prefix" wide>
          <FilterSearchInput
            name="q"
            defaultValue={q}
            placeholder="Search purchases…"
            aria-label="Search purchases"
          />
        </FilterField>
        <FilterField label="Payment status">
          <FilterSelect name="status" defaultValue={status} aria-label="Filter by payment status">
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {labelOrderStatus(s)}
              </option>
            ))}
          </FilterSelect>
        </FilterField>
        <FilterField label="Product">
          <FilterSelect name="sku" defaultValue={sku} aria-label="Filter by product">
            <option value="">All products</option>
            {PRODUCT_SKUS.map((code) => (
              <option key={code} value={code}>
                {labelProductSku(`ORTH-${code}`) !== "—" ? labelProductSku(`ORTH-${code}`) : code}
              </option>
            ))}
          </FilterSelect>
        </FilterField>
      </ListFilterPanel>

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
            hasFilters
              ? "No purchases match these filters."
              : "No purchases yet. Complete a test checkout in the iOS app."
          }
        />
      ) : (
        <table>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Status</th>
              <th scope="col">Product</th>
              <th scope="col">Amount</th>
              <th scope="col">Patient</th>
              <th scope="col">Payment ref</th>
              <th scope="col">Record</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{formatDate(row.created_at)}</td>
                <td>
                  <Badge tone={orderStatusTone(row.status)}>{labelOrderStatus(row.status)}</Badge>
                </td>
                <td>{labelProductSku(row.product_sku) !== "—" ? labelProductSku(row.product_sku) : row.product_sku}</td>
                <td>{formatMoney(row.amount_cents, row.currency)}</td>
                <td>
                  <UserLink userId={row.user_id} />
                </td>
                <td>
                  <Code>{row.stripe_payment_intent_id ? shortId(row.stripe_payment_intent_id) : "—"}</Code>
                </td>
                <td>
                  <Link href={`/orders/${row.id}`} prefetch>
                    View →
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
