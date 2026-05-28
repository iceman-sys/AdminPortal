import { AdminNav } from "@/components/AdminNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s · OrthoticHub Admin",
    default: "OrthoticHub Admin",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminNav />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px" }}>{children}</main>
    </>
  );
}
