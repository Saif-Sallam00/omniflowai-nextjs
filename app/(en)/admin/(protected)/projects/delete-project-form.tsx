"use client";

import { useFormStatus } from "react-dom";

const ITEM_DANGER_CLASSNAME = "block w-full px-3 py-1.5 text-left text-sm text-admin-danger hover:bg-admin-danger-bg";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" role="menuitem" disabled={pending} className={ITEM_DANGER_CLASSNAME}>
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}

export function DeleteProjectForm({ action, recordLabel }: { action: () => Promise<void>; recordLabel: string }) {
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
