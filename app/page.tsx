import type { Metadata } from "next";
import { Hero } from "@/app/components/home/hero";
import { LevelQuestSection } from "@/app/components/home/levelcheck";
import { CefrJourney } from "@/app/components/home/cefr-journey";
import { SkillsShowcase, ProductShowcase } from "@/app/components/home/skills-showcase";
import {
  Personalization, LearningPath, RealLife, ProgressStory, ReportSection,
  WhyAndOrganizations, Conversion, Footer,
} from "@/app/components/home/value";

export const metadata: Metadata = {
  title: "Master English. Know Exactly Where You Stand. — English Wizard",
  description:
    "English Wizard measures your English with an adaptive LevelCheck (Pre-A1 to C2), builds your personalised learning path, trains all four skills, and documents your progress with verifiable CEFR-aligned reports.",
  openGraph: {
    title: "Master English. Know Exactly Where You Stand. — English Wizard",
    description:
      "Adaptive CEFR placement, a personalised learning path and verifiable progress reports — English for real life, Pre-A1 to C2.",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Master English. Know Exactly Where You Stand.",
    description: "Adaptive LevelCheck, personalised path, four skills, verifiable reports — Pre-A1 to C2.",
    images: ["/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "English Wizard",
  applicationCategory: "EducationalApplication",
  description:
    "Adaptive English learning platform with CEFR-aligned LevelCheck assessment (Pre-A1 to C2), personalised learning paths, four-skill practice and verifiable progress reports.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free tier with full curriculum" },
};

export default function Home() {
  return (
    <div className="hp-root">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <LevelQuestSection />
      <CefrJourney />
      <SkillsShowcase />
      <ProductShowcase />
      <Personalization />
      <LearningPath />
      <RealLife />
      <ProgressStory />
      <ReportSection />
      <WhyAndOrganizations />
      <Conversion />
      <Footer />
    </div>
  );
}
