import Link from "next/link";

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`}>
          {i > 0 ? <span className="breadcrumb__sep">/</span> : null}
          {item.href ? (
            <Link href={item.href} prefetch>
              {item.label}
            </Link>
          ) : (
            <span className="breadcrumb__current">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
