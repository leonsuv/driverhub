import { and, asc, eq, or, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { reviews, users } from "@/lib/db/schema";
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

export async function updateUserProfile(userId: string, params: { displayName: string; bio?: string; avatarUrl?: string }) {
  const [row] = await db
    .update(users)
    .set({
      displayName: params.displayName,
      bio: params.bio ?? null,
      avatarUrl: params.avatarUrl ?? null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning({ id: users.id });

  return { id: row?.id ?? userId } as const;
}

export async function getUserStats(userId: string) {
  const [statsRow] = await db
    .select({
      totalReviews: sql<number>`count(*)`,
      publishedReviews: sql<number>`coalesce(sum(case when ${reviews.status} = 'published' then 1 else 0 end), 0)`,
      totalLikesReceived: sql<number>`coalesce(sum(${reviews.likeCount}), 0)`,
    })
    .from(reviews)
    .where(eq(reviews.authorId, userId));

  return {
    totalReviews: Number(statsRow?.totalReviews ?? 0),
    publishedReviews: Number(statsRow?.publishedReviews ?? 0),
    totalLikesReceived: Number(statsRow?.totalLikesReceived ?? 0),
  } as const;
}

function encodeCursor(username: string, id: string) {
  return Buffer.from(`${username}::${id}`).toString("base64");
}

function decodeCursor(cursor?: string | null) {
  if (!cursor) return null;
  try {
    const [u, i] = Buffer.from(cursor, "base64").toString("utf8").split("::");
    return { username: u, id: i };
  } catch {
    return null;
  }
}

export async function searchUsers(params: { query: string; limit: number; cursor?: string | null }) {
  const limit = Math.min(Math.max(params.limit, 1), 50);
  const decoded = decodeCursor(params.cursor ?? null);
  const pattern = `%${params.query.replace(/%/g, "\\%").replace(/_/g, "\\_")}%`;

  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(
      decoded
        ? and(
            or(sql`${users.username} ILIKE ${pattern}`, sql`coalesce(${users.displayName}, '') ILIKE ${pattern}`),
            or(sql`${users.username} > ${decoded.username}`, and(eq(users.username, decoded.username), sql`${users.id} > ${decoded.id}`)),
          )
        : or(sql`${users.username} ILIKE ${pattern}`, sql`coalesce(${users.displayName}, '') ILIKE ${pattern}`),
    )
    .orderBy(asc(users.username), asc(users.id))
    .limit(limit + 1);

  const hasNext = rows.length > limit;
  const visible = hasNext ? rows.slice(0, limit) : rows;
  const nextCursor = hasNext ? encodeCursor(visible[visible.length - 1].username, visible[visible.length - 1].id) : null;

  const items = visible.map((u) => ({
    id: u.id,
    username: u.username,
    displayName: u.displayName ?? u.username,
    avatarUrl: u.avatarUrl ?? null,
  }));

  return { items, nextCursor } as const;
}
