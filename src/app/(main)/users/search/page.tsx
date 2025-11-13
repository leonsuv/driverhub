import { UserSearch } from "@/features/users/components/user-search";

export default function UsersSearchPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Search users</h1>
      <UserSearch />
    </div>
  );
}
