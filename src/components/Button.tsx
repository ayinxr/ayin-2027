"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { ReactNode } from "react";

export function Button({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium tracking-wide transition will-change-transform";

  const variants: Record<string, string> = {
    primary:
      "bg-white text-black hover:bg-white/90 active:scale-[0.98] shadow-[0_16px_40px_rgba(120,163,255,0.22)]",
    outline:
      "border border-white/14 bg-white/5 text-white hover:bg-white/8 active:scale-[0.985] backdrop-blur",
    ghost: "text-white/85 hover:text-white hover:bg-white/6 active:scale-[0.985]",
  };

  return (
    <Link href={href} className={cn(base, variants[variant], className)}>
      {children}
    </Link>
  );
}

