"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { FollowButton } from "@/features/social/components/follow-button";

interface HoverUser {
  id?: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}

interface UserHoverProps {
  user: HoverUser;
  children: React.ReactNode;
  className?: string;
}

export function UserHover({ user, children, className }: UserHoverProps) {
  const name = user.displayName ?? user.username;
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className={className}>{children}</span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex items-start gap-3">
          <Link href={`/profile/${user.username}`} className="shrink-0">
            <Avatar className="size-10">
              <AvatarImage src={user.avatarUrl ?? undefined} alt={name} />
              <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <Link href={`/profile/${user.username}`} className="block truncate font-medium hover:underline text-foreground">
                  {name}
                </Link>
                <Link href={`/profile/${user.username}`} className="block truncate text-sm text-muted-foreground hover:underline">
                  @{user.username}
                </Link>
              </div>
              {user.id ? <FollowButton targetUserId={user.id} /> : null}
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
