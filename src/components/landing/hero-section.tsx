"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { X, Play } from "lucide-react";
import { IMAGES } from "@/lib/images";

const stats = [
  { value: "10,000+", label: "Startups Built" },
  { value: "$2.4B", label: "Revenue Generated" },
  { value: "95%", label: "Launch Success" },
];

export function HeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background pt-16"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.h1
            className="text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Your AI Co-Founder.
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            From idea to billion-dollar company. GENESIS is the AI-powered
            founding team that thinks, plans, and executes alongside you.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link
              href="/register"
              className="rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:bg-primary-hover"
            >
              Start Building
            </Link>
            <button
              onClick={() => setDemoOpen(true)}
              className="rounded-full border border-border px-8 py-3.5 text-base font-semibold text-foreground transition-all duration-200 hover:bg-muted"
            >
              Watch Demo
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-24 grid grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-foreground sm:text-3xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="mt-20 mx-auto max-w-4xl overflow-hidden rounded-lg thin-border"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="relative aspect-[16/9]">
            <Image
              src={IMAGES.commandCenter.src}
              alt={IMAGES.commandCenter.alt}
              fill
              sizes="(max-width: 768px) 100vw, 896px"
              quality={90}
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {demoOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70"
              onClick={() => setDemoOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/4 rounded-2xl bg-surface overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
                <h3 className="text-lg font-semibold text-on-surface">GENESIS Demo</h3>
                <button
                  onClick={() => setDemoOpen(false)}
                  className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="relative aspect-video bg-black flex items-center justify-center">
                <div className="text-center text-on-surface-variant">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                    <Play className="h-10 w-10 text-primary ml-1" />
                  </div>
                  <p className="text-lg font-medium text-on-surface">Demo Video Coming Soon</p>
                  <p className="mt-1 text-sm">Full product walkthrough — AI co-founder, file management, real-time collaboration</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
