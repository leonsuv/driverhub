"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";

interface DraftEditorProps {
  id: number;
}

export function ReviewDraftEditor({ id }: DraftEditorProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const getQuery = trpc.reviews.getDraft.useQuery({ id });
  const update = trpc.reviews.updateDraft.useMutation();
  const publish = trpc.reviews.publishDraft.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.reviews.list.invalidate(),
        utils.reviews.listLatest.invalidate(),
      ]);
    },
  });
  const discard = trpc.reviews.discardDraft.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.reviews.list.invalidate(),
        utils.reviews.listLatest.invalidate(),
      ]);
    },
  });

  const draft = getQuery.data;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState("5");
  const [carId, setCarId] = useState<string>("");

  const carsQuery = trpc.cars.list.useInfiniteQuery({ limit: 50 }, { getNextPageParam: (p) => p.nextCursor ?? undefined });
  const carOptions = useMemo(() => (carsQuery.data?.pages.flatMap((p) => p.items) ?? []).map((c) => ({ id: c.id, label: `${c.year} ${c.make} ${c.model}${c.generation ? ` (${c.generation})` : ""}` })), [carsQuery.data]);

  // initialize from fetched draft
  useEffect(() => {
    if (!draft) return;
    setTitle(draft.title ?? "");
    setContent(draft.content ?? "");
    setRating(String(draft.rating ?? 5));
    setCarId(String(draft.carId));
  }, [draft]);

  // autosave (debounced)
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (!draft) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    dirtyRef.current = true;
    timerRef.current = setTimeout(() => {
      if (!dirtyRef.current) return;
      update.mutate({ reviewId: id, title, content, rating: Number(rating), carId: Number(carId) });
      dirtyRef.current = false;
    }, 700);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [id, title, content, rating, carId, draft, update]);

  if (getQuery.isLoading) {
    return <div className="space-y-3">Loading draft...</div>;
  }
  if (getQuery.error || !draft) {
    return <div className="text-red-600">Draft not found</div>;
  }

  const onPublish = async () => {
    try {
      await publish.mutateAsync({ reviewId: id });
      toast.success("Draft published");
      router.push(`/reviews/${id}`);
      router.refresh();
    } catch (e) {
      toast.error("Unable to publish draft");
    }
  };

  const onDiscard = async () => {
    try {
      await discard.mutateAsync({ reviewId: id });
      toast.success("Draft discarded");
      router.push("/profile/me");
    } catch (e) {
      toast.error("Unable to discard draft");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit draft</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <FormLabel>Title</FormLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A day with my car" />
          </div>
          <div className="space-y-2">
            <FormLabel>Rating</FormLabel>
            <Input type="number" min={1} max={10} value={rating} onChange={(e) => setRating(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <FormLabel>Content</FormLabel>
            <Textarea rows={10} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your story..." />
          </div>
          <div className="space-y-2 md:col-span-2">
            <FormLabel>Car</FormLabel>
            <Select value={carId} onValueChange={(v) => setCarId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your car" />
              </SelectTrigger>
              <SelectContent>
                {carOptions.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Autosaving… {update.isPending ? "saving" : "saved"}</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={onPublish} disabled={publish.isPending}>Publish</Button>
        <Button variant="outline" onClick={onDiscard} disabled={discard.isPending}>Discard</Button>
      </CardFooter>
    </Card>
  );
}
