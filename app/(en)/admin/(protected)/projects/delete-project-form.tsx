"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/admin/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant="destructive" className="text-sm">
      {pending ? "Deleting…" : "Delete"}
    </Button>
  );
}

export function DeleteProjectForm({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("Delete this project?")) {
          event.preventDefault();
        }
      }}
    >
      <SubmitButton />
    </form>
  );
}
