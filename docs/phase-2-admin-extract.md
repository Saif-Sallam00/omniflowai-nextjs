# Phase 2 Admin — Extraction from OLD app

Read-only extraction pass. No code was modified in either repo.

Repo paths confirmed read from:
- **OLD** = `/home/ss-dev/projects/omniflowai` (current production React/Vite/Express app, omniflowai.net)
- **NEW** = `/home/ss-dev/projects/v2omniflowai` (Next.js rewrite, package `omniflowai-nextjs`)

Every finding below is labeled OLD or NEW. Code quotes are verbatim with file paths noted.

---

## 1. Leads view (OLD admin)

### 1.1 Location
- OLD client page: `client/src/pages/admin/Leads.tsx`
- OLD server routes: `server/routes.ts` (lines ~381–407)
- OLD data layer: `server/storage.ts` (lines ~132–168)
- OLD schema: `shared/schema.ts` (lines ~113–139)

### 1.2 List/table columns, sort, pagination, filters, search

There is no table — it's a stacked card list, one card per lead. Per card, OLD shows (`client/src/pages/admin/Leads.tsx:86-135`):

```tsx
<h3 className="font-semibold text-white">{lead.name || lead.email}</h3>
<Badge className={SOURCE_STYLES[lead.source]}>{lead.source}</Badge>
<Badge className={STATUS_STYLES[lead.status]}>{lead.status}</Badge>
{lead.service && <span className="text-xs uppercase tracking-wide text-slate-500">{lead.service}</span>}
...
<div className="flex items-center gap-2"><Mail .../><a href={`mailto:${lead.email}`} ...>{lead.email}</a></div>
{lead.phone && <div ...><Phone .../>{lead.phone}</div>}
{lead.company && <div ...><Building2 .../>{lead.company}</div>}
...
{lead.message && ( <p className={expanded === lead.id ? "whitespace-pre-wrap" : "line-clamp-2"}>{lead.message}</p> ... )}
...
<div className="mt-3 text-xs text-slate-500">{new Date(lead.createdAt).toLocaleString()}</div>
```

Fields shown: name-or-email, source badge, status badge, service (if present), email (mailto link), phone (if present), company (if present), message (line-clamped/expandable), created-at timestamp. A header line shows a running count: `{leads.length} total`.

**Sort:** server-side, newest first. `server/storage.ts:156-158`:
```ts
async listLeads(): Promise<Lead[]> {
  return await db.select().from(leads).orderBy(desc(leads.createdAt));
}
```

**Pagination:** none. The client fetches the entire list in one request (`useQuery<Lead[]>({ queryKey: ["/api/leads"] })`) and renders all rows.

**Filters:** none. No filter-by-status or filter-by-source control exists in the file.

**Search box:** none. No search input exists in the file.

### 1.3 Row actions / detail view

- **Status change**: an inline `<Select>` per row bound to `lead.status`, options `new` / `read` / `archived` (`Leads.tsx:104-111`), calling `PATCH /api/leads/:id` with `{ status }`.
- **Delete**: a destructive icon button opens an `AlertDialog` confirmation, then `DELETE /api/leads/:id` (`Leads.tsx:112-115`, `141-154`).
- **View full message**: no separate detail view/route — the message is shown inline in the card and toggled between `line-clamp-2` and full (`whitespace-pre-wrap`) via a local "Show more/Show less" button (`Leads.tsx:118-129`), only rendered when `lead.message.length > 140`.
- No explicit "mark read" action other than picking `read` from the status `<Select>`. No "archive" button beyond selecting `archived` from the same select.

Server route handlers, verbatim (`server/routes.ts:381-407`):
```ts
// Admin: list leads (newest first)
app.get("/api/leads", isAuthenticated, async (_req, res) => {
  const list = await storage.listLeads();
  res.json(list);
});

// Admin: change lead status
app.patch("/api/leads/:id", isAuthenticated, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
  const status = req.body?.status;
  if (!(LEAD_STATUSES as readonly string[]).includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  const updated = await storage.updateLeadStatus(id, status);
  if (!updated) return res.status(404).json({ message: "Lead not found" });
  res.json(updated);
});

// Admin: delete lead
app.delete("/api/leads/:id", isAuthenticated, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
  const ok = await storage.deleteLead(id);
  if (!ok) return res.status(404).json({ message: "Lead not found" });
  res.sendStatus(204);
});
```

