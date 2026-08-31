import Link from "next/link";
import { leadStatusEnum } from "@/lib/db/schema";
import { listLeads, type Lead } from "@/lib/db/leads";
import { updateLeadStatusAction, deleteLeadAction } from "./actions";
import { DeleteLeadForm } from "./delete-lead-form";

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

const STATUS_FILTERS = leadStatusEnum.enumValues;

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
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-xl font-bold">Leads</h1>
      <p className="mt-1 text-sm text-gray-600">
        {leads.length} lead{leads.length === 1 ? "" : "s"}
      </p>

      <nav className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/leads"
          className={status === undefined ? "font-semibold underline" : "text-gray-600 underline"}
        >
          All
        </Link>
        {STATUS_FILTERS.map((s) => (
          <Link
            key={s}
            href={`/admin/leads?status=${s}`}
            className={status === s ? "font-semibold underline" : "text-gray-600 underline"}
          >
            {s}
          </Link>
        ))}
      </nav>

      {leads.length === 0 ? (
        <p className="mt-6 text-sm text-gray-600">
          {status === undefined ? "No leads yet." : "No leads match this filter."}
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {leads.map((lead) => (
            <li key={lead.id} className="rounded-md border border-gray-200 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{lead.name || lead.email}</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs uppercase">
                  {lead.source}
                </span>
                <form action={updateLeadStatusAction.bind(null, lead.id)} className="flex items-center gap-1">
                  <select
                    key={lead.status}
                    name="status"
                    defaultValue={lead.status}
                    className="rounded border border-gray-300 text-xs uppercase"
                  >
                    {STATUS_FILTERS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="rounded border border-gray-300 px-2 py-0.5 text-xs">
                    Update
                  </button>
                </form>
                <DeleteLeadForm action={deleteLeadAction.bind(null, lead.id)} />
              </div>

              <dl className="mt-2 space-y-1 text-sm text-gray-700">
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
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
