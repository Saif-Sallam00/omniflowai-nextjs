import { buildPageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return buildPageMetadata({
    path: "/",
    language: "ar",
    title: "OmniflowAI — الأساس",
    description: "إصدار الأساس التجريبي للمرحلة صفر.",
  });
}

export default function HomePage() {
  return (
    <main>
      <h1>OmniflowAI — الأساس</h1>
      <p>
        هذا هو إصدار الأساس التجريبي للمرحلة صفر. الغرض منه التحقق من بيئة
        التشغيل وقاعدة البيانات ونظام المصادقة للتطبيق المستهدف. لا يعرض بعد
        أي محتوى فعلي للموقع.
      </p>
    </main>
  );
}
