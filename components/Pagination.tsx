import Link from "next/link";

export function Pagination({
  page,
  rowCount,
  pageSize = 25,
  prevHref,
  nextHref,
}: {
  page: number;
  rowCount: number;
  pageSize?: number;
  prevHref: string;
  nextHref: string;
}) {
  return (
    <div className="list-footer">
      <div className="muted" style={{ fontSize: 13 }}>
        Page <strong>{page}</strong> · showing {rowCount} of up to {pageSize} rows
      </div>
      <div className="btn-group">
        <Link
          href={prevHref}
          prefetch
          className={`btn-ghost${page <= 1 ? " btn-ghost--disabled" : ""}`}
          aria-disabled={page <= 1}
        >
          ← Prev
        </Link>
        <Link href={nextHref} prefetch className="btn-ghost">
          Next →
        </Link>
      </div>
    </div>
  );
}
