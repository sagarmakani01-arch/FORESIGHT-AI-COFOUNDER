"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calendar, Columns3, List, Sparkles, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { roadmaps } from "@/lib/data";
import PageHeader from "@/components/shared/page-header";

type ViewMode = "timeline" | "kanban" | "calendar";

const statuses = ["backlog", "in-progress", "review", "done"] as const;

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  backlog: { label: "Backlog", color: "text-on-surface-variant", bg: "bg-surface-container", dot: "bg-on-surface-variant" },
  "in-progress": { label: "In Progress", color: "text-primary", bg: "bg-primary-container", dot: "bg-primary" },
  review: { label: "Review", color: "text-warning", bg: "bg-surface-container", dot: "bg-warning" },
  done: { label: "Done", color: "text-success", bg: "bg-primary-container", dot: "bg-success" },
};

const kanbanItems = [
  { id: "1", title: "Mobile Wallet v2.0 Beta", status: "in-progress", priority: "high", phase: "Intelligence", dueDate: "Aug 31" },
  { id: "2", title: "AI Credit Scoring Engine", status: "in-progress", priority: "urgent", phase: "Intelligence", dueDate: "Aug 15" },
  { id: "3", title: "Merchant Dashboard", status: "backlog", priority: "medium", phase: "Ecosystem", dueDate: "Oct 31" },
  { id: "4", title: "RBI Compliance Portal", status: "done", priority: "high", phase: "Foundation", dueDate: "Jun 30" },
  { id: "5", title: "P2P Transfer Backend", status: "review", priority: "high", phase: "Intelligence", dueDate: "Jul 20" },
  { id: "6", title: "Developer API Portal", status: "backlog", priority: "medium", phase: "Ecosystem", dueDate: "Nov 15" },
  { id: "7", title: "Indonesia Market Research", status: "backlog", priority: "low", phase: "Expansion", dueDate: "Jan 15" },
  { id: "8", title: "KYC Verification Integration", status: "in-progress", priority: "urgent", phase: "Intelligence", dueDate: "Jul 25" },
];

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: "Low", color: "text-on-surface-variant", bg: "bg-surface-container" },
  medium: { label: "Medium", color: "text-primary", bg: "bg-primary-container" },
  high: { label: "High", color: "text-warning", bg: "bg-surface-container" },
  urgent: { label: "Urgent", color: "text-error", bg: "bg-error-container" },
};

export default function RoadmapsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");

  const roadmap = roadmaps[0];
  const phases = roadmap.phases;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roadmaps"
        description="Plan and track your product journey"
        actions={[
          <div key="view-toggle" className="flex gap-1 bg-surface-container rounded-full p-1">
            {(["timeline", "kanban", "calendar"] as ViewMode[]).map((mode) => (
              <button key={mode} onClick={() => setViewMode(mode)} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200", viewMode === mode ? "bg-primary text-white" : "text-on-surface-variant hover:text-on-surface")}>
                {mode === "timeline" && <List className="w-4 h-4" />}
                {mode === "kanban" && <Columns3 className="w-4 h-4" />}
                {mode === "calendar" && <Calendar className="w-4 h-4" />}
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>,
          <button key="add" className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-sm"><Plus className="w-4 h-4" />Add Milestone</button>,
        ]}
      />

      {viewMode === "timeline" && (
        <div className="bg-surface thin-border rounded-xl p-6 overflow-x-auto">
          <div className="flex gap-8 min-w-max pb-4">
            {phases.map((phase, phaseIndex) => {
              const totalTasks = phase.tasks.length;
              return (
                <div key={phase.id} className="w-80 flex-shrink-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold", phaseIndex === 0 ? "bg-primary-container text-primary" : phaseIndex === 1 ? "bg-primary text-white" : phaseIndex === 2 ? "bg-surface-container text-on-surface-variant" : "bg-surface-container text-on-surface-variant")}>
                      {phaseIndex + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-on-surface">{phase.title}</h3>
                      <p className="text-xs text-on-surface-variant">{totalTasks} tasks</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {phase.tasks.map((task, taskIndex) => (
                      <motion.div key={taskIndex} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: taskIndex * 0.05 }} className="bg-surface thin-border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-card">
                        <h4 className="font-medium text-on-surface text-sm mb-2">{task}</h4>
                        <div className="flex items-center gap-2">
                          {phaseIndex <= 1 && <span className="px-2 py-0.5 rounded-full bg-primary-container text-primary text-[10px] font-semibold uppercase">Done</span>}
                          {phaseIndex === 2 && <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-semibold uppercase">Planned</span>}
                          {phaseIndex === 3 && <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-semibold uppercase">Future</span>}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-3">
                          <Calendar className="w-3 h-3" />
                          {new Date(phase.startDate).toLocaleDateString("en-US", { month: "short" })} - {new Date(phase.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === "kanban" && (
        <div className="grid grid-cols-4 gap-4">
          {statuses.map((status) => {
            const config = statusConfig[status];
            const items = kanbanItems.filter((item) => item.status === status);
            return (
              <div key={status} className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <span className={cn("w-2 h-2 rounded-full", config.dot)} />
                  <h3 className="font-medium text-on-surface">{config.label}</h3>
                  <span className="text-xs text-on-surface-variant ml-auto">{items.length}</span>
                </div>
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => {
                      const priority = priorityConfig[item.priority];
                      return (
                        <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-surface thin-border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-card">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-on-surface text-sm">{item.title}</h4>
                            {item.priority === "urgent" && <Sparkles className="w-3.5 h-3.5 text-primary" />}
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", priority.bg, priority.color)}>{priority.label}</span>
                            <span className="text-xs text-on-surface-variant">{item.phase}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-on-surface-variant">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{item.dueDate}</span>
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === "calendar" && (
        <div className="bg-surface thin-border rounded-xl p-6">
          <div className="grid grid-cols-7 gap-px bg-outline-variant rounded-xl overflow-hidden">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="bg-surface-container-low p-3 text-center type-label-caps text-on-surface-variant">{day}</div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => {
              const day = i - 2;
              const date = new Date(2026, 6, day);
              return (
                <div key={i} className={cn("bg-surface min-h-[100px] p-2", day < 1 || day > 31 ? "opacity-30" : "")}>
                  <span className="text-xs text-on-surface-variant">{date.getDate()}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