There is no dedicated "get one lead" GET-by-id route — the client works from the already-fetched list.

### 1.4 OLD schema: leads status/source

`shared/schema.ts:113-139` (OLD):
```ts
// --- LEADS (contact form submissions + newsletter signups) ---
export const LEAD_STATUSES = ["new", "read", "archived"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

// Where a lead came from. Defaulted to "contact" so existing rows backfill
// cleanly; newsletter signups are tagged "newsletter" to distinguish them.
export const LEAD_SOURCES = ["contact", "newsletter"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  service: text("service").$type<ContactService>(),
  message: text("message"),
  source: text("source").$type<LeadSource>().default("contact").notNull(),
  status: text("status").$type<LeadStatus>().default("new").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```
Note: in OLD, `source`/`status` are plain `text` columns constrained only at the app layer via TypeScript union types (no Postgres enum type).

### 1.5 NEW schema: leads status/source

`lib/db/schema.ts:17-19` and `132-147` (NEW):
```ts
export const leadStatusEnum = pgEnum("lead_status_enum", ["new", "read", "archived"]);
export const leadSourceEnum = pgEnum("lead_source_enum", ["contact", "newsletter"]);
...
export const leads = pgTable(
  "leads",
  {
    id: serial("id").primaryKey(),
    name: text("name"),
    email: text("email").notNull(),
    phone: text("phone"),
    company: text("company"),
    service: text("service"),
    message: text("message"),
    source: leadSourceEnum("source").notNull().default("contact"),
    status: leadStatusEnum("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("leads_created_at_idx").on(table.createdAt.desc())],
);
```
NEW upgrades `source`/`status` to real Postgres enum types (`lead_source_enum`, `lead_status_enum`), otherwise the same column set (minus `service` being typed to `ContactService` at the DB-type level in OLD vs. plain `text` in NEW — same underlying storage).

### 1.6 OLD → NEW value mapping

| OLD `status` | NEW `lead_status_enum` | Match |
|---|---|---|
| `new` | `new` | 1:1 |
| `read` | `read` | 1:1 |
| `archived` | `archived` | 1:1 |

| OLD `source` | NEW `lead_source_enum` | Match |
|---|---|---|
| `contact` | `contact` | 1:1 |
| `newsletter` | `newsletter` | 1:1 |

**No OLD value lacks a NEW equivalent.** The enums are identical in name and membership; NEW simply promotes them from app-level TS unions on `text` columns to native Postgres enum types.

---

## 2. Articles — schema question + old form

### 2.1 NEW: current articles table (verbatim)

`lib/db/schema.ts:56-91`:
```ts
export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    translationGroupId: uuid("translation_group_id")
      .notNull()
      .default(sql`gen_random_uuid()`),
    language: languageEnum("language").notNull(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    body: text("body").notNull(),
    coverImage: text("cover_image").notNull(),
    published: boolean("published").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    relatedProjectId: integer("related_project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    relatedSolution: text("related_solution"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("articles_language_slug_unique").on(table.language, table.slug),
    unique("articles_translation_group_id_language_unique").on(
      table.translationGroupId,
      table.language,
    ),
    index("articles_language_published_published_at_idx").on(
      table.language,
      table.published,
      table.publishedAt.desc(),
    ),
    index("articles_translation_group_id_idx").on(table.translationGroupId),
  ],
);
```

### 2.2 FR-3.1 (verbatim)

Found in `specs/001-foundation-slice/spec.md:68-72`:
```
- FR-3.1: The schema MUST include all target application tables, even those unpopulated in Phase 0:
  - `articles` with columns: `id serial pk`, `translation_group_id uuid not null default gen_random_uuid()`, `language language_enum not null`, `slug text not null`, `title text not null`, `excerpt text not null`, `body text not null`, `cover_image text not null`, `published boolean not null default false`, `published_at timestamptz`, `related_project_id integer references projects(id) on delete set null`, `related_solution text`, `created_at timestamptz not null default now()`, `updated_at timestamptz not null default now()`.
  - `projects` with columns: `id serial pk`, `category text not null`, `is_featured boolean not null default false`, `is_service_showcase boolean not null default false`, `cover_image text not null`, `created_at timestamptz not null default now()`, `updated_at timestamptz not null default now()`.
  - `project_translations` with columns: `id serial pk`, `project_id integer not null references projects(id) on delete cascade`, `language language_enum not null`, `title text not null`, `client text not null`, `description text not null`, `challenge text not null`, `diagnosis text`, `solution text not null`, `results jsonb not null default '[]'`, `tags jsonb not null default '[]'`, `technologies jsonb not null default '[]'`, `created_at timestamptz not null default now()`, `updated_at timestamptz not null default now()`.
  - `leads` with columns: `id serial pk`, `name text`, `email text not null`, `phone text`, `company text`, `service text`, `message text`, `source lead_source_enum not null default 'contact'`, `status lead_status_enum not null default 'new'`, `created_at timestamptz not null default now()`.
```

