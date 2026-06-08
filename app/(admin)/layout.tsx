import { AdminNav } from "@/components/AdminNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s · OrthoticHub Clinician Portal",
    default: "OrthoticHub Clinician Portal",
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
      <main className="app-main">{children}</main>
    </>
  );
}
