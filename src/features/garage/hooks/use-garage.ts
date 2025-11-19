"use client";

import { trpc } from "@/lib/trpc/client";

export function useGarage() {
  const utils = trpc.useUtils();
  const list = trpc.garage.listMine.useQuery(undefined, { staleTime: 5_000 });

  const add = trpc.garage.add.useMutation({
    onSuccess: () => utils.garage.listMine.invalidate(),
  });

  const update = trpc.garage.update.useMutation({
    onSuccess: () => utils.garage.listMine.invalidate(),
  });

  const remove = trpc.garage.remove.useMutation({
    onSuccess: () => utils.garage.listMine.invalidate(),
  });

  const setActive = trpc.garage.setActive.useMutation({
    onSuccess: () => utils.garage.listMine.invalidate(),
  });

  const move = trpc.garage.move.useMutation({
    onSuccess: () => utils.garage.listMine.invalidate(),
  });

  const transfer = trpc.garage.transfer.useMutation({
    onSuccess: () => utils.garage.listMine.invalidate(),
  });

  return { list, add, update, remove, setActive, move, transfer };
}
