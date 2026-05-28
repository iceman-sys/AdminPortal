import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 16,
      }}
    >
      <div>
        <h1 style={{ margin: "0 0 6px", fontSize: 26 }}>{title}</h1>
        {subtitle ? (
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div style={{ display: "flex", gap: 10, alignItems: "center" }}>{actions}</div> : null}
    </div>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="card" style={{ color: "var(--muted)" }}>
      {message}
    </div>
  );
}

export function ErrorBlock({ message }: { message: string }) {
  return (
    <div className="card" style={{ color: "var(--danger)" }}>
      <strong>Error loading data</strong>
      <p style={{ marginBottom: 0 }}>{message}</p>
    </div>
  );
}

export function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const className =
    tone === "success"
      ? "badge badge-paid"
      : tone === "warning"
        ? "badge badge-pending"
        : tone === "danger"
          ? "badge badge-refer"
          : "badge";
  return <span className={className}>{children}</span>;
}

export function Code({ children }: { children: React.ReactNode }) {
  return <code style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{children}</code>;
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function shortId(id: string) {
  return id.length > 10 ? `${id.slice(0, 10)}…` : id;
}

export function JsonViewer({ value }: { value: unknown }) {
  return (
    <pre
      style={{
        marginTop: 12,
        padding: 12,
        background: "#f8fafc",
        borderRadius: 8,
        overflow: "auto",
        fontSize: 12,
      }}
    >
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export function PillLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        padding: "8px 12px",
        borderRadius: 999,
        border: "1px solid var(--border)",
        background: "var(--surface)",
        color: "var(--text)",
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {children}
    </Link>
  );
}

