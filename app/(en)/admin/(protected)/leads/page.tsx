import type { Metadata } from "next";
import Link from "next/link";
import { leadStatusEnum } from "@/lib/db/schema";
import { listLeads, type Lead } from "@/lib/db/leads";
import { updateLeadStatusAction, deleteLeadAction } from "./actions";
import { DeleteLeadForm } from "./delete-lead-form";
import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/admin/card";
import { StatusBadge } from "@/components/admin/status-badge";
import type { StatusBadgeTone } from "@/components/admin/palette";

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const metadata: Metadata = {
  title: "Admin — Leads",
};

const STATUS_FILTERS = leadStatusEnum.enumValues;

const LEAD_STATUS_TONES: Record<Lead["status"], StatusBadgeTone> = {
  new: "warning",
  read: "success",
  archived: "neutral",
};

function parseStatusFilter(value: string | undefined): Lead["status"] | undefined {
  return (STATUS_FILTERS as readonly string[]).includes(value ?? "")
    ? (value as Lead["status"])
    : undefined;
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawStatus } = await searchParams;
  const status = parseStatusFilter(rawStatus);
  const leads = await listLeads(status);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Leads"
        description={`${leads.length} lead${leads.length === 1 ? "" : "s"}`}
      />

      <nav className="flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/leads"
          className={
            status === undefined
              ? "font-semibold text-indigo-600 underline"
              : "text-gray-600 underline"
          }
        >
          All
        </Link>
        {STATUS_FILTERS.map((s) => (
          <Link
            key={s}
            href={`/admin/leads?status=${s}`}
            className={
              status === s ? "font-semibold text-indigo-600 underline" : "text-gray-600 underline"
            }
          >
            {s}
          </Link>
        ))}
      </nav>

      {leads.length === 0 ? (
        <p className="text-sm text-gray-600">
          {status === undefined ? "No leads yet." : "No leads match this filter."}
        </p>
      ) : (
        <ul className="space-y-4">
          {leads.map((lead) => (
            <li key={lead.id}>
              <Card>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-gray-900">{lead.name || lead.email}</span>
                  <StatusBadge tone="neutral">{lead.source}</StatusBadge>
                  <form
                    action={updateLeadStatusAction.bind(null, lead.id)}
                    className="flex items-center gap-1"
                  >
                    <select
                      key={lead.status}
                      name="status"
                      defaultValue={lead.status}
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs uppercase"
                    >
                      {STATUS_FILTERS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Update
                    </button>
                  </form>
                  <StatusBadge tone={LEAD_STATUS_TONES[lead.status]}>{lead.status}</StatusBadge>
                  <DeleteLeadForm action={deleteLeadAction.bind(null, lead.id)} />
                </div>

                <dl className="mt-3 space-y-1 text-sm text-gray-700">
                  <div>
                    <a href={`mailto:${lead.email}`} className="underline">
                      {lead.email}
                    </a>
                  </div>
                  {lead.service && <div>Service: {lead.service}</div>}
                  {lead.phone && <div>Phone: {lead.phone}</div>}
                  {lead.company && <div>Company: {lead.company}</div>}
                </dl>

                {lead.message && (
                  <details className="mt-2 text-sm text-gray-700">
                    <summary className="cursor-pointer">Message</summary>
                    <p className="mt-1 whitespace-pre-wrap">{lead.message}</p>
                  </details>
                )}

                <p className="mt-2 text-xs text-gray-500">{DATE_FORMAT.format(lead.createdAt)}</p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
