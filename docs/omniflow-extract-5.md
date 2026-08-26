# OmniflowAI Extraction Pass 5 — Contact Form & Newsletter

Scope: `/contact` page, contact form submit logic, server-side lead write + Resend email,
footer newsletter signup, shared Zod validation, and Resend env config. For slice 1D (rebuilding
these in the Next app).

---

## 1. Contact page (`/contact` route)

Source: [client/src/pages/Contact.tsx](client/src/pages/Contact.tsx)

### Fields — confirmed

| Field | Required? | Type | Notes |
|---|---|---|---|
| `name` | **required** (min 2 chars) | text | |
| `email` | **required** | email | |
| `phone` | optional | tel | |
| `company` | optional | text | |
| `service` | required (enum, but always has a value — see below) | select | defaults to `"not-sure"` unless `?service=` query param matches a valid `ContactService` |
| `message` | **required** (min 10 chars) | textarea | |

There is **no** honeypot/captcha, no `?source=` tracking beyond `?service=`, no file upload.

### Full page JSX (verbatim, minus imports)

```tsx
/**
 * `?service=<id>` — set by the per-solution CTAs on the Solutions page so the
 * lead record carries which card produced the enquiry instead of it having to
 * be inferred from the message.
 *
 * Anything absent or unrecognised falls back to "not-sure". §6's rule stands:
 * the form must never pre-select a service on its own, because that silently
 * biases every lead. This only honours a choice the visitor actually made by
 * clicking a specific solution.
 */
function requestedService(): ContactService {
  if (typeof window === "undefined") return "not-sure";
  const param = new URLSearchParams(window.location.search).get("service");
  return CONTACT_SERVICES.includes(param as ContactService)
    ? (param as ContactService)
    : "not-sure";
}

export default function Contact() {
  const { t } = useI18n();
  useDocumentTitle("Contact");
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      service: requestedService(),
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ContactFormData) =>
      apiRequest("POST", "/api/contact", data),
    onSuccess: () => {
      toast({ title: t("contact.toast.success") });
      form.reset();
    },
    onError: () => {
      toast({ title: t("contact.toast.error"), variant: "destructive" });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen pt-20 bg-slate-950 text-white">
      <section className="py-20 md:py-24 relative">
        {/* Background Effect */}
        <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-gradient-to-br from-orange-950/20 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold font-display mb-6 text-white">
              {t("contact.title")}
            </h1>
            <p className="text-xl text-slate-400">
              {t("contact.sub")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: form (spans 2 cols) */}
            <div className="lg:col-span-2">
              <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-8 shadow-card">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Row 1: name + email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300">{t("contact.name")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("contact.ph.name")}
                                {...field}
                                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus:border-brand-500/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300">{t("contact.email")}</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder={t("contact.ph.email")}
                                {...field}
                                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus:border-brand-500/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Row 2: phone + company (both optional) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300">
                              {t("contact.phone")} <span className="text-slate-500 text-xs">{t("contact.optional")}</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder={t("contact.ph.phone")}
                                {...field}
                                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus:border-brand-500/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300">
                              {t("contact.company")} <span className="text-slate-500 text-xs">{t("contact.optional")}</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("contact.ph.company")}
                                {...field}
                                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus:border-brand-500/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Service select */}
                    <FormField
                      control={form.control}
                      name="service"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">{t("contact.service")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-slate-950 border-slate-800 text-white focus:border-brand-500/50">
                                <SelectValue placeholder={t("contact.ph.service")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-slate-900 border-slate-800 text-white">
                              {CONTACT_SERVICES.map((s) => (
                                <SelectItem key={s} value={s}>{t(`serviceOpt.${s}`)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Message */}
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">{t("contact.message")}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t("contact.ph.message")}
                              className="min-h-32 resize-none bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus:border-brand-500/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-primary text-primary-foreground font-semibold"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? t("contact.submitting") : t("contact.submit")}
                      {!mutation.isPending && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>

            {/* RIGHT: contact info sidebar */}
            <div className="space-y-6">
              <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6 space-y-6 shadow-card">
                <h3 className="font-bold text-lg text-white">{t("contact.info")}</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-brand-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-slate-300">{t("contact.emailLabel")}</p>
                      <p className="text-sm text-slate-400">{CONTACT_EMAIL}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-brand-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-slate-300">{t("contact.phoneLabel")}</p>
                      <p className="text-sm text-slate-400">{t("contact.phoneVal")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-brand-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-slate-300">{t("contact.responseLabel")}</p>
                      <p className="text-sm text-slate-400">{t("contact.responseVal")}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-brand-500/10 to-slate-900 border border-brand-500/20 p-6 space-y-4 shadow-card">
                <h3 className="font-bold text-lg text-white">{t("contact.quick.title")}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{t("contact.quick.body")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
```

