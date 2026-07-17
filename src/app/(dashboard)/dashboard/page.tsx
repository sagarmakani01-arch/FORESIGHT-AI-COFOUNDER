"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Target,
  Wallet,
  BarChart3,
  TrendingUp,
  Rocket,
  MessageSquare,
  Sparkles,
  Zap,
  Users,
  Shield,
} from "lucide-react";
import MetricCard from "@/components/dashboard/metric-card";
import WidgetCard from "@/components/dashboard/widget-card";
import ChartCard from "@/components/dashboard/chart-card";
import ProgressRing from "@/components/dashboard/progress-ring";
import TaskList from "@/components/dashboard/task-list";
import CompetitorCard from "@/components/dashboard/competitor-card";
import PageHeader from "@/components/shared/page-header";
import { useCompanyData, formatCurrency } from "@/lib/hooks";
import { CardSkeleton } from "@/components/ui/skeleton";

import { useEffect } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-16 w-full animate-pulse rounded-xl bg-surface-container" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="lg:col-span-2 h-48 animate-pulse rounded-xl bg-surface-container" />
        <div className="h-48 animate-pulse rounded-xl bg-surface-container" />
        <div className="h-48 animate-pulse rounded-xl bg-surface-container" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { data, loading, error } = useCompanyData();

  useEffect(() => {
    if (!loading && !error && data && !data.company) {
      router.replace("/onboarding");
    }
  }, [loading, error, data, router]);

  if (loading) return <LoadingSkeleton />;

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Your command center." />
        <div className="flex h-64 items-center justify-center rounded-xl bg-surface thin-border">
          <p className="text-on-surface-variant">{error || "No data available. Complete onboarding to get started."}</p>
        </div>
      </div>
    );
  }

  if (!data.company) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Your command center." />
        <div className="flex h-64 items-center justify-center rounded-xl bg-surface thin-border">
          <p className="text-on-surface-variant">Redirecting to onboarding...</p>
        </div>
      </div>
    );
  }

  const { company: co, tasks, milestones, financeEntries, competitors, documents } = data;

  const revenueEntries = (financeEntries ?? []).filter((e) => e.type.toLowerCase() === "revenue");
  const expenseEntries = (financeEntries ?? []).filter((e) => e.type.toLowerCase() === "expense");

  const latestMonth = new Date().getMonth();
  const latestYear = new Date().getFullYear();
  const currentMonthRevenue = revenueEntries
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === latestMonth && d.getFullYear() === latestYear;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const currentMonthExpenses = expenseEntries
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === latestMonth && d.getFullYear() === latestYear;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const displayRevenue = currentMonthRevenue || revenueEntries.reduce((sum, e) => sum + e.amount, 0);
  const burnRate = co.monthlyBurn || currentMonthExpenses || expenseEntries.reduce((sum, e) => sum + e.amount, 0);

  const monthlyRevenueMap: Record<string, number> = {};
  const monthlyExpenseMap: Record<string, number> = {};
  revenueEntries.forEach((e) => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    monthlyRevenueMap[key] = (monthlyRevenueMap[key] || 0) + e.amount;
  });
  expenseEntries.forEach((e) => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    monthlyExpenseMap[key] = (monthlyExpenseMap[key] || 0) + e.amount;
  });

  const allMonths = [...new Set([...Object.keys(monthlyRevenueMap), ...Object.keys(monthlyExpenseMap)])].sort();
  const last7Months = allMonths.slice(-7);
  const growthData = last7Months.map((key) => {
    const [, m] = key.split("-");
    return {
      name: monthNames[parseInt(m)],
      revenue: Math.round(monthlyRevenueMap[key] || 0),
      users: Math.round((monthlyRevenueMap[key] || 0) / 5),
    };
  });

  const merchantsMatch = co.keyMetrics?.find((m: string) => m.toLowerCase().includes("merchant"));
  const merchants = merchantsMatch ? merchantsMatch.replace(/[^0-9]/g, "") : "0";
  const usersMatch = co.keyMetrics?.find((m: string) => m.toLowerCase().includes("active user"));
  const activeUsers = usersMatch ? usersMatch.replace(/[^0-9]/g, "") : "0";

  const displayMRR = co.keyMetrics?.find((m: string) => m.toLowerCase().includes("mrr"));
  const mrrValue = displayMRR
    ? displayMRR
    : `$${Math.round(displayRevenue).toLocaleString()}`;

  const pendingTasks = tasks.filter((t) => t.status.toLowerCase() !== "done");
  const dashboardTasks = pendingTasks.slice(0, 5).map((t) => ({
    id: t.id,
    title: t.title,
    priority: (t.priority.toLowerCase() === "urgent" ? "high" : t.priority.toLowerCase()) as "high" | "medium" | "low",
    dueDate: t.deadline ? new Date(t.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No date",
    completed: false,
  }));

  const displayMilestones = milestones.slice(0, 4);

  const competitorDisplay = competitors.slice(0, 3).map((c) => ({
    name: c.name,
    status: "watching" as const,
    lastUpdated: new Date(c.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    description: c.strengths?.[0] || c.features?.[0] || "",
  }));

  const recentDocs = documents.slice(0, 3).map((d) => ({
    id: d.id,
    title: d.title,
    preview: (d.content ?? "").slice(0, 100) + "...",
    time: new Date(d.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  const cashBalance = financeEntries.reduce((sum, e) => {
    if (e.type.toLowerCase() === "revenue") return sum + e.amount;
    if (e.type.toLowerCase() === "expense") return sum - e.amount;
    if (e.type.toLowerCase() === "investment") return sum + e.amount;
    return sum;
  }, 0);

  const monthlyBurnForRunway = burnRate || 1;
  const availableCash = Math.max(cashBalance, 0);
  const runwayMonths = co.runway || Math.round(availableCash / monthlyBurnForRunway) || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`${co.name} — Your command center.`}
      />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="lg:col-span-2 bg-surface thin-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="type-label-caps text-on-surface-variant">Market Position</p>
                <p className="mt-1 text-3xl font-bold text-on-surface">{mrrValue}</p>
                <p className="text-sm text-on-surface-variant">Monthly Recurring Revenue</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div>
                <p className="text-xs text-on-surface-variant">Active Users</p>
                <p className="text-lg font-bold text-on-surface">{Number(activeUsers).toLocaleString()}</p>
              </div>
              <div className="h-8 w-px bg-outline-variant" />
              <div>
                <p className="text-xs text-on-surface-variant">Merchants</p>
                <p className="text-lg font-bold text-on-surface">{Number(merchants).toLocaleString()}</p>
              </div>
              <div className="h-8 w-px bg-outline-variant" />
              <div>
                <p className="text-xs text-on-surface-variant">Team Size</p>
                <p className="text-lg font-bold text-on-surface">{co.teamSize}</p>
              </div>
            </div>
          </div>

          <MetricCard
            icon={<Wallet className="h-5 w-5" />}
            label="Monthly Burn"
            value={formatCurrency(burnRate)}
            trend="down"
          />
          <MetricCard
            icon={<Target className="h-5 w-5" />}
            label="Runway"
            value={`${runwayMonths} mo`}
            trend="neutral"
          />
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="lg:col-span-2">
            {growthData.length > 0 ? (
              <ChartCard
                title="Growth Trajectory"
                description="Revenue over time"
                data={growthData}
                type="area"
                xAxisKey="name"
                yAxisKey="revenue"
                color="#10B981"
                height={260}
              />
            ) : (
              <div className="bg-surface thin-border rounded-xl p-6 flex h-[260px] items-center justify-center">
                <p className="text-on-surface-variant">No financial data yet</p>
              </div>
            )}
          </div>

          <WidgetCard title="Sentiment" description="Brand perception">
            <div className="flex flex-col items-center py-4">
              <ProgressRing value={78} size={100} strokeWidth={8} label="Positive" />
              <div className="mt-4 w-full space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant">Positive</span>
                  <span className="font-medium text-on-surface">78%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant">Neutral</span>
                  <span className="font-medium text-on-surface">16%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant">Negative</span>
                  <span className="font-medium text-on-surface">6%</span>
                </div>
              </div>
            </div>
          </WidgetCard>

          <WidgetCard title="Liquidity" description="Cash position">
            <div className="space-y-4 py-2">
              <div>
                <p className="text-3xl font-bold text-on-surface">{formatCurrency(availableCash)}</p>
                <p className="text-xs text-on-surface-variant">Available Cash</p>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-on-surface-variant">Runway</span>
                    <span className="font-medium text-on-surface">{runwayMonths} months</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-container">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(runwayMonths / 24 * 100, 100)}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-on-surface-variant">Monthly Burn</span>
                    <span className="font-medium text-on-surface">{formatCurrency(burnRate)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-container">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(burnRate / (displayRevenue || 1) * 100, 100)}%` }}
                      transition={{ duration: 1, delay: 0.7 }}
                      className="h-full rounded-full bg-on-surface-variant"
                    />
                  </div>
                </div>
              </div>
            </div>
          </WidgetCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <WidgetCard title="Ecosystem Health" description="Platform vitals at a glance">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { label: "Uptime", value: "99.97%", icon: Shield, color: "text-primary" },
                { label: "API Latency", value: "142ms", icon: Zap, color: "text-primary" },
                { label: "Active Merchants", value: Number(merchants).toLocaleString(), icon: Users, color: "text-primary" },
                { label: "Team Size", value: String(co.teamSize), icon: BarChart3, color: "text-primary" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg bg-surface-container-low p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    <span className="type-label-caps text-on-surface-variant">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-on-surface">{stat.value}</p>
                </div>
              ))}
            </div>
          </WidgetCard>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <WidgetCard title="Active Tasks" description={`${pendingTasks.length} pending`} action={{ label: "See All", onClick: () => router.push("/tasks") }}>
            {dashboardTasks.length > 0 ? (
              <TaskList tasks={dashboardTasks} />
            ) : (
              <p className="text-sm text-on-surface-variant py-4 text-center">No active tasks</p>
            )}
          </WidgetCard>

          <WidgetCard title="Milestones" description="Key dates ahead" action={{ label: "View All", onClick: () => router.push("/roadmaps") }}>
            <div className="space-y-3">
              {displayMilestones.length > 0 ? displayMilestones.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-container">
                    <Rocket className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-medium text-on-surface">{m.title}</span>
                      <span className="shrink-0 text-[10px] text-on-surface-variant">
                        {new Date(m.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-surface-container">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${m.progress}%` }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-on-surface-variant py-4 text-center">No milestones yet</p>
              )}
            </div>
          </WidgetCard>

          <WidgetCard title="Recent Documents" description="Latest updates" action={{ label: "View All", onClick: () => router.push("/documents") }}>
            <div className="space-y-2">
              {recentDocs.length > 0 ? recentDocs.map((doc) => (
                <div key={doc.id} className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-container-low cursor-pointer">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-container">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-on-surface">{doc.title}</span>
                      <Sparkles className="h-3 w-3 shrink-0 text-primary" />
                    </div>
                    <p className="mt-0.5 truncate text-xs text-on-surface-variant">{doc.preview}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{doc.time}</span>
                </div>
              )) : (
                <p className="text-sm text-on-surface-variant py-4 text-center">No documents yet</p>
              )}
            </div>
          </WidgetCard>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <WidgetCard title="Competitor Watch" description="Tracking key competitors" action={{ label: "View All", onClick: () => router.push("/competitors") }}>
            <div className="space-y-2">
              {competitorDisplay.length > 0 ? competitorDisplay.map((comp) => (
                <CompetitorCard key={comp.name} competitor={comp} />
              )) : (
                <p className="text-sm text-on-surface-variant py-4 text-center">No competitors tracked</p>
              )}
            </div>
          </WidgetCard>

          <WidgetCard title="Company Vision" description="North star & mission">
            <div className="space-y-4">
              <div className="rounded-lg bg-surface-container-low p-4">
                <p className="type-label-caps text-on-surface-variant">Mission</p>
                <p className="mt-1 text-sm text-on-surface leading-relaxed">{co.mission}</p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1 rounded-lg bg-surface-container-low p-4">
                  <p className="type-label-caps text-on-surface-variant">North Star</p>
                  <p className="mt-1 text-2xl font-bold text-on-surface">{Number(activeUsers).toLocaleString()}</p>
                  <p className="text-xs text-on-surface-variant">Active users</p>
                </div>
                <div className="flex-1 rounded-lg bg-surface-container-low p-4">
                  <p className="type-label-caps text-on-surface-variant">Stage</p>
                  <p className="mt-1 text-2xl font-bold text-primary capitalize">{(co.stage ?? "IDEA").replace("-", " ")}</p>
                  <p className="text-xs text-on-surface-variant">{co.industry ?? "Not specified"}</p>
                </div>
              </div>
            </div>
          </WidgetCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
