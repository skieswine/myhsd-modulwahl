import type { ReactNode } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "neutral";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand text-white border border-brand active:bg-brand-pressed",
  secondary:
    "bg-white text-brand border-[1.5px] border-brand active:bg-brand-tint",
  neutral:
    "bg-white text-ink-muted border-[1.5px] border-[#E2E2E2] active:bg-canvas",
};

interface BaseProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
  full?: boolean;
}

export function Button({
  variant = "primary",
  children,
  className = "",
  full,
  onClick,
}: BaseProps & { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl text-center text-[15px] font-medium transition-colors ${
        variant === "primary" ? "px-[13px] py-[13px]" : "px-[18px] py-[11.5px]"
      } ${full ? "flex-1" : ""} ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  children,
  className = "",
  full,
  href,
}: BaseProps & { href: string }) {
  return (
    <Link
      href={href}
      className={`block rounded-xl text-center text-[15px] font-medium transition-colors ${
        variant === "primary" ? "px-[13px] py-[13px]" : "px-[18px] py-[11.5px]"
      } ${full ? "flex-1" : ""} ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
