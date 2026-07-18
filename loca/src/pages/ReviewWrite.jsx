import { Suspense } from "react";
import { AppShell } from "@/src/components/layout/AppShell";
import { ReviewWriteForm } from "./ReviewWriteForm";

export default function ReviewWritePage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="h-96 animate-pulse rounded-2xl bg-zinc-100" />
        </AppShell>
      }
    >
      <ReviewWriteForm />
    </Suspense>
  );
}
