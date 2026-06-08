"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function PatientSearchHero() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="card patient-search-hero">
      <h2 className="patient-search-hero__title">Find a patient</h2>
      <p className="muted" style={{ margin: "0 0 18px", fontSize: 15, lineHeight: 1.55 }}>
        Search by email to open their case — foot scans, orthotic match, and purchase status in one place.
      </p>
      <form onSubmit={onSubmit} className="patient-search-form">
        <div className="field__control field__control--icon patient-search-input" style={{ flex: "1 1 260px" }}>
          <span className="field__icon" aria-hidden>✉</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Patient email address"
            className="input"
            aria-label="Search by patient email"
          />
        </div>
        <button type="submit" className="btn-primary patient-search-btn">
          Open patient case
        </button>
      </form>
    </div>
  );
}
