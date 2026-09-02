import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/admin/card";

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Admin dashboard" />
      <Card>
        <p className="text-sm text-gray-600">Later phases will add admin CRUD.</p>
      </Card>
    </div>
  );
}
