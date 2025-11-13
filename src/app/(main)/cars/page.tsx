import { CarsPageClient } from "@/features/cars/components/cars-page-client";
import { listCars } from "@/features/cars/infrastructure/car.repository";

type CarsPageSearchParams =
  | { q?: string | string[] }
  | Promise<{ q?: string | string[] }>;

interface CarsPageProps {
  searchParams: CarsPageSearchParams;
}

export default async function CarsPage({ searchParams }: CarsPageProps) {
  const resolvedSearchParams = await searchParams;
  const query =
    typeof resolvedSearchParams?.q === "string"
      ? resolvedSearchParams.q
      : undefined;
  const initialCars = await listCars({ limit: 12, query, cursor: undefined });

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Browse cars</h1>
        <p className="text-muted-foreground text-sm">
          Explore makes and models reviewed by the Drive2 community.
        </p>
      </header>
      <CarsPageClient initialData={initialCars} initialQuery={query} />
    </div>
  );
}
