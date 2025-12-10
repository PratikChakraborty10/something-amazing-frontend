"use client";

import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import {
  CheckCircle2,
  Mail,
  Inbox,
  MousePointerClick,
  ShieldCheck,
  Globe,
  Zap,
} from "lucide-react";

const deliverabilityFeatures = [
  {
    icon: Globe,
    title: "Custom Domain Sending",
    description: "Send from your own domain for better brand recognition and inbox placement.",
  },
  {
    icon: ShieldCheck,
    title: "SPF, DKIM & DMARC",
    description: "Full email authentication to prove you're a legitimate sender.",
  },
  {
    icon: Inbox,
    title: "Inbox Optimization",
    description: "Automatic handling of bounces, complaints, and unsubscribes.",
  },
  {
    icon: Zap,
    title: "High-Speed Delivery",
    description: "Send thousands of emails per minute with our optimized infrastructure.",
  },
];

const stats = [
  { value: "99.5%", label: "Delivery Rate" },
  { value: "<2s", label: "Avg. Send Time" },
  { value: "40%+", label: "Avg. Open Rate" },
];

export function Integrations() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as const }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Built for deliverability
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every email you send lands where it should — in the inbox, not spam.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.4, 0, 0.2, 1] as const }}
          className="grid grid-cols-3 gap-8 mb-16 max-w-2xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.2 + index * 0.1,
                ease: [0.4, 0, 0.2, 1] as const,
              }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {deliverabilityFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.3 + index * 0.1,
                ease: [0.4, 0, 0.2, 1] as const,
              }}
              className="flex gap-4 p-6 bg-card rounded-2xl border hover:border-primary/30 transition-colors"
            >
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <feature.icon className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
