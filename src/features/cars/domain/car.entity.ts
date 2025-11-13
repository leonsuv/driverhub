import type { CarListItem, CarSpecs, CarSummary } from "@/features/cars/types";

interface BaseCarRow {
  id: number;
  make: string;
  model: string;
  year: number;
  generation: string | null;
}

interface CarListRow extends BaseCarRow {
  imageUrl?: string | null;
  specs?: unknown;
}

export function createCarSummary(row: BaseCarRow): CarSummary {
  return {
    id: row.id,
    make: row.make,
    model: row.model,
    year: row.year,
    generation: row.generation,
  };
}

export function createCarListItem(row: CarListRow): CarListItem {
  return {
    ...createCarSummary(row),
    imageUrl: typeof row.imageUrl === "string" && row.imageUrl.trim().length > 0 ? row.imageUrl : null,
    specs: parseCarSpecs(row.specs),
  };
}

export function normalizeCarSearchQuery(query: string | undefined | null): string | undefined {
  if (!query) {
    return undefined;
  }

  const trimmed = query.trim();

  if (trimmed.length === 0) {
    return undefined;
  }

  return trimmed.replace(/\s+/g, " ");
}

const LIKE_SPECIAL_CHARACTERS = /[%_\\]/g;

export function escapeCarSearchTerm(term: string): string {
  return term.replace(LIKE_SPECIAL_CHARACTERS, "\\$&");
}

export function createCarSearchPattern(term: string): string {
  return `%${escapeCarSearchTerm(term)}%`;
}

function parseCarSpecs(raw: unknown): CarSpecs | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as Record<string, unknown>;
  const resolved: CarSpecs = {};

  const body = candidate.body;
  const drivetrain = candidate.drivetrain;
  const powertrain = candidate.powertrain;

  if (typeof body === "string" && body.trim().length > 0) {
    resolved.body = body.trim();
  }

  if (typeof drivetrain === "string" && drivetrain.trim().length > 0) {
    resolved.drivetrain = drivetrain.trim();
  }

  if (typeof powertrain === "string" && powertrain.trim().length > 0) {
    resolved.powertrain = powertrain.trim();
  }

  return Object.keys(resolved).length > 0 ? resolved : null;
}
