"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface MobileNavItem {
  href: string;
  label: string;
}

interface MobileMenuProps {
  items: MobileNavItem[];
  user?: {
    username?: string | null;
  } | null;
  className?: string;
}

export function MobileMenu({ items, user, className }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const profileHref = user?.username ? `/profile/${user.username}` : "/profile";

  return (
    <div className={cn("md:hidden", className)}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">Menu</Button>
        </DialogTrigger>
        <DialogContent
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 m-0 w-full max-w-none rounded-t-2xl border bg-card p-4 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-sm sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl",
          )}
        >
          <DialogHeader>
            <DialogTitle className="text-base">Navigation</DialogTitle>
          </DialogHeader>
          <nav className="grid gap-2 py-2">
            {items.map((item) => (
              <Button key={item.href} asChild variant="ghost" className="justify-start">
                <Link href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              </Button>
            ))}
            <div className="my-1 h-px w-full bg-border" />
            <Button asChild variant="ghost" className="justify-start">
              <Link href="/search" onClick={() => setOpen(false)}>
                Search
              </Link>
            </Button>
            <Button asChild variant="ghost" className="justify-start">
              <Link href="/notifications" onClick={() => setOpen(false)}>
                Notifications
              </Link>
            </Button>
            <Button asChild variant="ghost" className="justify-start">
              <Link href={profileHref} onClick={() => setOpen(false)}>
                Profile
              </Link>
            </Button>
          </nav>
        </DialogContent>
      </Dialog>
    </div>
  );
}
