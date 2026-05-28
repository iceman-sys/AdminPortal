import Link from "next/link";

export type FilterChip = { label: string; clearHref: string };

export function FilterChips({ chips, clearAllHref }: { chips: FilterChip[]; clearAllHref: string }) {
  if (!chips.length) return null;
  return (
    <div className="filter-chips">
      {chips.map((chip) => (
        <span key={chip.label} className="filter-chip">
          {chip.label}
          <Link href={chip.clearHref} className="filter-chip__clear" aria-label={`Clear ${chip.label}`}>
            ×
          </Link>
        </span>
      ))}
      <Link href={clearAllHref} className="link-muted">
        Clear all
      </Link>
    </div>
  );
}
