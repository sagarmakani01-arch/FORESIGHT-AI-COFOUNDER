"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  User,
  Briefcase,
  Lightbulb,
  Building2,
  Target,
  Rocket,
  Edit3,
  Loader2,
} from "lucide-react";

interface OnboardingData {
  fullName: string;
  email: string;
  role: string;
  yearsOfExperience: string;
  previousStartups: string;
  startupDetails: string;
  industryBackground: string[];
  technicalSkills: string[];
  buildingWhat: string;
  visionStatement: string;
  mission: string;
  industrySector: string;
  targetAudience: string;
  country: string;
  budgetRange: string;
  timelineToLaunch: string;
  currentTeamSize: string;
  fundingStage: string;
  goal1: string;
  goal2: string;
  goal3: string;
  riskTolerance: number;
  communicationStyle: string;
  needsMost: string[];
}

const initialState: OnboardingData = {
  fullName: "",
  email: "",
  role: "",
  yearsOfExperience: "",
  previousStartups: "",
  startupDetails: "",
  industryBackground: [],
  technicalSkills: [],
  buildingWhat: "",
  visionStatement: "",
  mission: "",
  industrySector: "",
  targetAudience: "",
  country: "",
  budgetRange: "",
  timelineToLaunch: "",
  currentTeamSize: "",
  fundingStage: "",
  goal1: "",
  goal2: "",
  goal3: "",
  riskTolerance: 50,
  communicationStyle: "",
  needsMost: [],
};

const INDUSTRIES = [
  "SaaS",
  "FinTech",
  "HealthTech",
  "EdTech",
  "E-commerce",
  "AI/ML",
  "Web3",
  "Gaming",
  "Marketplace",
  "Hardware",
  "Climate Tech",
  "Biotech",
  "Real Estate",
  "Media",
  "Other",
];

const TECH_SKILLS = [
  "Frontend",
  "Backend",
  "Full Stack",
  "Mobile",
  "DevOps",
  "Data Science",
  "AI/ML",
  "Blockchain",
  "UI/UX",
  "Product",
  "Marketing",
  "Sales",
  "Operations",
  "Finance",
  "Legal",
];

const SECTORS = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Energy",
  "Transportation",
  "Food & Beverage",
  "Entertainment",
  "Real Estate",
  "Agriculture",
  "Other",
];

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "France",
  "India",
  "Australia",
  "Singapore",
  "Japan",
  "Brazil",
  "Nigeria",
  "UAE",
  "Other",
];

const NEEDS_OPTIONS = ["Strategy", "Technical", "Financial", "Marketing", "Hiring"];

