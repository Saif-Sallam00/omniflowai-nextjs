import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { Card } from "@/components/admin/card";
import { textPrimary, textMuted } from "@/components/admin/palette";

export const metadata: Metadata = {
  title: "Admin sign in",
};

export default function AdminAuthPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <div className="mb-6 text-center">
        <h1 className={`text-xl font-bold ${textPrimary}`}>OmniflowAI Admin</h1>
        <p className={`mt-1 text-sm ${textMuted}`}>Sign in to manage articles, projects, and leads.</p>
      </div>
      <Card>
        <LoginForm />
      </Card>
    </div>
  );
}
