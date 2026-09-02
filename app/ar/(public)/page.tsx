import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Bot, Target, Layers } from "lucide-react";
import { buildPageMetadata } from "@/lib/metadata";
import { getLanguagePath } from "@/lib/language";
import { Reveal } from "@/components/reveal";
import { ValuePropReveal } from "@/components/value-prop-reveal";
import { HowWeWorkTimeline } from "@/components/how-we-work-timeline";
import { LogoMarquee } from "@/components/logo-marquee";
import { InteractiveSystemMap, type InteractiveNode } from "@/components/interactive-system-map";
import { HexGridSubstrate } from "@/components/systems/hex-grid-substrate";
import { CLIENTS } from "@/lib/clients";

const LANGUAGE = "ar" as const;

export function generateMetadata() {
  return buildPageMetadata({
    path: "/",
    language: "ar",
    title: "معظم الفِرق تبدأ باختيار الأداة. نحن نبدأ بالتشخيص.",
    description:
      "ذكاء اصطناعي، تسويق، برمجيات، أتمتة — لا نبني إلا ما يدعمه التشخيص. ننظر قبل أن نلمس، ليلائم ما نبنيه طريقة عمل أعمالك فعلاً.",
  });
}

const SYSTEM_MAP_CENTER = "نظام الأعمال";
const SYSTEM_MAP_ARIA =
  "نظام أعمال مترابط: تمكين الذكاء الاصطناعي، وأنظمة التسويق، وتقنية الأعمال، والأتمتة، وإدارة العملاء، والاستراتيجية، تترابط جميعها في نظام مركزي واحد.";

// Icons resolved inside InteractiveSystemMap (id → icon fallback map) — a
// server component can't pass icon components as client-component props.
const heroSystemNodes: InteractiveNode[] = [
  { id: "ai-training", label: "تمكين الذكاء الاصطناعي" },
  { id: "marketing", label: "أنظمة التسويق" },
  { id: "software", label: "تقنية الأعمال" },
  { id: "automation", label: "الأتمتة" },
  { id: "crm", label: "إدارة العملاء" },
  { id: "strategy", label: "الاستراتيجية" },
];

const PILLARS = [
  {
    href: "/services/ai-training",
    icon: Bot,
    title: "تمكين الذكاء الاصطناعي",
    body: "نقدّم برامج منظّمة لتبنّي الذكاء الاصطناعي للفرق والقيادات — من جلسات استراتيجية للمدراء إلى دمج عملي في سير العمل. الهدف ليس مجرد المعرفة، بل قدرة تشغيلية حقيقية: أن يستخدم فريقك الذكاء الاصطناعي في عمل حقيقي، لا أن يشاهد عرضاً توضيحياً فحسب.",
  },
  {
    href: "/services/digital-marketing",
    icon: Target,
    title: "أنظمة التسويق",
    body: "تحسين محركات البحث والحملات المدفوعة واستراتيجية التحويل، مدمجة في محرك واحد يستهدف المشترين المؤهّلين — لا الزيارات الشكلية. كل مرحلة قابلة للقياس، لتعرف كم يكلّفك العميل المحتمل فعلاً ومن أين تأتي الإيرادات.",
  },
  {
    href: "/services/software",
    icon: Layers,
    title: "تقنية الأعمال",
    body: (
      <>
        الأنظمة التي تدير أعمالك — منصّات تخطيط موارد المؤسسات (
        <span dir="ltr">ERP</span>) وإدارة علاقات العملاء (
        <span dir="ltr">CRM</span>)، ومواقع موجّهة للعملاء، وتطبيقات الجوال،
        والأتمتة التي تربطها معاً. مبنية لتملكها وتدمجها وتوسّعها، لا
        لتستأجرها.
      </>
    ),
    subcaps: (
      <>
        أنظمة الأعمال (<span dir="ltr">ERP/CRM</span>) · منصّات الويب ·
        تطبيقات الجوال · الأتمتة والذكاء الاصطناعي
      </>
    ),
  },
];

const TRANSFORM_BEFORE = [
  "أدوات لا تتواصل فيما بينها",
  "تسويق منفصل عن العمليات التشغيلية",
  "عمل يدوي يبطّئ كل شيء",
  "غياب رؤية واضحة لما ينجح فعلاً",
];

const TRANSFORM_AFTER = [
  "نظام أعمال واحد متكامل",
  "ترابط بين الاستقطاب والتحويل والعمليات",
  "سير عمل مؤتمت في الشركة كلها",
  "رؤية لحظية للأداء",
];

