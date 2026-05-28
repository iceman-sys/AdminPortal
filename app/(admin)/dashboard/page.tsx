import Link from "next/link";
import { ADMIN_REVALIDATE_SECONDS } from "@/lib/admin-cache";
import { getDashboardSnapshot } from "@/lib/dashboard-data";
import { orderStatusTone } from "@/lib/order-status";
import { formatMoney } from "@/lib/types";
import { Badge, Card, Code, EmptyState, PageHeader, formatDate, shortId } from "@/components/ui";
import type { Metadata } from "next";

export const revalidate = ADMIN_REVALIDATE_SECONDS;

export const metadata: Metadata = { title: "Dashboard" };

function KpiCard({
  href,
  label,
  total,
  last24h,
}: {
  href: string;
  label: string;
  total: number;
  last24h: number;
}) {
  return (
    <Link
      href={href}
      prefetch
      className="card"
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        transition: "box-shadow 0.15s ease",
      }}
    >
      <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </div>
      <div style={{ fontSize: 34, fontWeight: 800, marginTop: 6 }}>{total}</div>
      <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>Last 24h: {last24h}</div>
      <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>View all →</div>
    </Link>
  );
}

export default async function DashboardPage() {
  const {
    assessments,
    recommendations,
    orders,
    assessments24h,
    recommendations24h,
    orders24h,
    paid24h,
    stalePending,
    statusBreakdown,
    recentOrders,
  } = await getDashboardSnapshot();

  const conversion24h =
    assessments24h > 0 ? Math.round((orders24h / assessments24h) * 100) : null;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of intake, recommendations, and commerce."
        actions={
          <Link href="/orders" prefetch style={{ fontSize: 13, fontWeight: 600 }}>
            All orders →
          </Link>
        }
      />
      <p className="stale-hint">Counts refresh every {ADMIN_REVALIDATE_SECONDS} seconds.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
        <KpiCard href="/assessments" label="Assessments" total={assessments} last24h={assessments24h} />
        <KpiCard href="/recommendations" label="Recommendations" total={recommendations} last24h={recommendations24h} />
        <KpiCard href="/orders" label="Orders" total={orders} last24h={orders24h} />
      </div>

      {stalePending > 0 ? (
        <div
          className="card"
          style={{
            marginTop: 16,
            borderLeft: "4px solid #f59e0b",
            padding: "14px 18px",
          }}
        >
          <strong style={{ display: "block", marginBottom: 4 }}>Attention</strong>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 14, lineHeight: 1.5 }}>
            {stalePending} order{stalePending === 1 ? "" : "s"} still <Badge tone="warning">pending</Badge> after 15+
            minutes. Check Stripe webhook logs or open the order detail.
          </p>
          <Link
            href="/orders?status=pending"
            prefetch
            style={{ fontSize: 13, fontWeight: 600, marginTop: 8, display: "inline-block" }}
          >
            View pending orders →
          </Link>
        </div>
      ) : null}

      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Last 24 hours
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 12,
            marginTop: 12,
            fontSize: 15,
          }}
        >
          <span>
            <strong>{assessments24h}</strong> assessments
          </span>
          <span className="muted">→</span>
          <span>
            <strong>{recommendations24h}</strong> recommendations
          </span>
          <span className="muted">→</span>
          <span>
            <strong>{orders24h}</strong> orders
          </span>
          {conversion24h !== null ? (
            <span className="muted" style={{ fontSize: 13 }}>
              ({conversion24h}% assessment → order)
            </span>
          ) : null}
          <span className="muted" style={{ marginLeft: "auto", fontSize: 13 }}>
            {paid24h} paid in 24h
          </span>
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Recent orders</h2>
            <Link href="/orders" prefetch style={{ fontSize: 13, fontWeight: 600 }}>
              View all →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <EmptyState message="No orders yet. Complete a test purchase in the iOS app." />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Created</th>
                  <th>Status</th>
                  <th>SKU</th>
                  <th>Amount</th>
                  <th>Order</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDate(row.created_at)}</td>
                    <td>
                      <Badge tone={orderStatusTone(row.status)}>{row.status}</Badge>
                    </td>
                    <td>{row.product_sku}</td>
                    <td>{formatMoney(row.amount_cents, row.currency)}</td>
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

        <Card>
          <h2 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700 }}>Orders by status</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {statusBreakdown.map(({ status, count }) => (
              <li key={status}>
                <Link
                  href={`/orders?status=${status}`}
                  prefetch
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    textDecoration: "none",
                    color: "inherit",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    background: "#fbfdff",
                  }}
                >
                  <Badge tone={orderStatusTone(status)}>{status}</Badge>
                  <span style={{ fontSize: 22, fontWeight: 800 }}>{count}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p style={{ margin: "14px 0 0", color: "var(--muted)", fontSize: 13, lineHeight: 1.5 }}>
            Total orders: <strong>{orders}</strong>
          </p>
        </Card>
      </div>
    </div>
  );
}
