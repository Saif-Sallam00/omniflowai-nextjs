import type { Metadata } from "next";
import { leadStatusEnum } from "@/lib/db/schema";
import { listLeads, type Lead } from "@/lib/db/leads";
import { updateLeadStatusAction, deleteLeadAction } from "./actions";
import { DeleteLeadForm } from "./delete-lead-form";
import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/admin/card";
import { StatusBadge } from "@/components/admin/status-badge";
import { EmptyState } from "@/components/admin/empty-state";
import { SearchInput } from "@/components/admin/search-input";
import { FilterSelect } from "@/components/admin/filter-select";
import {
  type StatusBadgeTone,
  textMuted,
  textPrimary,
  textSecondary,
  inputClass,
} from "@/components/admin/palette";

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

function filterBySearch(leads: Lead[], q: string): Lead[] {
  if (!q.trim()) return leads;
  const needle = q.trim().toLowerCase();
  return leads.filter((lead) =>
    [lead.name, lead.email, lead.company].some((field) => field?.toLowerCase().includes(needle)),
  );
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status: rawStatus, q = "" } = await searchParams;
  const status = parseStatusFilter(rawStatus);
  const allLeads = await listLeads(status);
  const leads = filterBySearch(allLeads, q);
  const isFiltered = Boolean(status || q.trim());

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Leads"
        description={`${allLeads.length} lead${allLeads.length === 1 ? "" : "s"}`}
      />

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput placeholder="Search leads…" />
        <FilterSelect
          paramName="status"
          ariaLabel="Filter by status"
          options={[{ value: "", label: "All statuses" }, ...STATUS_FILTERS.map((s) => ({ value: s, label: s }))]}
        />
      </div>

      {leads.length === 0 ? (
        <EmptyState
          title={isFiltered ? "No leads match these filters." : "No leads yet."}
          description={isFiltered ? "Try changing your search or filters." : undefined}
        />
      ) : (
        <ul className="space-y-4">
          {leads.map((lead) => (
            <li key={lead.id}>
              <Card>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`font-semibold ${textPrimary}`}>{lead.name || lead.email}</span>
                  <StatusBadge tone="neutral">{lead.source}</StatusBadge>
                  <form
                    action={updateLeadStatusAction.bind(null, lead.id)}
                    className="flex items-center gap-1"
                  >
                    <select
                      key={lead.status}
                      name="status"
                      defaultValue={lead.status}
                      className={`${inputClass} w-auto px-2 py-1 text-xs uppercase`}
                    >
                      {STATUS_FILTERS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className={`rounded-md border border-admin-border px-2 py-1 text-xs font-medium ${textSecondary} hover:bg-admin-hover`}
                    >
                      Update
                    </button>
                  </form>
                  <StatusBadge tone={LEAD_STATUS_TONES[lead.status]}>{lead.status}</StatusBadge>
                  <DeleteLeadForm action={deleteLeadAction.bind(null, lead.id)} recordLabel={lead.name || lead.email} />
                </div>

                <dl className={`mt-3 space-y-1 text-sm ${textSecondary}`}>
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
                  <details className={`mt-2 text-sm ${textSecondary}`}>
                    <summary className="cursor-pointer">Message</summary>
                    <p className="mt-1 whitespace-pre-wrap">{lead.message}</p>
                  </details>
                )}

                <p className={`mt-2 text-xs ${textMuted}`}>{DATE_FORMAT.format(lead.createdAt)}</p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
