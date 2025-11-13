import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  type UserRole = "user" | "moderator" | "admin";

  interface Session {
    user?: DefaultSession["user"] & {
      id: string;
      username?: string;
      role?: UserRole;
    };
  }

  interface User {
    username: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    role?: import("next-auth").UserRole;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    username?: string;
    role?: import("next-auth").UserRole;
  }
}
