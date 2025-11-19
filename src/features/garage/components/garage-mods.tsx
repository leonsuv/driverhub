"use client";

import { useState } from "react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGarageMods } from "@/features/garage/hooks/use-garage-mods";

interface GarageModsProps {
  userCarId: number;
}

export function GarageMods({ userCarId }: GarageModsProps) {
  const { list, add, remove } = useGarageMods(userCarId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [installedAt, setInstalledAt] = useState("");
  const [costCents, setCostCents] = useState<string>("");
  const [partUrl, setPartUrl] = useState("");

  const onAdd = () => {
    if (!title.trim()) return;
    add.mutate({ userCarId, title: title.trim(), description: description || undefined, installedAt: installedAt || undefined, costCents: costCents ? Number(costCents) : undefined, partUrl: partUrl || undefined }, {
      onSuccess: () => {
        setTitle("");
        setDescription("");
        setInstalledAt("");
        setCostCents("");
        setPartUrl("");
      },
    });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Modifications</h3>
      {list.isLoading ? (
        <div className="text-sm text-muted-foreground">Loading mods...</div>
      ) : list.error ? (
        <div className="text-sm text-red-600">Failed to load mods</div>
      ) : (
        <ul className="space-y-2">
          {(list.data ?? []).map((m) => (
            <li key={m.id} className="flex items-start justify-between gap-3 rounded border p-2 text-sm">
              <div className="min-w-0">
                <div className="font-medium text-foreground">{m.title}</div>
                {m.description ? <div className="text-muted-foreground whitespace-pre-line">{m.description}</div> : null}
                <div className="text-xs text-muted-foreground">
                  {m.installedAt ? `Installed: ${format(new Date(m.installedAt), "PPP")}` : null}
                  {m.costCents != null ? ` • Cost: ${(m.costCents / 100).toFixed(2)}$` : null}
                  {m.partUrl ? (
                    <>
                      {m.installedAt || m.costCents != null ? " • " : null}
                      <a href={m.partUrl} className="hover:underline" target="_blank" rel="noreferrer">Part link</a>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="shrink-0">
                <Button size="sm" variant="ghost" onClick={() => remove.mutate({ id: m.id })} disabled={remove.isPending}>
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-2 rounded border p-3">
        <Input placeholder="Title (e.g. Coilovers)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Input type="date" value={installedAt} onChange={(e) => setInstalledAt(e.target.value)} />
          <Input type="number" min={0} placeholder="Cost (cents)" value={costCents} onChange={(e) => setCostCents(e.target.value)} />
          <Input type="url" placeholder="Part URL" value={partUrl} onChange={(e) => setPartUrl(e.target.value)} />
        </div>
        <Button size="sm" onClick={onAdd} disabled={add.isPending}>
          {add.isPending ? "Adding..." : "Add modification"}
        </Button>
      </div>
    </div>
  );
}
