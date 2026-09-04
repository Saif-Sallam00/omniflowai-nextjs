import Link from "next/link";
import { Award, Shield, Target, Users } from "lucide-react";
import { buildPageMetadata } from "@/lib/metadata";
import { getLanguagePath } from "@/lib/language";

const LANGUAGE = "ar" as const;

export function generateMetadata() {
  return buildPageMetadata({
    path: "/about",
    language: "ar",
    title: "من نحن",
    description:
      "‏OmniflowAI شريك في التحول الرقمي يقوم على قناعة واحدة: معظم الشركات لا تحتاج مزيداً من الأدوات — بل تحتاج الأنظمة الصحيحة، مبنية بإتقان ومترابطة كما ينبغي.",
  });
}

const VALUES = [
  {
    icon: Shield,
    title: "الأنظمة قبل الخدمات",
    desc: "لا نبيع مخرجات منعزلة. كل ما نبنيه مصمَّم ليترابط وتتضاعف قيمته.",
  },
  {
    icon: Target,
    title: "الملكية لك",
    desc: "نقل كامل للشيفرة المصدرية والملكية الفكرية في كل مشروع. ما تدفع مقابله يصبح ملكك.",
  },
  {
    icon: Users,
    title: "بقيادة هندسية",
    desc: "تتعامل مباشرةً مع من يبنون أنظمتك، لا مع مدير حسابات ينقل الرسائل.",
  },
  {
    icon: Award,
    title: "نُقاس بالنتائج",
    desc: "نربط عملنا بنتائج الأعمال — إيرادات وكفاءة واستقطاب — لا بساعات مسجّلة أو مخرجات مُسلّمة.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 pt-20 text-white">
      {/* 1. Hero */}
      <section className="relative overflow-hidden py-20 md:py-24">
        <div className="pointer-events-none absolute right-0 top-0 h-[60%] w-[50%] bg-gradient-to-bl from-orange-950/30 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center md:px-8">
          <div className="mx-auto max-w-4xl">
            <span className="mb-6 inline-block rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-brand-400">
              من نحن
            </span>
            <h1 className="mb-8 font-display text-4xl font-bold leading-tight text-white md:text-6xl">
              مهندسون يفهمون <span className="text-brand-400">الأعمال.</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-slate-400">
              {"‏"}
              <span dir="ltr">OmniflowAI</span> شريك في التحول الرقمي يقوم على
              قناعة واحدة: معظم الشركات لا تحتاج مزيداً من الأدوات — بل تحتاج
              الأنظمة الصحيحة، مبنية بإتقان ومترابطة كما ينبغي.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Story */}
      <section className="border-y border-slate-800/30 bg-slate-900/30 py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div className="group relative">
              <div className="absolute inset-0 translate-x-2 translate-y-2 rotate-2 transform rounded-xl bg-brand-500 opacity-20 transition-opacity group-hover:opacity-30" />
              {/* No team photo asset exists yet — structural placeholder for @/assets/team_images. */}
              <div className="relative flex aspect-video w-full items-center justify-center rounded-xl border border-slate-800 bg-slate-900 object-cover shadow-elevated">
                <Users className="h-12 w-12 text-slate-700" />
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
                أسّسنا <span dir="ltr">OmniflowAI</span> لسدّ فجوة.
              </h2>
              <div className="prose prose-lg space-y-6 text-slate-400">
                <p>
                  تُباع لكثير من الشركات أجزاء غير مترابطة — موقع هنا، وحملة
                  إعلانية هناك، وأداة لا يدمجها أحد — وتُترك لتجمّعها بنفسها.
                  والنتيجة تشتّت مكلف: برمجيات لا تتحاور، وتسويق لا يحوّل،
                  وغياب رؤية واضحة لما ينجح.
                </p>
                <p>
                  نحن نفعل العكس. نبدأ من طريقة عمل شركتك الفعلية، ثم نصمّم
                  ونبني الأنظمة التي تلائمها — برمجيات وتسويق وأتمتة تعمل
                  ككلٍّ واحد. أنت تملك كل ما نبنيه. لا احتكار، ولا تبعية، ولا
                  صناديق مغلقة.
                </p>
                <p>
                  نعمل كمهندسين لا كمنفّذي طلبات: يهمّنا تحقيق نتائج تستطيع
                  قياسها، وأنظمة تدوم بعد انتهاء التعاون، وتسليمك المفاتيح في
                  النهاية.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Values */}
      <section className="border-y border-slate-800/30 bg-slate-900/30 py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-card transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/60"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">{value.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CTA */}
      <section className="relative overflow-hidden py-24 text-center md:py-32">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-orange-950/20 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto max-w-3xl px-6 md:px-8">
          <h2 className="mb-6 font-display text-3xl font-bold text-white">
            لنرسم خريطة أنظمتك
          </h2>
          <p className="mb-8 text-lg text-slate-400">
            نحن لا نسلّم مخرجات ونمضي. نحن نبني أنظمة تستمر في العمل حتى بعد
            انتهاء تعاوننا.
          </p>
          <Link href={getLanguagePath("/contact", LANGUAGE)}>
            <span className="inline-flex rounded-full bg-primary px-8 py-6 text-lg font-bold text-primary-foreground shadow-sm">
              احجز مكالمة استراتيجية
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
