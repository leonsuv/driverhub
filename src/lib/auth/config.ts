import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import type { UserRole } from "next-auth";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { env } from "@/config/env";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const adapter = DrizzleAdapter(db) as Adapter;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  session: {
    strategy: "jwt",
  },
  secret: env.NEXTAUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!user?.password) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          return null;
        }

        const adapterUser: AdapterUser = {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.avatarUrl ?? undefined,
          name: user.displayName ?? user.username,
          username: user.username,
          role: user.role,
        };

        return adapterUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const adapterUser = user as AdapterUser;
        token.id = adapterUser.id;
        token.role = adapterUser.role;
        token.username = adapterUser.username;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id && typeof token.id === "string") {
          session.user.id = token.id;
          // Fetch latest user data to keep avatar/name in sync across the app
          const row = await db.query.users.findFirst({
            where: (t, { eq }) => eq(t.id, token.id as string),
            columns: { avatarUrl: true, displayName: true, username: true, role: true },
          });

          if (row) {
            session.user.image = row.avatarUrl ?? undefined;
            session.user.name = row.displayName ?? row.username;
            session.user.username = row.username;
            session.user.role = row.role as UserRole;
          }
        }
      }

      return session;
    },
  },
});
