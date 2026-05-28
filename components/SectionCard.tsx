import Link from "next/link";

export function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <div className="card section-card">
      <div className="section-card__header">
        <strong>{title}</strong>
        {action ? (
          <Link href={action.href} prefetch className="link-muted" style={{ fontWeight: 700 }}>
            {action.label}
          </Link>
        ) : null}
      </div>
      <div className="section-card__body">{children}</div>
    </div>
  );
}
