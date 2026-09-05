import type { Language } from "@/lib/language";
import { getServiceContent } from "@/lib/services/content";
import { getServiceRelatedProjects } from "@/lib/services/related-projects";
import type { ServiceSlug } from "@/lib/services/types";
import { ServiceHero } from "@/components/services/service-hero";
import { ServiceProblemList } from "@/components/services/service-problem-list";
import { ServiceCapabilities } from "@/components/services/service-capabilities";
import { ServiceSolutionMatrix } from "@/components/services/service-solution-matrix";
import { ServiceProof } from "@/components/services/service-proof";
import { ServiceFaq } from "@/components/services/service-faq";
import { ServiceFinalCta } from "@/components/services/service-final-cta";

// The single shared page shell all six service-detail routes render through
// (three slugs × two languages) — each route's page.tsx is a thin wrapper
// that picks the slug/language and calls this.
export async function ServiceDetailPage({
  slug,
  language,
}: {
  slug: ServiceSlug;
  language: Language;
}) {
  const content = getServiceContent(slug, language);
  const relatedProjects = await getServiceRelatedProjects(slug, language);

  return (
    <main className="min-h-screen bg-slate-950 pt-20">
      <ServiceHero content={content} language={language} />
      <ServiceProblemList heading={content.problemHeading} problems={content.problems} />
      <ServiceCapabilities
        heading={content.capabilitiesHeading}
        sub={content.capabilitiesSub}
        capabilities={content.capabilities}
        language={language}
      />
      <ServiceSolutionMatrix
        heading={content.solutionsHeading}
        sub={content.solutionsSub}
        relationships={content.relationships}
        language={language}
      />
      <ServiceProof projects={relatedProjects} language={language} />
      <ServiceFaq heading={content.faqHeading} faq={content.faq} />
      <ServiceFinalCta
        heading={content.finalCtaHeading}
        body={content.finalCtaBody}
        language={language}
      />
    </main>
  );
}
