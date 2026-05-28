import { JsonViewer } from "@/components/ui";

export function CollapsibleRaw({ value, label = "Raw record" }: { value: unknown; label?: string }) {
  return (
    <details className="raw-details">
      <summary>{label}</summary>
      <JsonViewer value={value} />
    </details>
  );
}
