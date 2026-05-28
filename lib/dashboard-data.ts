import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { ADMIN_REVALIDATE_SECONDS } from "@/lib/admin-cache";

export type DashboardOrderRow = {
  id: string;
  user_id: string;
  product_sku: string;
  status: string;
  amount_cents: number;
  currency: string;
  created_at: string;
};

export type DashboardSnapshot = {
  assessments: number;
  recommendations: number;
  orders: number;
  assessments24h: number;
  recommendations24h: number;
  orders24h: number;
  paid24h: number;
  stalePending: number;
  statusBreakdown: { status: string; count: number }[];
  recentOrders: DashboardOrderRow[];
};

async function loadDashboardSnapshot(): Promise<DashboardSnapshot> {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const staleBefore = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const supabase = createAdminClient();

  const countOf = async (table: string) => {
    const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
    if (error) throw error;
    return count ?? 0;
  };

  const countSince = async (table: string) => {
    const { count, error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true })
      .gte("created_at", since24h);
    if (error) throw error;
    return count ?? 0;
  };

  const countOrdersByStatus = async (status: string) => {
    const { count, error } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", status);
    if (error) throw error;
    return count ?? 0;
  };

  const [
    assessments,
    recommendations,
    orders,
    assessments24h,
    recommendations24h,
    orders24h,
    recentOrdersRes,
    stalePending,
    paid24h,
    pendingCount,
    paidCount,
    failedCount,
    canceledCount,
  ] = await Promise.all([
    countOf("assessments"),
    countOf("recommendations"),
    countOf("orders"),
    countSince("assessments"),
    countSince("recommendations"),
    countSince("orders"),
    supabase
      .from("orders")
      .select("id, user_id, product_sku, status, amount_cents, currency, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
      .lt("created_at", staleBefore)
      .then(({ count, error }) => {
        if (error) throw error;
        return count ?? 0;
      }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "paid")
      .gte("created_at", since24h)
      .then(({ count, error }) => {
        if (error) throw error;
        return count ?? 0;
      }),
    countOrdersByStatus("pending"),
    countOrdersByStatus("paid"),
    countOrdersByStatus("failed"),
    countOrdersByStatus("canceled"),
  ]);

  if (recentOrdersRes.error) throw recentOrdersRes.error;

  return {
    assessments,
    recommendations,
    orders,
    assessments24h,
    recommendations24h,
    orders24h,
    paid24h,
    stalePending,
    statusBreakdown: [
      { status: "pending", count: pendingCount },
      { status: "paid", count: paidCount },
      { status: "failed", count: failedCount },
      { status: "canceled", count: canceledCount },
    ],
    recentOrders: (recentOrdersRes.data ?? []) as DashboardOrderRow[],
  };
}

export const getDashboardSnapshot = unstable_cache(
  loadDashboardSnapshot,
  ["admin-dashboard-snapshot"],
  { revalidate: ADMIN_REVALIDATE_SECONDS, tags: ["admin-dashboard"] }
);
