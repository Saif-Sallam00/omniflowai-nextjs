import type { Language } from "@/lib/language";
import type { ServiceDetailContent, ServiceSlug } from "@/lib/services/types";

// Recovered from services-audit.md (Step 19 — self-contained recovery copy).
// EN/AR text is transcribed verbatim from the old site's source; only the
// meta descriptions below are newly authored, from content already on this
// page (see Step 15 of the audit: the old site shipped none at all).
export const SERVICE_CONTENT: Record<ServiceSlug, Record<Language, ServiceDetailContent>> = {
  "ai-training": {
    en: {
      slug: "ai-training",
      language: "en",
      eyebrow: "AI Enablement",
      title: "AI Enablement and team AI training",
      lead: "AI enablement isn't sold on its own — it's built into every solution. Department-specific use cases, workflow adoption, and practical team enablement, so AI ends up in daily work rather than in a training deck.",
      seoTitle: "AI Training & Enablement for Business Teams",
      metaDescription:
        "Executive AI strategy, department-level adoption programs, and hands-on workflow workshops — AI built into how your teams already work, not sold as standalone training.",
      problemHeading: "When AI adoption is the constraint, it looks like this.",
      problems: [
        "Everyone is talking about AI. Nobody on the team uses it on real work.",
        "You're paying for licences that sit unopened.",
        "The team tried it once, got a bad answer, and went back to the old way.",
        "You can't tell which processes are genuinely worth automating.",
      ],
      capabilitiesHeading: "How the work is delivered",
      capabilitiesSub:
        "AI Enablement is a layer inside the other solutions, never a standalone purchase. These are the formats that layer takes.",
      capabilities: [
        {
          title: "Executive AI strategy sessions",
          problemLabel: "The problem",
          problem: "Leadership is being sold AI without a way to judge it.",
          body: "Where AI changes the economics of your business and where it does not, so the investment decision is made on the same basis as any other.",
        },
        {
          title: "Department-level adoption programs",
          problemLabel: "The problem",
          problem: "Generic training teaches tools nobody's job requires.",
          body: "Use cases built from what a specific department actually does each week — sales, finance, operations, service — with the tools they already have open.",
        },
        {
          title: "Hands-on workflow integration workshops",
          problemLabel: "The problem",
          problem: "People leave training impressed and change nothing.",
          body: "Working sessions on live tasks, so the team finishes with AI inside a process they actually run rather than with a set of notes.",
        },
        {
          title: "Implementation support",
          problemLabel: "The problem",
          problem: "Adoption fades in the month after the training ends.",
          body: "Follow-through while the new way of working becomes the normal one — the part that decides whether any of the rest survives.",
        },
      ],
      solutionsHeading: "Where this sits in the solutions",
      solutionsSub:
        "The same capability appears at different depths depending on what the business diagnosis finds. This is not a service you buy on its own.",
      relationships: [
        {
          id: "foundation",
          tag: "Assessed here",
          body: "Which departments benefit first, which workflows should be automated, and where AI would create measurable impact. Identification only.",
        },
        {
          id: "growth-engine",
          tag: "Built here",
          body: "The commercial teams: department use cases, employee training, and AI-assisted workflows inside the processes that already run.",
        },
        {
          id: "scale-infrastructure",
          tag: "Built here",
          body: "Organisation-wide adoption, plus AI embedded in the business systems themselves rather than sitting beside them.",
        },
      ],
      faqHeading: "Common questions",
      faq: [
        {
          q: "Is this generic AI training?",
          a: "No. Programs are built around your actual workflows and tools, not a stock curriculum.",
        },
        {
          q: "Who is it for?",
          a: "Leadership and teams — we run both strategy-level and hands-on tracks.",
        },
        {
          q: "What do we walk away with?",
          a: "People who use AI on real work, plus documented workflows your team keeps.",
        },
      ],
      finalCtaHeading: "Not sure this is your constraint?",
      finalCtaBody:
        "That is what the business diagnosis is for. Start from the solutions and find where your growth is actually blocked.",
    },
    ar: {
      slug: "ai-training",
      language: "ar",
      eyebrow: "تمكين الذكاء الاصطناعي",
      title: "تمكين الذكاء الاصطناعي وتدريب الفرق عليه",
      lead: "تمكين الذكاء الاصطناعي لا يُباع منفرداً — بل هو مدمج في كل حل. استخدامات خاصة بكل قسم، وتبنٍّ داخل سير العمل، وتمكين عملي للفريق، ليصبح الذكاء الاصطناعي جزءاً من العمل اليومي لا شريحة في عرض تدريبي.",
      seoTitle: "تدريب وتمكين الذكاء الاصطناعي لفرق الأعمال",
      metaDescription:
        "جلسات استراتيجية للقيادات، وبرامج تبنٍّ على مستوى الأقسام، وورش دمج عملية في سير العمل — ذكاء اصطناعي مدمج في عمل فريقك، لا تدريب قائم بذاته.",
      problemHeading: "حين يكون تبنّي الذكاء الاصطناعي هو القيد، تبدو الصورة هكذا.",
      problems: [
        "الجميع يتحدّث عن الذكاء الاصطناعي. ولا أحد في الفريق يستخدمه في عمل حقيقي.",
        "تدفع مقابل تراخيص لا يفتحها أحد.",
        "جرّبه الفريق مرة، فجاءته إجابة سيئة، فعاد إلى الطريقة القديمة.",
        "لا تستطيع تحديد أي العمليات تستحق الأتمتة فعلاً.",
      ],
      capabilitiesHeading: "كيف يُنفَّذ العمل",
      capabilitiesSub:
        "تمكين الذكاء الاصطناعي طبقة داخل الحلول الأخرى، لا شراءً منفرداً. وهذه هي الصيغ التي تأخذها هذه الطبقة.",
      capabilities: [
        {
          title: "جلسات استراتيجية للقيادات",
          problemLabel: "المشكلة",
          problem: "يُعرض على القيادة ذكاء اصطناعي دون معيار للحكم عليه.",
          body: "أين يغيّر الذكاء الاصطناعي اقتصاديات أعمالك وأين لا يفعل، ليُتّخذ قرار الاستثمار على الأساس نفسه الذي تُتّخذ به بقية القرارات.",
        },
        {
          title: "برامج تبنٍّ على مستوى الأقسام",
          problemLabel: "المشكلة",
          problem: "التدريب العام يعلّم أدوات لا يحتاجها عمل أحد.",
          body: "استخدامات مبنية على ما يفعله قسم بعينه كل أسبوع — المبيعات والمالية والعمليات وخدمة العملاء — بالأدوات المفتوحة أمامه أصلاً.",
        },
        {
          title: "ورش دمج عملية في سير العمل",
          problemLabel: "المشكلة",
          problem: "يخرج الناس من التدريب معجبين ولا يغيّرون شيئاً.",
          body: "جلسات عمل على مهام حيّة، لينتهي الفريق والذكاء الاصطناعي داخل عملية يديرها فعلاً، لا بمجرّد ملاحظات.",
        },
        {
          title: "دعم التطبيق",
          problemLabel: "المشكلة",
          problem: "يخفت التبنّي في الشهر الذي يلي انتهاء التدريب.",
          body: "مواكبة حتى تصبح الطريقة الجديدة في العمل هي الطريقة المعتادة — وهي الجزء الذي يقرّر بقاء ما سبق من عدمه.",
        },
      ],
      solutionsHeading: "أين يقع هذا ضمن الحلول",
      solutionsSub:
        "القدرة نفسها تظهر بعمق مختلف بحسب ما يكشفه تشخيص الأعمال. وهي ليست خدمة تُشترى منفردة.",
      relationships: [
        {
          id: "foundation",
          tag: "يُقيَّم هنا",
          body: "أي الأقسام تستفيد أولاً، وأي مسارات العمل ينبغي أتمتتها، وأين يصنع الذكاء الاصطناعي أثراً قابلاً للقياس. تحديد فقط.",
        },
        {
          id: "growth-engine",
          tag: "يُبنى هنا",
          body: "الفرق التجارية: استخدامات خاصة بكل قسم، وتدريب الموظفين، ومسارات عمل مدعومة بالذكاء الاصطناعي داخل العمليات القائمة.",
        },
        {
          id: "scale-infrastructure",
          tag: "يُبنى هنا",
          body: "تبنٍّ على مستوى الشركة، مع ذكاء اصطناعي مدمج في أنظمة الأعمال نفسها لا ملحق بها.",
        },
      ],
      faqHeading: "أسئلة شائعة",
      faq: [
        {
          q: "هل هذا تدريب عام على الذكاء الاصطناعي؟",
          a: "لا. البرامج مبنية حول سير عملك وأدواتك الفعلية، لا منهجاً جاهزاً.",
        },
        {
          q: "لمن هذا التدريب؟",
          a: "للقيادات والفرق — نقدّم مسارين: على المستوى الاستراتيجي وعلى المستوى العملي.",
        },
        {
          q: "بماذا نخرج في النهاية؟",
          a: "أشخاص يستخدمون الذكاء الاصطناعي في عمل حقيقي، إضافة إلى سير عمل موثّق يحتفظ به فريقك.",
        },
      ],
      finalCtaHeading: "لست متأكداً أن هذا هو القيد لديك؟",
      finalCtaBody: "لهذا وُجد تشخيص الأعمال. ابدأ من الحلول واكتشف أين يُعاق نموك فعلاً.",
    },
  },
  "digital-marketing": {
    en: {
      slug: "digital-marketing",
      language: "en",
      eyebrow: "Marketing Systems",
      title: "Marketing Systems: SEO, paid, and conversion",
      lead: "SEO, paid campaigns, and conversion strategy wired into one measurable engine that brings in qualified buyers — not vanity traffic.",
      seoTitle: "Digital Marketing Systems — SEO, Paid & Conversion",
      metaDescription:
        "Marketing strategy, buyer-intent SEO, media buying, conversion optimization, and funnel tracking wired into one measurable acquisition system.",
      problemHeading: "When acquisition is the constraint, it looks like this.",
      problems: [
        "Leads arrive in bursts you can't forecast.",
        "You're spending on ads and can't say which spend produced a customer.",
        "Traffic goes up. Qualified enquiries don't.",
        "Follow-up depends on somebody remembering.",
      ],
      capabilitiesHeading: "What we build",
      capabilitiesSub:
        "Five parts of one acquisition system. Run separately they compete for budget; wired together they compound.",
      capabilities: [
        {
          title: "Marketing strategy and planning",
          problemLabel: "The problem",
          problem: "Channels were chosen one at a time, by whoever pitched last.",
          body: "Which buyers, which channels, which offers, in what order — and what you stop doing. The plan the other four parts execute against.",
        },
        {
          title: "Buyer-intent SEO",
          problemLabel: "The problem",
          problem: "You rank for terms that bring readers, not buyers.",
          body: "Targeting the searches made by someone with a budget and a deadline, then building the pages and technical foundation to hold those positions.",
        },
        {
          title: "Media buying",
          problemLabel: "The problem",
          problem: "Ad spend is a monthly bill nobody can defend.",
          body: "Google, Meta and LinkedIn campaigns built around the cost of a qualified lead rather than clicks, with the account structure and creative testing to bring that cost down.",
        },
        {
          title: "Conversion rate optimization",
          problemLabel: "The problem",
          problem: "You're paying to send traffic to pages that lose it.",
          body: "Landing pages, forms and offers rebuilt and tested against real behaviour, so the same spend produces more enquiries.",
        },
        {
          title: "Funnel strategy and tracking",
          problemLabel: "The problem",
          problem: "The report says the campaign worked. Sales says the leads were bad.",
          body: "Measurement from first touch to closed deal, so a channel is judged on revenue instead of on what the ad platform reports about itself.",
        },
      ],
      solutionsHeading: "Where this sits in the solutions",
      solutionsSub:
        "The same capability appears at different depths depending on what the business diagnosis finds. This is not a service you buy on its own.",
      relationships: [
        {
          id: "foundation",
          tag: "Assessed here",
          body: "Where SEO, paid, funnel and conversion would pay off in your business, and in what order. Assessment only — nothing is run at this stage.",
        },
        {
          id: "growth-engine",
          tag: "Built here",
          body: "All five, built and run as one acquisition engine, together with the conversion assets and the CRM the system needs in order to work.",
        },
      ],
      faqHeading: "Common questions",
      faq: [
        {
          q: "What's the minimum to make this work?",
          a: "We're honest about fit — we're upfront about whether the budget justifies the work, and we'll tell you before you commit.",
        },
        {
          q: "How fast do results come?",
          a: "Paid moves in weeks; SEO is a few months for meaningful traffic. We set realistic expectations before we start.",
        },
        {
          q: "Do you guarantee results?",
          a: "We guarantee our work and our process, not market conditions. Targets are agreed upfront and we're accountable to them.",
        },
      ],
      finalCtaHeading: "Not sure this is your constraint?",
      finalCtaBody:
        "That is what the business diagnosis is for. Start from the solutions and find where your growth is actually blocked.",
    },
    ar: {
      slug: "digital-marketing",
      language: "ar",
      eyebrow: "أنظمة التسويق",
      title: "أنظمة التسويق: تحسين محركات البحث والإعلانات المدفوعة والتحويل",
      lead: "تحسين محركات البحث والحملات المدفوعة واستراتيجية التحويل، مترابطة في محرّك واحد قابل للقياس يجلب مشترين مؤهّلين — لا زيارات بلا قيمة.",
      seoTitle: "أنظمة التسويق الرقمي — تحسين محركات البحث والإعلانات المدفوعة والتحويل",
      metaDescription:
        "استراتيجية التسويق، وتحسين محركات البحث بنيّة الشراء، وشراء الوسائط، وتحسين معدّل التحويل، وقياس المسار — مترابطة في نظام استقطاب واحد قابل للقياس.",
      problemHeading: "حين يكون الاستقطاب هو القيد، تبدو الصورة هكذا.",
      problems: [
        "العملاء المحتملون يصلون على دفعات لا يمكن توقّعها.",
        "تنفق على الإعلانات ولا تستطيع تحديد أي إنفاق جاء بعميل.",
        "الزيارات ترتفع. أما الطلبات المؤهّلة فلا.",
        "المتابعة تعتمد على تذكّر أحدهم.",
      ],
      capabilitiesHeading: "ما الذي نبنيه",
      capabilitiesSub:
        "خمسة أجزاء من نظام استقطاب واحد. منفصلةً تتنافس على الميزانية، ومترابطةً تتراكم نتائجها.",
      capabilities: [
        {
          title: "استراتيجية التسويق والتخطيط",
          problemLabel: "المشكلة",
          problem: "اختيرت القنوات واحدة تلو الأخرى، بحسب من قدّم العرض أخيراً.",
          body: "أي المشترين، وأي القنوات، وأي العروض، وبأي ترتيب — وما الذي تتوقّف عنه. إنها الخطة التي تنفّذها الأجزاء الأربعة الأخرى.",
        },
        {
          title: "تحسين محركات البحث بنيّة الشراء",
          problemLabel: "المشكلة",
          problem: "تتصدّر كلمات تجلب قرّاءً لا مشترين.",
          body: "استهداف عمليات البحث التي يجريها من لديه ميزانية وموعد نهائي، ثم بناء الصفحات والأساس التقني للحفاظ على تلك المراكز.",
        },
        {
          title: "شراء الوسائط",
          problemLabel: "المشكلة",
          problem: "الإنفاق الإعلاني فاتورة شهرية لا يستطيع أحد تبريرها.",
          body: "حملات على Google وMeta وLinkedIn مبنية حول كلفة العميل المحتمل المؤهّل لا حول النقرات، مع بنية الحسابات واختبار المحتوى الذي يخفض تلك الكلفة.",
        },
        {
          title: "تحسين معدّل التحويل",
          problemLabel: "المشكلة",
          problem: "تدفع لتوجيه زيارات إلى صفحات تفقدها.",
          body: "صفحات هبوط ونماذج وعروض يُعاد بناؤها واختبارها على سلوك حقيقي، ليُنتج الإنفاق نفسه طلبات أكثر.",
        },
        {
          title: "استراتيجية المسار والقياس",
          problemLabel: "المشكلة",
          problem: "التقرير يقول إن الحملة نجحت. والمبيعات تقول إن العملاء لم يكونوا مؤهّلين.",
          body: "قياس من أول تفاعل حتى إغلاق الصفقة، لتُقيَّم القناة بالإيرادات لا بما تقوله منصّة الإعلانات عن نفسها.",
        },
      ],
      solutionsHeading: "أين يقع هذا ضمن الحلول",
      solutionsSub:
        "القدرة نفسها تظهر بعمق مختلف بحسب ما يكشفه تشخيص الأعمال. وهي ليست خدمة تُشترى منفردة.",
      relationships: [
        {
          id: "foundation",
          tag: "يُقيَّم هنا",
          body: "أين يحقّق تحسين محركات البحث والإعلانات المدفوعة والمسار والتحويل عائداً في أعمالك، وبأي ترتيب. تقييم فقط — لا يُشغَّل شيء في هذه المرحلة.",
        },
        {
          id: "growth-engine",
          tag: "يُبنى هنا",
          body: "الخمسة جميعاً، مبنيّة ومُشغَّلة كمحرّك استقطاب واحد، مع أصول التحويل ونظام إدارة العملاء الذي يحتاجه النظام ليعمل.",
        },
      ],
      faqHeading: "أسئلة شائعة",
      faq: [
        {
          q: "ما الحد الأدنى ليعمل هذا؟",
          a: "نحن صرحاء بشأن الملاءمة — نخبرك مباشرة إن كانت الميزانية تبرّر العمل، قبل أن تلتزم.",
        },
        {
          q: "متى تظهر النتائج؟",
          a: "الإعلانات المدفوعة تتحرّك خلال أسابيع؛ وتحسين محركات البحث يحتاج أشهراً لزيارات ذات أثر. نضع توقّعات واقعية قبل البدء.",
        },
        {
          q: "هل تضمنون النتائج؟",
          a: "نضمن عملنا ومنهجيتنا، لا ظروف السوق. تُتّفق الأهداف مسبقاً ونكون مسؤولين أمامها.",
        },
      ],
      finalCtaHeading: "لست متأكداً أن هذا هو القيد لديك؟",
      finalCtaBody: "لهذا وُجد تشخيص الأعمال. ابدأ من الحلول واكتشف أين يُعاق نموك فعلاً.",
    },
  },
  software: {
    en: {
      slug: "software",
      language: "en",
      eyebrow: "Business Technology",
      title: "Business Technology: software, ERP, CRM, and automation",
      lead: "ERP and CRM platforms, customer-facing web, mobile apps, and the automation that connects them — designed to own, integrate, and scale.",
      seoTitle: "Software Development, ERP & CRM Systems",
      metaDescription:
        "ERP, CRM, business development performance systems, custom internal applications, customer portals, and web platforms — connected systems you own, integrate, and scale.",
      problemHeading: "When the systems are the constraint, it looks like this.",
      problems: [
        "Three teams keep three versions of the same customer list.",
        "Every report is exported, pasted and reconciled by hand.",
        "The tools you bought don't talk, so people are the integration.",
        "The system you run was built for a smaller company than the one you have.",
      ],
      capabilitiesHeading: "What we build",
      capabilitiesSub:
        "Six systems, and the constraint each one removes. Which of them you need comes out of the business diagnosis — this is not a catalogue to order from.",
      capabilities: [
        {
          title: "ERP platforms",
          problemLabel: "The problem",
          problem: "Finance, inventory and operations each keep their own numbers.",
          body: "One operational backbone — procurement, inventory, finance and fulfilment on the same data, so a number means the same thing in every department.",
        },
        {
          title: "CRM platforms",
          problemLabel: "The problem",
          problem: "Nobody can say what stage a deal is at without asking the person who owns it.",
          body: "A pipeline the whole commercial team works inside — accounts, stages, activity and history in one place, with the reporting that makes forecasting possible.",
        },
        {
          title: "Business development performance systems",
          problemLabel: "The problem",
          problem: "Sales performance is judged on impressions rather than measured.",
          body: "Targets, quotas, activity and outcomes tracked per rep and per team, so business development is managed on evidence instead of on who sounds busiest.",
        },
        {
          title: "Custom internal applications",
          problemLabel: "The problem",
          problem: "A core process runs on a spreadsheet that one person guards.",
          body: "The workflow that makes your business different, built as a real application — permissions, audit trail, and integration with the rest of the stack.",
        },
        {
          title: "Customer portals and B2B mobile apps",
          problemLabel: "The problem",
          problem: "Customers and partners phone your team for information they should be able to see.",
          body: "Direct access for clients, partners or field teams to their own orders, status, documents and requests — instead of routing every question through a person.",
        },
        {
          title: "Web platforms",
          problemLabel: "The problem",
          problem: "The website is a brochure, disconnected from everything behind it.",
          body: "Sites and web applications connected to your systems from day one, so a form submission becomes a record in the CRM rather than an email somebody re-types.",
        },
      ],
      solutionsHeading: "Where this sits in the solutions",
      solutionsSub:
        "The same capability appears at different depths depending on what the business diagnosis finds. This is not a service you buy on its own.",
      relationships: [
        {
          id: "foundation",
          tag: "Assessed here",
          body: "Your current stack, its limits and the reporting gaps are assessed. Nothing is built at this stage — the point is deciding what should be.",
        },
        {
          id: "growth-engine",
          tag: "Built here",
          body: "The commercial layer: a CMS website and landing pages that convert, and CRM set up for lead capture, pipeline and follow-up across the sales team.",
        },
        {
          id: "scale-infrastructure",
          tag: "Built here",
          body: "The operational layer: CRM as the system of record across departments, ERP, business development performance systems, custom applications, portals and B2B mobile.",
        },
      ],
      faqHeading: "Common questions",
      faq: [
        {
          q: "Do we own the code?",
          a: "Yes. Full source code and IP transfer on completion. No lock-in, no fees to access your own system.",
        },
        {
          q: "Can it integrate with our existing tools?",
          a: "That's the point. We connect to your CRM, ERP, and existing stack from day one.",
        },
        {
          q: "How long does a build take?",
          a: "Depends on scope — we give you a specific timeline in the proposal, not a vague range.",
        },
        {
          q: "What if we already have a system?",
          a: "We rebuild or extend what you have, whichever actually makes sense for your situation.",
        },
      ],
      finalCtaHeading: "Not sure this is your constraint?",
      finalCtaBody:
        "That is what the business diagnosis is for. Start from the solutions and find where your growth is actually blocked.",
    },
    ar: {
      slug: "software",
      language: "ar",
      eyebrow: "تقنية الأعمال",
      title: "تقنية الأعمال: البرمجيات وتخطيط الموارد وإدارة العملاء والأتمتة",
      lead: "منصّات تخطيط الموارد وإدارة العملاء، ومواقع موجّهة للعملاء، وتطبيقات جوال، والأتمتة التي تربطها — مصمّمة لتملكها وتربطها وتوسّعها.",
      seoTitle: "تطوير البرمجيات وأنظمة تخطيط الموارد وإدارة العملاء",
      metaDescription:
        "تخطيط الموارد، وإدارة العملاء، وأنظمة أداء تطوير الأعمال، وتطبيقات داخلية مخصّصة، وبوابات عملاء، ومنصّات ويب — أنظمة مترابطة تملكها وتربطها وتوسّعها.",
      problemHeading: "حين تكون الأنظمة هي القيد، تبدو الصورة هكذا.",
      problems: [
        "ثلاثة فرق تحتفظ بثلاث نسخ من قائمة العملاء نفسها.",
        "كل تقرير يُصدَّر ويُلصق ويُطابَق يدوياً.",
        "الأدوات التي اشتريتها لا تتحدّث إلى بعضها، فصار الموظفون هم حلقة الربط.",
        "النظام الذي تعمل عليه بُني لشركة أصغر من شركتك الحالية.",
      ],
      capabilitiesHeading: "ما الذي نبنيه",
      capabilitiesSub:
        "ستة أنظمة، والقيد الذي يزيله كلٌّ منها. وأيّها تحتاج يتحدّد من تشخيص الأعمال — فهذه ليست قائمة تختار منها.",
      capabilities: [
        {
          title: "منصّات تخطيط الموارد ERP",
          problemLabel: "المشكلة",
          problem: "المالية والمخزون والعمليات، لكلٍّ منها أرقامه الخاصة.",
          body: "عمود تشغيلي واحد — المشتريات والمخزون والمالية والتنفيذ على البيانات نفسها، ليحمل الرقم المعنى ذاته في كل قسم.",
        },
        {
          title: "منصّات إدارة العملاء CRM",
          problemLabel: "المشكلة",
          problem: "لا أحد يعرف في أي مرحلة صفقةٌ ما دون أن يسأل صاحبها.",
          body: "مسار مبيعات يعمل داخله الفريق التجاري كاملاً — الحسابات والمراحل والأنشطة والسجل في مكان واحد، مع التقارير التي تجعل التنبّؤ ممكناً.",
        },
        {
          title: "أنظمة إدارة أداء تطوير الأعمال",
          problemLabel: "المشكلة",
          problem: "أداء المبيعات يُقدَّر بالانطباعات بدل أن يُقاس.",
          body: "أهداف وحصص وأنشطة ونتائج تُتابَع لكل مندوب ولكل فريق، ليُدار تطوير الأعمال على أدلة لا على من يبدو أكثر انشغالاً.",
        },
        {
          title: "تطبيقات داخلية مخصّصة",
          problemLabel: "المشكلة",
          problem: "عملية أساسية تعمل على جدول بيانات يحرسه شخص واحد.",
          body: "سير العمل الذي يميّز أعمالك، مبنيّاً كتطبيق حقيقي — بصلاحيات وسجلّ تدقيق وربط ببقية الأنظمة.",
        },
        {
          title: "بوابات العملاء وتطبيقات الجوال B2B",
          problemLabel: "المشكلة",
          problem: "العملاء والشركاء يتّصلون بفريقك لمعلومات ينبغي أن يروها بأنفسهم.",
          body: "وصول مباشر للعملاء أو الشركاء أو الفرق الميدانية إلى طلباتهم وحالتها ومستنداتهم — بدل تمرير كل سؤال عبر شخص.",
        },
        {
          title: "منصّات الويب",
          problemLabel: "المشكلة",
          problem: "الموقع مجرّد كتيّب تعريفي، منفصل عن كل ما خلفه.",
          body: "مواقع وتطبيقات ويب مرتبطة بأنظمتك من اليوم الأول، ليتحوّل إرسال النموذج إلى سجلّ في نظام إدارة العملاء لا إلى بريد يعيد أحدهم كتابته.",
        },
      ],
      solutionsHeading: "أين يقع هذا ضمن الحلول",
      solutionsSub:
        "القدرة نفسها تظهر بعمق مختلف بحسب ما يكشفه تشخيص الأعمال. وهي ليست خدمة تُشترى منفردة.",
      relationships: [
        {
          id: "foundation",
          tag: "يُقيَّم هنا",
          body: "تُقيَّم منظومتك التقنية الحالية وحدودها وفجوات التقارير فيها. ولا يُبنى شيء في هذه المرحلة — الغاية هي تحديد ما ينبغي بناؤه.",
        },
        {
          id: "growth-engine",
          tag: "يُبنى هنا",
          body: "الطبقة التجارية: موقع بنظام إدارة محتوى وصفحات هبوط تحوّل، ونظام إدارة عملاء مهيّأ لالتقاط العملاء المحتملين وإدارة المسار والمتابعة عبر فريق المبيعات.",
        },
        {
          id: "scale-infrastructure",
          tag: "يُبنى هنا",
          body: "الطبقة التشغيلية: نظام إدارة العملاء كسجلّ موحّد عبر الأقسام، وتخطيط الموارد، وأنظمة إدارة أداء تطوير الأعمال، والتطبيقات المخصّصة والبوابات وتطبيقات الجوال.",
        },
      ],
      faqHeading: "أسئلة شائعة",
      faq: [
        {
          q: "هل نملك الشيفرة المصدرية؟",
          a: "نعم. تُنقل الشيفرة المصدرية كاملة والملكية الفكرية عند الإنجاز. لا تقييد، ولا رسوم للوصول إلى نظامك.",
        },
        {
          q: "هل يمكن ربطه بأدواتنا الحالية؟",
          a: "هذا هو المقصود. نربطه بنظام إدارة العملاء وتخطيط الموارد وأدواتك الحالية من اليوم الأول.",
        },
        {
          q: "كم يستغرق البناء؟",
          a: "يعتمد على النطاق — نعطيك جدولاً زمنياً محدّداً في العرض، لا مدى غامضاً.",
        },
        {
          q: "ماذا لو كان لدينا نظام بالفعل؟",
          a: "نعيد بناء ما لديك أو نوسّعه، بحسب ما يناسب وضعك فعلاً.",
        },
      ],
      finalCtaHeading: "لست متأكداً أن هذا هو القيد لديك؟",
      finalCtaBody: "لهذا وُجد تشخيص الأعمال. ابدأ من الحلول واكتشف أين يُعاق نموك فعلاً.",
    },
  },
};

export function getServiceContent(slug: ServiceSlug, language: Language): ServiceDetailContent {
  return SERVICE_CONTENT[slug][language];
}
