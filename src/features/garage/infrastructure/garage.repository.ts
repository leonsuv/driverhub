import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { cars, userCarMedia, userCarMods, userCars, users } from "@/lib/db/schema";

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
      vin: userCars.vin,
      engineCode: userCars.engineCode,
      colorCode: userCars.colorCode,
      trim: userCars.trim,
      imageUrl: userCars.imageUrl,
      isActive: userCars.isActive,
      status: userCars.status,
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
    .orderBy(desc(userCars.isActive), asc(userCars.orderIndex), desc(userCars.createdAt));

  return rows;
}

export async function transferGarageCar(params: { id: number; userId: string; targetUsername: string }) {
  const existing = await db
    .select({ id: userCars.id, userId: userCars.userId })
    .from(userCars)
    .where(eq(userCars.id, params.id))
    .limit(1);
  const current = existing[0];
  if (!current) throw new GarageItemNotFoundError();
  if (current.userId !== params.userId) throw new GaragePermissionError();

  // Case-insensitive match on username
  const rows = await db.execute<{ id: string }>(
    `SELECT id FROM users WHERE lower(username) = lower(${params.targetUsername}) LIMIT 1`
  );
  const target = rows[0];
  if (!target) throw new GarageItemNotFoundError();

  await db.update(userCars).set({ userId: target.id }).where(eq(userCars.id, params.id));
  return { success: true } as const;
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
  vin?: string | null;
  engineCode?: string | null;
  colorCode?: string | null;
  trim?: string | null;
  status?: "daily" | "project" | "sold" | "wrecked" | "hidden" | null;
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
      vin: input.vin ?? null,
      engineCode: input.engineCode ?? null,
      colorCode: input.colorCode ?? null,
      trim: input.trim ?? null,
      status: input.status ?? undefined,
      isActive: false,
    })
    .returning();

  return row;
}

// Gallery media
export async function listGarageMedia(params: { userCarId: number; userId: string }) {
  const parent = await db.query.userCars.findFirst({ where: (t, { and, eq }) => and(eq(t.id, params.userCarId), eq(t.userId, params.userId)), columns: { id: true } });
  if (!parent) throw new GaragePermissionError();
  const rows = await db
    .select({ id: userCarMedia.id, url: userCarMedia.url, orderIndex: userCarMedia.orderIndex, createdAt: userCarMedia.createdAt })
    .from(userCarMedia)
    .where(eq(userCarMedia.userCarId, params.userCarId))
    .orderBy(asc(userCarMedia.orderIndex), desc(userCarMedia.createdAt));
  return rows;
}

export async function addGarageMedia(input: { userId: string; userCarId: number; url: string }) {
  const parent = await db.query.userCars.findFirst({ where: (t, { and, eq }) => and(eq(t.id, input.userCarId), eq(t.userId, input.userId)), columns: { id: true } });
  if (!parent) throw new GaragePermissionError();
  // compute next orderIndex
  const [{ max }] = await db.execute<{ max: number }>(`SELECT COALESCE(MAX(order_index), 0) as max FROM user_car_media WHERE user_car_id = ${input.userCarId}`);
  const nextIndex = (max ?? 0) + 1;
  const [row] = await db.insert(userCarMedia).values({ userCarId: input.userCarId, url: input.url, orderIndex: nextIndex }).returning();
  return row;
}

export async function removeGarageMedia(params: { id: number; userId: string }) {
  const found = await db
    .select({ id: userCarMedia.id, userCarId: userCarMedia.userCarId })
    .from(userCarMedia)
    .where(eq(userCarMedia.id, params.id))
    .limit(1);
  const media = found[0];
  if (!media) throw new GarageItemNotFoundError();
  const parent = await db.query.userCars.findFirst({ where: (t, { and, eq }) => and(eq(t.id, media.userCarId), eq(t.userId, params.userId)), columns: { id: true } });
  if (!parent) throw new GaragePermissionError();
  await db.delete(userCarMedia).where(eq(userCarMedia.id, params.id));
  return { success: true } as const;
}

export async function reorderGarageMedia(input: { userId: string; userCarId: number; orderedIds: number[] }) {
  const parent = await db.query.userCars.findFirst({ where: (t, { and, eq }) => and(eq(t.id, input.userCarId), eq(t.userId, input.userId)), columns: { id: true } });
  if (!parent) throw new GaragePermissionError();
  await db.transaction(async (tx) => {
    for (let i = 0; i < input.orderedIds.length; i++) {
      const id = input.orderedIds[i];
      await tx.update(userCarMedia).set({ orderIndex: i }).where(eq(userCarMedia.id, id));
    }
  });
  return { success: true } as const;
}

