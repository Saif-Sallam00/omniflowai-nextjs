import type { Language } from "@/lib/language";

export const SERVICE_SLUGS = ["ai-training", "digital-marketing", "software"] as const;
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export type ServiceProblem = string;

export type ServiceCapability = {
  title: string;
  problemLabel: string;
  problem: string;
  body: string;
};

export type SolutionRelationshipId = "foundation" | "growth-engine" | "scale-infrastructure";

export type ServiceSolutionRelationship = {
  id: SolutionRelationshipId;
  /** "Assessed here" or "Built here" */
  tag: string;
  body: string;
};

export type ServiceFaqItem = {
  q: string;
  a: string;
};

export type ServiceDetailContent = {
  slug: ServiceSlug;
  language: Language;
  eyebrow: string;
  title: string;
  lead: string;
  seoTitle: string;
  metaDescription: string;
  problemHeading: string;
  problems: ServiceProblem[];
  capabilitiesHeading: string;
  capabilitiesSub: string;
  capabilities: ServiceCapability[];
  solutionsHeading: string;
  solutionsSub: string;
  relationships: ServiceSolutionRelationship[];
  faqHeading: string;
  faq: ServiceFaqItem[];
  finalCtaHeading: string;
  finalCtaBody: string;
};
