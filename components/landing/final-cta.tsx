"use client";

import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function FinalCta() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 px-4" ref={ref}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as const }}
        className="max-w-4xl mx-auto text-center bg-slate-900 rounded-3xl p-12 md:p-16 text-white relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to transform your email marketing?
          </h2>
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Join thousands of marketing teams who trust Email Config to deliver
            their campaigns.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-slate-900 hover:bg-white/90 rounded-full px-8 h-12 text-base font-semibold"
              asChild
            >
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="border-2 border-white/30 bg-transparent text-white hover:bg-white/10 hover:border-white/50 rounded-full px-8 h-12 text-base"
              asChild
            >
              <a href="mailto:sales@emailconfig.io">Contact Sales</a>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
