"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
      ].join(" ")}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

export function FeedNav() {
  return (
    <nav className="flex gap-2">
      <NavLink href="/feed" label="Latest" />
      <NavLink href="/feed/personalized" label="Personalized" />
      <NavLink href="/feed/trending" label="Trending" />
    </nav>
  );
}
