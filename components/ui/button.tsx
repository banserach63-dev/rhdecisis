import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent";
type Size = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover border-transparent shadow-sm shadow-primary/20",
  secondary: "bg-surface text-foreground hover:bg-surface-muted border-border",
  ghost: "bg-transparent text-foreground hover:bg-surface-muted border-transparent",
  danger: "bg-danger text-white hover:bg-red-700 border-transparent",
  accent: "bg-foreground text-background hover:bg-ink border-transparent",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-sm",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={`${BASE} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  return (
    <Link href={href} className={`${BASE} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}>
      {children}
    </Link>
  );
}