### 2.3 Does the current articles table still match FR-3.1?

**YES.** Comparing column-by-column, `articles` in `lib/db/schema.ts` matches FR-3.1's `articles` spec exactly: same column names, same types (`serial pk`, `uuid not null default gen_random_uuid()`, `language_enum not null`, `text not null`/`text` nullability per field, `boolean not null default false`, `timestamptz` nullable `published_at`, `integer references projects(id) on delete set null`, `text` for `related_solution`, and the two `timestamptz ... default now()` audit columns). No column has been added, changed, or dropped since FR-3.1 was written.

Note: `docs/decision-013-case-study-schema.md` ("Decision 013 — Case-study portfolio schema revision") revised `projects` and `project_translations` only (adding `slug`, `logo`, `media_image` to `projects`; replacing `challenge`/`diagnosis`/`solution` with structured fields on `project_translations`). It explicitly does not touch `articles` or `leads` — those two tables in the current schema still match FR-3.1 verbatim, while `projects`/`project_translations` in the current schema have diverged from what FR-3.1 originally specified (per Decision 013).

### 2.4 OLD: article admin form — every field

File: `client/src/pages/admin/Articles.tsx`. Backed by a zod schema (`react-hook-form` + `zodResolver`), lines 37-50:
```ts
const articleFormSchema = z.object({
  title: z.string().min(3, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase words separated by hyphens"),
  excerpt: z.string().min(20, "Excerpt is required — it is the LinkedIn preview text"),
  coverImage: z.string().min(1, "A cover image is required"),
  body: z.string().min(1, "Body is required"),
  language: z.enum(ARTICLE_LANGUAGES),
  published: z.boolean().default(false),
  relatedProjectId: z.string().default(NONE),
  relatedSolution: z.string().default(NONE),
});
```

Field-by-field, as rendered in the dialog form (`Articles.tsx:312-457`):

| Field | Input type | Validation | Notes |
|---|---|---|---|
| Title | `Input` (text) | `min(3)` | On change (create mode only), auto-fills `slug` via local `slugify()` helper. |
| URL slug | `Input` (text, monospace) | `min(1)`, regex `^[a-z0-9]+(?:-[a-z0-9]+)*$` | Editable at all times — not locked after creation. Description warns "avoid changing this once the article is live." |
| Excerpt | `Textarea` (rows=2) | `min(20)` | Description: doubles as index-card summary, meta description, and LinkedIn preview text; keep under ~155 chars. |
| Cover image | `ObjectUploader` component | `min(1)` (a URL string must be present) | Also used as LinkedIn preview image. |
| Body | `Textarea` (rows=16, monospace) | `min(1)` | Labelled "Body (Markdown)". Has an inline "Insert image" file-input control that uploads via `POST /api/objects/upload` and inserts `![](url)` Markdown at the cursor. |
| Language | `Select` (`en` / `ar`, "العربية" shown for ar) | `z.enum(ARTICLE_LANGUAGES)` | Description: "Shown only to readers on that language." |
| Published | `Switch` | `boolean`, default `false` | Shows "Live"/"Draft" label next to the switch. |
| Next step — case study (`relatedProjectId`) | `Select`, options = `NONE` + every fetched `Project.title` | `string`, default `NONE` sentinel | `NONE` ("none") used because Radix `Select` can't hold `""`; converted to `null` or `Number(...)` on submit. |
| Next step — solution (`relatedSolution`) | `Select`, options = `NONE` + `ARTICLE_SOLUTIONS` | `string`, default `NONE` sentinel | Same `NONE`-sentinel pattern. |

**Publish toggle:** a `Switch` bound to `published` (boolean), shown as "Live" / "Draft".

**Slug handling:** auto-generated from `title` via a local `slugify()` function *only while creating a new article* (`Articles.tsx:319-323`); once `editing` is set, changing the title no longer touches the slug. The slug field itself remains an editable text input at all times (not read-only/locked in the UI) — the code comment/UI copy just warns against changing it once live.
```ts
function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
```

