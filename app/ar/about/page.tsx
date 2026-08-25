import { buildPageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return buildPageMetadata({
    path: "/about",
    language: "ar",
    title: "من نحن — OmniflowAI",
    description: "صفحة تجريبية للتحقق من التوجيه ثنائي اللغة في المرحلة 1A.",
  });
}

export default function AboutPage() {
  return (
    <main>
      <h1>من نحن</h1>
      <p>
        هذه صفحة تجريبية بسيطة. الغرض منها التحقق من التوجيه ثنائي اللغة
        والبيانات الوصفية بما يتجاوز الصفحة الرئيسية. المحتوى الفعلي سيُضاف
        في مرحلة لاحقة.
      </p>
    </main>
  );
}
