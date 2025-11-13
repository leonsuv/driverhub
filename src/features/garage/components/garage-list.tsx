"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGarage } from "@/features/garage/hooks/use-garage";

export function GarageList() {
  const { list, remove, setActive } = useGarage();

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
          <CardContent className="flex items-center gap-4">
            {(() => {
              const url = item.imageUrl || item.car.imageUrl || "";
              if (!url) return null;
              // If URL is absolute (http/https), use a regular img to avoid next/image domain config
              const isAbsolute = /^https?:\/\//i.test(url);
              return isAbsolute ? (
                <img src={url} alt="Car" width={120} height={80} className="rounded object-cover" />
              ) : (
                <Image src={url} alt="Car" width={120} height={80} className="rounded object-cover" />
              );
            })()}
            <div className="text-sm text-muted-foreground">
              <div>
                {item.car.make} {item.car.model} {item.car.year}
              </div>
              {item.mileage ? <div>Mileage: {item.mileage.toLocaleString()} km</div> : null}
              {item.modifications ? <div>Mods: {item.modifications}</div> : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
