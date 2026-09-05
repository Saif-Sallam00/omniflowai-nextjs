import Link from "next/link";
import { buildPageMetadata } from "@/lib/metadata";
import { getLanguagePath } from "@/lib/language";
import { Disclosure } from "@/components/disclosure";
import { HexGlyph } from "@/components/hex-glyph";
import {
  SolutionsInteractive,
  type SolutionsCopy,
} from "@/components/solutions-interactive";
import { ltrNames } from "@/lib/ltr-names";
import { BusinessDiagnostic } from "@/components/business-diagnostic";

const LANGUAGE = "ar" as const;

export function generateMetadata() {
  return buildPageMetadata({
    path: "/solutions",
    language: "ar",
    title: "الحلول",
    description:
      "أعمالك تعمل بالفعل. ما تحتاجه الآن هو البنية التي تتيح لها التوسّع. نكتشف ما الذي يعيق النمو، ثم نبني أنظمة التسويق والتقنية والذكاء الاصطناعي التي تزيله.",
  });
}

const DIAG_COPY = {
  title: "تشخيص الأعمال",
  systemTitle: "نظام تشغيل النمو",
  summary: "{s} إشارات · {c} قيود جذرية",
  hint: "اختر أي إشارة لتكشف ما ترتبط به فعلاً.",
  trace: "{n} من {s} إشارات تعود إلى هذا القيد",
  buildLabel: "نبني",
  showSystem: "اعرض النظام",
  showSignals: "العودة إلى الإشارات",
  rootLabel: "قيد جذري",
  strategyLabel: "الاستراتيجية",
  strategyBody: "تشخيص الأعمال هو ما يحدّد أيّاً من الثلاثة تحتاج، وبأي ترتيب.",
  thesis: "معظم مشكلات النمو أعراضٌ لنظام واحد مفقود.",
  signals: [
    { label: "نمو غير منتظم", text: "النمو غير منتظم ولا يتراكم." },
    { label: "إنفاق لا يُقاس", text: "لا يمكن ربط الإنفاق بالإيرادات." },
    { label: "تعثّر عند التسليم", text: "العمل يتعثّر عند كل عملية تسليم." },
    { label: "تقارير يدوية", text: "كل تقرير يُعاد بناؤه يدوياً." },
    {
      label: "قرارات معتمدة على المؤسّس",
      text: "القرارات تمرّ عبر عدد قليل من الأشخاص.",
    },
    {
      label: "طاقة مقيّدة بالتوظيف",
      text: "زيادة الحجم ما زالت تعني زيادة الموظفين.",
    },
    {
      label: "تبنٍّ متعثّر للذكاء الاصطناعي",
      text: "الذكاء الاصطناعي يُناقَش ولا يُشغَّل.",
    },
  ],
  constraints: [
    {
      name: "الطلب ليس نظاماً.",
      impact: "الإيرادات تعتمد على الجهد، فلا يمكن توقّعها ولا مراكمتها.",
    },
    {
      name: "الأعمال تُدار بالأشخاص لا بالأنظمة.",
      impact: "كل عملية تحتاج شخصاً بداخلها، فيتزايد التعقيد أسرع من الإنتاج.",
    },
    {
      name: "الطاقة لا تتوسّع إلا بالتوظيف.",
      impact: "الإنتاج مسقوف بعدد الموظفين — وهو أبطأ طرق النمو وأغلاها.",
    },
  ],
};

