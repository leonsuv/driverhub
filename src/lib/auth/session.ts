import { cache } from "react";

import { auth } from "./config";

export const getCurrentSession = cache(async () => {
  return auth();
});

export const getCurrentUser = cache(async () => {
  const session = await getCurrentSession();
  return session?.user ?? null;
});
