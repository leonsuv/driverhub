import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CarDetailView } from "@/features/cars/components/car-detail-view";
import { getCarDetailWithReviews } from "@/features/cars/domain/car-detail.service";
import { getCurrentUser } from "@/lib/auth/session";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

interface CarModelPageProps {
  params: Promise<{
    make: string;
    model: string;
  }>;
}

export default async function CarModelPage({ params }: CarModelPageProps) {
  const { make, model } = await params;
  const currentUser = await getCurrentUser();
  const result = await getCarDetailWithReviews(make, model, {
    reviewLimit: 3,
    currentUserId: currentUser?.id ?? null,
  });

  if (!result) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cars", href: "/cars" }, { label: `${make} ${model}` }]} />
      <Button asChild variant="outline" className="w-fit">
        <Link href="/cars">Back to catalog</Link>
      </Button>
      <CarDetailView detail={result.detail} reviews={result.reviews} />
    </div>
  );
}
