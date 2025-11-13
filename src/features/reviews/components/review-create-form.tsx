"use client";

import { useCallback, useState, useTransition, type ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CarOption } from "@/features/cars/types";
import {
  createReviewFormSchema,
  createReviewSchema,
} from "@/features/reviews/schemas/review-schemas";
import type { CreateReviewFormSchema } from "@/features/reviews/schemas/review-schemas";
import { trpc } from "@/lib/trpc/client";

const MAX_MEDIA_ITEMS = 10;
const ACCEPTED_MEDIA_TYPES = "image/jpeg,image/png,image/webp,video/mp4";

interface ReviewCreateFormProps {
  cars: CarOption[];
}

export function ReviewCreateForm({ cars }: ReviewCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const utils = trpc.useUtils();

  const form = useForm<CreateReviewFormSchema>({
    resolver: zodResolver(createReviewFormSchema),
    defaultValues: {
      carId: cars[0] ? String(cars[0].id) : "",
      title: "",
      content: "",
      rating: "8",
      pros: "",
      cons: "",
      media: [],
    },
  });

  const { fields: mediaFields, append, remove } = useFieldArray<CreateReviewFormSchema, "media">({
    control: form.control,
    name: "media",
  });

  const createMutation = trpc.reviews.create.useMutation({
    onSuccess: async ({ reviewId }) => {
      await Promise.all([
        utils.feed.latest.invalidate(),
        utils.reviews.listLatest.invalidate(),
      ]);

      toast.success("Review published");
      startTransition(() => {
        router.push(`/reviews/${reviewId}`);
        router.refresh();
      });
    },
    onError: (error) => {
      toast.error(error.message ?? "Unable to publish review");
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    const mediaItems = values.media ?? [];

    const payload = createReviewSchema.parse({
      carId: Number(values.carId),
      title: values.title,
      content: values.content,
      rating: Number(values.rating),
      pros: values.pros?.trim() ? values.pros.trim() : undefined,
      cons: values.cons?.trim() ? values.cons.trim() : undefined,
      media: mediaItems.map((item, index) => ({
        url: item.url,
        type: item.type,
        altText: item.altText?.trim() ? item.altText.trim() : null,
        order: index,
      })),
    });

    createMutation.mutate(payload);
  });

  const handleMediaUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files ? Array.from(event.target.files) : [];

      if (files.length === 0) {
        return;
      }

      const remainingSlots = MAX_MEDIA_ITEMS - mediaFields.length;

      if (remainingSlots <= 0) {
        toast.error(`You can upload up to ${MAX_MEDIA_ITEMS} media items.`);
        event.target.value = "";
        return;
      }

      const filesToUpload = files.slice(0, remainingSlots);

      setIsUploading(true);

      try {
        for (const file of filesToUpload) {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({ error: "Upload failed" }));
            throw new Error(error.error ?? "Upload failed");
          }

          const data: { url: string } = await response.json();

          append({
            url: data.url,
            type: file.type.startsWith("video/") ? "video" : "image",
            altText: "",
          });
        }

        toast.success("Media uploaded");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to upload media";
        toast.error(message);
      } finally {
        setIsUploading(false);
        event.target.value = "";
      }
    },
    [append, mediaFields.length],
  );

  if (cars.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">No cars available</CardTitle>
          <CardDescription>
            Add car records to the database to start publishing reviews.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isSubmitting = isPending || createMutation.isPending;
  const ratingValue = Number(form.watch("rating") ?? 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Share your experience</CardTitle>
        <CardDescription>
          Publish a detailed review to help other drivers learn from your ownership journey.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="carId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a car" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cars.map((car) => (
                        <SelectItem key={car.id} value={String(car.id)}>
                          {car.year} {car.make} {car.model}
                          {car.generation ? ` (${car.generation})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel className="text-sm font-medium">Media uploads</FormLabel>
                <span className="text-muted-foreground text-xs">
                  {mediaFields.length}/{MAX_MEDIA_ITEMS}
                </span>
              </div>
              <Input
                type="file"
                accept={ACCEPTED_MEDIA_TYPES}
                multiple
                disabled={isUploading || mediaFields.length >= MAX_MEDIA_ITEMS}
                onChange={handleMediaUpload}
              />
              <p className="text-muted-foreground text-xs">
                Upload JPEG, PNG, WEBP images or MP4 videos. Maximum {MAX_MEDIA_ITEMS} items.
              </p>
              {isUploading ? (
                <p className="text-primary text-sm">Uploading media...</p>
              ) : null}
            </div>
            {mediaFields.length > 0 ? (
              <div className="space-y-3">
                {mediaFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col gap-3 rounded-lg border border-dashed p-4 sm:flex-row"
                  >
                    <div className="sm:w-48">
                      {field.type === "video" ? (
                        <video
                          controls
                          className="h-32 w-full rounded-md border object-cover"
                          src={field.url}
                        />
                      ) : (
                        <div className="relative h-32 w-full overflow-hidden rounded-md border">
                          <Image
                            src={field.url}
                            alt={field.altText ?? "Review media"}
                            fill
                            unoptimized
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, 200px"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Media #{index + 1}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          Remove
                        </Button>
                      </div>
                      <input
                        type="hidden"
                        defaultValue={field.url}
                        {...form.register(`media.${index}.url` as const)}
                      />
                      <input
                        type="hidden"
                        defaultValue={field.type}
                        {...form.register(`media.${index}.type` as const)}
                      />
                      <FormField
                        control={form.control}
                        name={`media.${index}.altText` as const}
                        render={({ field: altTextField }) => (
                          <FormItem>
                            <FormLabel>Alt text</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Describe this media for accessibility"
                                {...altTextField}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Supercharged ownership review" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating (1-10)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={10} step={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main review</FormLabel>
                  <FormControl>
                    <Textarea rows={10} placeholder="Tell us about driving dynamics, ownership costs, and more." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="pros"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Highlights</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="What do you love about this car?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cons"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Challenges</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="Any drawbacks or issues to share?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Rating preview: {ratingValue}/10
            </p>
            <Button type="submit" disabled={isSubmitting || cars.length === 0}>
              {isSubmitting ? "Publishing..." : "Publish review"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
