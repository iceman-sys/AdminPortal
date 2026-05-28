"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/assessments", label: "Assessments" },
  { href: "/recommendations", label: "Recommendations" },
  { href: "/orders", label: "Orders" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");

  async function signOut() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function onGlobalSearch(e: FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const searchActive = pathname.startsWith("/search");

  return (
    <header className="admin-header">
      <div className="admin-header__left">
        <Link href="/dashboard" prefetch style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
          <Image src="/logo.png" alt="OrthoticHub" width={120} height={36} style={{ height: 36, width: "auto" }} />
          <span style={{ fontSize: 15, color: "#64748b", fontWeight: 500 }}>Admin</span>
        </Link>
        <nav className="admin-header__nav" aria-label="Main">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch
              style={{
                fontWeight: isActive(link.href) ? 600 : 400,
                color: isActive(link.href) ? "#3b82f6" : "#64748b",
                textDecoration: "none",
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/search"
            prefetch
            style={{
              fontWeight: searchActive ? 600 : 400,
              color: searchActive ? "#3b82f6" : "#64748b",
              textDecoration: "none",
            }}
          >
            Search
          </Link>
        </nav>
      </div>
      <div className="admin-header__right">
        <form onSubmit={onGlobalSearch} className="admin-header__search">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Email, user id, Stripe PI…"
            className="input"
            style={{ width: 280 }}
            aria-label="Global search"
          />
          <button type="submit" className="button" style={{ padding: "10px 12px" }}>
            Search
          </button>
        </form>
        <button type="button" onClick={signOut} className="button" style={{ padding: "10px 12px", fontSize: 13 }}>
          Sign out
        </button>
      </div>
    </header>
  );
}