**Excerpt field:** required, `min(20)`, dedicated `Textarea`, used for card summary + meta description + LinkedIn preview.

**Body field:** confirmed Markdown — dialog description says "Body is Markdown. A YouTube link on its own line becomes an embed." (`Articles.tsx:306`), the schema comment for the DB column says "Markdown. Rendered with @tailwindcss/typography" (`shared/schema.ts:171`), and the form field label is "Body (Markdown)" with an image-insert helper that writes Markdown image syntax. It is plain-text `Textarea` input (no rich-text/WYSIWYG editor) — the user hand-writes Markdown.

**Related linkage fields:** `relatedProjectId` (dropdown of existing projects, nullable FK) and `relatedSolution` (dropdown of `ARTICLE_SOLUTIONS` — `"foundation" | "growth-engine" | "scale-infrastructure" | "custom"`, from `shared/schema.ts:152-157`), both optional/nullable, both use the `NONE` sentinel pattern described above.

### 2.5 OLD: how did article translations work?

**Conclusion: per-row-per-language.** OLD has a single `language` text column directly on the `articles` row (default `"en"`), no `translation_group` concept, and `slug` is globally unique (not scoped per language) — meaning an EN and an AR version of "the same" article are two entirely independent, unlinked rows with their own distinct slugs, unrelated except by convention.

Schema, verbatim (`shared/schema.ts:141-186`):
```ts
// --- ARTICLES (/articles) ---
// Authored one language at a time, like every other piece of DB content — the
// EN/AR parity rule applies to the i18n dictionary, not to CMS rows. `language`
// exists because the GTM splits content between Egypt- and Saudi-facing posts,
// so Arabic articles are expected; the index filters to the reader's language.
export const ARTICLE_LANGUAGES = ["en", "ar"] as const;
export type ArticleLanguage = (typeof ARTICLE_LANGUAGES)[number];
...
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  // The URL. Immutable in practice once published — changing it drops whatever
  // search ranking and inbound links the article has earned.
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  coverImage: text("cover_image").notNull(),
  body: text("body").notNull(),
  language: text("language").$type<ArticleLanguage>().default("en").notNull(),
  published: boolean("published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  relatedProjectId: integer("related_project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  relatedSolution: text("related_solution").$type<ArticleSolution>(),
});
```
`slug: text("slug").notNull().unique()` — a single, whole-table-unique constraint, not `(language, slug)`. The admin form's Language `Select` (`en`/`ar`) is the only bilingual mechanism, and its own description text says "Shown only to readers on that language" — i.e. the reader-facing index filters by `language`, but there is no code anywhere linking an EN row to its AR counterpart.

**NEW's model** (already quoted in 2.1) uses `translationGroupId: uuid ... default gen_random_uuid()` plus a `unique(translationGroupId, language)` constraint and a `unique(language, slug)` constraint (not global-unique slug) — a genuine per-row-per-language + translation-group model, confirmed present in `lib/db/schema.ts:56-91`.

**Conclusion:** OLD's article form UX (single-language form per row, language picker, no group linkage) can be reused for authoring *one language's row* in the NEW model — the field set and interaction pattern transfer directly. But OLD has no UI or data concept of *pairing* an EN row with its AR counterpart, so the NEW `translation_group_id` linkage (e.g. "edit this article, also edit/create its AR twin," or a slug-uniqueness scope of `(language, slug)` rather than global) is new admin UX that must be built from scratch — it is not present anywhere in the OLD form to reuse.

---

## 3. Image storage (OLD app)

### 3.1 Column types

`shared/schema.ts:83` (projects):
```ts
image: text("image").notNull(),
```

`shared/schema.ts:170` (articles):
```ts
// Base64 data URI, same as projects.image (server/objectStorage.ts).
coverImage: text("cover_image").notNull(),
```

Both are plain Postgres `text` columns (not `bytea`, not `varchar`) — confirmed by reading the schema directly, matching the CLAUDE.md hint.

### 3.2 Upload control (client) and handling route (server)

