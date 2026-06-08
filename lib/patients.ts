import type { SupabaseClient, User } from "@supabase/supabase-js";
import { deriveCaseStatus, type CaseStatus } from "@/lib/case-status";

export type PatientProfile = {
  id: string;
  fullName: string | null;
  email: string | null;
  memberSince: string | null;
};

export type RecentPatientRow = {
  userId: string;
  fullName: string | null;
  email: string | null;
  lastActivityAt: string;
  caseStatus: CaseStatus;
  footScanCount: number;
  latestOrderStatus: string | null;
  latestRecommendation: string | null;
  wasReferredOut: boolean;
};

export async function getPatientProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<PatientProfile> {
  const [{ data: profile }, authUser] = await Promise.all([
    supabase.from("profiles").select("id, full_name, created_at").eq("id", userId).maybeSingle(),
    getAuthUser(supabase, userId),
  ]);

  return {
    id: userId,
    fullName: profile?.full_name ?? authUser?.user_metadata?.full_name ?? null,
    email: authUser?.email ?? null,
    memberSince: profile?.created_at ?? authUser?.created_at ?? null,
  };
}

export async function getAuthUser(supabase: SupabaseClient, userId: string): Promise<User | null> {
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error || !data.user) return null;
  return data.user;
}

/** Find auth user by email (case-insensitive). Suitable for small staff consoles. */
export async function findUserByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<User | null> {
  const needle = email.trim().toLowerCase();
  if (!needle.includes("@")) return null;

  for (let page = 1; page <= 10; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error || !data.users.length) break;

    const exact = data.users.find((u) => u.email?.toLowerCase() === needle);
    if (exact) return exact;

    const partial = data.users.find((u) => u.email?.toLowerCase().includes(needle));
    if (partial) return partial;

    if (data.users.length < 100) break;
  }
  return null;
}

export async function fetchRecentPatients(
  supabase: SupabaseClient,
  limit = 12
): Promise<RecentPatientRow[]> {
  const [{ data: orders }, { data: assessments }] = await Promise.all([
    supabase
      .from("orders")
      .select("user_id, status, created_at")
      .order("created_at", { ascending: false })
      .limit(40),
    supabase
      .from("assessments")
      .select("user_id, created_at")
      .order("created_at", { ascending: false })
      .limit(40),
  ]);

  const activityByUser = new Map<string, string>();
  for (const row of [...(orders ?? []), ...(assessments ?? [])]) {
    const uid = row.user_id as string;
    const at = row.created_at as string;
    const prev = activityByUser.get(uid);
    if (!prev || at > prev) activityByUser.set(uid, at);
  }

  const userIds = [...activityByUser.entries()]
    .sort((a, b) => b[1].localeCompare(a[1]))
    .slice(0, limit)
    .map(([id]) => id);

  if (!userIds.length) return [];

  const [{ data: profiles }, { data: recs }, { data: scans }, { data: userOrders }] =
    await Promise.all([
      supabase.from("profiles").select("id, full_name").in("id", userIds),
      supabase
        .from("recommendations")
        .select("user_id, was_referred_out, primary_category, created_at")
        .in("user_id", userIds)
        .order("created_at", { ascending: false }),
      supabase.from("foot_scans").select("user_id").in("user_id", userIds),
      supabase
        .from("orders")
        .select("user_id, status, created_at")
        .in("user_id", userIds)
        .order("created_at", { ascending: false }),
    ]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id as string, p]));
  const scanCounts = new Map<string, number>();
  for (const s of scans ?? []) {
    const uid = s.user_id as string;
    scanCounts.set(uid, (scanCounts.get(uid) ?? 0) + 1);
  }

  const latestRec = new Map<string, { was_referred_out: boolean; primary_category: string | null }>();
  for (const r of recs ?? []) {
    const uid = r.user_id as string;
    if (!latestRec.has(uid)) {
      latestRec.set(uid, {
        was_referred_out: r.was_referred_out as boolean,
        primary_category: r.primary_category as string | null,
      });
    }
  }

  const latestOrder = new Map<string, string>();
  let hasPaid = new Map<string, boolean>();
  let hasPending = new Map<string, boolean>();
  for (const o of userOrders ?? []) {
    const uid = o.user_id as string;
    const status = o.status as string;
    if (!latestOrder.has(uid)) latestOrder.set(uid, status);
    if (status === "paid") hasPaid.set(uid, true);
    if (status === "pending") hasPending.set(uid, true);
  }

  const authUsers = await Promise.all(userIds.map((id) => getAuthUser(supabase, id)));

  return userIds.map((userId, i) => {
    const profile = profileMap.get(userId);
    const rec = latestRec.get(userId);
    const footScanCount = scanCounts.get(userId) ?? 0;
    const auth = authUsers[i];

    const caseStatus = deriveCaseStatus({
      hasPaidOrder: hasPaid.get(userId) ?? false,
      hasPendingOrder: hasPending.get(userId) ?? false,
      wasReferredOut: rec?.was_referred_out ?? false,
      footScanCount,
      hasAssessment: true,
    });

    return {
      userId,
      fullName: profile?.full_name ?? (auth?.user_metadata?.full_name as string | undefined) ?? null,
      email: auth?.email ?? null,
      lastActivityAt: activityByUser.get(userId)!,
      caseStatus,
      footScanCount,
      latestOrderStatus: latestOrder.get(userId) ?? null,
      latestRecommendation: rec?.primary_category ?? null,
      wasReferredOut: rec?.was_referred_out ?? false,
    };
  });
}
