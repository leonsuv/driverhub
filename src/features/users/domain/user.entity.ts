import type { UserProfileStats, UserPublicProfile } from "@/features/users/types";

interface UserRow {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
}

interface UserStatsRow {
  totalReviews: number | null;
  publishedReviews: number | null;
  totalLikesReceived: number | null;
}

export function createUserProfileStats(row: UserStatsRow): UserProfileStats {
  return {
    totalReviews: row.totalReviews ?? 0,
    publishedReviews: row.publishedReviews ?? 0,
    totalLikesReceived: row.totalLikesReceived ?? 0,
  };
}

export function createPublicUserProfile(
  user: UserRow,
  stats: UserStatsRow,
): UserPublicProfile {
  const profileStats = createUserProfileStats(stats);

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName ?? user.username,
    avatarUrl: user.avatarUrl ?? null,
    bio: user.bio ?? null,
    createdAt: user.createdAt.toISOString(),
    stats: profileStats,
  };
}
