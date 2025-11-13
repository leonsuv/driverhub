import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

interface CreateUserParams {
  email: string;
  username: string;
  passwordHash: string;
  displayName?: string | null;
}

export async function findUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });
}

export async function findUserByUsername(username: string) {
  return db.query.users.findFirst({
    where: eq(users.username, username.toLowerCase()),
  });
}

export async function createUser({
  email,
  username,
  passwordHash,
  displayName,
}: CreateUserParams) {
  const [user] = await db
    .insert(users)
    .values({
      id: createId(),
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password: passwordHash,
      displayName: displayName ?? username,
    })
    .returning();

  return user;
}