const HOW_WE_WORK = [
  {
    step: "01",
    title: "التشخيص",
    desc: "نرسم خريطة نموذج عملك وأنظمتك والعوائق التي تبطّئ نموّك.",
  },
  {
    step: "02",
    title: "التصميم",
    desc: "نصمّم المزيج المناسب من البرمجيات والتسويق والأتمتة بما يلائم طريقة عملك الفعلية.",
  },
  {
    step: "03",
    title: "البناء",
    desc: "نطوّر النظام وندمجه ونسلّمك ملكيته الكاملة.",
  },
  {
    step: "04",
    title: "التحسين",
    desc: "نواصل تحسينه استناداً إلى بيانات أعمالك الحقيقية.",
  },
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* 1. Hero */}
      <section className="relative mt-16 flex min-h-[80vh] items-center overflow-hidden py-20 md:mt-20 md:py-28">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-orange-950/10 via-transparent to-transparent" />
        <HexGridSubstrate className="absolute inset-0" opacity={0.035} fade="radial" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 md:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
            <div className="text-center lg:text-start">
              <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                معظم الفِرق تبدأ باختيار الأداة.{" "}
                <span className="text-brand-400">نحن نبدأ بالتشخيص.</span>
              </h1>
              <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl lg:mx-0">
                ذكاء اصطناعي، تسويق، برمجيات، أتمتة — لا نبني إلا ما يدعمه
                التشخيص. ننظر قبل أن نلمس، ليلائم ما نبنيه طريقة عمل أعمالك
                فعلاً.
              </p>
              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                <Link href={getLanguagePath("/contact", LANGUAGE)}>
                  <span className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-8 font-bold text-primary-foreground shadow-sm transition hover:brightness-110 sm:w-auto md:h-14">
                    احجز مكالمة استراتيجية <ArrowRight className="ms-2 h-5 w-5" />
                  </span>
                </Link>
                <Link href={getLanguagePath("/portfolio", LANGUAGE)}>
                  <span className="inline-flex h-12 w-full items-center justify-center rounded-full border border-slate-700 px-8 text-slate-300 transition hover:bg-white/10 hover:text-white sm:w-auto md:h-14">
                    استعرض أعمالنا
                  </span>
                </Link>
              </div>
            </div>

            <div className="mx-auto w-full max-w-sm lg:max-w-none">
              <InteractiveSystemMap
                centerLabel={SYSTEM_MAP_CENTER}
                nodes={heroSystemNodes}
                ariaLabel={SYSTEM_MAP_ARIA}
                isRTL={true}
                width={480}
                height={460}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trust strip + client-logo marquee */}
      <section className="overflow-hidden border-y border-black/[0.06] bg-surface py-20 md:py-24">
        <div className="mx-auto mb-16 flex max-w-4xl flex-col items-center px-6 text-center md:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
            </span>
            شركاء نثق بهم
          </span>
          <h2 className="mt-5 max-w-3xl text-balance text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            موثوقون من علاماتٍ تجارية في الولايات المتحدة ودول الخليج ومصر
          </h2>

          <dl className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3 md:gap-6">
            <div className="flex flex-col items-center text-center">
              <dd className="flex min-h-[3rem] items-center justify-center text-4xl font-bold leading-tight tabular-nums text-brand-600 md:min-h-[3.5rem] md:text-5xl">
                50+
              </dd>
              <dt className="mt-3 text-sm text-slate-600 md:text-base">مشروعٌ منجز</dt>
            </div>
            <div className="flex flex-col items-center text-center">
              <dd className="flex min-h-[3rem] items-center justify-center text-4xl font-bold leading-tight tabular-nums text-brand-600 md:min-h-[3.5rem] md:text-5xl">
                8
              </dd>
              <dt className="mt-3 text-sm text-slate-600 md:text-base">دول</dt>
            </div>
            <div className="flex flex-col items-center text-center">
              <dd className="flex min-h-[3rem] items-center justify-center text-2xl font-bold leading-tight text-brand-600 md:min-h-[3.5rem] md:text-3xl">
                تغطية كاملة لدول الخليج
              </dd>
              <dt className="mt-3 text-sm text-slate-600 md:text-base">+ الولايات المتحدة ومصر</dt>
            </div>
          </dl>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-slate-500">
            {[
              "مصر",
              "السعودية",
              "الإمارات",
              "قطر",
              "الكويت",
              "البحرين",
              "عُمان",
              "الولايات المتحدة",
            ].flatMap((country, i) =>
              i === 0
                ? [<span key={country}>{country}</span>]
                : [
                    <span key={`sep-${i}`} aria-hidden="true" className="text-slate-300">
                      ·
                    </span>,
                    <span key={country}>{country}</span>,
                  ],
            )}
          </div>
        </div>

        <LogoMarquee clients={CLIENTS} />
      </section>

      {/* 3. Value proposition */}
      <section className="border-y border-white/[0.06] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 md:py-24">
        <ValuePropReveal
          lead="معظم الشركات لا تعاني مشكلة تسويق."
          highlight="بل تعاني مشكلة أنظمة."
          body="أدوات غير مترابطة، وعمليات تسليم يدوية، وغياب رؤية واضحة من العميل المحتمل حتى إتمام الصفقة. نحن نربط السلسلة كاملة — كيف تستقطب عملاءك، وكيف تحوّلهم، وكيف تدير أعمالك بعد انضمامهم — لتعمل الأجزاء كنظام واحد يمكنك قياسه فعلاً."
        />
      </section>

      {/* 4. Pillars / Services grid */}
      <section className="border-t border-black/[0.06] bg-surface py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <h2 className="mb-12 max-w-2xl text-3xl font-bold text-slate-900 md:mb-16 md:text-4xl">
            ثلاث قدرات. شريك تحوّل رقمي واحد.
          </h2>

          <Reveal className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {PILLARS.map((pillar) => (
              <Link key={pillar.href} href={getLanguagePath(pillar.href, LANGUAGE)}>
                <div className="card-lift group flex h-full cursor-pointer flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-card hover:border-slate-300 md:p-8">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10">
                    <pillar.icon className="h-6 w-6 text-brand-600" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold leading-snug text-slate-900">
                    {pillar.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600 md:text-base">
                    {pillar.body}
                  </p>
                  {pillar.subcaps && (
                    <p className="mt-6 border-t border-slate-200 pt-6 text-xs font-medium text-brand-700">
                      {pillar.subcaps}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* 5. Transformation (Before / After) */}
      <section className="border-y border-white/[0.06] bg-slate-950 py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-white md:mb-16 md:text-4xl">
            من أدوات متناثرة إلى نظام واحد مترابط
          </h2>

          <Reveal className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-card md:p-8">
              <p className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-400">
                قبل
              </p>
              <ul className="space-y-4">
                {TRANSFORM_BEFORE.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-400">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-brand-500/20 bg-gradient-to-br from-brand-700/15 to-slate-900/50 p-6 shadow-card md:p-8">
              <p className="mb-6 text-xs font-bold uppercase tracking-widest text-brand-400">
                بعد
              </p>
              <ul className="space-y-4">
                {TRANSFORM_AFTER.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-200">
                    <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-brand-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 8. How we work */}
      <section className="border-t border-black/[0.06] bg-surface py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <h2 className="mb-12 text-3xl font-bold text-slate-900 md:mb-16 md:text-4xl">
            كيف نعمل
          </h2>
          <HowWeWorkTimeline items={HOW_WE_WORK} />
        </div>
      </section>

      {/* 9. Global brand line */}
      <section className="border-y border-brand-500/10 bg-slate-950 bg-gradient-to-r from-brand-700/15 via-slate-950 to-brand-700/15 py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-brand-500/20 bg-brand-500/10">
                <Shield className="h-6 w-6 text-brand-400" />
              </div>
              <p className="max-w-2xl text-lg font-semibold text-white md:text-xl">
                نحن لا نسلّم مخرجات ونمضي. نحن نبني أنظمة تستمر في العمل حتى
                بعد انتهاء تعاوننا.
              </p>
            </div>
            <Link href={getLanguagePath("/contact", LANGUAGE)}>
              <span className="flex items-center whitespace-nowrap rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors">
                احجز مكالمة استراتيجية
                <ArrowRight className="ms-2 h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 10. Final CTA */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-t from-orange-950/20 via-transparent to-transparent" />

        <Reveal className="relative z-10 mx-auto max-w-3xl px-6 text-center md:px-8">
          <h2 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl">
            جاهز لتغيير طريقة إدارة أعمالك؟
          </h2>
          <p className="mb-10 text-xl leading-relaxed text-slate-400">
            احجز مكالمة استراتيجية. سننظر في أنظمتك الحالية ونوضّح لك بالضبط ما
            يعيق النمو — حتى إن لم تعمل معنا.
          </p>

          <Link href={getLanguagePath("/contact", LANGUAGE)}>
            <span className="inline-flex items-center rounded-full bg-primary px-10 py-7 text-lg font-semibold text-primary-foreground transition-colors">
              احجز مكالمتك الاستراتيجية
              <ArrowRight className="ms-2 h-5 w-5" />
            </span>
          </Link>

          <p className="mt-6 text-sm text-slate-400">بلا عروض بيعية. وضوح فقط.</p>
        </Reveal>
      </section>
    </main>
  );
}
