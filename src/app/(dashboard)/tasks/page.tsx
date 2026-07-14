"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Calendar, Filter, Sparkles, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { tasks as allTasks } from "@/lib/data";
import PageHeader from "@/components/shared/page-header";
import type { TaskStatus, TaskPriority } from "@/types";

const statusFilters: { id: TaskStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "todo", label: "To Do" },
  { id: "in-progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
  { id: "blocked", label: "Blocked" },
];

const priorityConfig: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  urgent: { label: "Urgent", color: "text-error", bg: "bg-error-container" },
  high: { label: "High", color: "text-primary", bg: "bg-primary-container" },
  medium: { label: "Medium", color: "text-on-surface-variant", bg: "bg-surface-container" },
  low: { label: "Low", color: "text-muted-foreground", bg: "bg-muted" },
};

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
  todo: { icon: Clock, color: "text-on-surface-variant", bg: "bg-surface-container" },
  "in-progress": { icon: AlertCircle, color: "text-primary", bg: "bg-primary-container" },
  review: { icon: AlertCircle, color: "text-warning", bg: "bg-surface-container" },
  done: { icon: CheckCircle2, color: "text-success", bg: "bg-primary-container" },
  blocked: { icon: AlertCircle, color: "text-error", bg: "bg-error-container" },
};

const aiTasks = [
  "Schedule weekly sprint reviews for all active projects",
  "Set up automated competitor monitoring alerts",
  "Create onboarding checklist for new engineering hires",
  "Prepare monthly board update template",
];

export default function TasksPage() {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [tasks, setTasks] = useState(allTasks);

  const filtered = tasks.filter((t) => statusFilter === "all" || t.status === statusFilter);

  const toggleDone = (id: string) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t));
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Tasks" description="Track and manage your team's work" actions={[
        <button key="new" className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-sm"><Plus className="w-4 h-4" />New Task</button>,
      ]} />

      <div className="flex gap-2 flex-wrap">
        {statusFilters.map((f) => (
          <button key={f.id} onClick={() => setStatusFilter(f.id)} className={cn("px-4 py-2 rounded-full text-sm font-medium transition-all", statusFilter === f.id ? "bg-primary text-white" : "thin-border bg-surface text-on-surface-variant hover:text-on-surface")}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        <div className="flex-1 space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((task) => {
              const priority = priorityConfig[task.priority];
              const st = statusConfig[task.status] || statusConfig.todo;
              const StIcon = st.icon;
              return (
                <motion.div key={task.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-surface thin-border rounded-xl p-4 flex items-center gap-4 transition-all hover:shadow-card">
                  <button onClick={() => toggleDone(task.id)} className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-all", task.status === "done" ? "border-primary bg-primary" : "border-outline hover:border-primary/50")}>
                    {task.status === "done" && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium", task.status === "done" ? "text-on-surface-variant line-through" : "text-on-surface")}>{task.title}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">{task.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase", priority.bg, priority.color)}>{priority.label}</span>
                    <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold", st.bg, st.color)}>
                      <StIcon className="w-3 h-3" />{task.status}
                    </span>
                    {task.deadline && (
                      <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                        <Calendar className="w-3 h-3" />{new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* AI Suggestions */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-surface thin-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="type-label-caps text-on-surface">AI Suggested Tasks</h3>
            </div>
            <div className="space-y-2">
              {aiTasks.map((task, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-start gap-2 p-3 rounded-lg bg-surface-container-low">
                  <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-on-surface">{task}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
