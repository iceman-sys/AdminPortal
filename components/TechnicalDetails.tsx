import { CollapsibleRaw } from "@/components/CollapsibleRaw";
import { CopyButton } from "@/components/CopyButton";
import { Code } from "@/components/ui";

export function TechnicalDetails({
  userId,
  rawRecords,
}: {
  userId: string;
  rawRecords?: { label: string; value: unknown }[];
}) {
  return (
    <details className="raw-details technical-details">
      <summary>Technical details (for support)</summary>
      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span className="muted" style={{ fontSize: 13 }}>
            Patient ID:
          </span>
          <Code>{userId}</Code>
          <CopyButton value={userId} label="Copy ID" />
        </div>
        {rawRecords?.map(({ label, value }) => (
          <CollapsibleRaw key={label} label={label} value={value} />
        ))}
      </div>
    </details>
  );
}
