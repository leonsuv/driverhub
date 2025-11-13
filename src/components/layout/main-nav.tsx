"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export interface MainNavItem {
  href: string;
  label: string;
  exact?: boolean;
}

interface MainNavProps {
  items: MainNavItem[];
}

export function MainNav({ items }: MainNavProps) {
  const pathname = usePathname();

  if (!items.length) {
    return null;
  }

  return (
    <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
      {items.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-muted-foreground transition-colors hover:text-foreground",
              isActive && "text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
