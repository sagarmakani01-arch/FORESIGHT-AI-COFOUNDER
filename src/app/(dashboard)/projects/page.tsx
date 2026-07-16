"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  Calendar,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertCircle,
  Pause,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanyData } from "@/lib/hooks";
import PageHeader from "@/components/shared/page-header";
import { Modal, FormField, inputClass, selectClass, SubmitButton } from "@/components/shared/modal";
import { CardSkeleton } from "@/components/ui/skeleton";

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

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-16 w-full animate-pulse rounded-xl bg-surface-container" />
      <div className="flex gap-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-10 w-24 animate-pulse rounded-full bg-surface-container" />)}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [showNewProject, setShowNewProject] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", status: "PLANNING", priority: "MEDIUM", deadline: "" });
  const [submitting, setSubmitting] = useState(false);
  const { data, loading, error } = useCompanyData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, deadline: form.deadline || undefined }),
      });
      if (!res.ok) throw new Error("Failed");
      setShowNewProject(false);
      setForm({ name: "", description: "", status: "PLANNING", priority: "MEDIUM", deadline: "" });
      router.refresh();
    } catch {
      alert("Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Projects" description="Manage and track your team's projects" />
        <div className="flex h-64 items-center justify-center rounded-xl bg-surface thin-border">
          <p className="text-on-surface-variant">{error || "No data available."}</p>
        </div>
      </div>
    );
  }

  const { projects, user } = data;

  const userInitials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  const userName = user?.name || "Unknown";

  const filtered = projects.filter((p) => {
    const s = p.status.toLowerCase();
    if (activeFilter === "All") return true;
    if (activeFilter === "Active") return s === "in-progress";
    if (activeFilter === "Completed") return s === "completed";
    if (activeFilter === "Planning") return s === "planning";
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage and track your team's projects"
        actions={[
          <button key="export" onClick={() => window.open('/api/export?entity=projects&format=csv')} className="flex items-center gap-2 px-3 py-2 rounded-full thin-border bg-surface text-on-surface-variant hover:text-on-surface transition-colors font-medium text-sm">
            <Download className="w-4 h-4" />
            Export CSV
          </button>,
          <button key="new" onClick={() => setShowNewProject(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-sm">
            <Plus className="w-4 h-4" />
            New Project
          </button>,
        ]}
      />

      <div className="flex flex-wrap gap-2">
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

      {filtered.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl bg-surface thin-border">
          <p className="text-on-surface-variant">No projects found</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        >
          {filtered.map((project) => {
            const statusKey = project.status.toLowerCase();
            const status = statusConfig[statusKey] || statusConfig["in-progress"];
            const StatusIcon = status.icon;
            const progress = statusKey === "completed" ? 100 : statusKey === "in-progress" ? 65 : statusKey === "planning" ? 15 : 0;

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
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase", priorityColors[project.priority.toLowerCase()] || priorityColors.medium)}>
                    {project.priority.toLowerCase()}
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
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">{userInitials}</div>
                    <span className="text-xs text-on-surface-variant">{userName}</span>
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
      )}

      <Modal open={showNewProject} onClose={() => setShowNewProject(false)} title="New Project">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" required>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Project name" />
          </FormField>
          <FormField label="Description" required>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} rows={3} placeholder="Brief description" />
          </FormField>
          <FormField label="Status">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={selectClass}>
              <option value="PLANNING">Planning</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </FormField>
          <FormField label="Priority">
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={selectClass}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </FormField>
          <FormField label="Deadline">
            <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className={inputClass} />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowNewProject(false)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
            <SubmitButton loading={submitting}>Create Project</SubmitButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
