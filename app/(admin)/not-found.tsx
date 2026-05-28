import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="card">
      <h1 style={{ marginTop: 0, fontSize: 20 }}>Page not found</h1>
      <p className="muted" style={{ fontSize: 14 }}>
        This admin route does not exist.
      </p>
      <Link href="/dashboard" className="btn-ghost" style={{ display: "inline-block", marginTop: 16 }}>
        Go to dashboard
      </Link>
    </div>
  );
}
