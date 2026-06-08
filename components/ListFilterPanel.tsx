import Link from "next/link";
import type { ReactNode } from "react";

type PanelProps = {
  action: string;
  clearHref?: string;
  layout?: "default" | "single";
  children: ReactNode;
};

export function ListFilterPanel({ action, clearHref, layout = "default", children }: PanelProps) {
  const gridClass =
    layout === "single"
      ? "list-filter-panel__grid list-filter-panel__grid--single"
      : "list-filter-panel__grid";

  return (
    <form action={action} method="get" className="list-filter-panel">
      <div className="list-filter-panel__header">
        <span className="list-filter-panel__title">Filter &amp; search</span>
        <span className="list-filter-panel__hint muted">Narrow the list, then apply</span>
      </div>
      <div className={gridClass}>{children}</div>
      <div className="list-filter-panel__actions">
        <button type="submit" className="btn-primary list-filter-panel__submit">
          Apply filters
        </button>
        {clearHref ? (
          <Link href={clearHref} className="btn-ghost">
            Clear all
          </Link>
        ) : null}
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  hint?: string;
  wide?: boolean;
  children: ReactNode;
};

export function FilterField({ label, hint, wide, children }: FieldProps) {
  return (
    <div className={`filter-field${wide ? " filter-field--wide" : ""}`}>
      <label className="filter-field__label">{label}</label>
      <div className="filter-field__control-slot">{children}</div>
      <span className={`filter-field__hint${hint ? "" : " filter-field__hint--empty"}`}>
        {hint ?? "\u00a0"}
      </span>
    </div>
  );
}

export function FilterSearchInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="filter-field__control filter-field__control--icon">
      <span className="filter-field__icon" aria-hidden>
        🔍
      </span>
      <input className="input" {...props} />
    </div>
  );
}

export function FilterSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="filter-field__control filter-field__control--select">
      <select className="input input--select" {...props} />
    </div>
  );
}
