import { notFound, redirect } from "next/navigation";

import { ProfileSettingsForm } from "@/features/users/components/profile-settings-form";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export default async function ProfileSettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const row = await db.query.users.findFirst({
    where: (t, { eq }) => eq(t.id, user.id),
    columns: {
      displayName: true,
      bio: true,
      avatarUrl: true,
    },
  });

  if (!row) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Profile settings</h1>
      <ProfileSettingsForm
        initialDisplayName={row.displayName ?? user.username}
        initialBio={row.bio ?? null}
        initialAvatarUrl={row.avatarUrl ?? null}
      />
    </div>
  );
}
