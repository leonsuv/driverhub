"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm text-muted-foreground", className)}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-1">
            {item.href ? (
              <Link href={item.href} className="hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
            {idx < items.length - 1 ? <span className="px-0.5">/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
