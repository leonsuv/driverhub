"use client";

import { useParams } from "next/navigation";

import { ReviewDraftEditor } from "@/features/reviews/components/review-draft-editor";

export default function DraftEditorPage() {
  const params = useParams();
  const idParam = params?.id as string | undefined;
  const id = Number(idParam);
  if (!id || Number.isNaN(id)) return <div>Invalid draft id</div>;
  return (
    <div className="container py-6">
      <ReviewDraftEditor id={id} />
    </div>
  );
}