const SOLUTIONS_COPY: SolutionsCopy = {
  router: {
    eyebrow: "تشخيص الأعمال",
    heading: "حدّد القيد الذي يعيق نموك.",
    sub: "اختر ما يقترب أكثر من وضع أعمالك، وسنوجّهك إلى نقطة البداية المناسبة.",
    questions: [
      "لدينا عملاء، لكن النمو غير منتظم.",
      "نموّنا يعتمد على زيادة عدد الموظفين بدلاً من أنظمة أفضل.",
      "لدينا أدوات، لكن لا شيء مترابط.",
      "نعلم أن الذكاء الاصطناعي مهم، لكن لا نعرف من أين نبدأ.",
      "لسنا متأكدين ما الذي تعطّل فعلاً.",
      "لدينا تحدٍّ فريد يحتاج إلى نهج مصمَّم خصيصاً.",
    ],
    resultLabel: "نقطة البداية المقترحة",
    results: [
      "يجب أن يتحوّل الاستقطاب لديك إلى نظام قبل بناء مزيد من التقنية فوقه.",
      "النمو المعتمد على زيادة الموظفين هو حدٌّ في البنية التحتية. الأنظمة هي ما يجب أن يحمل هذا العبء بدلاً من ذلك.",
      "الأدوات غير المترابطة مشكلة بنية تحتية، لا مشكلة تسويق.",
      "ابدأ بتحديد أين يحقّق الذكاء الاصطناعي عائداً فعلياً داخل سير عملك.",
      "هذا بالضبط ما وُجد التشخيص من أجله. لا ينبغي لأحد أن يبني قبل أن تتوفّر هذه الإجابة.",
      "إذن الإجابة نظام مصمَّم حول قيودك، لا نطاق مُعدّ مسبقاً.",
    ],
    unsure: "تفضّل الحديث مباشرة؟ احجز مكالمة استراتيجية.",
  },
  grid: {
    heading: "ثلاث نقاط دخول. وتشخيص أعمال واحد وراءها جميعاً.",
    sub: "هذه ليست مستويات. بل نقاط بداية مختلفة لقيود مختلفة. وتشخيص الأعمال هو ما يحدّد الملائم منها.",
    recommendedNote: "محدَّد بناءً على قيد النمو المختار أعلاه. غيّر القيد لتتغيّر التوصية معه.",
    recommendedBadge: "موصى به",
    bestForLabel: "مناسب لـ",
    problemLabel: "المشكلة",
    includedLabel: "ما الذي يشمله",
    outcomeLabel: "النتيجة",
    priceFromLabel: "يبدأ من",
  },
  bookCallLabel: "احجز مكالمة استراتيجية",
  cards: [
    {
      id: "foundation",
      name: "Foundation",
      statement: "تعرف أن النمو متوقّف، لكنك لا تعرف السبب بعد.",
      outcomeShort: "حدّد القيد قبل الإنفاق على الحلول.",
      tagline: "اكتشف ما الذي يعيق مرحلتك التالية من النمو.",
      bestFor:
        "شركات تعرف أن شيئاً ما يحدّ من نموها لكنها لا تستطيع تسميته — ولا تريد الالتزام ببناء قبل أن تستطيع.",
      problem:
        "أعمالك تنمو، لكن سبب تباطؤها ليس واضحاً من الداخل. وكل عرض يصلك يفترض إجابة لم يتحقّق منها أحد فعلاً.",
      includes: [
        {
          title: "تشخيص الأعمال",
          body: "كيف تعمل الشركة اليوم — أين يتحرّك العمل، وأين يتوقّف، ولماذا.",
          items: [
            "العمليات وسير العمل والهيكل التشغيلي",
            "أداء التسويق ورحلة استقطاب العملاء",
            "المنظومة التقنية الحالية وحدودها",
            "فجوات وضوح البيانات والتقارير",
          ],
        },
        {
          title: "تقييم النمو والاختناقات",
          body: "النقاط المحدّدة التي يُقيَّد عندها النمو، وكلفة كلٍّ منها.",
          items: [
            "أين تُفقد الفرص",
            "أي العمليات تُبطئ النمو",
            "أي عمل يدوي يحدّ من التوسّع",
            "أعلى المجالات أثراً للبدء بها",
          ],
        },
        {
          title: "خريطة فرص التسويق والتقنية",
          body: "أين تحقّق كل قدرة عائداً في هذه الأعمال — وبأي ترتيب.",
          items: [
            "تحسين محركات البحث والنمو العضوي",
            "الاستقطاب المدفوع وشراء الوسائط",
            "المسار التسويقي والتحويل",
            <span key="crm-1">
              أنظمة إدارة العملاء (<span dir="ltr">CRM</span>)
            </span>,
            "أتمتة الأعمال",
            "البرمجيات والمنصّات المخصّصة",
          ],
        },
        {
          title: "تحديد فرص الذكاء الاصطناعي",
          body: "أي مسارات العمل تستحق فعلاً تطبيق الذكاء الاصطناعي عليها، وأيها لا.",
          items: [
            "أي الأقسام تستفيد أولاً",
            "أي مسارات العمل ينبغي أتمتتها",
            "أين يصنع الذكاء الاصطناعي أثراً قابلاً للقياس",
          ],
        },
      ],
      outcome:
        "خارطة طريق واضحة تُبيّن أين تصنع التقنية والذكاء الاصطناعي والأنظمة أثراً قابلاً للقياس.",
      note: "‏Foundation يُنتج قراراً لا مخرجاً. وإن بنيت معنا بعده، فإن العمل ينتقل إلى ما يليه.",
      credit: "إن مضيت في التنفيذ خلال 90 يوماً، تُخصم قيمة Foundation من قيمة المشروع.",
      priceFloor: "$1,000",
      priceNote: "يُحدَّد النطاق النهائي بعد تشخيص الأعمال.",
    },
    {
      id: "growth-engine",
      name: "Growth Engine",
      statement: "لديك طلب. لكن النمو غير قابل للتوقّع.",
      outcomeShort: "ابنِ نظام استقطاب قابلاً للقياس يديره فريقك بالذكاء الاصطناعي.",
      tagline: "حوّل النمو إلى نظام يمكن قياسه.",
      bestFor:
        "شركات لديها طلب حقيقي، يعيقها استقطاب غير منتظم وتسويق متفرّق ومتابعة يدوية.",
      problem:
        "الإيرادات تنمو، لكن النمو يعتمد على حملات غير مترابطة وعمليات يدوية وأشخاص يدفعون كل شيء إلى الأمام.",
      includes: [
        {
          title: "أنظمة التسويق",
          body: "محرّك الاستقطاب — يُخطَّط ويُبنى ويُقاس كنظام واحد لا كحملات منفصلة.",
          items: [
            "استراتيجية التسويق وخطة التنفيذ",
            "تحسين محركات البحث والنمو العضوي",
            "شراء الوسائط والحملات المدفوعة",
            "استراتيجية المسار وتحسين التحويل",
            "تتبّع الأداء وإسناد النتائج",
          ],
        },
        {
          title: "أصول التحويل",
          body: "ما يوجّه إليه المسار التسويقي — الصفحات التي يحتاجها نظام الاستقطاب ليحوّل.",
          items: ["موقع بنظام إدارة محتوى", "صفحات هبوط", "صفحات الحملات"],
        },
        {
          title: "عمليات الإيرادات",
          body: "نظام إدارة عملاء مهيّأ لإدارة العملاء المحتملين عبر الفريق التجاري، مع أتمتة المتابعة.",
          items: [
            <span key="crm-2">
              نظام <span dir="ltr">CRM</span> لالتقاط العملاء المحتملين وإدارة المسار
            </span>,
            "توجيه العملاء المحتملين وأتمتة المتابعة",
            "التسليم من التسويق إلى المبيعات",
            "ربط البيانات عبر الأدوات المستخدمة بالفعل",
          ],
        },
        {
          title: "تمكين الذكاء الاصطناعي",
          body: "الذكاء الاصطناعي داخل العمل اليومي للفرق التجارية — لا شريحة في عرض تدريبي.",
          items: [
            "استخدامات خاصة بكل قسم",
            "تدريب الموظفين على الذكاء الاصطناعي",
            "مسارات عمل مدعومة بالذكاء الاصطناعي ضمن العمليات القائمة",
          ],
        },
      ],
      outcome:
        "فرص أكثر تأهيلاً، ورؤية أوضح، وفريق يعمل بالذكاء الاصطناعي داخل مسارات عمل حقيقية.",
      priceFloor: "$7,000",
      priceNote: "ليس اشتراكاً شهرياً. بل نظام تملكه أعمالك.",
    },
    {
      id: "scale-infrastructure",
      name: "Scale Infrastructure",
      statement: "أعمالك تجاوزت الأنظمة التي تديرها.",
      outcomeShort: "ابنِ البنية التشغيلية اللازمة للتوسّع.",
      tagline: "ابنِ الأنظمة اللازمة للتوسّع التشغيلي.",
      bestFor:
        "شركات تجاوز نموّها تشغيلها — التعقيد يتصاعد والأنظمة الحالية لا تستطيع حمله.",
      problem:
        "النمو يولّد التعقيد. الأدوات غير المترابطة والعمليات اليدوية والرؤية المحدودة تبدأ في إبطاء الأعمال — وزيادة الموظفين تتوقّف عن الإفادة.",
      alwaysLabel: "مشمول دائماً",
      always:
        "طبقة الرؤية: القياس والتقارير وربط بيانات الأعمال — لتُتّخذ القرارات بعد البناء على أدلة لا على حدس.",
      expandsLabel: "ثم يتوسّع، بناءً على تشخيص الأعمال، ليشمل:",
      includes: [
        {
          title: "الأنظمة الأساسية للأعمال",
          body: "أنظمة السجلّ التي تقوم عليها الأعمال، مترابطة لا مرصوفة جنباً إلى جنب.",
          items: [
            <span key="crm-3">
              نظام <span dir="ltr">CRM</span> كسجلّ موحّد عبر الأقسام
            </span>,
            <span key="erp-1">
              منصّات تخطيط الموارد <span dir="ltr">ERP</span>
            </span>,
            "أنظمة إدارة أداء تطوير الأعمال",
            "الربط بين الأنظمة الأساسية",
          ],
        },
        {
          title: "التطبيقات المخصّصة",
          body: "برمجيات مبنية على طريقة عمل هذه الشركة، حيث لا يناسبها أي حل جاهز.",
          items: [
            "تطبيقات الأعمال الداخلية",
            "حلول برمجية مخصّصة",
            <span key="b2b-1">
              تطبيقات جوال للأعمال <span dir="ltr">B2B</span>
            </span>,
            "بوابات العملاء والأدوات الداخلية",
          ],
        },
        {
          title: "أتمتة وذكاء اصطناعي متقدّم",
          body: "أتمتة عابرة للأقسام، وذكاء اصطناعي مدمج في الأنظمة لا ملحق بها.",
          items: [
            "أتمتة سير العمل عبر الأقسام",
            "ذكاء اصطناعي مدمج في أنظمة الأعمال",
            "تقارير ذكية ودعم القرار",
            "تبنّي الذكاء الاصطناعي على مستوى الشركة وتدريب الموظفين",
          ],
        },
        {
          title: "التمكين التشغيلي",
          body: "عمل التغيير الذي يجعل الأنظمة الجديدة تستمر بعد التسليم.",
          items: ["إعادة تصميم العمليات", "دعم التبنّي", "التحسين المستمر بعد التسليم"],
        },
      ],
      outcome: "بنية أعمال قابلة للتوسّع مبنية حول الطريقة التي تعمل بها شركتك فعلاً.",
      priceFloor: "$30,000",
      priceNote: "ليس اشتراكاً شهرياً. بل نظام تملكه أعمالك.",
    },
  ],
  custom: {
    eyebrow: "المسار الاستثنائي",
    heading: "ليست كل الأعمال تناسبها الأنماط الجاهزة.",
    body: "مبيعات قوية مع عمليات مكسورة. تبنٍّ للذكاء الاصطناعي عبر كل الأقسام دفعة واحدة. تركيبة لا يغطّيها أي نطاق جاهز. حين يشير تشخيص الأعمال إلى ما لا يناسبه أيٌّ من الثلاثة، فالإجابة ليست باقة — بل نظام مصمَّم حول واقعك.",
    name: "Custom Transformation",
    price: "يُسعَّر بعد تشخيص الأعمال.",
  },
  solutionNames: {
    foundation: "Foundation",
    "growth-engine": "Growth Engine",
    "scale-infrastructure": "Scale Infrastructure",
    custom: "Custom Transformation",
  },
};

