"use client";

import { useState, useCallback, type ChangeEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc/client";
import { updateUserProfileSchema } from "@/features/users/schemas/user-schemas";

const formSchema = updateUserProfileSchema;

type FormValues = z.infer<typeof formSchema>;

interface ProfileSettingsFormProps {
  initialDisplayName: string;
  initialBio: string | null;
  initialAvatarUrl: string | null;
}

export function ProfileSettingsForm({ initialDisplayName, initialBio, initialAvatarUrl }: ProfileSettingsFormProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const mutation = trpc.users.updateProfile.useMutation({
    onSuccess: async () => {
      await utils.users.invalidate();
      toast.success("Profile updated", { duration: 2000 });
      router.refresh();
    },
    onError: (err) => {
      const message = err instanceof Error && err.message ? err.message : "Failed to update profile";
      toast.error(message);
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: initialDisplayName,
      bio: initialBio ?? "",
      avatarUrl: initialAvatarUrl ?? "",
    },
  });

  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>(initialAvatarUrl ?? "");

  const handleAvatarUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error ?? "Upload failed");
      }
      const data: { url: string } = await res.json();
      form.setValue("avatarUrl", data.url, { shouldDirty: true });
      setAvatarPreview(data.url);
      toast.success("Avatar uploaded");
    } catch (err) {
      const message = err instanceof Error && err.message ? err.message : "Failed to upload avatar";
      toast.error(message);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }, [form]);

  const onSubmit = (values: FormValues) => {
    mutation.mutate({
      displayName: values.displayName,
      bio: values.bio?.trim() ? values.bio.trim() : undefined,
      avatarUrl: values.avatarUrl?.trim() ? values.avatarUrl.trim() : undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile settings</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} disabled={mutation.isPending || isUploading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea rows={5} placeholder="Tell others about yourself" {...field} disabled={mutation.isPending || isUploading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input type="file" accept="image/jpeg,image/png,image/webp" disabled={isUploading || mutation.isPending} onChange={handleAvatarUpload} />
                      <input type="hidden" value={field.value ?? ""} onChange={field.onChange} />
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar preview" className="h-16 w-16 rounded-full border object-cover" />
                      ) : null}
                      {isUploading ? <p className="text-xs text-muted-foreground">Uploading...</p> : null}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex items-center gap-2">
            <Button type="submit" disabled={mutation.isPending || isUploading || !form.formState.isDirty}>
              {mutation.isPending ? "Saving..." : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={mutation.isPending || isUploading || !form.formState.isDirty}
              onClick={() => {
                form.reset({
                  displayName: initialDisplayName,
                  bio: initialBio ?? "",
                  avatarUrl: initialAvatarUrl ?? "",
                });
                setAvatarPreview(initialAvatarUrl ?? "");
              }}
            >
              Reset changes
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