### Service dropdown options

`CONTACT_SERVICES` (from `shared/taxonomy.ts`), rendered via `t(\`serviceOpt.${s}\`)`:

| value | EN label | AR label |
|---|---|---|
| `foundation` | Foundation | Foundation *(untranslated — see note)* |
| `growth-engine` | Growth Engine | Growth Engine *(untranslated)* |
| `scale-infrastructure` | Scale Infrastructure | Scale Infrastructure *(untranslated)* |
| `custom` | Custom Transformation | Custom Transformation *(untranslated)* |
| `not-sure` | Not sure yet | لست متأكداً بعد |

> Note: the first four solution-name options are deliberately **left in English in the Arabic
> dictionary** too (`client/src/lib/i18n.tsx:871-874`) — only "not sure yet" is translated. This
> looks like an intentional choice (solution names function as proper-noun product names, similar
> to how brand name/CONTACT_EMAIL are never translated per CLAUDE.md), but flagging it since it's
> not explicitly documented as a rule — confirm before porting whether 1D should keep this or
> translate them.

### Full EN copy

```
contact.title            = "Let's talk"
contact.sub              = "Tell us about your business and what's slowing it down. We'll tell you honestly if we can help."
contact.name             = "Name"
contact.email            = "Email"
contact.phone            = "Phone"
contact.optional         = "(optional)"
contact.company          = "Company"
contact.service          = "What do you need?"
contact.message          = "Message"
contact.ph.name          = "Your name"
contact.ph.email         = "you@company.com"
contact.ph.phone         = "+20 100 000 0000"
contact.ph.company       = "Your Company"
contact.ph.service       = "Select a service"
contact.ph.message       = "Tell us about your project goals..."
contact.submit           = "Send message"
contact.submitting       = "Sending…"
contact.info             = "Contact details"
contact.emailLabel       = "Email"
contact.phoneLabel       = "Phone"
contact.phoneVal         = "Available on request"
contact.responseLabel    = "Response Time"
contact.responseVal      = "Within 24 hours on business days"
contact.quick.title      = "Quick Response Guarantee"
contact.quick.body       = "We typically respond to all inquiries within 24 hours during business days. For urgent matters, please mention it in your message."
contact.toast.success    = "Message sent — we'll get back to you within 24 hours."
contact.toast.error      = "Something went wrong — please try again, or email us directly."
```

### Full AR copy

