# OmniflowAI — Content & Design Extraction (Home, About, Services/Solutions)

Read-only extraction for a faithful Next.js port. All strings below are copied verbatim
from the source files named next to them — no paraphrasing, no translation correction.
Route `/services` is internally named "Solutions" in code/i18n (`solutions.*` keys,
component `Services.tsx`, nav label "Solutions"/"الحلول") — this is the page that becomes
"Solutions" in the new site.

Source files:
- `client/src/pages/Home.tsx`
- `client/src/pages/About.tsx`
- `client/src/pages/Services.tsx` (route `/services`)
- `client/src/components/Navigation.tsx`
- `client/src/components/Footer.tsx`
- `client/src/lib/i18n.tsx` (single flat EN/AR dictionary, `translations.en` / `translations.ar`)
- `shared/taxonomy.ts` (CONTACT_EMAIL, SOCIAL_LINKS)
- `tailwind.config.ts`, `client/src/index.css`, `client/index.html`

---

## HOME (`client/src/pages/Home.tsx`, route `/`)

### 1. Page structure (section order, in document order)

1. **Hero** — H1 + subhead + two CTAs + interactive "system map" visual (capabilities → one Business System)
2. **Trust strip + client-logo marquee** (light band) — eyebrow, headline, 3 reach stats, country list, infinite-scroll logo row (26 real client logos, not translatable)
3. **Value proposition** ("systems problem" statement) — dark band, word-by-word scroll reveal on the highlighted clause
4. **Pillars / Services grid** — 3 cards (AI Enablement, Marketing Systems, Business Technology), light band
5. **Transformation (Before / After)** — dark band, two columns
6. **Proof** — DB-driven featured-projects grid; entire section hidden when there are no featured projects
7. **Recent work** — DB-driven carousel of non-featured projects; hidden when empty
8. **How we work / process** — 4-step scroll-activated timeline (Diagnose → Design → Build → Optimize)
9. **Global brand line** — dark band, shield icon + brand statement + CTA
10. **Final CTA** — headline, body, button, sub-line

### 2. Verbatim text (EN / AR side by side, document order)

i18n keys below are read from `client/src/lib/i18n.tsx`; component is `Home.tsx`.

**1. Hero**
| Element | EN | AR |
|---|---|---|
| H1 (lead) `home.hero.h1.lead` | Most teams buy the tool first. | معظم الفِرق تبدأ باختيار الأداة. |
| H1 (highlight span) `home.hero.h1.highlight` | We diagnose first. | نحن نبدأ بالتشخيص. |
| Sub `home.hero.sub` | AI, marketing, software, automation — we only build what the diagnosis supports. We look before we touch, so what we build fits how your business actually runs. | ذكاء اصطناعي، تسويق، برمجيات، أتمتة — لا نبني إلا ما يدعمه التشخيص. ننظر قبل أن نلمس، ليلائم ما نبنيه طريقة عمل أعمالك فعلاً. |
| CTA 1 (primary) `common.cta.bookCall` | Book a strategy call | احجز مكالمة استراتيجية |
| CTA 2 (outline) `home.hero.cta2` | See our work | استعرض أعمالنا |

System-map visual (same component data, `systemMap.*`):
| Key | EN | AR |
|---|---|---|
| `systemMap.center` | Business System | نظام الأعمال |
| `systemMap.node.aiTraining` | AI Enablement | تمكين الذكاء الاصطناعي |
| `systemMap.node.marketing` | Marketing Systems | أنظمة التسويق |
| `systemMap.node.software` | Business Technology | تقنية الأعمال |
| `systemMap.node.automation` | Automation | الأتمتة |
| `systemMap.node.crm` | CRM | إدارة العملاء |
| `systemMap.node.strategy` | Strategy | الاستراتيجية |
| `systemMap.aria` (aria-label only, not visible) | A connected business system: AI enablement, marketing systems, business technology, automation, CRM and strategy all connecting into one central system. | نظام أعمال مترابط: تمكين الذكاء الاصطناعي، وأنظمة التسويق، وتقنية الأعمال، والأتمتة، وإدارة العملاء، والاستراتيجية، تترابط جميعها في نظام مركزي واحد. |

**2. Trust strip + client logos**
| Element | EN | AR |
|---|---|---|
| Eyebrow `home.trustEyebrow` | Trusted partners | شركاء نثق بهم |
| Headline `home.reach.headline` | Trusted by brands across the US, the GCC & Egypt | موثوقون من علاماتٍ تجارية في الولايات المتحدة ودول الخليج ومصر |
| Stat 1 value `home.reach.stat1.value` | 50+ | 50+ |
| Stat 1 label `home.reach.stat1.label` | Projects delivered | مشروعٌ منجز |
| Stat 2 value `home.reach.stat2.value` | 8 | 8 |
| Stat 2 label `home.reach.stat2.label` | Countries | دول |
| Stat 3 value `home.reach.stat3.value` | Full GCC coverage | تغطية كاملة لدول الخليج |
| Stat 3 label `home.reach.stat3.label` | + US & Egypt | + الولايات المتحدة ومصر |
| Countries strip `home.reach.countries` (split on " · ") | Egypt · Saudi Arabia · UAE · Qatar · Kuwait · Bahrain · Oman · United States | مصر · السعودية · الإمارات · قطر · الكويت · البحرين · عُمان · الولايات المتحدة |

Client logo names rendered as image alt text (not i18n, not translated — proper nouns):
Petra, Reliance Hub, Madrid, Ipec, Electromeca, N2oosh, Dar El Maaly, El Khateer, Beit El 3tara,
El Modhsh, Decork, Princess, Naas, Ta2deer, Gzour, Mashareeb, Cutz, Kayan, Darat, Rafeek, Arcade,
Cleaning, Majarrah, OEM, Pioneer, Thaki. (26 logos, doubled in the DOM for the seamless marquee loop.)

Unused key present in dictionary but not rendered anywhere in `Home.tsx`: `home.trust` — EN "Trusted by teams shaping the future." / AR "تثق بنا فرقٌ تبني مستقبل قطاعاتها." (superseded by `home.reach.headline`; comment in source says the generic line was removed as redundant, but the key itself was never deleted).

**3. Value proposition**
| Element | EN | AR |
|---|---|---|
| Title lead `home.valueProp.title.lead` | Most companies don't have a marketing problem. | معظم الشركات لا تعاني مشكلة تسويق. |
| Title highlight `home.valueProp.title.highlight` | They have a systems problem. | بل تعاني مشكلة أنظمة. |
| Body `home.valueProp.body` | Disconnected tools, manual handoffs, and no clear line of sight from a lead to a closed deal. We connect the whole chain — how you acquire customers, how you convert them, and how you operate once they're in — so the parts work as one system you can actually measure. | أدوات غير مترابطة، وعمليات تسليم يدوية، وغياب رؤية واضحة من العميل المحتمل حتى إتمام الصفقة. نحن نربط السلسلة كاملة — كيف تستقطب عملاءك، وكيف تحوّلهم، وكيف تدير أعمالك بعد انضمامهم — لتعمل الأجزاء كنظام واحد يمكنك قياسه فعلاً. |

**4. Pillars grid**
| Element | EN | AR |
|---|---|---|
| Section title `home.pillars.title` | Three capabilities. One transformation partner. | ثلاث قدرات. شريك تحوّل رقمي واحد. |
| Card 1 title `pillars.aiTraining.title` | AI Enablement | تمكين الذكاء الاصطناعي |
| Card 1 body `pillars.aiTraining.body` | We run structured AI adoption programs for teams and leadership — from executive strategy sessions to hands-on workflow integration. The goal isn't awareness, it's operational capability: your people using AI on real work, not watching a demo. | نقدّم برامج منظّمة لتبنّي الذكاء الاصطناعي للفرق والقيادات — من جلسات استراتيجية للمدراء إلى دمج عملي في سير العمل. الهدف ليس مجرد المعرفة، بل قدرة تشغيلية حقيقية: أن يستخدم فريقك الذكاء الاصطناعي في عمل حقيقي، لا أن يشاهد عرضاً توضيحياً فحسب. |
| Card 2 title `pillars.digitalMarketing.title` | Marketing Systems | أنظمة التسويق |
| Card 2 body `pillars.digitalMarketing.body` | SEO, paid campaigns, and conversion strategy wired into one engine that targets qualified buyers — not vanity traffic. Every stage is tracked, so you know what a lead actually costs and where revenue comes from. | تحسين محركات البحث والحملات المدفوعة واستراتيجية التحويل، مدمجة في محرك واحد يستهدف المشترين المؤهّلين — لا الزيارات الشكلية. كل مرحلة قابلة للقياس، لتعرف كم يكلّفك العميل المحتمل فعلاً ومن أين تأتي الإيرادات. |
| Card 3 title `pillars.software.title` | Business Technology | تقنية الأعمال |
| Card 3 body `pillars.software.body` | The systems your business runs on — ERP and CRM platforms, customer-facing web, mobile apps, and the automation that connects them. Built to own, integrate, and scale, not to rent. | الأنظمة التي تدير أعمالك — منصّات تخطيط موارد المؤسسات (ERP) وإدارة علاقات العملاء (CRM)، ومواقع موجّهة للعملاء، وتطبيقات الجوال، والأتمتة التي تربطها معاً. مبنية لتملكها وتدمجها وتوسّعها، لا لتستأجرها. |
| Card 3 subcaps line `pillars.software.subcaps` | Business Systems (ERP/CRM) · Web Platforms · Mobile Apps · Automation & AI | أنظمة الأعمال (ERP/CRM) · منصّات الويب · تطبيقات الجوال · الأتمتة والذكاء الاصطناعي |

