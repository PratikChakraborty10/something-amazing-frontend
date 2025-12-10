"use client";

import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { ArrowRight, Check, Sparkles, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const freeFeatures = [
  "Unlimited contacts",
  "Very generous rate limits",
  "Full analytics dashboard",
  "Custom domain verification",
  "Rich email editor",
  "Template library",
];

export function PricingCta() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="pricing" className="py-24 px-4 bg-muted/30" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as const }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm font-medium mb-6 border border-green-500/20">
            <Sparkles className="size-4" />
            Everything is free during our launch period
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Start building for free
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We&apos;re in early access — enjoy generous limits at no cost while we grow together.
          </p>
        </motion.div>

        {/* Free Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.6,
            delay: 0.2,
            ease: [0.4, 0, 0.2, 1] as const,
          }}
          className="relative p-8 md:p-12 rounded-3xl border-2 border-primary bg-card shadow-xl shadow-primary/10"
        >
          {/* Badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-primary text-primary-foreground text-sm font-bold rounded-full">
            🎉 Free Forever (During Beta)
          </div>

          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Free Plan</h3>
            <div className="mb-4">
              <span className="text-5xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-muted-foreground">
              Full access to all features — no credit card required
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            {freeFeatures.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="size-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <Check className="size-3 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <Button size="lg" asChild className="w-full rounded-full h-12 text-base">
            <Link href="/signup">
              Get Started Free
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.6,
            delay: 0.4,
            ease: [0.4, 0, 0.2, 1] as const,
          }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-muted rounded-2xl border">
            <Rocket className="size-5 text-primary" />
            <div className="text-left">
              <p className="font-medium">Pro & Enterprise plans coming soon</p>
              <p className="text-sm text-muted-foreground">
                We&apos;ll notify you when premium features launch — current users get early-bird pricing
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
