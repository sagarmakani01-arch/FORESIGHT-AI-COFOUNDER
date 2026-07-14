"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Target,
  DollarSign,
  FileText,
  Users,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  prompt: string;
}

interface QuickActionsProps {
  onSelect: (prompt: string) => void;
}

const quickActions: QuickAction[] = [
  {
    id: "market",
    icon: <TrendingUp className="w-3.5 h-3.5" />,
    label: "Analyze Market",
    prompt: "Analyze the current market landscape for my industry and identify key opportunities and threats.",
  },
  {
    id: "strategy",
    icon: <Target className="w-3.5 h-3.5" />,
    label: "Build Strategy",
    prompt: "Help me build a comprehensive go-to-market strategy for my product.",
  },
  {
    id: "finance",
    icon: <DollarSign className="w-3.5 h-3.5" />,
    label: "Financial Model",
    prompt: "Create a financial model with revenue projections for the next 3 years.",
  },
  {
    id: "pitch",
    icon: <FileText className="w-3.5 h-3.5" />,
    label: "Pitch Deck",
    prompt: "Generate a compelling pitch deck outline for investor presentations.",
  },
  {
    id: "competitors",
    icon: <Users className="w-3.5 h-3.5" />,
    label: "Competitor Analysis",
    prompt: "Provide a detailed analysis of my main competitors and their strategies.",
  },
  {
    id: "roadmap",
    icon: <Calendar className="w-3.5 h-3.5" />,
    label: "Product Roadmap",
    prompt: "Help me create a product roadmap with key milestones for the next 12 months.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function QuickActions({ onSelect }: QuickActionsProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-wrap gap-2"
    >
      {quickActions.map((action) => (
        <motion.button
          key={action.id}
          variants={item}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(action.prompt)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full",
            "thin-border bg-surface hover:bg-primary-container",
            "text-xs font-medium text-on-surface-variant hover:text-primary",
            "transition-all duration-200"
          )}
        >
          <span className="text-primary/70">{action.icon}</span>
          {action.label}
        </motion.button>
      ))}
    </motion.div>
  );
}
