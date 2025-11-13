import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserPublicProfile } from "@/features/users/types";
import { formatDate } from "@/lib/utils/date";

interface UserProfileHeaderProps {
  profile: UserPublicProfile;
  isOwner?: boolean;
}

export function UserProfileHeader({ profile, isOwner = false }: UserProfileHeaderProps) {
  const initials = createInitials(profile.displayName);

  return (
    <section className="flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="size-16">
            <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.displayName} />
            <AvatarFallback className="text-lg font-semibold uppercase">{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{profile.displayName}</h1>
            <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
              <span>@{profile.username}</span>
              {isOwner ? (
                <Badge variant="secondary" className="font-normal uppercase">You</Badge>
              ) : null}
              <span>Member since {formatDate(profile.createdAt, "PPP")}</span>
            </div>
            {profile.bio ? <p className="text-muted-foreground text-sm leading-relaxed">{profile.bio}</p> : null}
          </div>
        </div>
      </div>
      <dl className="grid gap-4 sm:grid-cols-3">
        <ProfileStat label="Total reviews" value={profile.stats.totalReviews} />
        <ProfileStat label="Published reviews" value={profile.stats.publishedReviews} />
        <ProfileStat label="Likes received" value={profile.stats.totalLikesReceived} />
      </dl>
    </section>
  );
}

interface ProfileStatProps {
  label: string;
  value: number;
}

function ProfileStat({ label, value }: ProfileStatProps) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <dt className="text-muted-foreground text-xs uppercase tracking-wide">{label}</dt>
      <dd className="text-2xl font-semibold">{value}</dd>
    </div>
  );
}

function createInitials(value: string) {
  const parts = value
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return "DH";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
