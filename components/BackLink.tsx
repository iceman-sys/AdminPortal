import Link from "next/link";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} prefetch className="link-back">
      ← {label}
    </Link>
  );
}
