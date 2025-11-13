"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    username?: string | null;
    image?: string | null;
  } | null;
}

export function UserMenu({ user }: UserMenuProps) {
  if (!user) {
    return (
      <Button asChild size="sm" variant="outline">
        <Link href="/login">Log in</Link>
      </Button>
    );
  }

  const initials = getInitials(user.name ?? user.username ?? "Driver");
  const profileHref = user.username ? `/profile/${user.username}` : "/profile";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? user.username ?? ""} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden flex-col text-left text-sm sm:flex">
            <span className="font-medium leading-tight">{user.name ?? user.username}</span>
            {user.username ? (
              <span className="text-muted-foreground text-xs">@{user.username}</span>
            ) : null}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="font-medium">{user.name ?? user.username}</span>
          {user.email ? <span className="text-muted-foreground text-xs">{user.email}</span> : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={profileHref}>View profile</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            void signOut({ callbackUrl: "/login" });
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getInitials(value: string) {
  const segments = value.trim().split(/\s+/);

  if (segments.length === 1) {
    return segments[0].slice(0, 2).toUpperCase();
  }

  return `${segments[0][0] ?? ""}${segments[segments.length - 1][0] ?? ""}`.toUpperCase();
}
