import { listAllCars } from "@/features/cars/infrastructure/car.repository";
import { ReviewCreateForm } from "@/features/reviews/components/review-create-form";

export default async function ReviewCreatePage() {
  const cars = await listAllCars();

  return (
    <div className="flex w-full max-w-4xl flex-col gap-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Write a review</h1>
        <p className="text-muted-foreground text-sm">
          Capture your ownership story, highlight upgrades, and help fellow drivers pick their next ride.
        </p>
      </div>
      <ReviewCreateForm cars={cars} />
    </div>
  );
}
