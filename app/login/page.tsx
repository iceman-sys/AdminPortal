"use client";

import Image from "next/image";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    errorParam === "not_allowed"
      ? "This account is not authorized for the admin console."
      : null
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createBrowserSupabase();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="login-page">
      <form onSubmit={onSubmit} className="card login-form">
        <Image
          src="/logo.png"
          alt="OrthoticHub"
          width={200}
          height={56}
          style={{ width: "100%", maxWidth: 200, height: "auto", marginBottom: 8 }}
          priority
        />
        <h1 style={{ marginTop: 0, fontSize: 20, fontWeight: 600 }}>Staff console</h1>
        <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>
          Sign in with an allowlisted staff email. Read-only access to pipeline
          data.
        </p>
        {error && (
          <p style={{ color: "#dc2626", fontSize: 14, marginBottom: 12 }}>
            {error}
          </p>
        )}
        <label style={{ display: "block", marginBottom: 12 }}>
          <span className="muted" style={{ fontSize: 13 }}>
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </label>
        <label style={{ display: "block", marginBottom: 16 }}>
          <span className="muted" style={{ fontSize: 13 }}>
            Password
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </label>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