// Mods CRUD
export async function listGarageMods(params: { userCarId: number; userId: string }) {
  // Ensure ownership
  const parent = await db.query.userCars.findFirst({ where: (t, { and, eq }) => and(eq(t.id, params.userCarId), eq(t.userId, params.userId)), columns: { id: true } });
  if (!parent) throw new GaragePermissionError();
  const rows = await db
    .select({ id: userCarMods.id, title: userCarMods.title, description: userCarMods.description, installedAt: userCarMods.installedAt, costCents: userCarMods.costCents, partUrl: userCarMods.partUrl, createdAt: userCarMods.createdAt })
    .from(userCarMods)
    .where(eq(userCarMods.userCarId, params.userCarId))
    .orderBy(desc(userCarMods.installedAt), desc(userCarMods.createdAt));
  return rows;
}

export async function addGarageMod(input: { userId: string; userCarId: number; title: string; description?: string | null; installedAt?: string | Date | null; costCents?: number | null; partUrl?: string | null }) {
  const parent = await db.query.userCars.findFirst({ where: (t, { and, eq }) => and(eq(t.id, input.userCarId), eq(t.userId, input.userId)), columns: { id: true } });
  if (!parent) throw new GaragePermissionError();
  const installedAt = input.installedAt ? (typeof input.installedAt === "string" ? new Date(input.installedAt) : input.installedAt) : null;
  const [row] = await db
    .insert(userCarMods)
    .values({ userCarId: input.userCarId, title: input.title, description: input.description ?? null, installedAt, costCents: input.costCents ?? null, partUrl: input.partUrl ?? null })
    .returning();
  return row;
}

export async function updateGarageMod(input: { id: number; userId: string; title?: string; description?: string | null; installedAt?: string | Date | null; costCents?: number | null; partUrl?: string | null }) {
  // join to ensure ownership
  const mod = await db
    .select({ id: userCarMods.id, userCarId: userCarMods.userCarId })
    .from(userCarMods)
    .where(eq(userCarMods.id, input.id))
    .limit(1);
  const found = mod[0];
  if (!found) throw new GarageItemNotFoundError();
  const parent = await db.query.userCars.findFirst({ where: (t, { and, eq }) => and(eq(t.id, found.userCarId), eq(t.userId, input.userId)), columns: { id: true } });
  if (!parent) throw new GaragePermissionError();
  const [row] = await db
    .update(userCarMods)
    .set({
      title: input.title ?? undefined,
      description: input.description ?? undefined,
      installedAt:
        input.installedAt != null
          ? typeof input.installedAt === "string"
            ? new Date(input.installedAt)
            : input.installedAt
          : undefined,
      costCents: input.costCents ?? undefined,
      partUrl: input.partUrl ?? undefined,
    })
    .where(eq(userCarMods.id, input.id))
    .returning();
  return row;
}

export async function removeGarageMod(params: { id: number; userId: string }) {
  const mod = await db
    .select({ id: userCarMods.id, userCarId: userCarMods.userCarId })
    .from(userCarMods)
    .where(eq(userCarMods.id, params.id))
    .limit(1);
  const found = mod[0];
  if (!found) throw new GarageItemNotFoundError();
  const parent = await db.query.userCars.findFirst({ where: (t, { and, eq }) => and(eq(t.id, found.userCarId), eq(t.userId, params.userId)), columns: { id: true } });
  if (!parent) throw new GaragePermissionError();
  await db.delete(userCarMods).where(eq(userCarMods.id, params.id));
  return { success: true } as const;
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
  vin?: string | null;
  engineCode?: string | null;
  colorCode?: string | null;
  trim?: string | null;
  status?: "daily" | "project" | "sold" | "wrecked" | "hidden" | null;
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
      vin: input.vin ?? null,
      engineCode: input.engineCode ?? null,
      colorCode: input.colorCode ?? null,
      trim: input.trim ?? null,
      status: input.status ?? undefined,
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

export async function moveGarageCar(params: { id: number; userId: string; direction: "up" | "down" }) {
  const items = await db
    .select({ id: userCars.id, orderIndex: userCars.orderIndex })
    .from(userCars)
    .where(eq(userCars.userId, params.userId))
    .orderBy(asc(userCars.orderIndex), desc(userCars.createdAt));

  const currentIdx = items.findIndex((i) => i.id === params.id);
  if (currentIdx === -1) throw new GarageItemNotFoundError();

  const targetIdx = params.direction === "up" ? currentIdx - 1 : currentIdx + 1;
  if (targetIdx < 0 || targetIdx >= items.length) {
    return { success: true } as const;
  }

  const a = items[currentIdx];
  const b = items[targetIdx];

  await db.transaction(async (tx) => {
    await tx.update(userCars).set({ orderIndex: b.orderIndex }).where(eq(userCars.id, a.id));
    await tx.update(userCars).set({ orderIndex: a.orderIndex }).where(eq(userCars.id, b.id));
  });

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
