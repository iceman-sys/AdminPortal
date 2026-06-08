import type { SupabaseClient } from "@supabase/supabase-js";

export type FootScanRow = {
  id: string;
  user_id: string;
  assessment_id: string | null;
  side: string;
  arch_type: string | null;
  storage_path: string;
  source: string;
  captured_at: string;
  created_at: string;
  // Phase C — present after migration 0005; null for photo/mock captures.
  capture_mode: string | null;
  length_mm: number | null;
  width_mm: number | null;
  arch_height_mm: number | null;
  metrics_confidence: number | null;
  mesh_storage_path: string | null;
};

export type FootScanWithUrl = FootScanRow & {
  imageUrl: string | null;
  meshUrl: string | null;
};

const BUCKET = "foot-scans";
const SIGNED_URL_TTL_SEC = 3600;

export async function fetchFootScansForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<FootScanRow[]> {
  const { data, error } = await supabase
    .from("foot_scans")
    .select("*")
    .eq("user_id", userId)
    .order("captured_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  return (data ?? []) as FootScanRow[];
}

export async function fetchFootScansForAssessment(
  supabase: SupabaseClient,
  assessmentId: string
): Promise<FootScanRow[]> {
  const { data, error } = await supabase
    .from("foot_scans")
    .select("*")
    .eq("assessment_id", assessmentId)
    .order("side", { ascending: true });

  if (error) throw error;
  return (data ?? []) as FootScanRow[];
}

export async function attachSignedImageUrls(
  supabase: SupabaseClient,
  rows: FootScanRow[]
): Promise<FootScanWithUrl[]> {
  const results: FootScanWithUrl[] = [];

  for (const row of rows) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(row.storage_path, SIGNED_URL_TTL_SEC);

    let meshUrl: string | null = null;
    if (row.mesh_storage_path) {
      const mesh = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(row.mesh_storage_path, SIGNED_URL_TTL_SEC);
      meshUrl = mesh.error ? null : mesh.data?.signedUrl ?? null;
    }

    results.push({
      ...row,
      imageUrl: error ? null : data?.signedUrl ?? null,
      meshUrl,
    });
  }

  return results;
}

export function labelFootScanSource(source: string): string {
  switch (source) {
    case "camera":
      return "Device camera";
    case "simulator_mock":
      return "Test scan (simulator)";
    default:
      return source;
  }
}

export function footScanSourceTone(source: string): "default" | "warning" | "success" {
  if (source === "camera") return "success";
  if (source === "simulator_mock") return "warning";
  return "default";
}

/** Plain-language scan type for clinicians (not engineers). */
export function labelCaptureMode(mode: string | null): string {
  switch (mode) {
    case "true_depth":
      return "3D scan (depth camera)";
    case "rear_lidar":
      return "3D scan (LiDAR)";
    case "photo_fallback":
      return "Photo only — depth unavailable";
    case "simulator_mock":
      return "Test scan (simulator)";
    case "photo":
      return "Photo";
    default:
      return mode ?? "Photo";
  }
}

export function captureModeTone(mode: string | null): "default" | "warning" | "success" {
  if (mode === "true_depth" || mode === "rear_lidar") return "success";
  if (mode === "photo_fallback" || mode === "simulator_mock") return "warning";
  return "default";
}

export function hasFootMetrics(scan: FootScanRow): boolean {
  return scan.length_mm != null || scan.width_mm != null || scan.arch_height_mm != null;
}

export function hasMeshExport(scan: FootScanRow): boolean {
  return Boolean(scan.mesh_storage_path);
}

export function formatMm(value: number | null): string {
  return value == null ? "—" : `${value.toFixed(1)} mm`;
}
