"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { NAV } from "@/lib/labels";

const links = [
  { href: "/dashboard", label: NAV.home },
  { href: "/assessments", label: NAV.intakes },
  { href: "/recommendations", label: NAV.matches },
  { href: "/orders", label: NAV.purchases },
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
        <BrandLogo variant="header" linked showSubtitle />
        <nav className="admin-header__nav" aria-label="Main">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch
              className={`nav-link${isActive(link.href) ? " nav-link--active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/search"
            prefetch
            className={`nav-link${searchActive ? " nav-link--active" : ""}`}
          >
            {NAV.search}
          </Link>
        </nav>
      </div>
      <div className="admin-header__right">
        <form onSubmit={onGlobalSearch} className="admin-header__search">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Patient email"
            className="input"
            aria-label="Find patient by email"
          />
          <button type="submit" className="btn-secondary">
            Find
          </button>
        </form>
        <button type="button" onClick={signOut} className="btn-ghost">
          Sign out
        </button>
      </div>
    </header>
  );
}
