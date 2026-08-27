import { Clock, Mail, Phone } from "lucide-react";
import { buildPageMetadata } from "@/lib/metadata";
import { CONTACT_EMAIL, parseContactService } from "@/lib/contact";
import { ContactForm } from "@/components/contact-form";

const LANGUAGE = "ar" as const;

export function generateMetadata() {
  return buildPageMetadata({
    path: "/contact",
    language: LANGUAGE,
    title: "لنتحدث",
    description: "أخبرنا عن أعمالك وما الذي يبطّئها، وسنخبرك بصراحة إن كنا نستطيع مساعدتك.",
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
              لنتحدث
            </h1>
            <p className="text-xl text-slate-400">
              أخبرنا عن أعمالك وما الذي يبطّئها، وسنخبرك بصراحة إن كنا نستطيع مساعدتك.
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
                <h3 className="text-lg font-bold text-white">بيانات التواصل</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-5 w-5 text-brand-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-300">البريد الإلكتروني</p>
                      <p className="text-sm text-slate-400">{CONTACT_EMAIL}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-5 w-5 text-brand-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-300">الهاتف</p>
                      <p className="text-sm text-slate-400">متاح عند الطلب</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 text-brand-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-300">وقت الاستجابة</p>
                      <p className="text-sm text-slate-400">خلال 24 ساعة في أيام العمل</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-brand-500/20 bg-gradient-to-br from-brand-500/10 to-slate-900 p-6 shadow-card">
                <h3 className="text-lg font-bold text-white">ضمان الاستجابة السريعة</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  نردّ عادةً على كل الاستفسارات خلال 24 ساعة في أيام العمل. وإن كان الأمر عاجلاً،
                  اذكر ذلك في رسالتك.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
