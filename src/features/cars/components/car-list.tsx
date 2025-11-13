import { CarCard } from "@/features/cars/components/car-card";
import type { CarListItem } from "@/features/cars/types";

interface CarListProps {
  items: CarListItem[];
}

export function CarList({ items }: CarListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
        No cars found. Try adjusting your search criteria.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((car) => (
        <CarCard key={car.id} car={car} />
      ))}
    </div>
  );
}
