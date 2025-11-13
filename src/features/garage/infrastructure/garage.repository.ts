import { and, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { cars, userCars } from "@/lib/db/schema";

export async function listUserGarage(userId: string) {
  const rows = await db
    .select({
      id: userCars.id,
      userId: userCars.userId,
      carId: userCars.carId,
      nickname: userCars.nickname,
      purchaseDate: userCars.purchaseDate,
      mileage: userCars.mileage,
      modifications: userCars.modifications,
      imageUrl: userCars.imageUrl,
      isActive: userCars.isActive,
      createdAt: userCars.createdAt,
      car: {
        id: cars.id,
        make: cars.make,
        model: cars.model,
        year: cars.year,
        generation: cars.generation,
        imageUrl: cars.imageUrl,
        specs: cars.specs,
      },
    })
    .from(userCars)
    .innerJoin(cars, eq(userCars.carId, cars.id))
    .where(eq(userCars.userId, userId))
    .orderBy(desc(userCars.isActive), desc(userCars.createdAt));

  return rows;
}

export class GaragePermissionError extends Error {}
export class GarageItemNotFoundError extends Error {}

export async function addGarageCar(input: {
  userId: string;
  carId: number;
  nickname?: string | null;
  purchaseDate?: string | Date | null;
  mileage?: number | null;
  modifications?: string | null;
  imageUrl?: string | null;
}) {
  const purchaseDate = input.purchaseDate
    ? typeof input.purchaseDate === "string"
      ? new Date(input.purchaseDate)
      : input.purchaseDate
    : null;
  const [row] = await db
    .insert(userCars)
    .values({
      userId: input.userId,
      carId: input.carId,
      nickname: input.nickname ?? null,
      purchaseDate,
      mileage: input.mileage ?? null,
      modifications: input.modifications ?? null,
      imageUrl: input.imageUrl ?? null,
      isActive: false,
    })
    .returning();

  return row;
}

export async function updateGarageCar(input: {
  id: number;
  userId: string;
  nickname?: string | null;
  purchaseDate?: string | Date | null;
  mileage?: number | null;
  modifications?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
}) {
  const existing = await db.query.userCars.findFirst({
    where: (t, { eq }) => eq(t.id, input.id),
    columns: { id: true, userId: true },
  });

  if (!existing) {
    throw new GarageItemNotFoundError();
  }

  if (existing.userId !== input.userId) {
    throw new GaragePermissionError();
  }

  const [row] = await db
    .update(userCars)
    .set({
      nickname: input.nickname ?? null,
      purchaseDate:
        input.purchaseDate != null
          ? typeof input.purchaseDate === "string"
            ? new Date(input.purchaseDate)
            : input.purchaseDate
          : null,
      mileage: input.mileage ?? null,
      modifications: input.modifications ?? null,
      imageUrl: input.imageUrl ?? null,
      isActive: input.isActive ?? undefined,
    })
    .where(eq(userCars.id, input.id))
    .returning();

  return row;
}

export async function removeGarageCar(params: { id: number; userId: string }) {
  const existing = await db.query.userCars.findFirst({
    where: (t, { eq }) => eq(t.id, params.id),
    columns: { id: true, userId: true },
  });

  if (!existing) {
    throw new GarageItemNotFoundError();
  }

  if (existing.userId !== params.userId) {
    throw new GaragePermissionError();
  }

  await db.delete(userCars).where(and(eq(userCars.id, params.id), eq(userCars.userId, params.userId)));

  return { success: true } as const;
}

export async function setActiveGarageCar(params: { id: number; userId: string }) {
  const existing = await db.query.userCars.findFirst({
    where: (t, { and, eq }) => and(eq(t.id, params.id), eq(t.userId, params.userId)),
    columns: { id: true, userId: true },
  });

  if (!existing) {
    throw new GarageItemNotFoundError();
  }

  if (existing.userId !== params.userId) {
    throw new GaragePermissionError();
  }

  await db.update(userCars).set({ isActive: false }).where(eq(userCars.userId, params.userId));

  const [row] = await db
    .update(userCars)
    .set({ isActive: true })
    .where(and(eq(userCars.id, params.id), eq(userCars.userId, params.userId)))
    .returning();

  return row;
}
