import { SQL, asc, desc, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { cars } from "@/lib/db/schema";
import {
  createCarListItem,
  createCarSearchPattern,
  createCarSummary,
  normalizeCarSearchQuery,
} from "@/features/cars/domain/car.entity";
import {
  CarListItem,
  CarModelDetail,
  CarSummary,
  ListCarsParams,
  ListCarsResult,
} from "@/features/cars/types";

export async function listAllCars(): Promise<CarSummary[]> {
  const rows = await db
    .select({
      id: cars.id,
      make: cars.make,
      model: cars.model,
      year: cars.year,
      generation: cars.generation,
    })
    .from(cars)
    .orderBy(asc(cars.make), asc(cars.model), desc(cars.year));

  return rows.map(createCarSummary);
}

export async function listCars(params: ListCarsParams): Promise<ListCarsResult> {
  const limit = Math.min(Math.max(params.limit, 1), 50);
  const normalizedQuery = normalizeCarSearchQuery(params.query);

  const rows = await db.query.cars.findMany({
    columns: {
      id: true,
      make: true,
      model: true,
      year: true,
      generation: true,
      imageUrl: true,
      specs: true,
    },
    limit: limit + 1,
    orderBy: (carsTable, { desc }) => [desc(carsTable.id)],
    where:
      params.cursor || normalizedQuery
        ? (carsTable, operators) => {
            const clauses: SQL[] = [];

            if (params.cursor) {
              clauses.push(operators.lt(carsTable.id, params.cursor));
            }

            if (normalizedQuery) {
              const pattern = createCarSearchPattern(normalizedQuery);
              const searchCondition = operators.or(
                operators.ilike(carsTable.make, pattern),
                operators.ilike(carsTable.model, pattern),
                sql`coalesce(${carsTable.generation}, '') ILIKE ${pattern}`,
              );

              if (searchCondition) {
                clauses.push(searchCondition);
              }
            }

            if (clauses.length === 0) {
              return sql`true`;
            }

            if (clauses.length === 1) {
              return clauses[0];
            }

            return operators.and(...clauses);
          }
        : undefined,
  });

  const hasNextPage = rows.length > limit;
  const visibleRows = hasNextPage ? rows.slice(0, limit) : rows;

  const items: CarListItem[] = visibleRows.map((row) =>
    createCarListItem({
      id: row.id,
      make: row.make,
      model: row.model,
      year: row.year,
      generation: row.generation,
      imageUrl: row.imageUrl,
      specs: row.specs,
    }),
  );

  const nextCursor = hasNextPage ? rows[limit].id : null;

  return {
    items,
    nextCursor,
  };
}

export async function getCarModelDetail(make: string, model: string): Promise<CarModelDetail | null> {
  const rows = await db.query.cars.findMany({
    columns: {
      id: true,
      make: true,
      model: true,
      year: true,
      generation: true,
      imageUrl: true,
      specs: true,
    },
    where: (carsTable, { and, eq }) => and(eq(carsTable.make, make), eq(carsTable.model, model)),
    orderBy: (carsTable, { desc }) => [desc(carsTable.year), desc(carsTable.id)],
  });

  if (rows.length === 0) {
    return null;
  }

  const variants: CarListItem[] = rows.map((row) =>
    createCarListItem({
      id: row.id,
      make: row.make,
      model: row.model,
      year: row.year,
      generation: row.generation,
      imageUrl: row.imageUrl,
      specs: row.specs,
    }),
  );

  return {
    make: variants[0].make,
    model: variants[0].model,
    latest: variants[0],
    variants,
  };
}