```
contact.title            = "لنتحدث"
contact.sub              = "أخبرنا عن أعمالك وما الذي يبطّئها، وسنخبرك بصراحة إن كنا نستطيع مساعدتك."
contact.name             = "الاسم"
contact.email            = "البريد الإلكتروني"
contact.phone            = "الهاتف"
contact.optional         = "(اختياري)"
contact.company          = "الشركة"
contact.service          = "ما الذي تحتاجه؟"
contact.message          = "الرسالة"
contact.ph.name          = "اسمك"
contact.ph.email         = "you@company.com"
contact.ph.phone         = "+20 100 000 0000"
contact.ph.company       = "اسم شركتك"
contact.ph.service       = "اختر خدمة"
contact.ph.message       = "أخبرنا عن أهداف مشروعك..."
contact.submit           = "إرسال الرسالة"
contact.submitting       = "جارٍ الإرسال…"
contact.info             = "بيانات التواصل"
contact.emailLabel       = "البريد الإلكتروني"
contact.phoneLabel       = "الهاتف"
contact.phoneVal         = "متاح عند الطلب"
contact.responseLabel    = "وقت الاستجابة"
contact.responseVal      = "خلال 24 ساعة في أيام العمل"
contact.quick.title      = "ضمان الاستجابة السريعة"
contact.quick.body       = "نردّ عادةً على كل الاستفسارات خلال 24 ساعة في أيام العمل. وإن كان الأمر عاجلاً، اذكر ذلك في رسالتك."
contact.toast.success    = "تم إرسال الرسالة — سنعاود التواصل معك خلال 24 ساعة."
contact.toast.error      = "حدث خطأ ما — حاول مجدداً، أو راسلنا مباشرةً عبر البريد."
```

### Success / error states

Both are **toast notifications**, not inline page states — there is no success/error banner
rendered in the page body:
- Success → `useToast()` fires `{ title: t("contact.toast.success") }`, then `form.reset()`
  clears all fields back to defaults (service resets to `requestedService()`, re-reading the URL
  param).
