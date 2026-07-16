"use client";

import { useState, useEffect } from "react";

interface CompanyData {
  company: {
    id: string;
    name: string;
    industry: string;
    stage: string;
    vision: string;
    mission: string;
    description: string;
    website: string | null;
    location: string | null;
    teamSize: number;
    foundedDate: string | null;
    targetMarket: string | null;
    businessModel: string | null;
    revenueStreams: string[];
    fundingStatus: string | null;
    monthlyBurn: number | null;
    runway: number | null;
    keyMetrics: string[];
    challenges: string[];
    goals: string[];
  } | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
  } | null;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    status: string;
    priority: string;
    deadline: string | null;
    companyId: string;
    createdAt: string;
    updatedAt: string;
    tasks: Array<{
      id: string;
      title: string;
      status: string;
      priority: string;
      assigneeId: string | null;
      deadline: string | null;
      projectId: string;
    }>;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    assigneeId: string | null;
    deadline: string | null;
    projectId: string;
    createdAt: string;
    updatedAt: string;
    project: { id: string; name: string };
    dependencies: Array<{ taskId: string; dependsOnId: string }>;
    dependents: Array<{ taskId: string; dependsOnId: string }>;
  }>;
  documents: Array<{
    id: string;
    title: string;
    content: string;
    folder: string;
    companyId: string;
    createdAt: string;
    updatedAt: string;
  }>;
  competitors: Array<{
    id: string;
    name: string;
    industry: string;
    website: string | null;
    features: string[];
    pricing: string | null;
    strengths: string[];
    weaknesses: string[];
    funding: string | null;
    traffic: string | null;
    reviews: string | null;
    lastUpdated: string;
    companyId: string;
  }>;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    deadline: string;
    progress: number;
    companyId: string;
  }>;
  financeEntries: Array<{
    id: string;
    type: string;
    amount: number;
    category: string;
    date: string;
    description: string;
    companyId: string;
  }>;
  investors: Array<{
    id: string;
    name: string;
    firm: string;
    stage: string;
    status: string;
    email: string | null;
    phone: string | null;
    notes: string | null;
    lastContact: string | null;
    companyId: string;
  }>;
  roadmaps: Array<{
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    companyId: string;
    phases: Array<{
      id: string;
      title: string;
      description: string;
      startDate: string;
      endDate: string;
      tasks: string[];
      sortOrder: number;
    }>;
  }>;
  knowledgeEntries: Array<{
    id: string;
    type: string;
    content: string;
    metadata: unknown;
    companyId: string;
  }>;
  researchReports: Array<{
    id: string;
    title: string;
    query: string;
    content: string;
    category: string;
    sources: unknown;
    companyId: string;
    createdAt: string;
  }>;
}

const EMPTY_DATA: CompanyData = {
  company: null,
  user: null,
  projects: [],
  tasks: [],
  documents: [],
  competitors: [],
  milestones: [],
  financeEntries: [],
  investors: [],
  roadmaps: [],
  knowledgeEntries: [],
  researchReports: [],
};

export function useCompanyData() {
  const [data, setData] = useState<CompanyData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/data")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch data");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  return { data, loading, error, refresh };
}

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function relativeTime(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(dateStr);
}

export function statusColor(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("progress") || s.includes("active")) return "text-primary";
  if (s.includes("completed") || s.includes("done") || s.includes("closed")) return "text-success";
  if (s.includes("pending") || s.includes("todo") || s.includes("planning")) return "text-warning";
  if (s.includes("blocked") || s.includes("delayed") || s.includes("cancelled")) return "text-error";
  if (s.includes("review")) return "text-info";
  if (s.includes("hold")) return "text-on-surface-variant";
  return "text-on-surface-variant";
}

export function statusBg(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("progress") || s.includes("active")) return "bg-primary-container";
  if (s.includes("completed") || s.includes("done") || s.includes("closed")) return "bg-success/10";
  if (s.includes("pending") || s.includes("todo") || s.includes("planning")) return "bg-warning/10";
  if (s.includes("blocked") || s.includes("delayed") || s.includes("cancelled")) return "bg-error/10";
  if (s.includes("review")) return "bg-info/10";
  return "bg-surface-container";
}

export function priorityColor(p: string): string {
  const v = p.toLowerCase();
  if (v === "urgent") return "text-error";
  if (v === "high") return "text-warning";
  if (v === "medium") return "text-primary";
  return "text-on-surface-variant";
}

export function priorityBg(p: string): string {
  const v = p.toLowerCase();
  if (v === "urgent") return "bg-error/10";
  if (v === "high") return "bg-warning/10";
  if (v === "medium") return "bg-primary-container";
  return "bg-surface-container";
}
