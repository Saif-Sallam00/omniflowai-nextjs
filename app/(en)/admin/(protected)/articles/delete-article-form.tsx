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

export function DeleteArticleForm({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("Delete this article?")) {
          event.preventDefault();
        }
      }}
    >
      <SubmitButton />
    </form>
  );
}
