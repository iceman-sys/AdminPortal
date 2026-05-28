import Link from "next/link";
import { Code, shortId } from "@/components/ui";

export function UserLink({ userId }: { userId: string }) {
  return (
    <Link href={`/users/${userId}`} prefetch className="user-link">
      <Code>{shortId(userId)}</Code>
    </Link>
  );
}
