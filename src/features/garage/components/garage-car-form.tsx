"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCallback, useState, type ChangeEvent } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGarage } from "@/features/garage/hooks/use-garage";
import { addGarageCarInputSchema } from "@/features/garage/schemas/garage-schemas";
import type { CarSummary } from "@/features/cars/types";

type FormValues = z.infer<typeof addGarageCarInputSchema>;

interface GarageCarFormProps {
  cars: CarSummary[];
}

export function GarageCarForm({ cars }: GarageCarFormProps) {
  const { add } = useGarage();
  const form = useForm<FormValues>({
    resolver: zodResolver(addGarageCarInputSchema),
    defaultValues: {
      carId: 0,
      nickname: "",
      mileage: undefined,
      modifications: "",
      imageUrl: "",
      purchaseDate: "",
    },
  });

  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleImageUpload = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", { method: "POST", body: formData });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error ?? "Upload failed");
      }

      const data: { url: string } = await response.json();
      form.setValue("imageUrl", data.url, { shouldDirty: true });
      setPreviewUrl(data.url);
    } catch (_e) {
      // swallow error, UI remains unchanged
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }, [form]);

  const onSubmit = (values: FormValues) => {
    add.mutate(
      {
        ...values,
        // Normalize empty strings to undefined for optional fields
        nickname: values.nickname ? values.nickname : undefined,
        modifications: values.modifications ? values.modifications : undefined,
        imageUrl: values.imageUrl ? values.imageUrl : undefined,
        purchaseDate: values.purchaseDate ? values.purchaseDate : undefined,
        mileage: typeof values.mileage === "number" && !Number.isNaN(values.mileage)
          ? values.mileage
          : undefined,
      },
      { onSuccess: () => form.reset() },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a car</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="carId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
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
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nickname</FormLabel>
                  <FormControl>
                    <Input placeholder="My daily driver" value={field.value ?? ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mileage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mileage</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 120000"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? undefined : Number(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="modifications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modifications</FormLabel>
                  <FormControl>
                    <Input placeholder="Exhaust, wheels, ECU tune" value={field.value ?? ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={isUploading}
                        onChange={handleImageUpload}
                      />
                      {/* Hidden bound field to store the uploaded URL */}
                      <input type="hidden" value={field.value ?? ""} onChange={field.onChange} />
                      {previewUrl || field.value ? (
                        <img
                          src={(previewUrl || field.value) as string}
                          alt="Car photo preview"
                          className="h-24 w-40 rounded border object-cover"
                        />
                      ) : null}
                      {isUploading ? (
                        <p className="text-xs text-muted-foreground">Uploading...</p>
                      ) : null}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Date</FormLabel>
                  <FormControl>
                    <Input type="date" value={field.value ?? ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2">
              <Button type="submit" disabled={add.isPending}>
                {add.isPending ? "Adding..." : "Add to garage"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
