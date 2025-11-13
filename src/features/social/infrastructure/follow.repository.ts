import { and, eq, gt, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { follows, users } from "@/lib/db/schema";

export class FollowValidationError extends Error {}

export async function countFollowers(userId: string): Promise<number> {
  const rows = await db
    .select({ c: sql<number>`count(*)` })
    .from(follows)
    .where(eq(follows.followingId, userId));
  return Number(rows[0]?.c ?? 0);
}

export async function countFollowing(userId: string): Promise<number> {
  const rows = await db
    .select({ c: sql<number>`count(*)` })
    .from(follows)
    .where(eq(follows.followerId, userId));
  return Number(rows[0]?.c ?? 0);
}

function encodeCursor(createdAt: Date, userId: string) {
  return Buffer.from(`${createdAt.toISOString()}::${userId}`).toString("base64");
}

function decodeCursor(cursor?: string) {
  if (!cursor) return null;
  try {
    const [iso, id] = Buffer.from(cursor, "base64").toString("utf8").split("::");
    return { createdAt: new Date(iso), userId: id };
  } catch {
    return null;
  }
}

export async function listFollowers(params: { userId: string; limit: number; cursor?: string | null }) {
  const limit = Math.min(Math.max(params.limit, 1), 50);
  const decoded = decodeCursor(params.cursor ?? undefined);

  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      createdAt: follows.createdAt,
    })
    .from(follows)
    .innerJoin(users, eq(users.id, follows.followerId))
    .where(
      decoded
        ? and(eq(follows.followingId, params.userId), gt(follows.createdAt, decoded.createdAt))
        : eq(follows.followingId, params.userId),
    )
    .orderBy(follows.createdAt)
    .limit(limit + 1);

  const items = rows.slice(0, limit).map((r) => ({
    id: r.id,
    username: r.username,
    displayName: r.displayName ?? r.username,
    avatarUrl: r.avatarUrl ?? null,
  }));

  const next = rows.length > limit ? rows[rows.length - 1] : null;
  const nextCursor = next ? encodeCursor(next.createdAt as unknown as Date, next.id) : null;

  return { items, nextCursor } as const;
}

export async function listFollowing(params: { userId: string; limit: number; cursor?: string | null }) {
  const limit = Math.min(Math.max(params.limit, 1), 50);
  const decoded = decodeCursor(params.cursor ?? undefined);

  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      createdAt: follows.createdAt,
    })
    .from(follows)
    .innerJoin(users, eq(users.id, follows.followingId))
    .where(
      decoded
        ? and(eq(follows.followerId, params.userId), gt(follows.createdAt, decoded.createdAt))
        : eq(follows.followerId, params.userId),
    )
    .orderBy(follows.createdAt)
    .limit(limit + 1);

  const items = rows.slice(0, limit).map((r) => ({
    id: r.id,
    username: r.username,
    displayName: r.displayName ?? r.username,
    avatarUrl: r.avatarUrl ?? null,
  }));

  const next = rows.length > limit ? rows[rows.length - 1] : null;
  const nextCursor = next ? encodeCursor(next.createdAt as unknown as Date, next.id) : null;

  return { items, nextCursor } as const;
}

export async function isFollowing(params: { followerId: string; targetUserId: string }) {
  if (params.followerId === params.targetUserId) return false;

  const row = await db.query.follows.findFirst({
    where: (t, { and, eq }) => and(eq(t.followerId, params.followerId), eq(t.followingId, params.targetUserId)),
    columns: { followerId: true },
  });
  return Boolean(row);
}

export async function toggleFollow(params: { followerId: string; targetUserId: string }) {
  if (params.followerId === params.targetUserId) {
    throw new FollowValidationError();
  }

  const existing = await db.query.follows.findFirst({
    where: (t, { and, eq }) => and(eq(t.followerId, params.followerId), eq(t.followingId, params.targetUserId)),
    columns: { followerId: true, followingId: true },
  });

  if (existing) {
    await db
      .delete(follows)
      .where(and(eq(follows.followerId, params.followerId), eq(follows.followingId, params.targetUserId)));
    return { following: false } as const;
  }

  await db.insert(follows).values({ followerId: params.followerId, followingId: params.targetUserId });
  return { following: true } as const;
}