const HOW_WE_WORK = {
  heading: "كيف نعمل",
  strategyLabel: "الاستراتيجية",
  strategyBody:
    "نُشخّص الأعمال، ونحدّد القيود، ونضع خارطة الطريق. الاستراتيجية ليست شيئاً نبيعه، بل الطريقة التي تُتّخذ بها كل القرارات الأخرى.",
  divider: "وثلاث قدرات تُنفّذ التحوّل",
  capabilities: [
    {
      glyph: "marketing",
      href: "/services/digital-marketing",
      title: "أنظمة التسويق",
      body: "بناء أنظمة استقطاب قابلة للقياس — بحث وإعلانات مدفوعة وتحويل وقياس مترابطة معاً بدلاً من تشغيلها منفصلة.",
    },
    {
      glyph: "tech",
      href: "/services/software",
      title: "تقنية الأعمال",
      body: "بناء وربط الأنظمة التي تدير بها الأعمال — تخطيط الموارد وإدارة العملاء ومنصّات الويب والجوال والأتمتة بينها.",
    },
    {
      glyph: "ai",
      href: "/services/ai-training",
      title: "تمكين الذكاء الاصطناعي",
      body: "دمج الذكاء الاصطناعي في مسارات العمل الحقيقية ليستخدمه الفريق فعلاً، ضمن العمل الذي يؤدّيه أصلاً.",
    },
  ],
};