const stepIcons = [Sparkles, User, Briefcase, Lightbulb, Building2, Target, Rocket];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
  }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLaunching, setIsLaunching] = useState(false);

  const totalSteps = 7;

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!data.fullName.trim()) newErrors.fullName = "Name is required";
        if (!data.email) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
          newErrors.email = "Invalid email";
        if (!data.role.trim()) newErrors.role = "Role is required";
        break;
      case 2:
        if (!data.yearsOfExperience)
          newErrors.yearsOfExperience = "Select experience level";
        if (!data.previousStartups) newErrors.previousStartups = "Select an option";
        if (data.industryBackground.length === 0)
          newErrors.industryBackground = "Select at least one industry";
        if (data.technicalSkills.length === 0)
          newErrors.technicalSkills = "Select at least one skill";
        break;
      case 3:
        if (!data.buildingWhat.trim())
          newErrors.buildingWhat = "Describe what you're building";
        if (!data.visionStatement.trim())
          newErrors.visionStatement = "Vision statement is required";
        if (!data.mission.trim()) newErrors.mission = "Mission is required";
        if (!data.industrySector) newErrors.industrySector = "Select an industry";
        if (!data.targetAudience.trim())
          newErrors.targetAudience = "Define your target audience";
        break;
      case 4:
        if (!data.country) newErrors.country = "Select your country";
        if (!data.budgetRange) newErrors.budgetRange = "Select a budget range";
        if (!data.timelineToLaunch)
          newErrors.timelineToLaunch = "Select a timeline";
        if (!data.currentTeamSize) newErrors.currentTeamSize = "Select team size";
        if (!data.fundingStage) newErrors.fundingStage = "Select funding stage";
        break;
      case 5:
        if (!data.goal1.trim()) newErrors.goal1 = "Goal 1 is required";
        if (!data.goal2.trim()) newErrors.goal2 = "Goal 2 is required";
        if (!data.goal3.trim()) newErrors.goal3 = "Goal 3 is required";
        if (!data.communicationStyle)
          newErrors.communicationStyle = "Select a style";
        if (data.needsMost.length === 0) newErrors.needsMost = "Select at least one";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const goToStep = (step: number) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
  };

  const handleLaunch = async () => {
    setIsLaunching(true);
    try {
      const saveRes = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: 6, data }),
      });
      if (!saveRes.ok) throw new Error("Failed to save onboarding data");

      const completeRes = await fetch("/api/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!completeRes.ok) throw new Error("Failed to complete onboarding");

      await fetch("/api/seed", { method: "POST" }).catch(() => {});

      router.push("/dashboard");
    } catch (err) {
      console.error("Onboarding launch error:", err);
      setIsLaunching(false);
    }
  };

  const toggleArrayItem = (
    field: "industryBackground" | "technicalSkills" | "needsMost",
    item: string
  ) => {
    const current = data[field];
    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    updateData({ [field]: updated });
    if (errors[field]) {
      setErrors((p) => {
        const next = { ...p };
        delete next[field];
        return next;
      });
    }
  };

  const inputClass = (error?: string) =>
    `w-full px-4 py-2.5 rounded-[0.5rem] border bg-surface text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
      error ? "border-destructive" : "border-border"
    }`;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="step0"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            custom={direction}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-28 h-28 rounded-2xl bg-primary flex items-center justify-center mb-8"
            >
              <Sparkles className="h-14 w-14 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-foreground mb-4"
            >
              Welcome to GENESIS
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-muted-foreground max-w-md mb-10"
            >
              Your AI co-founder is ready to help you build something amazing.
              Let&apos;s get to know each other first.
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={nextStep}
              className="px-8 py-3 bg-primary text-white font-medium rounded-full transition-all duration-200 flex items-center gap-2 hover:bg-primary-hover"
            >
              Let&apos;s get to know you
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="step1"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            custom={direction}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-1">Who are you?</h2>
            <p className="text-muted-foreground mb-8">Tell us a bit about yourself</p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={data.fullName}
                  onChange={(e) => {
                    updateData({ fullName: e.target.value });
                    if (errors.fullName) setErrors((p) => ({ ...p, fullName: "" }));
                  }}
                  placeholder="John Doe"
                  className={inputClass(errors.fullName)}
                />
                {errors.fullName && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive mt-1.5">
                    {errors.fullName}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => {
                    updateData({ email: e.target.value });
                    if (errors.email) setErrors((p) => ({ ...p, email: "" }));
                  }}
                  placeholder="you@example.com"
                  className={inputClass(errors.email)}
                />
                {errors.email && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive mt-1.5">
                    {errors.email}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Role / Founder Title
                </label>
                <input
                  type="text"
                  value={data.role}
                  onChange={(e) => {
                    updateData({ role: e.target.value });
                    if (errors.role) setErrors((p) => ({ ...p, role: "" }));
                  }}
                  placeholder="e.g., CEO & Co-Founder"
                  className={inputClass(errors.role)}
                />
                {errors.role && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive mt-1.5">
                    {errors.role}
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            custom={direction}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-1">Your Experience</h2>
            <p className="text-muted-foreground mb-8">Help us understand your background</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Years of Experience
                </label>
                <select
                  value={data.yearsOfExperience}
                  onChange={(e) => {
                    updateData({ yearsOfExperience: e.target.value });
                    if (errors.yearsOfExperience) setErrors((p) => ({ ...p, yearsOfExperience: "" }));
                  }}
                  className={inputClass(errors.yearsOfExperience)}
                >
                  <option value="">Select...</option>
                  <option value="0-1">0-1 years</option>
                  <option value="2-4">2-4 years</option>
                  <option value="5-7">5-7 years</option>
                  <option value="8-10">8-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
                {errors.yearsOfExperience && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive mt-1.5">
                    {errors.yearsOfExperience}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Previous Startups
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["Yes", "No"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        updateData({ previousStartups: opt });
                        if (errors.previousStartups) setErrors((p) => ({ ...p, previousStartups: "" }));
                      }}
                      className={`py-2.5 px-4 rounded-[0.5rem] border font-medium transition-all text-sm ${
                        data.previousStartups === opt
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-surface border-border text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {errors.previousStartups && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive mt-1.5">
                    {errors.previousStartups}
                  </motion.p>
                )}
              </div>

              {data.previousStartups === "Yes" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tell us about your previous startups
                  </label>
                  <textarea
                    value={data.startupDetails}
                    onChange={(e) => updateData({ startupDetails: e.target.value })}
                    placeholder="Brief description of your previous ventures..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-[0.5rem] border border-border bg-surface text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Industry Background
                </label>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleArrayItem("industryBackground", item)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                        data.industryBackground.includes(item)
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-surface border-border text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                {errors.industryBackground && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive mt-1.5">
                    {errors.industryBackground}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Technical Skills
                </label>
                <div className="flex flex-wrap gap-2">
                  {TECH_SKILLS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleArrayItem("technicalSkills", item)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                        data.technicalSkills.includes(item)
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-surface border-border text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                {errors.technicalSkills && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive mt-1.5">
                    {errors.technicalSkills}
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            custom={direction}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-1">Your Vision</h2>
            <p className="text-muted-foreground mb-8">What are you building and why does it matter?</p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  What are you building?
                </label>
                <textarea
                  value={data.buildingWhat}
                  onChange={(e) => {
                    updateData({ buildingWhat: e.target.value });
                    if (errors.buildingWhat) setErrors((p) => ({ ...p, buildingWhat: "" }));
                  }}
                  placeholder="Describe your product or service in a few sentences..."
                  rows={3}
                  className={`w-full px-4 py-2.5 rounded-[0.5rem] border bg-surface text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none ${
                    errors.buildingWhat ? "border-destructive" : "border-border"
                  }`}
                />
                {errors.buildingWhat && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive mt-1.5">
                    {errors.buildingWhat}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Vision Statement
                </label>
                <textarea
                  value={data.visionStatement}
                  onChange={(e) => {
                    updateData({ visionStatement: e.target.value });
                    if (errors.visionStatement) setErrors((p) => ({ ...p, visionStatement: "" }));
                  }}
                  placeholder="What does the future look like with your product?"
                  rows={2}
                  className={`w-full px-4 py-2.5 rounded-[0.5rem] border bg-surface text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none ${
                    errors.visionStatement ? "border-destructive" : "border-border"
                  }`}
                />
                {errors.visionStatement && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive mt-1.5">
                    {errors.visionStatement}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mission
                </label>
                <textarea
                  value={data.mission}
                  onChange={(e) => {
                    updateData({ mission: e.target.value });
                    if (errors.mission) setErrors((p) => ({ ...p, mission: "" }));
                  }}
                  placeholder="What is your core mission?"
                  rows={2}
                  className={`w-full px-4 py-2.5 rounded-[0.5rem] border bg-surface text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none ${
                    errors.mission ? "border-destructive" : "border-border"
                  }`}
                />
                {errors.mission && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive mt-1.5">
                    {errors.mission}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Industry / Sector
                </label>
                <select
                  value={data.industrySector}
                  onChange={(e) => {
                    updateData({ industrySector: e.target.value });
                    if (errors.industrySector) setErrors((p) => ({ ...p, industrySector: "" }));
                  }}
                  className={inputClass(errors.industrySector)}
                >
                  <option value="">Select industry...</option>
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.industrySector && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive mt-1.5">
                    {errors.industrySector}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Target Audience
                </label>
                <textarea
                  value={data.targetAudience}
                  onChange={(e) => {
                    updateData({ targetAudience: e.target.value });
                    if (errors.targetAudience) setErrors((p) => ({ ...p, targetAudience: "" }));
                  }}
                  placeholder="Who is your ideal customer?"
                  rows={2}
                  className={`w-full px-4 py-2.5 rounded-[0.5rem] border bg-surface text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none ${
                    errors.targetAudience ? "border-destructive" : "border-border"
                  }`}
                />
                {errors.targetAudience && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive mt-1.5">
                    {errors.targetAudience}
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            custom={direction}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-1">Business Details</h2>
            <p className="text-muted-foreground mb-8">Help us tailor your experience</p>

            <div className="space-y-5">
              {[
                { label: "Country", key: "country" as const, options: COUNTRIES, placeholder: "Select country..." },
                { label: "Budget Range", key: "budgetRange" as const, options: ["Under $10,000", "$10,000 - $50,000", "$50,000 - $100,000", "$100,000 - $500,000", "$500,000 - $1M", "$1M+"], placeholder: "Select range..." },
                { label: "Timeline to Launch", key: "timelineToLaunch" as const, options: ["1-3 months", "3-6 months", "6-12 months", "12+ months"], placeholder: "Select timeline..." },
                { label: "Current Team Size", key: "currentTeamSize" as const, options: ["Just me", "2-5 people", "6-10 people", "11-25 people", "25+ people"], placeholder: "Select size..." },
                { label: "Funding Stage", key: "fundingStage" as const, options: ["Pre-Seed", "Seed", "Series A", "Growth", "Bootstrapped"], placeholder: "Select stage..." },
              ].map(({ label, key, options, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
                  <select
                    value={data[key]}
                    onChange={(e) => {
                      updateData({ [key]: e.target.value });
                      if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
                    }}
                    className={inputClass(errors[key])}
                  >
                    <option value="">{placeholder}</option>
                    {options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {errors[key] && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive mt-1.5">
                      {errors[key]}
                    </motion.p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            custom={direction}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-1">Your Goals</h2>
            <p className="text-muted-foreground mb-8">What matters most to you right now?</p>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">Top 3 Goals</label>
                {[
                  { key: "goal1" as const, placeholder: "Goal #1" },
                  { key: "goal2" as const, placeholder: "Goal #2" },
                  { key: "goal3" as const, placeholder: "Goal #3" },
                ].map(({ key, placeholder }) => (
                  <div key={key}>
                    <input
                      type="text"
                      value={data[key]}
                      onChange={(e) => {
                        updateData({ [key]: e.target.value });
                        if (errors[key]) {
                          setErrors((p) => {
                            const next = { ...p };
                            delete next[key];
                            return next;
                          });
                        }
                      }}
                      placeholder={placeholder}
                      className={inputClass(errors[key])}
                    />
                    {errors[key] && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive mt-1.5">
                        {errors[key]}
                      </motion.p>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Risk Tolerance
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={data.riskTolerance}
                    onChange={(e) => updateData({ riskTolerance: Number(e.target.value) })}
                    className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Conservative</span>
                    <span>Balanced</span>
                    <span>Aggressive</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Preferred Communication Style
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["Formal", "Casual", "Direct"].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => {
                        updateData({ communicationStyle: style.toLowerCase() });
                        if (errors.communicationStyle) setErrors((p) => ({ ...p, communicationStyle: "" }));
                      }}
                      className={`py-2.5 px-4 rounded-[0.5rem] border font-medium transition-all text-sm ${
                        data.communicationStyle === style.toLowerCase()
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-surface border-border text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
                {errors.communicationStyle && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive mt-1.5">
                    {errors.communicationStyle}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  What do you need most?
                </label>
                <div className="flex flex-wrap gap-2">
                  {NEEDS_OPTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleArrayItem("needsMost", item)}
                      className={`px-4 py-2 rounded-full text-sm border transition-all ${
                        data.needsMost.includes(item)
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-surface border-border text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                {errors.needsMost && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive mt-1.5">
                    {errors.needsMost}
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            key="step6"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            custom={direction}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-1">Review & Launch</h2>
            <p className="text-muted-foreground mb-8">Review your information before launching</p>

            <div className="space-y-4">
              {[
                {
                  title: "Who are you?",
                  icon: User,
                  step: 1,
                  items: [
                    { label: "Name", value: data.fullName },
                    { label: "Email", value: data.email },
                    { label: "Role", value: data.role },
                  ],
                },
                {
                  title: "Your Experience",
                  icon: Briefcase,
                  step: 2,
                  items: [
                    { label: "Experience", value: data.yearsOfExperience },
                    { label: "Previous Startups", value: data.previousStartups },
                    { label: "Industries", value: data.industryBackground.join(", ") },
                    { label: "Skills", value: data.technicalSkills.join(", ") },
                  ],
                },
                {
                  title: "Your Vision",
                  icon: Lightbulb,
                  step: 3,
                  items: [
                    { label: "Building", value: data.buildingWhat },
                    { label: "Vision", value: data.visionStatement },
                    { label: "Mission", value: data.mission },
                    { label: "Industry", value: data.industrySector },
                    { label: "Audience", value: data.targetAudience },
                  ],
                },
                {
                  title: "Business Details",
                  icon: Building2,
                  step: 4,
                  items: [
                    { label: "Country", value: data.country },
                    { label: "Budget", value: data.budgetRange },
                    { label: "Timeline", value: data.timelineToLaunch },
                    { label: "Team Size", value: data.currentTeamSize },
                    { label: "Funding", value: data.fundingStage },
                  ],
                },
                {
                  title: "Your Goals",
                  icon: Target,
                  step: 5,
                  items: [
                    { label: "Goal 1", value: data.goal1 },
                    { label: "Goal 2", value: data.goal2 },
                    { label: "Goal 3", value: data.goal3 },
                    { label: "Risk Tolerance", value: `${data.riskTolerance}%` },
                    { label: "Communication", value: data.communicationStyle },
                    { label: "Needs", value: data.needsMost.join(", ") },
                  ],
                },
              ].map(({ title, icon: Icon, step, items }) => (
                <div key={title} className="rounded-[0.75rem] border border-border bg-surface p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-foreground text-sm">{title}</h3>
                    </div>
                    <button
                      onClick={() => goToStep(step)}
                      className="text-xs text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
                    >
                      <Edit3 className="h-3 w-3" />
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {items.map(({ label, value }) => (
                      <div key={label} className="text-sm">
                        <span className="text-muted-foreground">{label}: </span>
                        <span className="text-foreground">{value || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {currentStep > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps - 1}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round((currentStep / (totalSteps - 1)) * 100)}%
            </span>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </div>
        </div>
      )}

      {currentStep > 0 && (
        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: totalSteps - 1 }).map((_, i) => {
            const StepIcon = stepIcons[i + 1];
            const isActive = i + 1 === currentStep;
            const isCompleted = i + 1 < currentStep;
            return (
              <div key={i} className="flex items-center">
                <button
                  onClick={() => i + 1 < currentStep && goToStep(i + 1)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-primary text-white scale-110"
                      : isCompleted
                        ? "bg-success text-white cursor-pointer"
                        : "bg-border text-muted-foreground"
                  }`}
                  disabled={i + 1 > currentStep}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                </button>
                {i < totalSteps - 2 && (
                  <div
                    className={`w-8 h-0.5 mx-1 transition-all duration-300 ${
                      i + 1 < currentStep ? "bg-success" : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-[0.75rem] border border-border bg-surface p-8 min-h-[400px]">
        <AnimatePresence mode="wait" custom={direction}>
          {renderStep()}
        </AnimatePresence>
      </div>

      {currentStep > 0 && currentStep < totalSteps - 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={prevStep}
            className="px-6 py-2.5 border border-border rounded-full text-foreground text-sm font-medium transition-all hover:bg-muted flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            onClick={nextStep}
            className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-2 hover:bg-primary-hover"
          >
            {currentStep === totalSteps - 2 ? "Review" : "Next"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {currentStep === totalSteps - 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={prevStep}
            className="px-6 py-2.5 border border-border rounded-full text-foreground text-sm font-medium transition-all hover:bg-muted flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <motion.button
            onClick={handleLaunch}
            disabled={isLaunching}
            className="px-8 py-3 bg-primary text-white font-medium rounded-full transition-all duration-200 flex items-center gap-2 disabled:opacity-50 hover:bg-primary-hover"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLaunching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Launching...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4" />
                Launch GENESIS
              </>
            )}
          </motion.button>
        </div>
      )}
    </div>
  );
}
