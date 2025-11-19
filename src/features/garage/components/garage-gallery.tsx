"use client";

import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGarageMedia } from "@/features/garage/hooks/use-garage-media";
import { PlateBlurEditor } from "@/features/garage/components/plate-blur-editor";

interface GarageGalleryProps {
  userCarId: number;
}

export function GarageGallery({ userCarId }: GarageGalleryProps) {
  const { list, add, remove, reorder } = useGarageMedia(userCarId);
  const [file, setFile] = useState<File | null>(null);
  const [useBlur, setUseBlur] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const items = list.data ?? [];

  const orderedIds = useMemo(() => items.map((m) => m.id), [items]);

  const handleUpload = useCallback(
    async (blob: Blob) => {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", blob, (file?.name ?? "image") + ".jpg");
        const resp = await fetch("/api/upload", { method: "POST", body: formData });
        if (!resp.ok) throw new Error("Upload failed");
        const data: { url: string } = await resp.json();
        add.mutate({ userCarId, url: data.url });
        setFile(null);
        setUseBlur(false);
      } catch {
        // swallow; UI shows pending states via button disable
      } finally {
        setIsUploading(false);
      }
    },
    [add, userCarId, file]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    setFile(f);
  };

  const doDirectUpload = async () => {
    if (!file) return;
    await handleUpload(file);
  };

  const move = (idx: number, dir: "up" | "down") => {
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= orderedIds.length) return;
    const arr = orderedIds.slice();
    const [current] = arr.splice(idx, 1);
    arr.splice(target, 0, current);
    reorder.mutate({ userCarId, orderedIds: arr });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Gallery</h3>
      {list.isLoading ? (
        <div className="text-sm text-muted-foreground">Loading photos...</div>
      ) : list.error ? (
        <div className="text-sm text-red-600">Failed to load photos</div>
      ) : items.length === 0 ? (
        <div className="rounded border border-dashed p-3 text-sm text-muted-foreground">No photos yet.</div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((m, idx) => (
            <li key={m.id} className="group overflow-hidden rounded border">
              <img src={m.url} alt="Car" className="h-28 w-full object-cover" />
              <div className="flex items-center justify-between gap-2 p-2">
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => move(idx, "up")} disabled={reorder.isPending}>
                    ↑
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => move(idx, "down")} disabled={reorder.isPending}>
                    ↓
                  </Button>
                </div>
                <Button size="sm" variant="ghost" onClick={() => remove.mutate({ id: m.id })} disabled={remove.isPending}>
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-2 rounded border p-3">
        {file ? (
          useBlur ? (
            <PlateBlurEditor
              file={file}
              onCancel={() => setFile(null)}
              onApply={(blob) => handleUpload(blob)}
            />
          ) : (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Selected file: {file.name}</div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => setFile(null)} disabled={isUploading}>
                  Cancel
                </Button>
                <Button size="sm" onClick={doDirectUpload} disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Upload"}
                </Button>
                <label className="ml-auto inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={useBlur} onChange={(e) => setUseBlur(e.target.checked)} />
                  Blur plates before upload
                </label>
              </div>
            </div>
          )
        ) : (
          <div className="flex items-center gap-2">
            <Input type="file" accept="image/*" onChange={onFileChange} />
          </div>
        )}
      </div>
    </div>
  );
}