// Flat dict for BusinessDiagnostic's t(key) lookups (solutions.diag.* plus the
// three solutions.work.*.title build targets its CONSTRAINTS reference).
const DIAG_DICT: Record<string, string> = {
  "solutions.diag.title": DIAG_COPY.title,
  "solutions.diag.systemTitle": DIAG_COPY.systemTitle,
  "solutions.diag.summary": DIAG_COPY.summary,
  "solutions.diag.hint": DIAG_COPY.hint,
  "solutions.diag.trace": DIAG_COPY.trace,
  "solutions.diag.buildLabel": DIAG_COPY.buildLabel,
  "solutions.diag.showSystem": DIAG_COPY.showSystem,
  "solutions.diag.showSignals": DIAG_COPY.showSignals,
  "solutions.diag.rootLabel": DIAG_COPY.rootLabel,
  "solutions.diag.strategyLabel": DIAG_COPY.strategyLabel,
  "solutions.diag.strategyBody": DIAG_COPY.strategyBody,
  "solutions.diag.thesis": DIAG_COPY.thesis,
  ...Object.fromEntries(
    DIAG_COPY.signals.flatMap((s, i) => [
      [`solutions.diag.s${i + 1}.label`, s.label],
      [`solutions.diag.s${i + 1}.text`, s.text],
    ]),
  ),
  ...Object.fromEntries(
    DIAG_COPY.constraints.flatMap((c, i) => [
      [`solutions.diag.c${i + 1}.name`, c.name],
      [`solutions.diag.c${i + 1}.impact`, c.impact],
    ]),
  ),
  "solutions.work.marketing.title": HOW_WE_WORK.capabilities[0].title,
  "solutions.work.tech.title": HOW_WE_WORK.capabilities[1].title,
  "solutions.work.ai.title": HOW_WE_WORK.capabilities[2].title,
};

