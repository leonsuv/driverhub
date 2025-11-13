import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { createPublicUserProfile } from "@/features/users/domain/user.entity";
import type { UserPublicProfile } from "@/features/users/types";

export async function getUserProfileByUsername(
  username: string,
): Promise<UserPublicProfile | null> {
  const userRecord = await db.query.users.findFirst({
    where: (usersTable, { eq }) => eq(usersTable.username, username),
    columns: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
    },
  });

  if (!userRecord) {
    return null;
  }

  const [statsRow] = await db
    .select({
      totalReviews: sql<number>`count(*)`,
      publishedReviews: sql<number>`coalesce(sum(case when ${reviews.status} = 'published' then 1 else 0 end), 0)`,
      totalLikesReceived: sql<number>`coalesce(sum(${reviews.likeCount}), 0)`,
    })
    .from(reviews)
    .where(eq(reviews.authorId, userRecord.id));

  const totals = {
    totalReviews: Number(statsRow?.totalReviews ?? 0),
    publishedReviews: Number(statsRow?.publishedReviews ?? 0),
    totalLikesReceived: Number(statsRow?.totalLikesReceived ?? 0),
  };

  return createPublicUserProfile(userRecord, totals);
}
