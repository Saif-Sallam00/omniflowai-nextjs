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

export function DeleteLeadForm({ action, recordLabel }: { action: () => Promise<void>; recordLabel: string }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`Delete "${recordLabel}"?\n\nThis action cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <SubmitButton />
    </form>
  );
}
