"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/admin/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button variant="destructive" type="submit" disabled={pending} className="text-xs">
      {pending ? "Deleting…" : "Delete"}
    </Button>
  );
}

export function DeleteLeadForm({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("Delete this lead?")) {
          event.preventDefault();
        }
      }}
    >
      <SubmitButton />
    </form>
  );
}
