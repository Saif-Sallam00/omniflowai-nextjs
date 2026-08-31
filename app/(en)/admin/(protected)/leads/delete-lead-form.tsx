"use client";

import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded border border-red-300 px-2 py-0.5 text-xs text-red-700"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
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