const FAQ_ITEMS = [
  {
    q: "كيف نعرف أي حل نحتاج؟",
    a: "معظم الشركات لا تعرف، وهذا طبيعي. تشخيص الأعمال موجود للإجابة عن هذا السؤال قبل الالتزام بأي تنفيذ.",
  },
  {
    q: "هل يجب أن نبدأ بـ Foundation؟",
    a: "لا. Foundation مخصّص للشركات التي لا تستطيع بعد تسمية القيد. وإن كان واضحاً بالفعل، فنبدأ من حيث المشكلة. وكل حل يشمل مرحلة تشخيص أعمال في الحالتين.",
  },
  {
    q: "لماذا السعر «يبدأ من»؟",
    a: "لأن النطاق يعتمد على ما يكشفه تشخيص الأعمال. الرقم المعروض هو الحد الأدنى، والرقم النهائي يأتي مع العرض.",
  },
  {
    q: "هل هذا اشتراك شهري؟",
    a: "لا. هذه أنظمة تملكها — الشيفرة المصدرية والمنصّات والبيانات. أما الدعم المستمر فاتفاق منفصل إن أردته.",
  },
  {
    q: "هل نملك ما تبنونه؟",
    a: "نعم. تُنقل الملكية الفكرية وكامل الشيفرة المصدرية عند الإنجاز. لا تقييد، ولا رسوم للوصول إلى نظامك.",
  },
  {
    q: "ماذا يحدث لقيمة Foundation إن مضينا في التنفيذ؟",
    a: "تُخصم من قيمة المشروع، شريطة أن يبدأ التنفيذ خلال 90 يوماً وأن يستند إلى ذلك التشخيص. وهي ليست استرداداً — لقد اشتريت خارطة طريق، وتبقى لك سواء بنيت معنا أم لا.",
  },
  {
    q: "هل يُباع التدريب على الذكاء الاصطناعي بشكل منفصل؟",
    a: "لا. تمكين الذكاء الاصطناعي مدمج في كل حل، لأن التدريب غير المرتبط بسير عمل حقيقي لا يصمد بعد انتهائه بشهر.",
  },
];

