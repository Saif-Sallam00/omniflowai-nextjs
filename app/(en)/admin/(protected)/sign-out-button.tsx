"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/admin/button";

export function SignOutButton() {
  const { pending } = useFormStatus();
  return (
    <Button variant="secondary" type="submit" disabled={pending} className="w-full">
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
