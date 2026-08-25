import { signOutAction } from "./actions";
import { SignOutButton } from "./sign-out-button";

export default function AdminDashboard() {
  return (
    <main>
      <h1>Admin dashboard</h1>
      <p>Later phases will add admin CRUD.</p>
      <form action={signOutAction}>
        <SignOutButton />
      </form>
    </main>
  );
}