(Cards link to `/services/ai-training`, `/services/digital-marketing`, `/services/software` — out of scope per this extraction, listed only for link targets.)

**5. Transformation (Before/After)**
| Element | EN | AR |
|---|---|---|
| Section title `home.transform.title` | From scattered tools to one connected system | من أدوات متناثرة إلى نظام واحد مترابط |
| Before label `home.transform.before.label` | Before | قبل |
| Before item 1 `home.transform.before.1` | Tools that don't talk to each other | أدوات لا تتواصل فيما بينها |
| Before item 2 `home.transform.before.2` | Marketing disconnected from operations | تسويق منفصل عن العمليات التشغيلية |
| Before item 3 `home.transform.before.3` | Manual work slowing everything down | عمل يدوي يبطّئ كل شيء |
| Before item 4 `home.transform.before.4` | No clear view of what's actually working | غياب رؤية واضحة لما ينجح فعلاً |
| After label `home.transform.after.label` | After | بعد |
| After item 1 `home.transform.after.1` | One integrated business system | نظام أعمال واحد متكامل |
| After item 2 `home.transform.after.2` | Acquisition, conversion, and operations connected | ترابط بين الاستقطاب والتحويل والعمليات |
| After item 3 `home.transform.after.3` | Automated workflows across the business | سير عمل مؤتمت في الشركة كلها |
| After item 4 `home.transform.after.4` | Real-time visibility into performance | رؤية لحظية للأداء |

**6. Proof** (hidden when no `isFeatured` projects exist in the DB)
| Element | EN | AR |
|---|---|---|
| Title `home.proof.title` | Measured by outcomes, not deliverables | نُقاس بالنتائج، لا بالمخرجات |
| Body `home.proof.body` | Every engagement is tied to something your business can feel — revenue, efficiency, acquisition cost, scale. Here's the work behind that. | كل مشروع مرتبط بأثر تلمسه أعمالك — إيرادات، كفاءة، تكلفة استقطاب، توسّع. وهذه هي الأعمال التي تقف وراء ذلك. |

Card content (title, category label, first `results[]` entry) is DB-driven project data, not i18n — out of scope (portfolio is a later migration slice). Category labels use `category.*` keys (see Design Tokens/shared section below).

There is a `// TODO(Layer3-proof)` in source: an aggregate stat strip is deliberately deferred until real aggregate metrics exist — do not invent numbers.

**7. Recent work** (hidden when there are no non-featured projects)
| Element | EN | AR |
|---|---|---|
| Title `home.recent.title` | Recent work | أحدث الأعمال |
| Sub `home.recent.sub` | A look at the systems we've built. | لمحة عن الأنظمة التي بنيناها. |
| "View all" link `common.viewAllProjects` | View all projects | عرض جميع الأعمال |

**8. How we work**
| Element | EN | AR |
|---|---|---|
| Title `home.how.title` | How we work | كيف نعمل |
| Step 01 title `home.how.diagnose.title` | Diagnose | التشخيص |
| Step 01 desc `home.how.diagnose.desc` | We map your business model, systems, and the bottlenecks slowing growth. | نرسم خريطة نموذج عملك وأنظمتك والعوائق التي تبطّئ نموّك. |
| Step 02 title `home.how.design.title` | Design | التصميم |
| Step 02 desc `home.how.design.desc` | We design the right mix of software, marketing, and automation for how you actually operate. | نصمّم المزيج المناسب من البرمجيات والتسويق والأتمتة بما يلائم طريقة عملك الفعلية. |
| Step 03 title `home.how.build.title` | Build | البناء |
| Step 03 desc `home.how.build.desc` | We develop and integrate the system, and hand you full ownership. | نطوّر النظام وندمجه ونسلّمك ملكيته الكاملة. |
| Step 04 title `home.how.optimize.title` | Optimize | التحسين |
| Step 04 desc `home.how.optimize.desc` | We keep improving it against real business data. | نواصل تحسينه استناداً إلى بيانات أعمالك الحقيقية. |

Step numerals are hardcoded literals in source, not i18n: `"01"`, `"02"`, `"03"`, `"04"` (same in both languages — Western numerals throughout per repo convention).

**9. Global brand line**
| Element | EN | AR |
|---|---|---|
| Statement `common.brandLine` | We don't hand over deliverables and walk away. We build systems that keep working after we're gone. | نحن لا نسلّم مخرجات ونمضي. نحن نبني أنظمة تستمر في العمل حتى بعد انتهاء تعاوننا. |
| CTA `common.cta.bookCall` | Book a strategy call | احجز مكالمة استراتيجية |

**10. Final CTA**
| Element | EN | AR |
|---|---|---|
| Title `home.finalCta.title` | Ready to transform how your business runs? | جاهز لتغيير طريقة إدارة أعمالك؟ |
| Body `home.finalCta.body` | Book a strategy call. We'll look at your current systems and show you exactly what's blocking growth — even if you don't work with us. | احجز مكالمة استراتيجية. سننظر في أنظمتك الحالية ونوضّح لك بالضبط ما يعيق النمو — حتى إن لم تعمل معنا. |
| Button `home.finalCta.button` | Book your strategy call | احجز مكالمتك الاستراتيجية |
| Sub-line `home.finalCta.sub` | No sales pitch. Just clarity. | بلا عروض بيعية. وضوح فقط. |

### 3. How Arabic is handled (mechanism)

