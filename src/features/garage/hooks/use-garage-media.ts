"use client";

import { trpc } from "@/lib/trpc/client";

export function useGarageMedia(userCarId: number) {
  const utils = trpc.useUtils();
  const list = trpc.garage.listMedia.useQuery({ userCarId }, { staleTime: 5_000 });

  const add = trpc.garage.addMedia.useMutation({
    onSuccess: () => utils.garage.listMedia.invalidate({ userCarId }),
  });

  const remove = trpc.garage.removeMedia.useMutation({
    onSuccess: () => utils.garage.listMedia.invalidate({ userCarId }),
  });

  const reorder = trpc.garage.reorderMedia.useMutation({
    onSuccess: () => utils.garage.listMedia.invalidate({ userCarId }),
  });

  return { list, add, remove, reorder };
}
