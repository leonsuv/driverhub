"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface PlateBlurEditorProps {
  file: File;
  onCancel: () => void;
  onApply: (processed: Blob) => void;
}

interface Rect { x: number; y: number; w: number; h: number }

export function PlateBlurEditor({ file, onCancel, onApply }: PlateBlurEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [rects, setRects] = useState<Rect[]>([]);
  const [drag, setDrag] = useState<{ sx: number; sy: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => setImage(img);
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }, [file]);

  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const maxW = 800;
    const scale = Math.min(1, maxW / image.width);
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    // draw overlays
    drawOverlay();
  }, [image, rects]);

  const drawOverlay = () => {
    const overlay = overlayRef.current;
    if (!overlay || !canvasRef.current) return;
    overlay.width = canvasRef.current.width;
    overlay.height = canvasRef.current.height;
    const octx = overlay.getContext("2d");
    if (!octx) return;
    octx.clearRect(0, 0, overlay.width, overlay.height);
    octx.strokeStyle = "#22c55e";
    octx.lineWidth = 2;
    rects.forEach((r) => {
      octx.strokeRect(r.x, r.y, r.w, r.h);
    });
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (!overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    setDrag({ sx, sy, x: sx, y: sy });
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!drag || !overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDrag((d) => (d ? { ...d, x, y } : d));
  };
  const onMouseUp = () => {
    if (!drag) return;
    const x = Math.min(drag.sx, drag.x);
    const y = Math.min(drag.sy, drag.y);
    const w = Math.abs(drag.x - drag.sx);
    const h = Math.abs(drag.y - drag.sy);
    if (w > 5 && h > 5) setRects((rs) => [...rs, { x, y, w, h }]);
    setDrag(null);
  };

  useEffect(() => {
    if (!overlayRef.current || !drag) return;
    drawOverlay();
    const octx = overlayRef.current.getContext("2d");
    if (!octx) return;
    octx.setLineDash([6, 4]);
    octx.strokeStyle = "#3b82f6";
    octx.strokeRect(Math.min(drag.sx, drag.x), Math.min(drag.sy, drag.y), Math.abs(drag.x - drag.sx), Math.abs(drag.y - drag.sy));
    octx.setLineDash([]);
  }, [drag]);

  const applyBlur = async () => {
    if (!canvasRef.current) return;
    const base = document.createElement("canvas");
    base.width = canvasRef.current.width;
    base.height = canvasRef.current.height;
    const bctx = base.getContext("2d");
    const src = canvasRef.current.getContext("2d");
    if (!bctx || !src) return;
    // copy base image
    bctx.drawImage(canvasRef.current, 0, 0);
    // apply blur per rect by scaling trick
    rects.forEach((r) => {
      const crop = src.getImageData(r.x, r.y, r.w, r.h);
      const temp = document.createElement("canvas");
      temp.width = r.w;
      temp.height = r.h;
      const tctx = temp.getContext("2d");
      if (!tctx) return;
      // put and scale down then up to simulate blur
      tctx.putImageData(crop, 0, 0);
      const scale = 0.1; // aggressive blur
      const smallW = Math.max(1, Math.floor(r.w * scale));
      const smallH = Math.max(1, Math.floor(r.h * scale));
      const small = document.createElement("canvas");
      small.width = smallW;
      small.height = smallH;
      const sctx = small.getContext("2d");
      if (!sctx) return;
      sctx.drawImage(temp, 0, 0, smallW, smallH);
      tctx.clearRect(0, 0, r.w, r.h);
      tctx.imageSmoothingEnabled = true;
      tctx.drawImage(small, 0, 0, r.w, r.h);
      bctx.drawImage(tctx.canvas, r.x, r.y);
    });
    bctx.canvas.toBlob((blob) => {
      if (blob) onApply(blob);
    }, file.type || "image/jpeg", 0.92);
  };

  return (
    <div className="space-y-3">
      <div className="relative w-full overflow-auto">
        <canvas ref={canvasRef} className="max-w-full" />
        <canvas
          ref={overlayRef}
          className="absolute left-0 top-0 cursor-crosshair"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={applyBlur}>Apply blur & continue</Button>
      </div>
    </div>
  );
}
