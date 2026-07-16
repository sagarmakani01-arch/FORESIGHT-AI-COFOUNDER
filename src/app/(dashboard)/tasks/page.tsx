"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Calendar, AlertCircle, Clock, CheckCircle2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanyData } from "@/lib/hooks";
import PageHeader from "@/components/shared/page-header";
import { Modal, FormField, inputClass, selectClass, SubmitButton } from "@/components/shared/modal";
import { TableSkeleton } from "@/components/ui/skeleton";

const statusFilters = [
  { id: "all", label: "All" },
  { id: "todo", label: "To Do" },
  { id: "in-progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
  { id: "blocked", label: "Blocked" },
] as const;

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  urgent: { label: "Urgent", color: "text-error", bg: "bg-error-container" },
  high: { label: "High", color: "text-primary", bg: "bg-primary-container" },
  medium: { label: "Medium", color: "text-on-surface-variant", bg: "bg-surface-container" },
  low: { label: "Low", color: "text-muted-foreground", bg: "bg-muted" },
};

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string; label: string }> = {
  todo: { icon: Clock, color: "text-on-surface-variant", bg: "bg-surface-container", label: "Todo" },
  "in-progress": { icon: AlertCircle, color: "text-primary", bg: "bg-primary-container", label: "In Progress" },
  review: { icon: AlertCircle, color: "text-warning", bg: "bg-surface-container", label: "Review" },
  done: { icon: CheckCircle2, color: "text-success", bg: "bg-primary-container", label: "Done" },
  blocked: { icon: AlertCircle, color: "text-error", bg: "bg-error-container", label: "Blocked" },
};

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-16 w-full animate-pulse rounded-xl bg-surface-container" />
      <div className="flex gap-2 flex-wrap">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-10 w-24 animate-pulse rounded-full bg-surface-container" />)}</div>
      <TableSkeleton rows={5} />
    </div>
  );
}

export default function TasksPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", projectId: "", priority: "MEDIUM", deadline: "" });
  const { data, loading, error, refresh } = useCompanyData();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          projectId: form.projectId,
          priority: form.priority,
          deadline: form.deadline || undefined,
        }),
      });
      if (res.ok) {
        setModalOpen(false);
        setForm({ title: "", description: "", projectId: "", priority: "MEDIUM", deadline: "" });
        refresh?.();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Tasks" description="Track and manage your team's work" actions={[
        <button key="export" onClick={() => window.open('/api/export?entity=tasks&format=csv')} className="flex items-center gap-2 px-3 py-2 rounded-full thin-border bg-surface text-on-surface-variant hover:text-on-surface transition-colors font-medium text-sm"><Download className="w-4 h-4" />Export CSV</button>,
        <button key="new" onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-sm"><Plus className="w-4 h-4" />New Task</button>,
      ]} />

      <div className="flex gap-2 flex-wrap">
        {statusFilters.map((f) => (
          <button key={f.id} onClick={() => setStatusFilter(f.id)} className={cn("px-4 py-2 rounded-full text-sm font-medium transition-all", statusFilter === f.id ? "bg-primary text-white" : "thin-border bg-surface text-on-surface-variant hover:text-on-surface")}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : error || !data ? (
        <div className="flex h-64 items-center justify-center rounded-xl bg-surface thin-border">
          <p className="text-on-surface-variant">{error || "No data available."}</p>
        </div>
      ) : (() => {
        const allTasks = data.tasks.map((t) => ({
          ...t,
          statusLower: t.status.toLowerCase(),
          priorityLower: t.priority.toLowerCase(),
        }));

        const filtered = allTasks.filter((t) => statusFilter === "all" || t.statusLower === statusFilter);

        return filtered.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-xl bg-surface thin-border">
            <p className="text-on-surface-variant">No tasks found</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filtered.map((task) => {
                const priority = priorityConfig[task.priorityLower] || priorityConfig.medium;
                const st = statusConfig[task.statusLower] || statusConfig.todo;
                const StIcon = st.icon;
                return (
                  <motion.div key={task.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-surface thin-border rounded-xl p-4 flex items-center gap-4 transition-all hover:shadow-card">
                    <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-all", task.statusLower === "done" ? "border-primary bg-primary" : "border-outline hover:border-primary/50")}>
                      {task.statusLower === "done" && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium", task.statusLower === "done" ? "text-on-surface-variant line-through" : "text-on-surface")}>{task.title}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">{task.description}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{task.project?.name ?? "No project"}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn("hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase", priority.bg, priority.color)}>{priority.label}</span>
                      <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold", st.bg, st.color)}>
                        <StIcon className="w-3 h-3" />{st.label}
                      </span>
                      {task.deadline && (
                        <span className="hidden sm:flex items-center gap-1 text-xs text-on-surface-variant">
                          <Calendar className="w-3 h-3" />{new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        );
      })()}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Task">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Title" required>
            <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Task title" required />
          </FormField>
          <FormField label="Description" required>
            <textarea className={inputClass} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the task" required />
          </FormField>
          <FormField label="Project" required>
            <select className={selectClass} value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required>
              <option value="" disabled>Select a project</option>
              {data.projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Priority">
            <select className={selectClass} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </FormField>
          <FormField label="Deadline">
            <input type="date" className={inputClass} value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
            <SubmitButton loading={submitting}>Create Task</SubmitButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
