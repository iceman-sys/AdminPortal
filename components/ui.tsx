import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </div>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="card empty-state">
      <p style={{ margin: 0, color: "var(--muted)", fontSize: 15, lineHeight: 1.55 }}>{message}</p>
    </div>
  );
}

export function ErrorBlock({ message }: { message: string }) {
  return (
    <div className="card login-form__error" role="alert">
      <strong style={{ display: "block", marginBottom: 4 }}>Something went wrong</strong>
      <span>{message}</span>
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
  return (
    <code
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "0.92em",
        padding: "2px 6px",
        background: "var(--bg-subtle)",
        borderRadius: 6,
      }}
    >
      {children}
    </code>
  );
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
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
        padding: 14,
        background: "var(--surface)",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border)",
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
    <Link href={href} className="btn-secondary" style={{ borderRadius: "var(--radius-full)" }}>
      {children}
    </Link>
  );
}
