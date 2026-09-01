"use client";

import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Deleting…" : "Delete"}
    </button>
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
