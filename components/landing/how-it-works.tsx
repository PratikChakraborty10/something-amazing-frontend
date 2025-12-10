"use client";

import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { Users, PenLine, Palette, Send } from "lucide-react";

const steps = [
  {
    icon: Users,
    title: "Organize your contacts",
    description:
      "Import contacts, create lists, and tag them for precise targeting.",
  },
  {
    icon: PenLine,
    title: "Create a campaign",
    description:
      "Set up campaign details and pick which lists to send to.",
  },
  {
    icon: Palette,
    title: "Design your email",
    description:
      "Craft beautiful emails with our editor, templates, and personalization.",
  },
  {
    icon: Send,
    title: "Send & track",
    description:
      "Send now or schedule. Track opens, clicks, and conversions live.",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="py-24 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as const }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From contacts to campaigns in just a few clicks
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: index * 0.2,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="relative text-center"
            >
              {/* Step circle */}
              <div className="relative inline-flex mb-6">
                <div className="size-32 rounded-full bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center">
                  <div className="size-20 rounded-full bg-card border-2 border-primary/20 flex items-center justify-center shadow-lg">
                    <step.icon className="size-8 text-primary" />
                  </div>
                </div>
                <span className="absolute -top-2 -right-2 size-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </span>
              </div>

              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
