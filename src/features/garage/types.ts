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
  // Car passport
  vin?: string | null;
  engineCode?: string | null;
  colorCode?: string | null;
  trim?: string | null;
  // Vehicle status
  status?: "daily" | "project" | "sold" | "wrecked" | "hidden";
  isActive: boolean;
  createdAt: string;
  car: GarageCarSummary;
}

export type GarageList = GarageItem[];
export {};
