import { buildServiceMetadata } from "@/lib/services/metadata";
import { getServiceContent } from "@/lib/services/content";
import { buildServiceJsonLd, buildBreadcrumbJsonLd } from "@/lib/structured-data";
import { ServiceDetailPage } from "@/components/services/service-detail-page";

const SLUG = "software" as const;
const LANGUAGE = "en" as const;

export function generateMetadata() {
  return buildServiceMetadata(SLUG, LANGUAGE);
}

export default function SoftwareServicePage() {
  const content = getServiceContent(SLUG, LANGUAGE);

  const serviceJsonLd = buildServiceJsonLd(
    { name: content.title, description: content.metaDescription, slug: SLUG },
    LANGUAGE,
  );
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(
    [
      { name: "Home", path: "/" },
      { name: "Solutions", path: "/solutions" },
      { name: content.eyebrow, path: `/services/${SLUG}` },
    ],
    LANGUAGE,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ServiceDetailPage slug={SLUG} language={LANGUAGE} />
    </>
  );
}