Client file-input component: `client/src/components/ObjectUploader.tsx`. It is a drag/click file picker (not a paste-URL flow) with a 4MB client-side size guard, verbatim:
```tsx
const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // 1. Client-Side Size Check (Limit to 4MB to be safe)
  if (file.size > 4 * 1024 * 1024) {
    toast({ variant: "destructive", title: "File too large", description: "Please upload an image smaller than 4MB." });
    return;
  }

  setIsUploading(true);
  try {
    const formData = new FormData();
    formData.append("file", file);

    // 2. Attempt Upload
    const res = await fetch("/api/objects/upload", { method: "POST", body: formData });
    if (!res.ok) { ... }
    const data = await res.json();

    // 3. Success
    setPreview(data.url);
    onUploadComplete(data.url);
    ...
```
So the client posts multipart `FormData` to `POST /api/objects/upload` and receives back `{ url: "data:image/webp;base64,..." }`, which it stores directly as the form field value (i.e. the "url" the client stores is itself the base64 data URI, not a link to an image).

Server route (`server/routes.ts:332-357`), multer memory storage + sharp compression:
```ts
app.post(
  "/api/objects/upload",
  isAuthenticated,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const objectStorageService = new ObjectStorageService();

      // This now returns a long "data:image..." string
      const dataUrl = await objectStorageService.uploadImageBuffer(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname,
      );

      // We send this string back to the frontend to save in the DB
      res.json({ url: dataUrl });
    } catch (error) {
      console.error("Upload Error:", error);
      res.status(500).json({ message: "Server upload failed" });
    }
  },
);
```
`multer` is configured with in-memory storage (`server/routes.ts:28-29`, `const upload = multer({ storage: multer.memoryStorage(), ... })` — buffer never touches disk).

Compression/base64 conversion, `server/objectStorage.ts` (full file):
```ts
import sharp from "sharp";

export class ObjectStorageService {
  // No initialization needed. We are not using disk or cloud buckets.

  /**
   * DATABASE MODE: Compresses the uploaded image with sharp (resize + WebP)
   * and returns a Base64 Data URI for storage in a Postgres text column.
   */
  async uploadImageBuffer(buffer: Buffer, _mimeType: string, originalName: string): Promise<string> {
    try {
      const processed = await sharp(buffer)
        .rotate() // honor EXIF orientation before we strip metadata
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      const base64String = processed.toString("base64");
      const dataURI = `data:image/webp;base64,${base64String}`;

      console.log(
        `[Storage] Processed ${originalName}: ${buffer.length} → ${processed.length} bytes (webp, ${dataURI.length} chars)`,
      );

      return dataURI;
    } catch (error) {
      console.error("[Storage] Processing Error:", error);
      throw new Error("Failed to process image");
    }
  }
}
```
So the pipeline is: multipart upload → `req.file.buffer` (in memory) → sharp (EXIF-rotate, resize ≤1600px wide without upscaling, re-encode WebP q80) → base64 → `data:image/webp;base64,...` string → returned to client → client stores that literal string as the form field's value → saved into the `text` column on project/article create/update.

### 3.3 How images are served on read

Rendered as an inline data URI directly in `<img src>` — not a backend route, not an external/CDN URL. Example from the project list card (`client/src/pages/admin/Dashboard.tsx:210-217`):
```tsx
<img
  src={project.image}
  alt={project.title}
  loading="lazy"
  decoding="async"
  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
  onError={onImageError}
/>
```
Same pattern confirmed on the public site: `client/src/pages/ProjectDetail.tsx:81`, `client/src/pages/Portfolio.tsx:149`, `client/src/pages/ServiceDetail.tsx:324`, `client/src/pages/Services.tsx:480`, `client/src/pages/Home.tsx:457,510` — all bind `src={project.image}` straight from the fetched row, which already contains the full `data:image/webp;base64,...` string.

**Conclusion: old app stored images as base64 data-URI (embedded directly in Postgres `text` columns, compressed to WebP by `sharp` on upload, no external storage or CDN).**

---

## 4. Projects form (OLD admin) — UX REFERENCE ONLY

**Decision 013 rewrote this schema; the old fields below are OBSOLETE and NOT authoritative — captured for UX/layout reference only.**

Brief context on Decision 013 (`docs/decision-013-case-study-schema.md`): it replaces the old flat `challenge`/`diagnosis`/`solution` `project_translations` text fields with a structured bilingual case-study shape (client-identity fields, headline+body pairs for Problem/Diagnosis, a dynamic `system_cards` list, a re-shaped dynamic `results` list, media caption, optional CTA overrides), and adds `slug`, `logo`, `media_image` to `projects`. It explicitly flags that "Phase 2 admin must expose every field above in the project editor... a larger project editor than Decision 010 implied."

