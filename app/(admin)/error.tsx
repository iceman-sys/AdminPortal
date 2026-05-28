"use client";

import Link from "next/link";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="card" style={{ marginTop: 24 }}>
      <h1 style={{ marginTop: 0, fontSize: 20 }}>Something went wrong</h1>
      <p className="muted" style={{ fontSize: 14, lineHeight: 1.5 }}>
        The page could not load. Try again or return to the dashboard.
      </p>
      <div className="btn-group" style={{ marginTop: 16 }}>
        <button type="button" className="button" onClick={() => reset()}>
          Try again
        </button>
        <Link href="/dashboard" className="btn-ghost">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
