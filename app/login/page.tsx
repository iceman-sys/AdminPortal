"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { FormField } from "@/components/FormField";
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
      ? "This account is not authorized for the clinician portal."
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
      <aside className="login-page__brand" aria-hidden={false}>
        <BrandLogo variant="login" />
      </aside>

      <div className="login-page__form-wrap">
        <form onSubmit={onSubmit} className="card login-form">
          <div className="login-form__mobile-logo">
            <BrandLogo variant="mark" />
          </div>

          <h1 className="login-form__title">Welcome back</h1>
          <p className="login-form__subtitle">
            Sign in to review patient foot scans, orthotic recommendations, and in-app purchases.
          </p>

          {error ? <div className="login-form__error" role="alert">{error}</div> : null}

          <FormField
            label="Staff email"
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@yourclinic.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon="✉"
          />

          <FormField
            label="Password"
            type="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon="🔒"
          />

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Signing in…" : "Sign in to portal"}
          </button>
        </form>
      </div>
    </div>
  );
}