const FINAL_CTA = {
  heading: "لست متأكداً ما الذي يعيقك؟",
  body: "احجز مكالمة استراتيجية. سنخبرك بصراحة أين يقع القيد — وإن لم نكن الشريك المناسب، فسنقول ذلك أيضاً.",
};

export default function SolutionsPage() {
  return (
    <main className="min-h-screen bg-slate-950 pt-20 text-slate-300">
      {/* 1. Hero */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="pointer-events-none absolute -top-40 end-[-120px] h-[520px] w-[520px] rounded-full bg-primary/[0.13] blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 md:px-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              الحلول
              <span aria-hidden="true" className="h-px flex-1 bg-slate-800" />
            </span>
            <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl">
              ابنِ الأنظمة التي يقوم عليها{" "}
              <span className="text-primary">نموك في المرحلة القادمة.</span>
            </h1>
            <p className="mt-5 max-w-[46ch] leading-relaxed text-slate-300">
              أعمالك تعمل بالفعل. ما تحتاجه الآن هو البنية التي تتيح لها
              التوسّع. نكتشف ما الذي يعيق النمو، ثم نبني أنظمة التسويق
              والتقنية والذكاء الاصطناعي التي تزيله.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href={getLanguagePath("/contact", LANGUAGE)} className="w-full sm:w-auto">
                <span className="block w-full rounded-lg border border-primary bg-primary px-6 py-3 text-center text-sm font-semibold text-slate-950 transition-colors hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                  احجز مكالمة استراتيجية
                </span>
              </Link>
              <a
                href="#router"
                className="w-full rounded-lg border border-slate-700 px-6 py-3 text-center text-sm font-medium text-white transition-colors hover:border-slate-600 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
              >
                حدّد القيد لديك
              </a>
            </div>
          </div>

          <BusinessDiagnostic copy={DIAG_DICT} />
        </div>
      </section>

      <SolutionsInteractive language={LANGUAGE} copy={SOLUTIONS_COPY} />

      {/* 5. How we work */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
            {HOW_WE_WORK.heading}
          </h2>

          <div className="relative mt-7 overflow-hidden rounded-e-xl border border-slate-800 bg-slate-900/40 p-6">
            <span aria-hidden="true" className="absolute inset-y-0 start-0 w-[2px] bg-primary" />
            <h3 className="font-display text-lg font-semibold text-white">
              {HOW_WE_WORK.strategyLabel}
            </h3>
            <p className="mt-2 max-w-[80ch] leading-relaxed text-slate-400">
              {HOW_WE_WORK.strategyBody}
            </p>
          </div>

          <p className="my-6 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
            {HOW_WE_WORK.divider}
          </p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {HOW_WE_WORK.capabilities.map((c) => (
              <Link key={c.glyph} href={getLanguagePath(c.href, LANGUAGE)}>
                <div className="card-lift group h-full cursor-pointer rounded-xl border border-slate-800 bg-slate-900/40 p-6 hover:border-slate-700">
                  <HexGlyph size={26} glyph={c.glyph} />
                  <h3 className="mt-3.5 font-display text-base font-semibold text-white transition-colors group-hover:text-primary">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{c.body}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="border-y border-slate-800 bg-slate-900/30 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
            أسئلة شائعة
          </h2>
          <div className="mt-6 border-t border-slate-800/40">
            {FAQ_ITEMS.map((item, n) => (
              <Disclosure
                key={item.q}
                id={`faq-${n + 1}`}
                label={ltrNames(item.q)}
                labelClassName="font-display text-base font-medium text-white"
              >
                <p className="max-w-[80ch] pb-4 text-sm leading-relaxed text-slate-400">
                  {ltrNames(item.a)}
                </p>
              </Disclosure>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Final CTA */}
      <section className="relative overflow-hidden py-20 text-center md:py-24">
        <div className="pointer-events-none absolute -bottom-52 left-1/2 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-primary/[0.13] blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-6 md:px-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
            {FINAL_CTA.heading}
          </h2>
          <p className="mx-auto mt-4 max-w-[56ch] leading-relaxed text-slate-400">
            {FINAL_CTA.body}
          </p>
          <Link href={getLanguagePath("/contact", LANGUAGE)}>
            <span className="mt-7 inline-block rounded-lg border border-primary bg-primary px-7 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
              احجز مكالمة استراتيجية
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
