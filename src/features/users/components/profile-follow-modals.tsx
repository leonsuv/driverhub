"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FollowersList, FollowingList } from "@/features/social/components/follow-lists";

interface ProfileFollowModalsProps {
  userId: string;
  followersCount: number;
  followingCount: number;
}

export function ProfileFollowModals({ userId, followersCount, followingCount }: ProfileFollowModalsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" variant="secondary">View all followers ({followersCount})</Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Followers</DialogTitle>
            <DialogDescription>People who follow this user</DialogDescription>
          </DialogHeader>
          <FollowersList userId={userId} />
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" variant="secondary">View all following ({followingCount})</Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Following</DialogTitle>
            <DialogDescription>People this user follows</DialogDescription>
          </DialogHeader>
          <FollowingList userId={userId} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
