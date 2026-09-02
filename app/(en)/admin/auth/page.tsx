import { LoginForm } from "./login-form";
import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/admin/card";

export default function AdminAuthPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <PageHeader title="Admin sign in" />
      <Card className="mt-6">
        <LoginForm />
      </Card>
    </div>
  );
}
