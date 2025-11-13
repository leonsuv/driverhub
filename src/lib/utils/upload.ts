import { mkdir, writeFile } from "fs/promises";
import { basename, join } from "path";
import { randomUUID } from "crypto";

import { env } from "@/config/env";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
]);

export type UploadValidationResult =
  | { success: true; filepath: string; filename: string }
  | { success: false; error: string };

export async function saveUpload(file: File): Promise<UploadValidationResult> {
  if (!allowedMimeTypes.has(file.type)) {
    return { success: false, error: "Unsupported file type" };
  }

  if (file.size > env.MAX_FILE_SIZE) {
    return { success: false, error: "File exceeds maximum size" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = basename(file.name).split(".").pop();
  const filename = `${randomUUID()}${ext ? `.${ext}` : ""}`;
  const dir = join(process.cwd(), env.UPLOAD_DIR);
  const filepath = join(dir, filename);

  await mkdir(dir, { recursive: true });
  await writeFile(filepath, buffer);

  return { success: true, filepath, filename };
}
