import { signOutAction } from "./actions";
import { SignOutButton } from "./sign-out-button";
import { AdminShell } from "@/components/admin/admin-shell";

export function AdminNav({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell
      signOutSlot={
        <form action={signOutAction} className="px-3 pt-1">
          <SignOutButton />
        </form>
      }
    >
      {children}
    </AdminShell>
  );
}
