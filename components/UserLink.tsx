import Link from "next/link";

export function UserLink({ userId, compact = false }: { userId: string; compact?: boolean }) {
  return (
    <Link href={`/users/${userId}`} prefetch className="user-link" style={{ fontWeight: 600, fontSize: 13 }}>
      {compact ? "Case →" : "Open patient case →"}
    </Link>
  );
}
