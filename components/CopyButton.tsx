"use client";

import { useState } from "react";

export function CopyButton({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {
      // clipboard may be blocked in some environments
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      title={value}
      className={`btn-secondary${copied ? "" : ""}`}
      style={{
        padding: "8px 12px",
        fontSize: 12,
        color: copied ? "var(--success)" : undefined,
        borderColor: copied ? "#bbf7d0" : undefined,
        background: copied ? "#f0fdf4" : undefined,
      }}
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}
