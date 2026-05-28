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
      // no-op: clipboard may be blocked in some environments
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      title={value}
      style={{
        border: "1px solid var(--border)",
        background: "var(--surface)",
        padding: "6px 10px",
        borderRadius: 10,
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 700,
        color: copied ? "#166534" : "var(--text)",
      }}
    >
      {copied ? "Copied" : label}
    </button>
  );
}