See the single shared write-up under **HOME** below — it applies identically, byte-for-byte, to About and Solutions (there is no per-page i18n mechanism, it's one context provider site-wide):

- **Where strings live:** one flat, dot-namespaced dictionary in `client/src/lib/i18n.tsx`: `const translations: Record<Language, Record<string, string>> = { en: {...}, ar: {...} }` (`Language = "en" | "ar"`). No JSON files, no per-page dictionaries, no ICU/pluralization — just `key: "string"` pairs, looked up with a plain `t(key)` function that falls back to returning the raw key if missing.
- **How language is switched:** a React context (`I18nProvider` / `useI18n()`), not a cookie or a route param. State (`language`) is initialized from `localStorage.getItem("language")` (default `"en"`) and persisted back to `localStorage` on every change. The globe icon button in `Navigation.tsx` calls `setLanguage(language === "en" ? "ar" : "en")`.
- **How RTL/dir is applied:** a `useEffect` inside `I18nProvider` sets, on every language change: `document.documentElement.lang = language`, `document.documentElement.dir = language === "ar" ? "rtl" : "ltr"`, and `document.body.dir` the same way. Components additionally read `isRTL` (`language === "ar"`) from the context to flip specific icon margins (e.g. the header CTA arrow) rather than relying on `dir` alone. Tailwind's logical-property utilities (`ms-`, `me-`, `start-`, `end-`) are used throughout so most spacing mirrors automatically; `[dir="rtl"]` CSS overrides in `index.css` additionally swap the body/display font to Cairo and flip specific `lucide-*` arrow icons via `scaleX(-1)`.
- **Solution/brand names** (Foundation, Growth Engine, Scale Infrastructure, Custom Transformation, "OmniflowAI") are deliberately **not translated** — kept Latin in both languages and wrapped in `dir="ltr"` spans (a regex-based `ltrNames()` helper on the Solutions page) so they don't get bidi-reordered inside Arabic sentences.
- No server-side locale/cookie negotiation exists — language is 100% client-side, defaulting to English on first visit.

---

## ABOUT (`client/src/pages/About.tsx`, route `/about`)

### 1. Page structure

1. **Hero** — badge, H1 (two-part), sub
2. **Story** — team photo (frozen/real image, not a placeholder) + heading + 3 paragraphs
3. **Values** — 4-card grid (icon + title + desc)
4. **CTA** — heading, brand line, button

(Note: the section comments in source are numbered 1, 2, 4, 5 — there is no "3. Team" section rendered, despite the numbering jumping from 2 to 4. See below.)

### 2. Verbatim text (EN / AR side by side, document order)

**1. Hero**
| Element | EN | AR |
|---|---|---|
| Badge `about.badge` | Who we are | من نحن |
| H1 lead `about.headline.lead` | Engineers who understand | مهندسون يفهمون |
| H1 highlight `about.headline.highlight` | business. | الأعمال. |
| Sub `about.sub` | OmniflowAI is a digital transformation partner built around one belief: most companies don't need more tools — they need the right systems, built well and connected properly. | ‏OmniflowAI شريك في التحول الرقمي يقوم على قناعة واحدة: معظم الشركات لا تحتاج مزيداً من الأدوات — بل تحتاج الأنظمة الصحيحة، مبنية بإتقان ومترابطة كما ينبغي. |

**2. Story**
| Element | EN | AR |
|---|---|---|
| Heading `about.story.heading` | We started OmniflowAI to close a gap. | أسّسنا OmniflowAI لسدّ فجوة. |
| Paragraph 1 `about.story.p1` | Too many businesses are sold disconnected pieces — a website here, an ad campaign there, a tool nobody integrates — and left to stitch them together themselves. The result is expensive fragmentation: software that doesn't talk, marketing that doesn't convert, and no clear view of what's working. | تُباع لكثير من الشركات أجزاء غير مترابطة — موقع هنا، وحملة إعلانية هناك، وأداة لا يدمجها أحد — وتُترك لتجمّعها بنفسها. والنتيجة تشتّت مكلف: برمجيات لا تتحاور، وتسويق لا يحوّل، وغياب رؤية واضحة لما ينجح. |
| Paragraph 2 `about.story.p2` | We do the opposite. We start from how your business actually operates, then design and build the systems that fit it — software, marketing, and automation that work as one. You own everything we build. No lock-in, no dependency, no black boxes. | نحن نفعل العكس. نبدأ من طريقة عمل شركتك الفعلية، ثم نصمّم ونبني الأنظمة التي تلائمها — برمجيات وتسويق وأتمتة تعمل ككلٍّ واحد. أنت تملك كل ما نبنيه. لا احتكار، ولا تبعية، ولا صناديق مغلقة. |
| Paragraph 3 `about.story.p3` | We work like engineers, not order-takers: we care about outcomes you can measure, systems that outlast the engagement, and giving you the keys at the end. | نعمل كمهندسين لا كمنفّذي طلبات: يهمّنا تحقيق نتائج تستطيع قياسها، وأنظمة تدوم بعد انتهاء التعاون، وتسليمك المفاتيح في النهاية. |

Image: `TeamImage` from `@/assets/team_images/omniflowai-team.webp`, alt="The OmniflowAI team". Founder/team attribution around this section is marked `[TODO(team-final)]` in a source comment — **frozen, do not invent names/bios**.

**3. Values (4-card grid)**
| Element | EN | AR |
|---|---|---|
| Value 1 title `about.values.1.title` | Systems over services | الأنظمة قبل الخدمات |
| Value 1 desc `about.values.1.desc` | We don't sell isolated deliverables. Everything we build is designed to connect and compound. | لا نبيع مخرجات منعزلة. كل ما نبنيه مصمَّم ليترابط وتتضاعف قيمته. |
| Value 2 title `about.values.2.title` | You own it | الملكية لك |
| Value 2 desc `about.values.2.desc` | Full source code and IP transfer on every build. What you pay for is yours. | نقل كامل للشيفرة المصدرية والملكية الفكرية في كل مشروع. ما تدفع مقابله يصبح ملكك. |
| Value 3 title `about.values.3.title` | Engineering-led | بقيادة هندسية |
| Value 3 desc `about.values.3.desc` | You work directly with the people building your systems, not an account manager relaying messages. | تتعامل مباشرةً مع من يبنون أنظمتك، لا مع مدير حسابات ينقل الرسائل. |
| Value 4 title `about.values.4.title` | Measured by outcomes | نُقاس بالنتائج |
| Value 4 desc `about.values.4.desc` | We tie our work to business results — revenue, efficiency, acquisition — not hours logged or assets shipped. | نربط عملنا بنتائج الأعمال — إيرادات وكفاءة واستقطاب — لا بساعات مسجّلة أو مخرجات مُسلّمة. |

**4. CTA**
| Element | EN | AR |
|---|---|---|
| Title `about.cta.title` | Let's map your systems | لنرسم خريطة أنظمتك |
| Body `common.brandLine` | We don't hand over deliverables and walk away. We build systems that keep working after we're gone. | نحن لا نسلّم مخرجات ونمضي. نحن نبني أنظمة تستمر في العمل حتى بعد انتهاء تعاوننا. |
| Button `common.cta.bookCall` | Book a strategy call | احجز مكالمة استراتيجية |

**Unused keys** (defined in the dictionary, not referenced anywhere in `About.tsx` — no Team section is actually rendered):
- `about.team.heading` — EN "Meet the Builders" / AR "تعرّف على فريق البناء"
- `about.team.sub` — EN "No outsourcing. No juniors learning on your dime. Just senior talent dedicated to your growth." / AR "لا إسناد خارجي. لا مبتدئون يتعلّمون على حسابك. فقط كفاءات خبيرة مكرّسة لنموّك."

### 3. How Arabic is handled

Same site-wide mechanism — see **HOME § 3. How Arabic is handled** above. No page-specific differences on About.

---

## SERVICES / "Solutions" (`client/src/pages/Services.tsx`, route stays `/services`)

Source has an explicit header comment: *"SOLUTIONS PAGE — route stays /services (spec §0.5: slugs do not change)."* Copy lives under the `solutions.*` i18n namespace. The page references `docs/PHASE-1-SOLUTIONS-PAGE-SPEC-v2.md` as its governing spec (not read here — out of scope, flagging its existence for your reference).

### 1. Page structure

1. **Hero** — eyebrow, H1 (two-part), subhead, primary CTA + secondary "Find your constraint" button, signature visual (`BusinessDiagnostic` component, self-contained, reads its own `solutions.diag.*` copy)
2. **Diagnostic router** — eyebrow, heading, sub, 6 radio-button questions (single-select, pre-answered to option 1 by default), a live "recommended starting point" result block, an "unsure" link to Contact
3. **The three solutions** — heading, sub, recommendation note, 3 cards (Foundation / Growth Engine / Scale Infrastructure), each with: recommended-badge (conditional), name, statement, outcome (short), Scale-only "always included" callout, collapsible "What's included" disclosure (tagline, Best for, The problem, N components each with M bullet items, Outcome, Foundation-only note), price (or "Pricing on request"), price note, Foundation-only credit callout, per-card CTA
4. **Custom Transformation** — single inverted (orange background) band, not a 4th card: recommended-badge (conditional), eyebrow, heading, body, name, CTA + price note
5. **How we work** — heading, Strategy block (not a capability card), divider line, 3 capability cards (Marketing Systems, Business Technology, AI Enablement) linking to the individual service-detail pages (`/services/digital-marketing`, `/services/software`, `/services/ai-training` — out of scope)
6. **Proof** — DB-driven featured-projects grid; entire section hidden when empty
7. **FAQ** — heading, 7 collapsible Q&A items
8. **Final CTA** — heading, body, button

Two sections that existed in an earlier spec revision were deliberately **removed** per a source comment: a trust strip and a "problem recognition" section, because both restated arguments the homepage already makes (`home.reach.*`, `home.valueProp.*`, `home.transform.*`).

### 2. Verbatim text (EN / AR side by side, document order)

**1. Hero**
| Element | EN | AR |
|---|---|---|
| Eyebrow `solutions.eyebrow` | Solutions | الحلول |
| H1 lead `solutions.h1.lead` | Build the systems behind | ابنِ الأنظمة التي يقوم عليها |
| H1 accent `solutions.h1.accent` | your next stage of growth. | نموك في المرحلة القادمة. |
| Subhead `solutions.subhead` | Your business already works. What it needs now is the infrastructure to scale. We find what's blocking growth, then build the marketing, technology, and AI systems that remove it. | أعمالك تعمل بالفعل. ما تحتاجه الآن هو البنية التي تتيح لها التوسّع. نكتشف ما الذي يعيق النمو، ثم نبني أنظمة التسويق والتقنية والذكاء الاصطناعي التي تزيله. |
| Primary CTA `common.cta.bookCall` | Book a strategy call | احجز مكالمة استراتيجية |
| Secondary CTA `solutions.hero.secondary` | Find your constraint | حدّد القيد لديك |

Hero visual copy (`BusinessDiagnostic` component, `solutions.diag.*` keys — self-contained, reads its own strings):
| Key | EN | AR |
|---|---|---|
| `solutions.diag.title` | Business diagnosis | تشخيص الأعمال |
| `solutions.diag.systemTitle` | Growth operating system | نظام تشغيل النمو |
| `solutions.diag.summary` (template, `{s}`/`{c}` substituted) | {s} signals · {c} root constraints | {s} إشارات · {c} قيود جذرية |
| `solutions.diag.rootLabel` | Root constraint | قيد جذري |
| `solutions.diag.hint` | Select any signal to reveal what it's really connected to. | اختر أي إشارة لتكشف ما ترتبط به فعلاً. |
| `solutions.diag.trace` (template) | {n} of {s} signals trace to this constraint | {n} من {s} إشارات تعود إلى هذا القيد |
| `solutions.diag.buildLabel` | We build | نبني |
| `solutions.diag.showSystem` | Show the system | اعرض النظام |
| `solutions.diag.showSignals` | Back to the signals | العودة إلى الإشارات |
| `solutions.diag.strategyLabel` | Strategy | الاستراتيجية |
| `solutions.diag.strategyBody` | The business diagnosis decides which of the three you need, and in what order. | تشخيص الأعمال هو ما يحدّد أيّاً من الثلاثة تحتاج، وبأي ترتيب. |
| `solutions.diag.thesis` | Most growth problems are symptoms of one missing system. | معظم مشكلات النمو أعراضٌ لنظام واحد مفقود. |

Seven signals (`solutions.diag.s1`–`s7`, each with a short `label` and a full `text`):
| # | EN label | EN text | AR label | AR text |
|---|---|---|---|---|
| 1 | Inconsistent growth | Growth is inconsistent, not compounding. | نمو غير منتظم | النمو غير منتظم ولا يتراكم. |
| 2 | Untraceable spend | Spend can't be traced to revenue. | إنفاق لا يُقاس | لا يمكن ربط الإنفاق بالإيرادات. |
| 3 | Handoff delays | Work stalls at every handoff. | تعثّر عند التسليم | العمل يتعثّر عند كل عملية تسليم. |
| 4 | Manual reporting | Every report is rebuilt by hand. | تقارير يدوية | كل تقرير يُعاد بناؤه يدوياً. |
| 5 | Founder-dependent decisions | Decisions route through a few people. | قرارات معتمدة على المؤسّس | القرارات تمرّ عبر عدد قليل من الأشخاص. |
| 6 | Headcount-bound capacity | More volume still means more headcount. | طاقة مقيّدة بالتوظيف | زيادة الحجم ما زالت تعني زيادة الموظفين. |
| 7 | Stalled AI adoption | AI is discussed, never operational. | تبنٍّ متعثّر للذكاء الاصطناعي | الذكاء الاصطناعي يُناقَش ولا يُشغَّل. |

Three root constraints (`solutions.diag.c1`–`c3`, each with `name` + `impact`):
| # | EN name | EN impact | AR name | AR impact |
|---|---|---|---|---|
| 1 | Demand isn't a system. | Revenue depends on effort, so it can't be forecast or compounded. | الطلب ليس نظاماً. | الإيرادات تعتمد على الجهد، فلا يمكن توقّعها ولا مراكمتها. |
| 2 | The business runs on people, not systems. | Every process needs a person inside it, so complexity grows faster than output. | الأعمال تُدار بالأشخاص لا بالأنظمة. | كل عملية تحتاج شخصاً بداخلها، فيتزايد التعقيد أسرع من الإنتاج. |
| 3 | Capacity only scales by hiring. | Output is capped by headcount — the slowest and most expensive way to grow. | الطاقة لا تتوسّع إلا بالتوظيف. | الإنتاج مسقوف بعدد الموظفين — وهو أبطأ طرق النمو وأغلاها. |

**2. Diagnostic router**
| Element | EN | AR |
|---|---|---|
| Eyebrow `solutions.router.eyebrow` | Business diagnostic | تشخيص الأعمال |
| Heading `solutions.router.heading` | Find your growth constraint. | حدّد القيد الذي يعيق نموك. |
| Sub `solutions.router.sub` | Pick what sounds closest to your business. We'll point you to the right starting point. | اختر ما يقترب أكثر من وضع أعمالك، وسنوجّهك إلى نقطة البداية المناسبة. |
| Q1 `solutions.router.q1` → Growth Engine | We have customers, but growth is inconsistent. | لدينا عملاء، لكن النمو غير منتظم. |
| Q2 `solutions.router.q2` → Scale Infrastructure | Our growth depends on adding more people instead of better systems. | نموّنا يعتمد على زيادة عدد الموظفين بدلاً من أنظمة أفضل. |
| Q3 `solutions.router.q3` → Scale Infrastructure | We have tools, but nothing is connected. | لدينا أدوات، لكن لا شيء مترابط. |
| Q4 `solutions.router.q4` → Foundation | We know AI matters but don't know where to start. | نعلم أن الذكاء الاصطناعي مهم، لكن لا نعرف من أين نبدأ. |
| Q5 `solutions.router.q5` → Foundation | We're not sure what's actually broken. | لسنا متأكدين ما الذي تعطّل فعلاً. |
| Q6 `solutions.router.q6` → Custom | We have a unique challenge that needs a tailored approach. | لدينا تحدٍّ فريد يحتاج إلى نهج مصمَّم خصيصاً. |
| Result label `solutions.router.resultLabel` | Recommended starting point | نقطة البداية المقترحة |
| Result copy R1 `solutions.router.r1` | Your acquisition needs to become a system before more technology gets built on top of it. | يجب أن يتحوّل الاستقطاب لديك إلى نظام قبل بناء مزيد من التقنية فوقه. |
| R2 `solutions.router.r2` | Headcount-driven growth is an infrastructure limit. The systems have to carry that load instead. | النمو المعتمد على زيادة الموظفين هو حدٌّ في البنية التحتية. الأنظمة هي ما يجب أن يحمل هذا العبء بدلاً من ذلك. |
| R3 `solutions.router.r3` | Disconnected tools is an infrastructure problem, not a marketing one. | الأدوات غير المترابطة مشكلة بنية تحتية، لا مشكلة تسويق. |
| R4 `solutions.router.r4` | Start by finding where AI actually pays off inside your workflows. | ابدأ بتحديد أين يحقّق الذكاء الاصطناعي عائداً فعلياً داخل سير عملك. |
| R5 `solutions.router.r5` | That's exactly what the diagnosis is for. Nobody should build before that answer exists. | هذا بالضبط ما وُجد التشخيص من أجله. لا ينبغي لأحد أن يبني قبل أن تتوفّر هذه الإجابة. |
| R6 `solutions.router.r6` | Then the answer is a system designed around your constraints, not a predefined scope. | إذن الإجابة نظام مصمَّم حول قيودك، لا نطاق مُعدّ مسبقاً. |
| "Unsure" link `solutions.router.unsure` | Rather just talk it through? Book a strategy call. | تفضّل الحديث مباشرة؟ احجز مكالمة استراتيجية. |

Default state: router starts pre-answered on Q1 → Growth Engine (`DEFAULT_ROUTER_INDEX = 0`); this selection never fires the `router_select` GA event (only an explicit change does).

**3. The three solutions — section frame**
| Element | EN | AR |
|---|---|---|
| Heading `solutions.grid.heading` | Three ways in. One business diagnosis behind all of them. | ثلاث نقاط دخول. وتشخيص أعمال واحد وراءها جميعاً. |
| Sub `solutions.grid.sub` | These aren't tiers. They're different starting points for different constraints. The business diagnosis decides which one fits. | هذه ليست مستويات. بل نقاط بداية مختلفة لقيود مختلفة. وتشخيص الأعمال هو ما يحدّد الملائم منها. |
| Recommended-note `solutions.grid.recommendedNote` | Marked against the growth constraint selected above. Change the constraint and the recommendation changes with it. | محدَّد بناءً على قيد النمو المختار أعلاه. غيّر القيد لتتغيّر التوصية معه. |
| Badge text `solutions.grid.recommended` | Recommended | موصى به |
| "Best for" label `solutions.grid.bestFor` | Best for | مناسب لـ |
| "The problem" label `solutions.grid.problem` | The problem | المشكلة |
| "What's included" label `solutions.grid.included` | What's included | ما الذي يشمله |
| "Outcome" label `solutions.grid.outcome` / `.outcomeLabel` | Outcome | النتيجة |
| "Starting from" label `solutions.grid.priceFrom` | Starting from | يبدأ من |
| "Pricing on request" `solutions.grid.priceOnRequest` | Pricing on request | السعر عند الطلب |
| Price note 1 `solutions.grid.priceNote1` (Foundation) | Final scope is determined after the business diagnosis. | يُحدَّد النطاق النهائي بعد تشخيص الأعمال. |
| Price note 2 `solutions.grid.priceNote2` (Growth Engine & Scale) | Not a monthly retainer. A system your business owns. | ليس اشتراكاً شهرياً. بل نظام تملكه أعمالك. |
| "See the full solution" `solutions.grid.detailLink` (defined, not confirmed rendered in current JSX) | See the full solution | تفاصيل الحل كاملة |

**Card price floors** (`priceFloor` literals in source, USD, written in full, not abbreviated): Foundation **$1,000**, Growth Engine **$7,000**, Scale Infrastructure **$30,000**. These are hardcoded string literals, not i18n keys. Framed as a floor ("Starting from"), never a fixed price.

**Foundation card**
| Element | EN | AR |
|---|---|---|
| Name `solutions.foundation.name` | Foundation | Foundation |
| Statement `solutions.foundation.statement` | You know growth is stuck. You don't yet know why. | تعرف أن النمو متوقّف، لكنك لا تعرف السبب بعد. |
| Outcome (short) `solutions.foundation.outcomeShort` | Find the constraint before spending on solutions. | حدّد القيد قبل الإنفاق على الحلول. |
| Tagline `solutions.foundation.tagline` | Discover what's blocking your next stage of growth. | اكتشف ما الذي يعيق مرحلتك التالية من النمو. |
| Best for `solutions.foundation.bestFor` | Companies that know something is limiting growth but can't name it — and don't want to commit to a build before they can. | شركات تعرف أن شيئاً ما يحدّ من نموها لكنها لا تستطيع تسميته — ولا تريد الالتزام ببناء قبل أن تستطيع. |
| Problem `solutions.foundation.problem` | Your business is growing, but the reason it's slowing isn't obvious from the inside. Every proposal you receive assumes an answer nobody has actually verified. | أعمالك تنمو، لكن سبب تباطؤها ليس واضحاً من الداخل. وكل عرض يصلك يفترض إجابة لم يتحقّق منها أحد فعلاً. |
| Component 1 title `inc1.title` | Business Diagnosis | تشخيص الأعمال |
| Component 1 body `inc1.body` | How the company runs today — where work moves, where it stops, and why. | كيف تعمل الشركة اليوم — أين يتحرّك العمل، وأين يتوقّف، ولماذا. |
| — item1 | Processes, workflows and operational structure | العمليات وسير العمل والهيكل التشغيلي |
| — item2 | Marketing performance and the customer acquisition journey | أداء التسويق ورحلة استقطاب العملاء |
| — item3 | The current technology stack and its limits | المنظومة التقنية الحالية وحدودها |
| — item4 | Data visibility and reporting gaps | فجوات وضوح البيانات والتقارير |
| Component 2 title `inc2.title` | Growth and bottleneck assessment | تقييم النمو والاختناقات |
| Component 2 body `inc2.body` | The specific points where growth is being capped, and what each one is costing. | النقاط المحدّدة التي يُقيَّد عندها النمو، وكلفة كلٍّ منها. |
| — item1 | Where opportunities are being lost | أين تُفقد الفرص |
| — item2 | Which processes are slowing growth | أي العمليات تُبطئ النمو |
| — item3 | Which manual work is capping scale | أي عمل يدوي يحدّ من التوسّع |
| — item4 | The highest-impact areas to address first | أعلى المجالات أثراً للبدء بها |
| Component 3 title `inc3.title` | Marketing and technology opportunity map | خريطة فرص التسويق والتقنية |
| Component 3 body `inc3.body` | Where each capability would pay off in this business — and in what order. | أين تحقّق كل قدرة عائداً في هذه الأعمال — وبأي ترتيب. |
| — item1 | SEO and organic growth | تحسين محركات البحث والنمو العضوي |
| — item2 | Paid acquisition and media buying | الاستقطاب المدفوع وشراء الوسائط |
| — item3 | Funnel and conversion | المسار التسويقي والتحويل |
| — item4 | CRM and customer management | أنظمة إدارة العملاء (CRM) |
| — item5 | Business automation | أتمتة الأعمال |
| — item6 | Custom software and platforms | البرمجيات والمنصّات المخصّصة |
| Component 4 title `inc4.title` | AI opportunity identification | تحديد فرص الذكاء الاصطناعي |
| Component 4 body `inc4.body` | Which workflows are genuinely worth applying AI to, and which aren't. | أي مسارات العمل تستحق فعلاً تطبيق الذكاء الاصطناعي عليها، وأيها لا. |
| — item1 | Which departments benefit first | أي الأقسام تستفيد أولاً |
| — item2 | Which workflows should be automated | أي مسارات العمل ينبغي أتمتتها |
| — item3 | Where AI creates measurable impact | أين يصنع الذكاء الاصطناعي أثراً قابلاً للقياس |
| Outcome `solutions.foundation.outcome` | A clear roadmap showing where technology, AI, and systems create measurable business impact. | خارطة طريق واضحة تُبيّن أين تصنع التقنية والذكاء الاصطناعي والأنظمة أثراً قابلاً للقياس. |
| Note `solutions.foundation.note` | Foundation produces a decision, not a deliverable. If you build with us afterwards, the work carries forward. | ‏Foundation يُنتج قراراً لا مخرجاً. وإن بنيت معنا بعده، فإن العمل ينتقل إلى ما يليه. |
| Credit callout `solutions.foundation.credit` | Move forward with implementation within 90 days and your Foundation fee is credited toward the project. | إن مضيت في التنفيذ خلال 90 يوماً، تُخصم قيمة Foundation من قيمة المشروع. |
| Price | $1,000 (Starting from) | same, `dir="ltr"` |
| CTA | Book a strategy call → `/contact?service=foundation` | احجز مكالمة استراتيجية |

**Growth Engine card**
| Element | EN | AR |
|---|---|---|
| Name `solutions.growth.name` | Growth Engine | Growth Engine |
| Statement `solutions.growth.statement` | You have demand. Growth is unpredictable. | لديك طلب. لكن النمو غير قابل للتوقّع. |
| Outcome (short) `solutions.growth.outcomeShort` | Build a measurable acquisition system your team runs with AI. | ابنِ نظام استقطاب قابلاً للقياس يديره فريقك بالذكاء الاصطناعي. |
| Tagline `solutions.growth.tagline` | Turn growth into a system you can measure. | حوّل النمو إلى نظام يمكن قياسه. |
| Best for `solutions.growth.bestFor` | Companies with real demand, held back by inconsistent acquisition, scattered marketing, and manual follow-through. | شركات لديها طلب حقيقي، يعيقها استقطاب غير منتظم وتسويق متفرّق ومتابعة يدوية. |
| Problem `solutions.growth.problem` | Revenue is growing, but growth depends on disconnected campaigns, manual processes, and people pushing everything forward. | الإيرادات تنمو، لكن النمو يعتمد على حملات غير مترابطة وعمليات يدوية وأشخاص يدفعون كل شيء إلى الأمام. |
| Component 1 title `inc1.title` | Marketing Systems | أنظمة التسويق |
| Component 1 body `inc1.body` | The acquisition engine — planned, built and measured as one system rather than separate campaigns. | محرّك الاستقطاب — يُخطَّط ويُبنى ويُقاس كنظام واحد لا كحملات منفصلة. |
| — item1 | Marketing strategy and plan | استراتيجية التسويق وخطة التنفيذ |
| — item2 | SEO and organic growth | تحسين محركات البحث والنمو العضوي |
| — item3 | Media buying and paid campaigns | شراء الوسائط والحملات المدفوعة |
| — item4 | Funnel strategy and conversion optimization | استراتيجية المسار وتحسين التحويل |
| — item5 | Performance tracking and attribution | تتبّع الأداء وإسناد النتائج |
| Component 2 title `inc2.title` | Conversion assets | أصول التحويل |
| Component 2 body `inc2.body` | What the funnel points at — the pages the acquisition system needs in order to convert. | ما يوجّه إليه المسار التسويقي — الصفحات التي يحتاجها نظام الاستقطاب ليحوّل. |
| — item1 | CMS website | موقع بنظام إدارة محتوى |
| — item2 | Landing pages | صفحات هبوط |
| — item3 | Campaign pages | صفحات الحملات |
| Component 3 title `inc3.title` | Revenue operations | عمليات الإيرادات |
| Component 3 body `inc3.body` | CRM set up for lead management across the commercial team, with the follow-through automated. | نظام إدارة عملاء مهيّأ لإدارة العملاء المحتملين عبر الفريق التجاري، مع أتمتة المتابعة. |
| — item1 | CRM for lead capture and pipeline | نظام CRM لالتقاط العملاء المحتملين وإدارة المسار |
| — item2 | Lead routing and follow-up automation | توجيه العملاء المحتملين وأتمتة المتابعة |
| — item3 | The handoff from marketing to sales | التسليم من التسويق إلى المبيعات |
| — item4 | Data connected across the tools already in use | ربط البيانات عبر الأدوات المستخدمة بالفعل |
| Component 4 title `inc4.title` | AI Enablement | تمكين الذكاء الاصطناعي |
| Component 4 body `inc4.body` | AI inside the daily work of the commercial teams — not a training deck. | الذكاء الاصطناعي داخل العمل اليومي للفرق التجارية — لا شريحة في عرض تدريبي. |
| — item1 | Department-specific use cases | استخدامات خاصة بكل قسم |
| — item2 | Employee AI training | تدريب الموظفين على الذكاء الاصطناعي |
| — item3 | AI-assisted workflows inside existing processes | مسارات عمل مدعومة بالذكاء الاصطناعي ضمن العمليات القائمة |
| Outcome `solutions.growth.outcome` | More qualified opportunities, clearer visibility, and a team operating with AI inside real workflows. | فرص أكثر تأهيلاً، ورؤية أوضح، وفريق يعمل بالذكاء الاصطناعي داخل مسارات عمل حقيقية. |
| Price | $7,000 (Starting from) | same |
| CTA | Book a strategy call → `/contact?service=growth-engine` | احجز مكالمة استراتيجية |

**Scale Infrastructure card**
| Element | EN | AR |
|---|---|---|
| Name `solutions.scale.name` | Scale Infrastructure | Scale Infrastructure |
| Statement `solutions.scale.statement` | Your business has outgrown the systems running it. | أعمالك تجاوزت الأنظمة التي تديرها. |
| Outcome (short) `solutions.scale.outcomeShort` | Build the operating infrastructure for scale. | ابنِ البنية التشغيلية اللازمة للتوسّع. |
| Tagline `solutions.scale.tagline` | Build the systems required for operational scale. | ابنِ الأنظمة اللازمة للتوسّع التشغيلي. |
| Best for `solutions.scale.bestFor` | Companies where growth has outgrown the operation — complexity is rising and the current systems can't carry it. | شركات تجاوز نموّها تشغيلها — التعقيد يتصاعد والأنظمة الحالية لا تستطيع حمله. |
| Problem `solutions.scale.problem` | Growth creates complexity. Disconnected tools, manual operations, and limited visibility start slowing the business down — and adding people stops helping. | النمو يولّد التعقيد. الأدوات غير المترابطة والعمليات اليدوية والرؤية المحدودة تبدأ في إبطاء الأعمال — وزيادة الموظفين تتوقّف عن الإفادة. |
| "Always included" label `solutions.scale.alwaysLabel` | Always included | مشمول دائماً |
| Always-included body `solutions.scale.always` | The visibility layer: measurement, reporting, and business data connection — so the decisions after the build are made on evidence, not instinct. | طبقة الرؤية: القياس والتقارير وربط بيانات الأعمال — لتُتّخذ القرارات بعد البناء على أدلة لا على حدس. |
| "Then expands..." label `solutions.scale.expandsLabel` | Then expands, based on the business diagnosis, into: | ثم يتوسّع، بناءً على تشخيص الأعمال، ليشمل: |
| Component 1 title `inc1.title` | Core business systems | الأنظمة الأساسية للأعمال |
| Component 1 body `inc1.body` | The systems of record the business runs on, integrated rather than stacked side by side. | أنظمة السجلّ التي تقوم عليها الأعمال، مترابطة لا مرصوفة جنباً إلى جنب. |
| — item1 | CRM as the system of record across departments | نظام CRM كسجلّ موحّد عبر الأقسام |
| — item2 | ERP platforms | منصّات تخطيط الموارد ERP |
| — item3 | Business development performance management | أنظمة إدارة أداء تطوير الأعمال |
| — item4 | Integration between the core systems | الربط بين الأنظمة الأساسية |
| Component 2 title `inc2.title` | Custom applications | التطبيقات المخصّصة |
| Component 2 body `inc2.body` | Software built for how this business works, where nothing off the shelf fits. | برمجيات مبنية على طريقة عمل هذه الشركة، حيث لا يناسبها أي حل جاهز. |
| — item1 | Internal business applications | تطبيقات الأعمال الداخلية |
| — item2 | Custom software solutions | حلول برمجية مخصّصة |
| — item3 | B2B mobile applications | تطبيقات جوال للأعمال B2B |
| — item4 | Customer portals and internal tools | بوابات العملاء والأدوات الداخلية |
| Component 3 title `inc3.title` | Advanced automation and AI | أتمتة وذكاء اصطناعي متقدّم |
| Component 3 body `inc3.body` | Automation across departments, and AI embedded in the systems rather than bolted beside them. | أتمتة عابرة للأقسام، وذكاء اصطناعي مدمج في الأنظمة لا ملحق بها. |
| — item1 | Cross-department workflow automation | أتمتة سير العمل عبر الأقسام |
| — item2 | AI embedded in the business systems | ذكاء اصطناعي مدمج في أنظمة الأعمال |
| — item3 | Intelligent reporting and decision support | تقارير ذكية ودعم القرار |
| — item4 | Org-wide AI adoption and employee training | تبنّي الذكاء الاصطناعي على مستوى الشركة وتدريب الموظفين |
| Component 4 title `inc4.title` | Operational enablement | التمكين التشغيلي |
| Component 4 body `inc4.body` | The change work that makes new systems stick after handover. | عمل التغيير الذي يجعل الأنظمة الجديدة تستمر بعد التسليم. |
| — item1 | Process redesign | إعادة تصميم العمليات |
| — item2 | Adoption support | دعم التبنّي |
| — item3 | Continuous optimization after handover | التحسين المستمر بعد التسليم |
| Outcome `solutions.scale.outcome` | A scalable business infrastructure built around how your company actually operates. | بنية أعمال قابلة للتوسّع مبنية حول الطريقة التي تعمل بها شركتك فعلاً. |
| Price | $30,000 (Starting from) | same |
| CTA | Book a strategy call → `/contact?service=scale-infrastructure` | احجز مكالمة استراتيجية |

**4. Custom Transformation (band)**
| Element | EN | AR |
|---|---|---|
| Badge (conditional, when recommended) `solutions.grid.recommended` | Recommended | موصى به |
| Eyebrow `solutions.custom.eyebrow` | The escape hatch | المسار الاستثنائي |
| Heading `solutions.custom.heading` | Not every business fits a pattern. | ليست كل الأعمال تناسبها الأنماط الجاهزة. |
| Body `solutions.custom.body` | Strong sales with broken operations. AI adoption across every department at once. A combination no standard scope covers. When the business diagnosis points somewhere none of the three fit, the answer isn't a package — it's a system designed around your reality. | مبيعات قوية مع عمليات مكسورة. تبنٍّ للذكاء الاصطناعي عبر كل الأقسام دفعة واحدة. تركيبة لا يغطّيها أي نطاق جاهز. حين يشير تشخيص الأعمال إلى ما لا يناسبه أيٌّ من الثلاثة، فالإجابة ليست باقة — بل نظام مصمَّم حول واقعك. |
| Name `solutions.custom.name` | Custom Transformation | Custom Transformation |
| Price line `solutions.custom.price` | Priced after the business diagnosis. | يُسعَّر بعد تشخيص الأعمال. |
| CTA | Book a strategy call → `/contact?service=custom` | احجز مكالمة استراتيجية |

Defined but not rendered in the current band JSX (only used elsewhere/available for detail copy): `solutions.custom.composed` — EN "Built from the same four parts — strategy, marketing systems, business technology, and AI enablement — in whatever proportion the business diagnosis calls for." / AR "مبني من الأجزاء الأربعة نفسها — الاستراتيجية وأنظمة التسويق وتقنية الأعمال وتمكين الذكاء الاصطناعي — بالنِّسَب التي يستدعيها تشخيص الأعمال."

**5. How we work**
| Element | EN | AR |
|---|---|---|
| Heading `solutions.work.heading` | How we work | كيف نعمل |
| Strategy label `solutions.work.strategy.label` | Strategy | الاستراتيجية |
| Strategy body `solutions.work.strategy.body` | We diagnose the business, identify the constraints, and define the roadmap. Strategy isn't something we sell — it's how everything else gets decided. | نُشخّص الأعمال، ونحدّد القيود، ونضع خارطة الطريق. الاستراتيجية ليست شيئاً نبيعه، بل الطريقة التي تُتّخذ بها كل القرارات الأخرى. |
| Divider `solutions.work.divider` | Three capabilities deliver the transformation | وثلاث قدرات تُنفّذ التحوّل |
| Capability 1 title `solutions.work.marketing.title` | Marketing Systems | أنظمة التسويق |
| Capability 1 body `solutions.work.marketing.body` | Build measurable acquisition systems — search, paid, conversion, and tracking wired together instead of run separately. | بناء أنظمة استقطاب قابلة للقياس — بحث وإعلانات مدفوعة وتحويل وقياس مترابطة معاً بدلاً من تشغيلها منفصلة. |
| Capability 2 title `solutions.work.tech.title` | Business Technology | تقنية الأعمال |
| Capability 2 body `solutions.work.tech.body` | Build and connect the systems the business runs on — ERP, CRM, web and mobile platforms, and the automation between them. | بناء وربط الأنظمة التي تدير بها الأعمال — تخطيط الموارد وإدارة العملاء ومنصّات الويب والجوال والأتمتة بينها. |
| Capability 3 title `solutions.work.ai.title` | AI Enablement | تمكين الذكاء الاصطناعي |
| Capability 3 body `solutions.work.ai.body` | Embed AI into real workflows so teams actually use it, inside the work they already do. | دمج الذكاء الاصطناعي في مسارات العمل الحقيقية ليستخدمه الفريق فعلاً، ضمن العمل الذي يؤدّيه أصلاً. |

**6. Proof** (hidden when no featured projects; identical mechanism/labels pattern to Home's proof section)
| Element | EN | AR |
|---|---|---|
| Heading `solutions.proof.heading` | What this looks like in practice | كيف يبدو هذا على أرض الواقع |
| Sub `solutions.proof.sub` | Real engagements, and what changed in the business. | تعاونات حقيقية، وما الذي تغيّر في الأعمال. |

**7. FAQ**
| Element | EN | AR |
|---|---|---|
| Heading `solutions.faq.heading` | Common questions | أسئلة شائعة |
| Q1 `solutions.faq.q1` | How do we know which solution we need? | كيف نعرف أي حل نحتاج؟ |
| A1 `solutions.faq.a1` | Most companies don't, and that's fine. The business diagnosis exists to answer that question before anyone commits to a build. | معظم الشركات لا تعرف، وهذا طبيعي. تشخيص الأعمال موجود للإجابة عن هذا السؤال قبل الالتزام بأي تنفيذ. |
| Q2 `solutions.faq.q2` | Do we have to start with Foundation? | هل يجب أن نبدأ بـ Foundation؟ |
| A2 `solutions.faq.a2` | No. Foundation is for companies that can't yet name the constraint. If it's already clear, we start where the problem is. Every solution includes a business diagnosis phase either way. | لا. Foundation مخصّص للشركات التي لا تستطيع بعد تسمية القيد. وإن كان واضحاً بالفعل، فنبدأ من حيث المشكلة. وكل حل يشمل مرحلة تشخيص أعمال في الحالتين. |
| Q3 `solutions.faq.q3` | Why is pricing "starting from"? | لماذا السعر «يبدأ من»؟ |
| A3 `solutions.faq.a3` | Because scope depends on what the business diagnosis finds. The figure shown is the floor. The final number comes with the proposal. | لأن النطاق يعتمد على ما يكشفه تشخيص الأعمال. الرقم المعروض هو الحد الأدنى، والرقم النهائي يأتي مع العرض. |
| Q4 `solutions.faq.q4` | Is this a monthly retainer? | هل هذا اشتراك شهري؟ |
| A4 `solutions.faq.a4` | No. These are systems you own — source code, platforms, and data. Ongoing support is a separate agreement if you want one. | لا. هذه أنظمة تملكها — الشيفرة المصدرية والمنصّات والبيانات. أما الدعم المستمر فاتفاق منفصل إن أردته. |
| Q5 `solutions.faq.q5` | Do we own what you build? | هل نملك ما تبنونه؟ |
| A5 `solutions.faq.a5` | Yes. Full source code and IP transfer on completion. No lock-in, no fee to access your own system. | نعم. تُنقل الملكية الفكرية وكامل الشيفرة المصدرية عند الإنجاز. لا تقييد، ولا رسوم للوصول إلى نظامك. |
| Q6 `solutions.faq.q6` | What happens to the Foundation fee if we implement? | ماذا يحدث لقيمة Foundation إن مضينا في التنفيذ؟ |
| A6 `solutions.faq.a6` | It's credited toward the project, provided implementation starts within 90 days and is based on that diagnosis. It isn't a refund — you bought a roadmap, and you keep it whether you build with us or not. | تُخصم من قيمة المشروع، شريطة أن يبدأ التنفيذ خلال 90 يوماً وأن يستند إلى ذلك التشخيص. وهي ليست استرداداً — لقد اشتريت خارطة طريق، وتبقى لك سواء بنيت معنا أم لا. |
| Q7 `solutions.faq.q7` | Is AI training sold separately? | هل يُباع التدريب على الذكاء الاصطناعي بشكل منفصل؟ |
| A7 `solutions.faq.a7` | No. AI enablement is built into every solution, because training that isn't attached to a real workflow doesn't survive the month after it ends. | لا. تمكين الذكاء الاصطناعي مدمج في كل حل، لأن التدريب غير المرتبط بسير عمل حقيقي لا يصمد بعد انتهائه بشهر. |

**8. Final CTA**
| Element | EN | AR |
|---|---|---|
| Heading `solutions.cta.heading` | Not sure what's blocking you? | لست متأكداً ما الذي يعيقك؟ |
| Body `solutions.cta.body` | Book a strategy call. We'll tell you honestly where the constraint is — and if we're not the right partner, we'll say that too. | احجز مكالمة استراتيجية. سنخبرك بصراحة أين يقع القيد — وإن لم نكن الشريك المناسب، فسنقول ذلك أيضاً. |
| Button `common.cta.bookCall` | Book a strategy call | احجز مكالمة استراتيجية |

### 3. How Arabic is handled

Same site-wide mechanism — see **HOME § 3. How Arabic is handled** above. One page-specific nuance: solution/product names (Foundation, Growth Engine, Scale Infrastructure, Custom Transformation) and every FAQ answer that names them are run through a local `ltrNames()` helper (regex `/(Custom Transformation|Scale Infrastructure|Growth Engine|Foundation)/`, longest-match-first) that wraps just the matched name in `<span dir="ltr">`, so the product name stays LTR inside an RTL sentence without affecting anything else in the string.

---

## DESIGN TOKENS (site-wide)

### Styling system

**Tailwind CSS** (utility classes throughout) + **shadcn/ui** component primitives (`client/src/components/ui/*`, configured via `components.json`) + a small set of hand-rolled global CSS in `client/src/index.css` for CSS custom properties, RTL overrides, and keyframes. No CSS modules, no styled-components, no plain hand-authored page CSS. Tailwind config: `tailwind.config.ts`.

### Color palette

Colors are defined as **HSL CSS custom properties** in `client/src/index.css` (`:root` = light theme, `.dark` = dark theme override block — note the site's actual pages hardcode `bg-slate-950`/`bg-slate-900` etc. directly rather than switching the `.dark` class, so the `.dark` block below exists in the design system but is not the mechanism driving the dark sections visible on Home/About/Solutions). Values are `H S% L%` triplets consumed as `hsl(var(--x) / <alpha-value>)`.

**Brand tokens ("Ember on gunmetal")**
```css
--gunmetal: 222 47% 11%;
--midnight: 222 47% 7%;
--brand-400: 27 96% 61%;   /* orange-400 — accent text on dark */
--brand-500: 25 95% 53%;   /* orange-500 — core brand */
--brand-600: 21 90% 48%;   /* orange-600 — solid CTA fill (default) */
--brand-700: 17 88% 40%;   /* orange-700 — hover / pressed / on-light text */
--brand-light: 38 92% 50%; /* amber-500 — highlight word & footer signal dot */
--surface-light: 210 14% 97%; /* #F6F7F8 — light readability bands */
```

**Core theme (light `:root`)**
```css
--background: 0 0% 100%;
--foreground: 222 47% 11%;
--card: 0 0% 100%;              --card-foreground: 222 47% 11%;         --card-border: 214 32% 91%;
--popover: 0 0% 100%;           --popover-foreground: 222 47% 11%;      --popover-border: 214 32% 91%;
--primary: 20 100% 56%;         /* Flow Orange #FF6B1F — the one canonical CTA fill */
--primary-foreground: 0 0% 100%;
--primary-border: 20 100% 47%;
--secondary: 210 40% 96.1%;     --secondary-foreground: 222 47% 11%;    --secondary-border: 214 32% 91%;
--muted: 210 40% 96.1%;         --muted-foreground: 215.4 16.3% 46.9%;  --muted-border: 214 32% 91%;
--accent: 222 47% 11%;          --accent-foreground: 210 40% 98%;       --accent-border: 222 47% 15%;
--destructive: 0 84.2% 60.2%;   --destructive-foreground: 210 40% 98%;  --destructive-border: 0 84.2% 60.2%;
--border: 214.3 31.8% 91.4%;
--input: 214.3 31.8% 91.4%;
--ring: 25 95% 53%;             /* focus ring = brand orange-500 */
--radius: 0.5rem;
--chart-1: 38 92% 50%;  --chart-2: 173 58% 39%;  --chart-3: 222 47% 11%;  --chart-4: 43 74% 66%;  --chart-5: 27 87% 67%;
```

**Dark override (`.dark` class block — see note above on where it's actually used)**
```css
--background: 222 47% 11%;      --foreground: 210 40% 98%;
--card: 217 33% 17%;            --card-foreground: 210 40% 98%;         --card-border: 217 33% 20%;
--popover: 222 47% 11%;         --popover-foreground: 210 40% 98%;      --popover-border: 217 33% 20%;
--primary: 210 40% 98%;         --primary-foreground: 222 47% 11%;      --primary-border: 210 40% 98%;
--secondary: 217 33% 17%;       --secondary-foreground: 210 40% 98%;    --secondary-border: 217 33% 20%;
--muted: 217 33% 17%;           --muted-foreground: 215 20.2% 65.1%;    --muted-border: 217 33% 20%;
--accent: 217 33% 17%;          --accent-foreground: 210 40% 98%;       --accent-border: 217 33% 20%;
--destructive: 0 62.8% 30.6%;   --destructive-foreground: 210 40% 98%;  --destructive-border: 0 62.8% 30.6%;
--border: 217.2 32.6% 17.5%;
--input: 217.2 32.6% 17.5%;
--ring: 210 40% 98%;
```

**Actual page backgrounds observed in JSX** (Tailwind slate scale, used directly — not via the CSS vars above): `bg-slate-950`, `bg-slate-900`, `bg-slate-900/30`, `bg-slate-900/50`, gradients like `bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950`, and the light "trust/readability" band `bg-surface` (→ `--surface-light` = `#F6F7F8`).

**Shadows**
```css
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.30);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.35);
--shadow-md: 0 4px 16px -6px rgb(0 0 0 / 0.45);
```
Exposed as Tailwind `shadow-card` (→ `--shadow-xs`) and `shadow-elevated` (→ `--shadow-md`).

**Motion tokens**
```css
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
--duration-fast: 150ms;  --duration-base: 250ms;  --duration-slow: 400ms;
```
Exposed as Tailwind `ease-standard`.

### Typography

- **Body/sans:** Inter (`--font-sans: 'Inter', sans-serif'`; Tailwind `font-sans` → `["Inter", "var(--font-sans)"]`)
- **Display/headings:** Space Grotesk, falling back to Inter (`--font-display`; Tailwind `font-display` → `["Space Grotesk", "Inter", "sans-serif"]`)
- **Mono:** system stack only, no webfont — `--font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace` (Tailwind `font-mono` maps to this var)
- **Arabic (RTL):** Cairo, loaded alongside the above and swapped in via `[dir="rtl"] body { font-family: "Cairo", "Inter", sans-serif; }` and `[dir="rtl"] .font-display { font-family: "Cairo", "Space Grotesk", sans-serif; }`. Latin runs (brand name, ERP/CRM/AI, solution names) still render via the Inter/Space Grotesk fallback inside the same stack even in RTL.
- **Loaded from Google Fonts** in `client/index.html`:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Space+Grotesk:wght@400;700&family=Cairo:wght@400;700&display=swap" rel="stylesheet">
  ```
  (Inter weights 300/400/500/600/700/900; Space Grotesk 400/700; Cairo 400/700.)
- **Observed heading sizes** (Tailwind utility classes seen directly in JSX, not tokens): hero H1s run `text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black` (Home) or `text-4xl md:text-6xl font-display font-bold` (About) or `text-4xl font-bold sm:text-5xl` (Solutions); section H2s typically `text-3xl md:text-4xl font-bold` or `font-display text-2xl ... sm:text-3xl md:text-4xl` on Solutions; body copy `text-lg`/`text-xl leading-relaxed`.

### Tailwind config (verbatim, `tailwind.config.ts`)

```ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // ... keep existing radii/colors ...
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
          border: "hsl(var(--card-border) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
          border: "hsl(var(--popover-border) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          border: "var(--primary-border)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
          border: "var(--secondary-border)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
          border: "var(--muted-border)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
          border: "var(--accent-border)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
          border: "var(--destructive-border)",
        },
        // Brand accent — "Ember on gunmetal" (orange family, no red).
        // Prefer these tokens over hardcoded orange-* utilities.
        brand: {
          DEFAULT: "hsl(var(--brand-500) / <alpha-value>)",
          400: "hsl(var(--brand-400) / <alpha-value>)",
          500: "hsl(var(--brand-500) / <alpha-value>)",
          600: "hsl(var(--brand-600) / <alpha-value>)",
          700: "hsl(var(--brand-700) / <alpha-value>)",
          light: "hsl(var(--brand-light) / <alpha-value>)",
        },
        // Light readability surface (#F6F7F8) — P6 trust/readability bands.
        surface: "hsl(var(--surface-light) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        chart: {
          "1": "hsl(var(--chart-1) / <alpha-value>)",
          "2": "hsl(var(--chart-2) / <alpha-value>)",
          "3": "hsl(var(--chart-3) / <alpha-value>)",
          "4": "hsl(var(--chart-4) / <alpha-value>)",
          "5": "hsl(var(--chart-5) / <alpha-value>)",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          primary: "hsl(var(--sidebar-primary) / <alpha-value>)",
          "primary-foreground":
            "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
          accent: "hsl(var(--sidebar-accent) / <alpha-value>)",
          "accent-foreground":
            "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
          ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["Inter", "var(--font-sans)"],
        display: ["Space Grotesk", "Inter", "sans-serif"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        // New scroll animation for the logo ticker
        scroll: {
          to: { transform: "translate(calc(-50% - 0.5rem))" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
        // Scroll takes 40s to loop - adjust for speed
        scroll: "scroll 40s linear infinite",
      },
      // Extremely subtle elevation (Linear / Vercel / Stripe). Named tokens so
      // components opt in; Tailwind's default shadow-* are left untouched.
      boxShadow: {
        card: "var(--shadow-xs)",
        elevated: "var(--shadow-md)",
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
```

Note: the `home.transform` marquee (`animate-marquee`) is defined inline in a `<style>` tag inside `Home.tsx` itself, not in the Tailwind config — `@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .animate-marquee { animation: marquee 30s linear infinite; }`.

### Header / Navigation (`client/src/components/Navigation.tsx`)

Fixed top nav, transitions from transparent to `bg-slate-950/90 backdrop-blur-md` on scroll (`scrollY > 20`).

**Logo:** code-based (no image asset) — a `Hexagon` (lucide) icon + "Omniflow" (white) + "AI" (brand orange), rendered `dir="ltr"` even under Arabic so the brand lockup never mirrors.

**Nav links** (`nav.*` keys), in order:
| Href | EN label (`key`) | AR label |
|---|---|---|
| `/` | Home (`nav.home`) | الرئيسية |
| `/services` | Solutions (`nav.services`) | الحلول |
| `/portfolio` | Portfolio (`nav.portfolio`) | أعمالنا |
| `/articles` | Articles (`nav.articles`) | المقالات |
| `/about` | About (`nav.about`) | من نحن |
| `/contact` | Contact (`nav.contact`) | تواصل معنا |

**Right side (desktop):** a language-toggle icon button (`Globe` icon; `aria-label` "التبديل إلى العربية" when in EN / "Switch to English" when in AR — these two literal strings are hardcoded, not i18n keys), then the primary CTA button (`common.cta.bookCall`, → `/contact`).

**Mobile menu:** same 6 links stacked, then the primary CTA full-width, then a labeled language toggle button showing "العربية" (when in EN) or "English" (when in AR) — also hardcoded literals, not i18n keys.

### Footer (`client/src/components/Footer.tsx`)

4-column grid (2-col on mobile, brand + newsletter spanning full width).

**Column 1 — Brand:** "OmniflowAI" wordmark (plain text, not the hexagon logo) + amber pulsing dot, tagline (`footer.tagline`), social icons (only rendered for platforms with a non-empty URL in `SOCIAL_LINKS` — currently **none**, since all three are empty strings in `shared/taxonomy.ts`, so no social icons currently render).

**Column 2 — Services** (`footer.services` heading), links in order:
| Href | EN label | AR label |
|---|---|---|
| `/services/ai-training` | AI Enablement (`footer.link.aiTraining`) | تمكين الذكاء الاصطناعي |
| `/services/digital-marketing` | Marketing Systems (`footer.link.digitalMarketing`) | أنظمة التسويق |
| `/services/software` | Business Technology (`footer.link.software`) | تقنية الأعمال |

**Column 3 — Company** (`footer.company` heading), links in order:
| Href | EN label | AR label |
|---|---|---|
| `/about` | About (`footer.link.about`) | من نحن |
| `/portfolio` | Work (`footer.link.work`) | الأعمال |
| `/articles` | Articles (reuses `nav.articles`) | المقالات |
| `/contact` | Contact (`footer.link.contact`) | تواصل |

(Source has `// TODO(legal-final): add real privacy/terms pages before/after launch` — no privacy/terms links exist yet, by design.)

**Column 4 — Stay Connected:** heading `footer.stayConnected` ("Stay Connected" / "ابقَ على تواصل"; shows `footer.connectShort` ("Connect" / "تواصل") on mobile only), a newsletter form (`footer.newsletter.text`: "Practical notes on AI, marketing, and the systems that connect them — straight to your inbox." / "ملاحظات عملية حول الذكاء الاصطناعي والتسويق والأنظمة التي تربطها — إلى بريدك مباشرة."; placeholder `footer.newsletter.placeholder` = "Enter your email" / "أدخل بريدك الإلكتروني"; posts to `POST /api/subscribe`; success toast `footer.toast.subscribed` = "Thanks — you're subscribed." / "شكراً — تم اشتراكك."; error toast `footer.toast.error` = "Something went wrong, please try again." / "حدث خطأ ما، حاول مجدداً."), then the contact email (`CONTACT_EMAIL` from `shared/taxonomy.ts` = **`contact@omniflowai.net`** — marked `TODO(email-final)`, a placeholder, not translated) and location (`footer.location` = "Wyoming, USA" / "وايومنغ، الولايات المتحدة الأمريكية").

**Bottom bar:** `© {currentYear} {footer.copyright}` where `footer.copyright` = "Omniflowai LLC" / "شركة OmniflowAI LLC. جميع الحقوق محفوظة." (year is computed client-side via `new Date().getFullYear()`, not a static string).

---

## GLOBAL CTA

**Label** (`common.cta.bookCall`): **EN "Book a strategy call" / AR "احجز مكالمة استراتيجية"**.

This exact key is reused verbatim everywhere the CTA appears (a deliberate single-source-of-truth per a source comment, "§0.10"): header nav (desktop + mobile), Home hero, Home global-brand-line band, Home final CTA (a second key, `home.finalCta.button` = "Book your strategy call" / "احجز مكالمتك الاستراتيجية", is used only for that one final-CTA button — everywhere else it's the exact `common.cta.bookCall` string above), About CTA, Solutions hero, each of the 3 Solutions cards, the Custom Transformation band, and the Solutions final CTA.

**Link target:** `/contact` in nearly all cases; the Solutions page's per-card and Custom-band CTAs append a `service` query param instead — `/contact?service=foundation`, `/contact?service=growth-engine`, `/contact?service=scale-infrastructure`, `/contact?service=custom` — so the lead record captures which card/band produced the enquiry.
