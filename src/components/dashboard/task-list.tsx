"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
  className?: string;
}

const priorityConfig = {
  high: { label: "High", className: "bg-primary-container text-primary" },
  medium: { label: "Med", className: "bg-surface-container text-on-surface-variant" },
  low: { label: "Low", className: "bg-muted text-muted-foreground" },
};

export default function TaskList({ tasks: initialTasks, className }: TaskListProps) {
  const [tasks, setTasks] = useState(initialTasks);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <div className={cn("space-y-1", className)}>
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-container-low"
          >
            <button
              onClick={() => toggleTask(task.id)}
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all",
                task.completed
                  ? "border-primary bg-primary"
                  : "border-outline hover:border-primary/50"
              )}
            >
              {task.completed && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
            </button>

            <span
              className={cn(
                "flex-1 text-sm transition-all duration-300",
                task.completed
                  ? "text-muted-foreground line-through opacity-60"
                  : "text-on-surface"
              )}
            >
              {task.title}
            </span>

            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                priorityConfig[task.priority].className
              )}
            >
              {priorityConfig[task.priority].label}
            </span>

            <span className="flex items-center gap-1 text-[11px] text-on-surface-variant">
              <Calendar className="h-3 w-3" />
              {task.dueDate}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
