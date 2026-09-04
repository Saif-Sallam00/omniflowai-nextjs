import { Clock, Mail, Phone } from "lucide-react";
import { buildPageMetadata } from "@/lib/metadata";
import { CONTACT_EMAIL, parseContactService } from "@/lib/contact";
import { ContactForm } from "@/components/contact-form";

const LANGUAGE = "en" as const;

export function generateMetadata() {
  return buildPageMetadata({
    path: "/contact",
    language: LANGUAGE,
    title: "Contact",
    description:
      "Tell us about your business and what's slowing it down. We'll tell you honestly if we can help.",
  });
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  const defaultService = parseContactService(service);

  return (
    <div className="min-h-screen bg-slate-950 pt-20 text-white">
      <section className="relative py-20 md:py-24">
        <div className="pointer-events-none absolute start-0 top-0 h-[50%] w-[50%] bg-gradient-to-br from-orange-950/20 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h1 className="mb-6 font-display text-5xl font-bold text-white md:text-6xl">
              Let&apos;s talk
            </h1>
            <p className="text-xl text-slate-400">
              Tell us about your business and what&apos;s slowing it down. We&apos;ll tell you
              honestly if we can help.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 shadow-card">
                <ContactForm language={LANGUAGE} defaultService={defaultService} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-6 rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-card">
                <h3 className="text-lg font-bold text-white">Contact details</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-5 w-5 text-brand-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-300">Email</p>
                      <p className="text-sm text-slate-400">{CONTACT_EMAIL}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-5 w-5 text-brand-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-300">Phone</p>
                      <p className="text-sm text-slate-400">Available on request</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 text-brand-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-300">Response Time</p>
                      <p className="text-sm text-slate-400">Within 24 hours on business days</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-brand-500/20 bg-gradient-to-br from-brand-500/10 to-slate-900 p-6 shadow-card">
                <h3 className="text-lg font-bold text-white">Quick Response Guarantee</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  We typically respond to all inquiries within 24 hours during business days. For
                  urgent matters, please mention it in your message.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
