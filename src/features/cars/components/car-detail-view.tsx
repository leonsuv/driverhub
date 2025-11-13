import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CarReviewHighlights } from "@/features/cars/components/car-review-highlights";
import type { CarModelDetail } from "@/features/cars/types";
import type { ReviewSummary } from "@/features/reviews/types";
import { cn } from "@/lib/utils";

interface CarDetailViewProps {
  detail: CarModelDetail;
  reviews?: ReviewSummary[];
}

export function CarDetailView({ detail, reviews = [] }: CarDetailViewProps) {
  const { latest, variants } = detail;
  const latestSpecs = latest.specs ?? {};
  const specEntries = Object.entries(latestSpecs).filter(
    (entry): entry is [string, string] => Boolean(entry[1]),
  );
  const hasHeroImage = Boolean(latest.imageUrl);

  return (
    <div className="flex flex-col gap-10">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl border bg-muted">
            {hasHeroImage ? (
              <Image
                src={latest.imageUrl as string}
                alt={`${detail.make} ${detail.model}`}
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <span className="text-xs uppercase tracking-wide">Photo coming soon</span>
              </div>
            )}
          </div>
          <Card>
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-semibold">
                {latest.year} {detail.make} {detail.model}
              </CardTitle>
              {latest.generation ? (
                <Badge variant="secondary" className="w-fit">
                  {latest.generation}
                </Badge>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              {specEntries.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-foreground">Factory specifications</h3>
                  <dl className="grid gap-3 sm:grid-cols-2">
                    {specEntries.map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                          {formatSpecLabel(key)}
                        </dt>
                        <dd className="text-sm text-foreground">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : (
                <p>No detailed specifications recorded for this variant yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <aside>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Model overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                You&apos;re viewing the Driverhub catalog entry for the {detail.make} {detail.model}. This
                page aggregates specs, generations, and real-world ownership stories.
              </p>
              <p>
                There {variants.length === 1 ? "is" : "are"} currently {variants.length} recorded
                {variants.length === 1 ? " variant" : " variants"} for this model.
              </p>
            </CardContent>
          </Card>
        </aside>
      </section>
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Model history</h2>
          <p className="text-muted-foreground text-sm">
            Explore the generations and trims documented in the community catalog.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {variants.map((variant) => (
            <Card
              key={variant.id}
              className={cn(
                "h-full transition-shadow",
                variant.id === latest.id && "border-primary/60 shadow-sm",
              )}
            >
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg font-semibold">
                  {variant.year} {variant.make} {variant.model}
                </CardTitle>
                {variant.generation ? (
                  <p className="text-muted-foreground text-sm">{variant.generation}</p>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {variant.specs?.body ? <p>Body: {variant.specs.body}</p> : null}
                {variant.specs?.drivetrain ? <p>Drivetrain: {variant.specs.drivetrain}</p> : null}
                {variant.specs?.powertrain ? <p>Powertrain: {variant.specs.powertrain}</p> : null}
                {variant.id === latest.id ? (
                  <Badge variant="outline" className="mt-2 w-fit text-xs">
                    Latest catalog entry
                  </Badge>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Community reviews</h2>
          <p className="text-muted-foreground text-sm">
            Read recent ownership stories and impressions for this car.
          </p>
        </div>
        <CarReviewHighlights reviews={reviews} />
      </section>
    </div>
  );
}

function formatSpecLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (character) => character.toUpperCase())
    .trim();
}
