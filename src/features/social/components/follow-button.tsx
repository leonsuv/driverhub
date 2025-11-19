"use client";

import { Button } from "@/components/ui/button";
import { useFollow } from "@/features/social/hooks/use-follow";
import { useSession } from "next-auth/react";

interface FollowButtonProps {
  targetUserId: string;
}

export function FollowButton({ targetUserId }: FollowButtonProps) {
  const { data: session } = useSession();
  const { status, toggle } = useFollow(targetUserId);

  const following = status.data?.following ?? false;
  const loading = status.isLoading || toggle.isPending;
  const isSelf = session?.user?.id === targetUserId;

  if (isSelf) return null;

  return (
    <Button
      size="sm"
      variant={following ? "secondary" : "default"}
      onClick={() => toggle.mutate({ targetUserId })}
      disabled={loading}
    >
      {loading ? "..." : following ? "Following" : "Follow"}
    </Button>
  );
}
