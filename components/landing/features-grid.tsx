"use client";

import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import {
  Mail,
  Users,
  Globe,
  BarChart3,
  Sparkles,
  Clock,
  Shield,
  Webhook,
  Lock,
  type LucideIcon,
} from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  comingSoon?: boolean;
}

const features: Feature[] = [
  {
    icon: Mail,
    title: "Campaign Builder",
    description: "Multi-step wizard for creating campaigns with scheduling and recipient targeting.",
  },
  {
    icon: Users,
    title: "Contact Management",
    description: "Import, organize, and segment contacts with tags, lists, and smart filters.",
  },
  {
    icon: Globe,
    title: "Domain Verification",
    description: "Verify your sending domains with SPF, DKIM, and DMARC for better deliverability.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track opens, clicks, bounces, and conversions with beautiful dashboards.",
    comingSoon: true,
  },
  {
    icon: Sparkles,
    title: "Rich Email Editor",
    description: "WYSIWYG editor with templates, personalization tokens, and mobile preview.",
  },
  {
    icon: Clock,
    title: "Scheduling",
    description: "Schedule campaigns for the perfect time or send immediately with one click.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption, SOC 2 compliance, and role-based access control.",
  },
  {
    icon: Webhook,
    title: "Webhooks & API",
    description: "Integrate with your stack using our REST API and real-time webhooks.",
    comingSoon: true,
  },
];

export function FeaturesGrid() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-24 px-4 bg-muted/30" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as const }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Everything you need to succeed
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features that scale with your business
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0.4, 0, 0.2, 1] as const,
              }}
              whileHover={
                feature.comingSoon
                  ? undefined
                  : {
                      y: -8,
                      transition: { duration: 0.2 },
                    }
              }
              className={`group relative p-6 bg-card rounded-2xl border transition-all cursor-default ${
                feature.comingSoon
                  ? "opacity-75"
                  : "hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
              }`}
            >
              {/* Coming Soon Badge */}
              {feature.comingSoon && (
                <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium rounded-full border border-amber-500/20">
                  <Lock className="size-3" />
                  Soon
                </div>
              )}

              <div
                className={`size-12 rounded-xl flex items-center justify-center mb-4 transition-all ${
                  feature.comingSoon
                    ? "bg-muted"
                    : "bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110"
                }`}
              >
                <feature.icon
                  className={`size-6 ${
                    feature.comingSoon ? "text-muted-foreground" : "text-primary"
                  }`}
                />
              </div>
              <h3
                className={`font-semibold mb-2 ${
                  feature.comingSoon ? "text-muted-foreground" : ""
                }`}
              >
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
