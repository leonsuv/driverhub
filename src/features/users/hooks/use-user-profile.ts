import { trpc } from "@/lib/trpc/client";

interface UseUserProfileOptions {
  enabled?: boolean;
}

export function useUserProfile(username: string, options: UseUserProfileOptions = {}) {
  return trpc.users.byUsername.useQuery(
    { username },
    {
      enabled: options.enabled ?? Boolean(username),
    },
  );
}
