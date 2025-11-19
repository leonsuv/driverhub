import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/layout/main-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { auth } from "@/lib/auth/config";

const navItems = [
  { href: "/feed", label: "Feed" },
  { href: "/cars", label: "Cars" },
  { href: "/garage", label: "Garage" },
];

interface MainLayoutProps {
  children: ReactNode;
}

export default async function MainLayout({ children }: MainLayoutProps) {
  const session = await auth();
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link href="/feed" className="text-lg font-semibold tracking-tight">
            driverhub
          </Link>
          <MobileMenu items={navItems} user={session?.user ?? null} />
          <MainNav items={navItems} />
          <div className="ml-auto flex items-center gap-2">
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/reviews/create">Write a review</Link>
            </Button>
            <UserMenu user={session?.user ?? null} />
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-8 sm:px-6">{children}</div>
      <footer className="border-t bg-card">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 text-xs text-muted-foreground sm:px-6">
          <span>© {year} Driverhub</span>
          <span>Built for enthusiasts, hosted on your infrastructure.</span>
        </div>
      </footer>
    </div>
  );
}
