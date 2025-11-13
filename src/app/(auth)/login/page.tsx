import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="flex w-full max-w-xl flex-col items-center gap-6">
        <Suspense fallback={<div className="w-full max-w-md">Loading...</div>}>
          <LoginForm />
        </Suspense>
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
