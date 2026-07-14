"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { IMAGES } from "@/lib/images";

const steps = [
  {
    number: "01",
    title: "Tell us your vision",
    description:
      "Have a conversation with GENESIS about your idea, goals, and vision. Our AI interviews you like a co-founder would.",
    image: IMAGES.skyline,
  },
  {
    number: "02",
    title: "GENESIS builds your roadmap",
    description:
      "AI analyzes your market, competition, and resources to create a comprehensive strategic roadmap.",
    image: IMAGES.servers,
  },
  {
    number: "03",
    title: "Launch and scale",
    description:
      "Execute with AI guidance every step of the way — from product development to fundraising to growth.",
    image: IMAGES.commandCenter,
  },
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="how-it-works"
      className="relative py-32 bg-surface-container"
      ref={ref}
    >
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
            How it works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Three steps from idea to launch. GENESIS handles the complexity
            so you can focus on your vision.
          </p>
        </motion.div>

        <div className="relative mt-20">
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border lg:block" />

          <div className="space-y-16 lg:space-y-0">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{
                  duration: 0.7,
                  delay: index * 0.15,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className={`relative flex flex-col items-center gap-8 lg:mb-20 lg:flex-row ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-1 text-center lg:text-right">
                  <div
                    className={`inline-block ${index % 2 === 1 ? "lg:text-left" : ""}`}
                  >
                    <span className="label-caps text-primary">
                      Step {step.number}
                    </span>
                    <h3 className="mt-3 text-2xl font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-md text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-surface">
                  <span className="text-sm font-bold text-primary">
                    {step.number}
                  </span>
                </div>

                <div className="flex-1 hidden lg:block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg thin-border">
                    <Image
                      src={step.image.src}
                      alt={step.image.alt}
                      fill
                      sizes="(max-width: 1024px) 0vw, 448px"
                      quality={90}
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
