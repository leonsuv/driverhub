export interface GarageCarSummary {
  id: number;
  make: string;
  model: string;
  year: number;
  generation: string | null;
  imageUrl: string | null;
  specs: unknown;
}

export interface GarageItem {
  id: number;
  userId: string;
  carId: number;
  nickname?: string;
  purchaseDate?: string | null;
  mileage?: number | null;
  modifications?: string;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  car: GarageCarSummary;
}

export type GarageList = GarageItem[];
export {};
