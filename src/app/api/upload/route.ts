import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/config";
import { saveUpload } from "@/lib/utils/upload";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const result = await saveUpload(file);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // Return a relative URL so next/image treats it as a local asset and no domain config is required.
  const url = `/uploads/${result.filename}`;

  return NextResponse.json({ url, filename: result.filename });
}
