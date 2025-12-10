"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { LandingNav } from "@/components/landing/landing-nav";
import { HeroSection } from "@/components/landing/hero-section";
import { ValueProps } from "@/components/landing/value-props";
import { ProductDemo } from "@/components/landing/product-demo";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { Integrations } from "@/components/landing/integrations";
import { PricingCta } from "@/components/landing/pricing-cta";
import { Testimonials } from "@/components/landing/testimonials";
import { FinalCta } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function LandingPage() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    // Redirect authenticated users to the app
    if (accessToken) {
      router.replace("/campaigns");
    }
  }, [accessToken, router]);

  // Show nothing while checking auth
  if (accessToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main>
        <HeroSection />
        <ValueProps />
        <ProductDemo />
        <HowItWorks />
        <FeaturesGrid />
        <Integrations />
        <PricingCta />
        <Testimonials />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
