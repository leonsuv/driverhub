import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { CarListItem } from "@/features/cars/types";
import { createCarDetailHref } from "@/features/cars/domain/car-paths";

interface CarCardProps {
  car: CarListItem;
}

export function CarCard({ car }: CarCardProps) {
  const specs = car.specs ?? {};
  const hasImage = Boolean(car.imageUrl);

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="relative h-40 w-full bg-muted">
        {hasImage ? (
          <Image
            src={car.imageUrl as string}
            alt={`${car.make} ${car.model}`}
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 320px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <span className="text-xs uppercase tracking-wide">Photo coming soon</span>
          </div>
        )}
      </div>
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-semibold">
          {car.year} {car.make} {car.model}
        </CardTitle>
        {car.generation ? (
          <p className="text-muted-foreground text-sm">{car.generation}</p>
        ) : null}
      </CardHeader>
      <CardContent className="flex-1 space-y-2 text-sm text-muted-foreground">
        {specs.body ? <p>Body: {specs.body}</p> : null}
        {specs.drivetrain ? <p>Drivetrain: {specs.drivetrain}</p> : null}
        {specs.powertrain ? <p>Powertrain: {specs.powertrain}</p> : null}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={createCarDetailHref(car)}>View details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
