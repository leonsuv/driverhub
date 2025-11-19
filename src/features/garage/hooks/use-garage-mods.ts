"use client";

import { trpc } from "@/lib/trpc/client";

export function useGarageMods(userCarId: number) {
  const utils = trpc.useUtils();
  const list = trpc.garage.listMods.useQuery({ userCarId }, { staleTime: 5_000 });

  const add = trpc.garage.addMod.useMutation({
    onSuccess: () => utils.garage.listMods.invalidate({ userCarId }),
  });

  const update = trpc.garage.updateMod.useMutation({
    onSuccess: () => utils.garage.listMods.invalidate({ userCarId }),
  });

  const remove = trpc.garage.removeMod.useMutation({
    onSuccess: () => utils.garage.listMods.invalidate({ userCarId }),
  });

  return { list, add, update, remove };
}