- Error → `useToast()` fires `{ title: t("contact.toast.error"), variant: "destructive" }`. Form
  values are **not** cleared on error (user doesn't lose their input).

---

## 2. Form submission logic (client)

- **Form lib:** `react-hook-form` + `@hookform/resolvers/zod`, resolver = `zodResolver(contactFormSchema)` (the schema is shared with the server — see §5).
- **Validation:** entirely client-side via the Zod schema at submit time (react-hook-form's default `onSubmit` validation mode — no live/`onChange` validation configured, no debounced field-level checks).
- **Mutation:** TanStack Query `useMutation`:
  ```ts
  const mutation = useMutation({
    mutationFn: (data: ContactFormData) => apiRequest("POST", "/api/contact", data),
    onSuccess: () => { toast(...); form.reset(); },
    onError: () => { toast(...); },
  });
  ```
- **`apiRequest`** (from `client/src/lib/queryClient.ts`) — wraps `fetch` with `credentials: "include"`, JSON-stringifies `data`, sets `Content-Type: application/json`. **Returns the raw `Response`**, not parsed JSON — the mutation here never calls `.json()` on it (it only cares about resolve/reject via `.ok`, which `apiRequest` itself throws on for non-2xx — check `queryClient.ts` for the exact throw behavior before porting).
- **Endpoint:** `POST /api/contact`
- **Request body shape:** exactly `ContactFormData`:
  ```ts
  { name: string; email: string; phone?: string; company?: string; service: ContactService; message: string }
  ```
- **Loading/pending state:** `mutation.isPending` — disables the submit `Button` and swaps its label to `contact.submitting` ("Sending…"/"جارٍ الإرسال…"), hides the trailing arrow icon while pending.
- **wouter/react-query idiom flag:** `useMutation` + toast-on-settle is a client-only pattern. Porting to Next Server Actions means either (a) keeping this as a client component calling a Server Action via `useTransition`/`useFormState`, with the pending flag coming from `isPending` of `useTransition` instead of react-query, or (b) using `<form action={...}>` progressive enhancement, in which case the toast-based success/error UX needs rethinking (no mutation object to hook `onSuccess`/`onError` off of — you'd read the Server Action's return value instead).

---

## 3. Server side — lead write + email

Source: [server/routes.ts](server/routes.ts) (`POST /api/contact`, lines 359–379) and
[server/storage.ts](server/storage.ts) (`createLead`, `notifyNewLead` helper in routes.ts).

### Route handler (verbatim)

```ts
// --- CONTACT / LEADS ---

// Public: persist a lead, then (optionally) notify by email.
app.post("/api/contact", async (req, res) => {
  let validated;
  try {
    validated = contactFormSchema.parse(req.body);
  } catch (error) {
    return res.status(400).json({ success: false, message: "Invalid form data." });
  }

  try {
    const lead = await storage.createLead(validated);
    // Fire-and-forget — the lead is already saved; email must never fail the request.
    void notifyNewLead(lead);
    res.json({ success: true, message: "Thank you for your inquiry." });
  } catch (error) {
    console.error("[contact] Failed to save lead:", error);
    res.status(500).json({ success: false, message: "Could not submit right now. Please try again." });
  }
});
```

Response shape is always `{ success: boolean; message: string }` — `apiRequest`'s throw-on-`!ok`
behavior is what the client mutation actually keys off, not this JSON body's `success` field (the
client never inspects it).

### DB insert (`storage.ts` → `createLead`)

```ts
async createLead(data: ContactFormData): Promise<Lead> {
  const [lead] = await db.insert(leads).values({
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    company: data.company || null,
    service: data.service,
    message: data.message,
    source: "contact",
  }).returning();
  return lead;
}
```

Columns populated: `name`, `email`, `phone` (null if empty), `company` (null if empty), `service`,
`message`, `source` (hardcoded `"contact"`). `status` defaults to `"new"` (DB default), `createdAt`
defaults to `now()` (DB default), `id` is serial.

### Server-side validation

Yes — `contactFormSchema.parse(req.body)` (same shared Zod schema the client uses, from
`@shared/schema`). No re-validation happens in `storage.ts`; by the time `createLead` runs the data
is already the parsed/typed `ContactFormData`.

### Resend integration (`notifyNewLead`, routes.ts lines 70–102)

```ts
// Fire-and-forget lead notification. NEVER blocks or fails the API response.
// Skipped silently when RESEND_API_KEY is not configured.
async function notifyNewLead(lead: Lead) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("[leads] RESEND_API_KEY not set — skipping email notification (lead saved to DB).");
    return;
  }
  try {
    const resend = new Resend(apiKey);
    const to = process.env.NOTIFY_EMAIL || CONTACT_EMAIL;
    // Source-aware + null-safe: newsletter leads carry only an email.
    await resend.emails.send({
      from: "OmniflowAI Leads <onboarding@resend.dev>",
      to,
      subject: `New ${lead.source} lead: ${lead.name || lead.email}`,
      text: [
        `Source: ${lead.source}`,
        `Name: ${lead.name || "-"}`,
        `Email: ${lead.email}`,
        `Phone: ${lead.phone || "-"}`,
        `Company: ${lead.company || "-"}`,
        `Service: ${lead.service || "-"}`,
        "",
        "Message:",
        lead.message || "-",
      ].join("\n"),
    });
    console.log(`[leads] Notification email sent to ${to}.`);
  } catch (err) {
    console.error("[leads] Email notification failed (lead already saved):", err);
  }
}
```

- **From:** `"OmniflowAI Leads <onboarding@resend.dev>"` — hardcoded, **not** an env var. This is
  Resend's shared sandbox sender domain (`resend.dev`), not a verified custom domain. Flag for 1D:
  if a real domain is verified in Resend for the new app, this should probably become a real
  `from` address/env var instead of carrying over the sandbox one.
- **To:** `process.env.NOTIFY_EMAIL || CONTACT_EMAIL` (`CONTACT_EMAIL` = `"contact@omniflowai.net"`,
  itself a `TODO(email-final)` placeholder in `shared/taxonomy.ts`).
- **Subject:** `` `New ${lead.source} lead: ${lead.name || lead.email}` `` — e.g. `"New contact
  lead: Jane Doe"` or `"New newsletter lead: jane@x.com"` (newsletter leads have no `name`, so it
  falls back to the email).
- **Body:** plain text (no HTML template), built as a joined-line list — Source/Name/Email/Phone/
  Company/Service, blank line, "Message:", message body. All optional fields fall back to `"-"`.
- **Failure handling:** email send is **fully decoupled** from the HTTP response. `void
  notifyNewLead(lead)` is fired without `await`; the route responds immediately after
  `storage.createLead` succeeds. If Resend throws, it's caught inside `notifyNewLead` and only
  `console.error`'d — the client never sees it, and the lead row is already committed regardless.
  **The lead write always succeeds or fails independently of the email.**

---

## 4. Newsletter (footer signup)

Source: [client/src/components/Footer.tsx](client/src/components/Footer.tsx) (`NewsletterForm`,
lines 124–165) — **this is fully wired**, not markup-only, in the old app.

### Markup (verbatim)

```tsx
function NewsletterForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await apiRequest("POST", "/api/subscribe", { email });
      toast({ title: t("footer.toast.subscribed") });
      setEmail("");
    } catch {
      toast({ title: t("footer.toast.error"), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("footer.newsletter.placeholder")}
        className="bg-slate-950 border-slate-800 text-white text-xs h-10 focus-visible:ring-brand-500"
      />
      <Button
        type="submit"
        size="icon"
        disabled={submitting}
        aria-label={t("footer.newsletter.placeholder")}
        className="h-10 w-10 bg-primary text-primary-foreground"
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
}
```

Rendered inside the footer's "Stay Connected" column:

```tsx
<div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 space-y-4">
  <p className="text-xs text-slate-400">{t("footer.newsletter.text")}</p>
  <NewsletterForm />
</div>
```

Notes:
- **No react-hook-form here** — plain `useState` for the email string + a local `submitting`
  boolean. This is a different pattern from the Contact page's react-hook-form/Zod setup; if 1D
  wants consistency, this could be upgraded, but that would be a deliberate deviation from what
  the old app did, not a straight port.
- **Client-side validation:** none beyond `if (!email.trim()) return` (empty-string guard) and the
  native `type="email"` browser validation. No Zod resolver on the client for this form — the
  `newsletterSchema` Zod email check only runs server-side.
- **Endpoint:** `POST /api/subscribe`, body `{ email: string }`.
- **Success/error:** same toast pattern as Contact — `footer.toast.subscribed` / `footer.toast.error`, input cleared on success only.

### Server side (`POST /api/subscribe`, routes.ts lines 409–427)

```ts
// --- NEWSLETTER ---

// Public: newsletter signup → stored as a lead (source="newsletter") so it
// surfaces in /admin/leads, then the same fire-and-forget notify as contact.
app.post("/api/subscribe", async (req, res) => {
  const parsed = newsletterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Invalid email." });
  }
  try {
    const lead = await storage.createNewsletterLead(parsed.data.email);
    // Fire-and-forget — lead is already saved; email must never fail the request.
    void notifyNewLead(lead);
    res.json({ success: true });
  } catch (error) {
    console.error("[subscribe] Failed to save newsletter lead:", error);
    res.status(500).json({ success: false, message: "Could not subscribe right now." });
  }
});
```

`storage.createNewsletterLead` (storage.ts lines 148–154):

```ts
// Newsletter signup: email only. name/service/message stay null (absent, not
// faked); tagged source="newsletter" so admin can distinguish it.
async createNewsletterLead(email: string): Promise<Lead> {
  const [lead] = await db.insert(leads).values({
    email,
    source: "newsletter",
  }).returning();
  return lead;
}
```

**Yes** — writes a `leads` row with `source: "newsletter"`, `name`/`phone`/`company`/`service`/
`message` all left `null` (DB defaults), `status` defaults to `"new"`. Same `notifyNewLead` fire-
and-forget email as contact, reusing the same from/to/subject/body logic (subject becomes `"New
newsletter lead: {email}"` since `name` is null).

### Footer newsletter copy

EN:
```
footer.newsletter.text        = "Practical notes on AI, marketing, and the systems that connect them — straight to your inbox."
footer.newsletter.placeholder = "Enter your email"
footer.toast.subscribed       = "Thanks — you're subscribed."
footer.toast.error            = "Something went wrong, please try again."
```

AR:
```
footer.newsletter.text        = "ملاحظات عملية حول الذكاء الاصطناعي والتسويق والأنظمة التي تربطها — إلى بريدك مباشرة."
footer.newsletter.placeholder = "أدخل بريدك الإلكتروني"
footer.toast.subscribed       = "شكراً — تم اشتراكك."
footer.toast.error            = "حدث خطأ ما، حاول مجدداً."
```

**For 1D:** since this was fully wired (not just markup) in the old app, wiring it in the Next app
is a faithful port, not new scope — worth deciding explicitly either way, but the old app's
behavior is "yes, it writes leads with `source='newsletter'` and sends the same notification
email."

---

## 5. Validation / schema

Source: [shared/schema.ts](shared/schema.ts) lines 8–24, and the `leads` table definition (lines
113–139).

### `contactFormSchema`

```ts
export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  service: z.enum(CONTACT_SERVICES),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
export type ContactFormData = z.infer<typeof contactFormSchema>;
```

No max-length caps on any field (no `.max(...)` anywhere in this schema). `phone`/`company` have no
format validation beyond being optional strings.

### `newsletterSchema`

```ts
export const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
});
export type NewsletterData = z.infer<typeof newsletterSchema>;
```

### `leads` table (Drizzle)

```ts
export const LEAD_STATUSES = ["new", "read", "archived"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

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

export const insertLeadSchema = createInsertSchema(leads);
export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
```

Every field except `id`/`email`/`source`/`status`/`createdAt` is nullable at the DB level — this is
deliberate, so a newsletter lead's `name`/`phone`/`company`/`service`/`message` are genuinely
`null`, never a faked/empty-string placeholder (see the comment at schema.ts:124–126).

### `CONTACT_SERVICES` (shared/taxonomy.ts lines 62–75)

```ts
export const CONTACT_SERVICES = [
  "foundation",
  "growth-engine",
  "scale-infrastructure",
  "custom",
  "not-sure",
] as const;
export type ContactService = (typeof CONTACT_SERVICES)[number];
```

---

## 6. Resend config

Env vars (from `.env.example`):

```bash
# --- Lead email notifications (optional) ---
# If set, a notification email is sent (via Resend) on each new lead. If unset,
# email is skipped silently and the lead is still saved to the database.
RESEND_API_KEY=
# Destination for lead notification emails. Falls back to the app's CONTACT_EMAIL
# constant if unset.
NOTIFY_EMAIL=
```

| Var | Required? | Fallback |
|---|---|---|
| `RESEND_API_KEY` | No | email notification skipped entirely, logged, lead still saved |
| `NOTIFY_EMAIL` | No | falls back to `CONTACT_EMAIL` (`"contact@omniflowai.net"`, itself a `TODO(email-final)` placeholder) |

**Domain/sender specifics to flag for 1D:**
- `from` address is **hardcoded** in code, not an env var: `"OmniflowAI Leads <onboarding@resend.dev>"`.
  `onboarding@resend.dev` is Resend's shared sandbox/test sender — it works without any domain
  verification but is not a production-grade "from" identity (deliverability/branding-wise). 1D
  needs to decide: keep hardcoded (simplest, matches old app exactly) vs. make it an env var vs.
  switch to a verified sending domain if one exists for the new deployment.
- No SPF/DKIM/domain-verification setup exists in this codebase — Resend's sandbox sender doesn't
  need it, but a real domain would.
- No rate limiting, no CAPTCHA, no spam protection anywhere in the contact/newsletter path.

---

## Summary of "not present" items

- No inline success/error banner on the Contact page — toast only.
- No client-side max-length validation on any contact field.
- No captcha/honeypot/rate-limiting on `/api/contact` or `/api/subscribe`.
- No HTML email template — plain text only.
- No per-service routing of notification emails — all leads (contact and newsletter) go to the
  same single `NOTIFY_EMAIL`/`CONTACT_EMAIL` address.
- Newsletter form does not use react-hook-form/Zod client-side (Contact page does) — an
  inconsistency in the old app, not a missing feature.
