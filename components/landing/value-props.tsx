"use client";

import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { Zap, Shield, BarChart3 } from "lucide-react";

const valueProps = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Send millions of emails in minutes with our high-performance delivery infrastructure.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Your data is protected with bank-grade encryption and SOC 2 compliance.",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description:
      "Track opens, clicks, and conversions with real-time dashboards and reports.",
  },
];

export function ValueProps() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Why teams choose Email Config
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to run successful email campaigns, without the complexity
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {valueProps.map((prop, index) => (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="group relative p-8 rounded-3xl bg-gradient-to-b from-muted/50 to-transparent border hover:border-primary/30 transition-colors"
            >
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <prop.icon className="size-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{prop.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {prop.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
