"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const testimonials = [
  {
    quote:
      "GENESIS replaced my entire founding team. The AI co-founder helped me validate my idea, build a roadmap, and even prepare for our Series A.",
    author: "Sarah Chen",
    title: "CEO & Founder",
    company: "NeuralPath AI",
    initials: "SC",
  },
  {
    quote:
      "We went from concept to $2M ARR in 8 months. GENESIS handled everything from market research to financial modeling. Absolute game-changer.",
    author: "Marcus Williams",
    title: "Co-Founder",
    company: "ScaleForge",
    initials: "MW",
  },
  {
    quote:
      "The strategic insights are indistinguishable from a senior partner at a top VC firm. GENESIS gave us the confidence to raise our seed round.",
    author: "Priya Patel",
    title: "Founder & CEO",
    company: "QuantumLeap",
    initials: "PP",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  },
};

export function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-32 bg-background" ref={ref}>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
            Trusted by ambitious founders
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Join thousands of founders who are building the future with
            GENESIS.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-16 grid gap-5 md:grid-cols-3"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.author}
              variants={itemVariants}
              className="rounded-[0.75rem] border border-border bg-surface p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-sm leading-relaxed text-foreground">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-xs font-semibold">{t.initials}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.author}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.title}, {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
