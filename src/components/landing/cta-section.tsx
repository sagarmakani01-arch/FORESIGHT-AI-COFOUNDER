"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { IMAGES } from "@/lib/images";

export function CtaSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative overflow-hidden py-32 bg-surface-container" ref={ref}>
      <div className="pointer-events-none absolute inset-0">
        <Image
          src={IMAGES.skyline.src}
          alt=""
          fill
          sizes="100vw"
          quality={90}
          className="object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
            Ready to build the future?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Join thousands of founders who are building with GENESIS. Start
            your journey today.
          </p>

          <div className="mt-10">
            <Link
              href="/register"
              className="inline-block rounded-full bg-primary px-10 py-4 text-base font-semibold text-white transition-all duration-200 hover:bg-primary-hover"
            >
              Get Started Free
            </Link>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required. Free for your first 30 days.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
