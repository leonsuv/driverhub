import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CarDetailView } from "@/features/cars/components/car-detail-view";
import { getCarDetailWithReviews } from "@/features/cars/domain/car-detail.service";

interface CarModelPageProps {
  params: Promise<{
    make: string;
    model: string;
  }>;
}

export default async function CarModelPage({ params }: CarModelPageProps) {
  const { make, model } = await params;
  const result = await getCarDetailWithReviews(make, model, { reviewLimit: 3 });

  if (!result) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <Button asChild variant="outline" className="w-fit">
        <Link href="/cars">Back to catalog</Link>
      </Button>
      <CarDetailView detail={result.detail} reviews={result.reviews} />
    </div>
  );
}
