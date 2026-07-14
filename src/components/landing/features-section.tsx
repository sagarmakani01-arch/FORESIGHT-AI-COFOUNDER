"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Brain,
  Search,
  Package,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Strategy",
    description: "Get board-level strategic advice 24/7 from your AI co-founder",
  },
  {
    icon: Search,
    title: "Market Research",
    description: "Deep market analysis and competitor intelligence in minutes",
  },
  {
    icon: Package,
    title: "Product Builder",
    description: "From PRD to production-ready roadmaps and specifications",
  },
  {
    icon: DollarSign,
    title: "Financial Modeling",
    description: "Revenue projections, burn rate, runway — all automated",
  },
  {
    icon: TrendingUp,
    title: "Investor Ready",
    description: "Pitch decks, memos, and due diligence prep on demand",
  },
  {
    icon: Users,
    title: "Team Building",
    description: "Hiring plans, org structure, and culture definition",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
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

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="relative py-32 bg-background" ref={ref}>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
            Everything you need to build a unicorn
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            A complete AI-powered toolkit for founders. No more juggling
            dozens of tools — GENESIS handles it all.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative rounded-[0.75rem] border border-border bg-surface p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[0.5rem] bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