### 4.1 Location
`client/src/pages/admin/Dashboard.tsx` — a single file containing both the project grid/list and the create/edit dialog form (no separate shared form component).

### 4.2 Layout / section grouping / field ordering

The dialog form (`Dashboard.tsx:245-341`) is laid out top-to-bottom as:
1. **Visibility toggles** — two side-by-side colored cards (amber "Featured" / orange "Showcase"), each a label + `Switch`, in a 2-col grid.
2. **Basic info** — 2-col grid: Title (`Input`) + Client Name (`Input`).
3. **Category + Image** — 2-col grid: Category (`Select`, taxonomy-driven) + Image (`ObjectUploader`).
4. **Short Description** — full-width `Textarea` (rows=2).
5. **Narrative fields**, stacked full-width, each its own `Textarea`, in fixed order: Problem (`challenge`, rows=3) → Diagnosis (`diagnosis`, rows=3, marked optional in the label) → System (`solution`, rows=3). Code comment: "Portfolio narrative: Problem → Diagnosis → System → Outcome (Phase 3)".
6. **Outcome + Technologies** — 2-col grid: Outcome/results (`resultsString`, monospace `Textarea` rows=4, "one per line") + Technologies (`technologiesString`, monospace `Textarea` rows=4, "one per line").
7. **Tags** — full-width custom `TagsInput` chip control.
8. **Footer actions** — Cancel / Save, right-aligned, separated by a top border.

### 4.3 Validation feel

Backed by `react-hook-form` + `zodResolver(projectFormSchema)` (`Dashboard.tsx:32-48, 65-66`). Each field wraps `FormField`/`FormItem`/`FormControl`/`FormMessage`, so validation errors render inline under each field via shadcn's `FormMessage`. No visual required-field asterisks/indicators observed — required-ness is enforced only through zod (`min()` calls) and surfaces as an inline error message on submit/blur, not a static "*" marker in the label.

### 4.4 Repeatable-row UI patterns

**No `useFieldArray`/react-hook-form array fields are used anywhere in this form.** Two different manual patterns stand in for "list" input instead:

1. **Newline-delimited textarea** (used for `results` and `technologies`): a single monospace `Textarea` where each line becomes one array element, joined/split by `\n` at submit/load time — not an add/remove-row UI at all:
```ts
const payload = {
  ...data,
  results: data.resultsString.split('\n').filter(line => line.trim() !== ""),
  technologies: data.technologiesString.split('\n').filter(line => line.trim() !== ""),
};
```
and on load: `resultsString: project.results.join('\n')`.

2. **Manual chip/tag input** (used for `tags`): a hand-built controlled component (`TagsInput`, `Dashboard.tsx:366-412`) holding `value: string[]` + local `draft` text state. Enter or `,` commits the draft as a new chip (deduped via `includes` check); Backspace on an empty draft pops the last chip; each chip has its own × remove button; blur also commits any pending draft text:
```tsx
function TagsInput({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag) return;
    if (!value.includes(tag)) onChange([...value, tag]);
    setDraft("");
  };
  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag));
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(draft); }
    else if (e.key === "Backspace" && draft === "" && value.length > 0) { removeTag(value[value.length - 1]); }
  };
  ...
}
```

These are **UX patterns observed**, not a field list to replicate — Decision 013's `system_cards` and `results` (re-shaped to `{value, label}` objects, not plain strings) will need genuinely new repeatable-object-row UI (e.g. `useFieldArray`), since neither OLD pattern above handles an array of structured objects, only an array of plain strings.

---

## Gaps / things not found

- No server-side pagination, filtering, or search exists for leads in OLD — confirmed absence, not an oversight in this extraction.
- No dedicated "get one lead by id" REST endpoint exists in OLD; the admin works entirely off the bulk list response.
- Could not find any admin UI in OLD for reordering/pairing EN/AR article rows — as documented in §2.5, this concept does not exist in OLD at all (not a gap in this extraction, a genuine absence in OLD).
- Did not exhaustively audit every reference to `project.image`/`article.coverImage` rendering across the whole OLD client — a representative sample (admin dashboard, project detail, portfolio, service detail, services, home) was checked and all use the same inline `<img src={...}>` pattern; no instance of a different rendering approach (e.g. a proxy route) was found in that sample.
