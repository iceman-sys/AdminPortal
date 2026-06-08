import Link from "next/link";
import { ADMIN_REVALIDATE_SECONDS } from "@/lib/admin-cache";
import { getDashboardSnapshot } from "@/lib/dashboard-data";
import { fetchRecentPatients } from "@/lib/patients";
import { orderStatusTone } from "@/lib/order-status";
import { labelOrderStatus, labelProductSku } from "@/lib/labels";
import { formatMoney } from "@/lib/types";
import { createAdminClient } from "@/lib/supabase/server";
import { PatientSearchHero } from "@/components/PatientSearchHero";
import { RecentPatientsTable } from "@/components/RecentPatientsTable";
import { Badge, EmptyState, PageHeader, formatDate } from "@/components/ui";
import type { Metadata } from "next";

export const revalidate = ADMIN_REVALIDATE_SECONDS;

export const metadata: Metadata = { title: "Home" };

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
    <Link href={href} prefetch className="card kpi-card">
      <div className="kpi-card__label">{label}</div>
      <div className="kpi-card__value">{total}</div>
      <div className="kpi-card__hint">Last 24 hours: {last24h}</div>
    </Link>
  );
}

export default async function DashboardPage() {
  const supabase = createAdminClient();
  const [recentPatients, snapshot] = await Promise.all([
    fetchRecentPatients(supabase, 12),
    getDashboardSnapshot(),
  ]);

  const {
    assessments,
    recommendations,
    orders,
    assessments24h,
    recommendations24h,
    orders24h,
    paid24h,
    stalePending,
    recentOrders,
  } = snapshot;

  return (
    <div>
      <PageHeader
        title="Clinician home"
        subtitle="Review patient foot scans, recommendations, and purchases from the OrthoticHub app."
      />

      <PatientSearchHero />

      <div style={{ marginTop: 24 }}>
        <h2 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 700 }}>Recent patients</h2>
        <RecentPatientsTable rows={recentPatients} />
      </div>

      {stalePending > 0 ? (
        <div className="card attention-banner" style={{ marginTop: 20 }}>
          <strong style={{ display: "block", marginBottom: 4 }}>Needs attention</strong>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 14, lineHeight: 1.5 }}>
            {stalePending} purchase{stalePending === 1 ? "" : "s"} still showing as pending after 15+ minutes.
            The payment may not have completed — check the purchase in Stripe if needed.
          </p>
          <Link href="/orders?status=pending" prefetch style={{ fontSize: 13, fontWeight: 600, marginTop: 8, display: "inline-block" }}>
            View pending purchases →
          </Link>
        </div>
      ) : null}

      <details className="reports-section" style={{ marginTop: 28 }}>
        <summary>Activity reports</summary>
        <p className="muted" style={{ fontSize: 13, margin: "12px 0 16px" }}>
          Summary counts refresh every {ADMIN_REVALIDATE_SECONDS} seconds.
        </p>

        <div className="kpi-grid">
          <KpiCard href="/assessments" label="Patient intakes" total={assessments} last24h={assessments24h} />
          <KpiCard href="/recommendations" label="Orthotic matches" total={recommendations} last24h={recommendations24h} />
          <KpiCard href="/orders" label="Purchases" total={orders} last24h={orders24h} />
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <div className="muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Last 24 hours
          </div>
          <p style={{ margin: "12px 0 0", fontSize: 15 }}>
            <strong>{assessments24h}</strong> intakes → <strong>{recommendations24h}</strong> matches →{" "}
            <strong>{orders24h}</strong> purchases · <strong>{paid24h}</strong> paid
          </p>
        </div>

        <div style={{ marginTop: 16 }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 700 }}>Recent purchases</h3>
          {recentOrders.length === 0 ? (
            <EmptyState message="No purchases yet." />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDate(row.created_at)}</td>
                    <td>
                      <Badge tone={orderStatusTone(row.status)}>{labelOrderStatus(row.status)}</Badge>
                    </td>
                    <td>{labelProductSku(row.product_sku)}</td>
                    <td>{formatMoney(row.amount_cents, row.currency)}</td>
                    <td>
                      <Link href={`/users/${row.user_id}`} prefetch style={{ fontWeight: 600, fontSize: 13 }}>
                        Patient case →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </details>
    </div>
  );
}
