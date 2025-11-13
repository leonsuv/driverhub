import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
loadEnv();

const seedCars = [
  {
    make: "Audi",
    model: "A4",
    year: 2024,
    generation: "B9 Facelift",
    imageUrl: null,
    specs: {
      body: "Sedan",
      drivetrain: "Quattro AWD",
      powertrain: "2.0 TFSI",
    },
  },
  {
    make: "BMW",
    model: "M3",
    year: 2025,
    generation: "G80",
    imageUrl: null,
    specs: {
      body: "Sedan",
      drivetrain: "xDrive AWD",
      powertrain: "S58 3.0L Twin-Turbo",
    },
  },
  {
    make: "Tesla",
    model: "Model 3 Performance",
    year: 2024,
    generation: "Highland",
    imageUrl: null,
    specs: {
      body: "Sedan",
      drivetrain: "Dual Motor AWD",
      powertrain: "Electric",
    },
  },
];

async function main() {
  const { db } = await import("@/lib/db");
  const { cars } = await import("@/lib/db/schema");

  console.info("🌱 Seeding database...");

  await db.insert(cars).values(seedCars).onConflictDoNothing();

  console.info("✅ Seed complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => process.exit(0));
