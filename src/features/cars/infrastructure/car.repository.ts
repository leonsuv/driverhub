import { SQL, asc, desc, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { cars } from "@/lib/db/schema";
import {
  CarListItem,
  CarModelDetail,
  CarSpecs,
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

  return rows;
}

export async function listCars(params: ListCarsParams): Promise<ListCarsResult> {
  const limit = Math.min(Math.max(params.limit, 1), 50);
  const queryTerm = params.query?.trim();

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
      params.cursor || queryTerm
        ? (carsTable, operators) => {
            const clauses: SQL[] = [];

            if (params.cursor) {
              clauses.push(operators.lt(carsTable.id, params.cursor));
            }

            if (queryTerm) {
              const sanitized = queryTerm.replace(/[\\%_]/g, "\\$&");
              const search = `%${sanitized}%`;
              const searchFilters = [
                operators.ilike(carsTable.make, search),
                operators.ilike(carsTable.model, search),
                sql`coalesce(${carsTable.generation}, '') ILIKE ${search}`,
              ].filter((expression): expression is SQL => expression !== undefined);

              let searchCondition: SQL | undefined;

              for (const filter of searchFilters) {
                searchCondition = searchCondition ? operators.or(searchCondition, filter) : filter;
              }

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

  const items: CarListItem[] = visibleRows.map((row) => ({
    id: row.id,
    make: row.make,
    model: row.model,
    year: row.year,
    generation: row.generation,
    imageUrl: row.imageUrl,
    specs: (row.specs as CarSpecs | null) ?? null,
  }));

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

  const variants: CarListItem[] = rows.map((row) => ({
    id: row.id,
    make: row.make,
    model: row.model,
    year: row.year,
    generation: row.generation,
    imageUrl: row.imageUrl,
    specs: (row.specs as CarSpecs | null) ?? null,
  }));

  return {
    make: variants[0].make,
    model: variants[0].model,
    latest: variants[0],
    variants,
  };
}
