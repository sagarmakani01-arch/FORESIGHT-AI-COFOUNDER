"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Calendar,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertCircle,
  Pause,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { projects } from "@/lib/data";
import PageHeader from "@/components/shared/page-header";
import type { ProjectStatus } from "@/types";

const filters = ["All", "Active", "Completed", "Planning"] as const;

const statusConfig: Record<string, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  "in-progress": { label: "Active", icon: Clock, color: "text-primary", bg: "bg-primary-container" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-success", bg: "bg-primary-container" },
  planning: { label: "Planning", icon: AlertCircle, color: "text-warning", bg: "bg-surface-container" },
  "on-hold": { label: "On Hold", icon: Pause, color: "text-on-surface-variant", bg: "bg-surface-container" },
};

const priorityColors: Record<string, string> = {
  urgent: "bg-error-container text-error",
  high: "bg-primary-container text-primary",
  medium: "bg-surface-container text-on-surface-variant",
  low: "bg-muted text-muted-foreground",
};

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filtered = projects.filter((p) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Active") return p.status === "in-progress";
    if (activeFilter === "Completed") return p.status === "completed";
    if (activeFilter === "Planning") return p.status === "planning";
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage and track your team's projects"
        actions={[
          <button key="new" className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-sm">
            <Plus className="w-4 h-4" />
            New Project
          </button>,
        ]}
      />

      <div className="flex gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              activeFilter === filter
                ? "bg-primary text-white"
                : "thin-border bg-surface text-on-surface-variant hover:text-on-surface"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        initial="hidden"
        animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
      >
        {filtered.map((project) => {
          const status = statusConfig[project.status] || statusConfig["in-progress"];
          const StatusIcon = status.icon;
          const progress = project.status === "completed" ? 100 : project.status === "in-progress" ? 65 : project.status === "planning" ? 15 : 0;

          return (
            <motion.div
              key={project.id}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ y: -2 }}
              className="bg-surface thin-border rounded-xl p-5 cursor-pointer transition-all duration-200 hover:shadow-card"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-on-surface text-lg">{project.name}</h3>
                  <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">{project.description}</p>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", status.bg, status.color)}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase", priorityColors[project.priority])}>
                  {project.priority}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-on-surface-variant">Progress</span>
                  <span className="text-xs font-medium text-on-surface">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn("h-full rounded-full", progress === 100 ? "bg-primary" : "bg-primary/70")}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-outline-variant">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">SM</div>
                  <span className="text-xs text-on-surface-variant">Sagar Makani</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                  <Calendar className="w-3.5 h-3.5" />
                  {project.deadline
                    ? new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "No deadline"}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
