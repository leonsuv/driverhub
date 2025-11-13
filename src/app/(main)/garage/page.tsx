import { GarageCarForm, GarageList } from "@/features/garage/components";
import { listAllCars } from "@/features/cars/infrastructure/car.repository";

export default async function GaragePage() {
  const cars = await listAllCars();
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Your Garage</h1>
      <GarageCarForm cars={cars} />
      <GarageList />
    </div>
  );
}
