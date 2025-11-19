"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGarage } from "@/features/garage/hooks/use-garage";
import { GarageMods } from "@/features/garage/components/garage-mods";
import { GarageGallery } from "@/features/garage/components/garage-gallery";

export function GarageList() {
  const { list, remove, setActive, move, transfer } = useGarage();

  if (list.isLoading) return <div>Loading garage...</div>;
  if (list.error) return <div>Failed to load garage</div>;

  const items = list.data ?? [];

  if (items.length === 0) {
    return <div>Your garage is empty. Add your first car below.</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {items.map((item) => (
        <Card key={item.id} className={item.isActive ? "border-primary" : undefined}>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">
              {item.nickname || `${item.car.make} ${item.car.model} ${item.car.year}`}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => move.mutate({ id: item.id, direction: "up" })}
                disabled={move.isPending}
              >
                ↑
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => move.mutate({ id: item.id, direction: "down" })}
                disabled={move.isPending}
              >
                ↓
              </Button>
              {!item.isActive && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setActive.mutate({ id: item.id })}
                  disabled={setActive.isPending}
                >
                  Set active
                </Button>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">Transfer</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Transfer ownership</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Enter the target @username to transfer this car to another user.</p>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const data = new FormData(e.currentTarget as HTMLFormElement);
                        const username = String(data.get("username") ?? "").trim().replace(/^@+/, "");
                        if (!username) return;
                        transfer.mutate({ id: item.id, targetUsername: username });
                      }}
                      className="flex items-center gap-2"
                    >
                      <Input name="username" placeholder="@username" className="flex-1" />
                      <Button type="submit" size="sm" disabled={transfer.isPending}>Transfer</Button>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => remove.mutate({ id: item.id })}
                disabled={remove.isPending}
              >
                Remove
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {(() => {
              const url = item.imageUrl || item.car.imageUrl || "";
              if (!url) return null;
              return <img src={url} alt="Car" width={120} height={80} className="rounded object-cover" />;
            })()}
            <div className="text-sm text-muted-foreground">
              <div>
                {item.car.make} {item.car.model} {item.car.year}
              </div>
              {item.status ? <div>Status: {item.status}</div> : null}
              {item.mileage ? <div>Mileage: {item.mileage.toLocaleString()} km</div> : null}
              {item.modifications ? <div>Mods: {item.modifications}</div> : null}
              {item.vin ? <div>VIN: {item.vin}</div> : null}
              {item.engineCode ? <div>Engine: {item.engineCode}</div> : null}
              {item.colorCode ? <div>Color code: {item.colorCode}</div> : null}
              {item.trim ? <div>Trim: {item.trim}</div> : null}
            </div>
          </CardContent>
          <div className="px-6 pb-4">
            <GarageGallery userCarId={item.id} />
          </div>
          <div className="px-6 pb-6">
            <GarageMods userCarId={item.id} />
          </div>
        </Card>
      ))}
    </div>
  );
}
