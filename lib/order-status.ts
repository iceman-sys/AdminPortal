export function orderStatusTone(
  status: string
): "success" | "warning" | "danger" | "default" {
  if (status === "paid") return "success";
  if (status === "pending") return "warning";
  if (status === "failed" || status === "canceled") return "danger";
  return "default";
}
