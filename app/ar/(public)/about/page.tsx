import { buildPageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return buildPageMetadata({
    path: "/about",
    language: "ar",
    title: "من نحن — OmniflowAI",
    description: "تعرف على مهمة OmniflowAI في جعل الذكاء الاصطناعي العملي متاحًا لكل شركة.",
  });
}

export default function AboutPage() {
  return (
    <main>
      <h1>من نحن في OmniflowAI</h1>
      <p>
        تأسست OmniflowAI على فكرة بسيطة: يجب أن يحل الذكاء الاصطناعي مشكلات
        عمل حقيقية، لا أن يضيف تعقيدًا. نعمل مع مؤسسات من جميع الأحجام لبناء
        أدوات أتمتة وذكاء تتناسب بشكل طبيعي مع طريقة عملها الحالية.
      </p>
      <section>
        <h2>نهجنا</h2>
        <p>
          يبدأ كل تعاون بفهم سير العمل الفعلي، وليس بقالب عام. نصمم الحلول
          حول العمل نفسه، ثم ننفذها وندمجها وندعمها على المدى الطويل.
        </p>
      </section>
      <section>
        <h2>فريقنا</h2>
        <p>
          يجمع فريقنا بين الخبرة الهندسية وخبرة الأعمال لتقديم أنظمة ذكاء
          اصطناعي موثوقة وقابلة للصيانة ومفيدة فعليًا — وليست مجرد نماذج
          أولية لا تصل أبدًا إلى الإنتاج.
        </p>
      </section>
    </main>
  );
}
