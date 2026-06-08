import Image from "next/image";
import Link from "next/link";

type Props = {
  /** Header bar — compact thumbnail + wordmark */
  variant?: "header" | "login" | "mark";
  /** Wrap header variant in a link to home */
  linked?: boolean;
  showSubtitle?: boolean;
};

export function BrandLogo({ variant = "header", linked = false, showSubtitle = true }: Props) {
  if (variant === "mark") {
    return (
      <div className="brand-mark" aria-hidden>
        <Image
          src="/logo.png"
          alt=""
          width={80}
          height={80}
          className="brand-mark__img"
          priority
        />
      </div>
    );
  }

  if (variant === "login") {
    return (
      <div className="login-brand">
        <div className="brand-mark brand-mark--xl">
          <Image
            src="/logo.png"
            alt=""
            width={160}
            height={160}
            className="brand-mark__img"
            priority
          />
        </div>
        <h2 className="login-brand__wordmark">
          Orthotic<span>Hub</span>
        </h2>
        <p className="login-brand__tagline">Clinician portal for foot scans &amp; orthotic cases</p>
      </div>
    );
  }

  const content = (
    <div className="brand-lockup">
      <div className="brand-mark brand-mark--sm">
        <Image
          src="/logo.png"
          alt=""
          width={64}
          height={64}
          className="brand-mark__img"
          priority
        />
      </div>
      <div className="brand-lockup__text">
        <span className="brand-lockup__name">
          Orthotic<span className="brand-lockup__accent">Hub</span>
        </span>
        {showSubtitle ? <span className="brand-lockup__tag">Clinician Portal</span> : null}
      </div>
    </div>
  );

  if (linked) {
    return (
      <Link href="/dashboard" prefetch className="brand-lockup-link">
        {content}
      </Link>
    );
  }

  return content;
}
