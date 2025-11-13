import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({});

export function cn(...inputs: unknown[]) {
  return twMerge(clsx(inputs));
}
