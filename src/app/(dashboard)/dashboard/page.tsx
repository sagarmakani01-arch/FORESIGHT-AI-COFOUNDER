"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Target,
  Wallet,
  BarChart3,
  TrendingUp,
  Clock,
  Rocket,
  MessageSquare,
  Sparkles,
  AlertCircle,
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
import { company } from "@/lib/data";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const growthData = [
  { name: "Jan", users: 1200, revenue: 28500 },
  { name: "Feb", users: 2100, revenue: 35800 },
  { name: "Mar", users: 3800, revenue: 42400 },
  { name: "Apr", users: 5200, revenue: 52100 },
  { name: "May", users: 7100, revenue: 62300 },
  { name: "Jun", users: 9800, revenue: 72800 },
  { name: "Jul", users: 13400, revenue: 88700 },
];

const tasks = [
  { id: "1", title: "Implement biometric authentication flow", priority: "high" as const, dueDate: "Aug 1", completed: false },
  { id: "2", title: "Train credit scoring model v3", priority: "high" as const, dueDate: "Jul 30", completed: false },
  { id: "3", title: "Prepare investor deck for Series A", priority: "high" as const, dueDate: "Aug 5", completed: false },
  { id: "4", title: "Submit RBI compliance documentation", priority: "medium" as const, dueDate: "Jun 25", completed: true },
  { id: "5", title: "Collect and clean alternative data sources", priority: "medium" as const, dueDate: "Jul 10", completed: true },
];

const competitors = [
  { name: "Paytm", status: "threat" as const, lastUpdated: "2 hours ago", description: "Massive user base (300M+), banking license" },
  { name: "PhonePe", status: "threat" as const, lastUpdated: "1 day ago", description: "Highest UPI market share, Walmart backing" },
  { name: "Branch", status: "opportunity" as const, lastUpdated: "3 days ago", description: "AI credit scoring, emerging markets focus" },
];

const conversations = [
  { id: "1", title: "Fundraising Strategy Review", preview: "Analyzed current runway and recommended extending Series A timeline...", time: "12 min ago" },
  { id: "2", title: "Competitor Analysis Deep Dive", preview: "Generated competitive matrix comparing fintech players...", time: "2 hours ago" },
  { id: "3", title: "Product Roadmap Prioritization", preview: "Suggested prioritizing onboarding flow based on user data...", time: "5 hours ago" },
];

export default function DashboardPage() {
  const router = useRouter();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`${company.name} — Your command center.`}
      />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        {/* Row 1: Large metric spanning 2 cols + 2 small metrics */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="lg:col-span-2 bg-surface thin-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="type-label-caps text-on-surface-variant">Market Position</p>
                <p className="mt-1 text-3xl font-bold text-on-surface">$88,700</p>
                <p className="text-sm text-on-surface-variant">Monthly Recurring Revenue</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-on-surface-variant">Active Users</p>
                <p className="text-lg font-bold text-on-surface">18,240</p>
              </div>
              <div className="h-8 w-px bg-outline-variant" />
              <div>
                <p className="text-xs text-on-surface-variant">Merchants</p>
                <p className="text-lg font-bold text-on-surface">2,412</p>
              </div>
              <div className="h-8 w-px bg-outline-variant" />
              <div>
                <p className="text-xs text-on-surface-variant">NPS Score</p>
                <p className="text-lg font-bold text-on-surface">72</p>
              </div>
            </div>
          </div>

          <MetricCard
            icon={<Wallet className="h-5 w-5" />}
            label="Monthly Burn"
            value="$142,000"
            change={-3.1}
            trend="down"
          />
          <MetricCard
            icon={<Target className="h-5 w-5" />}
            label="Credit Accuracy"
            value="91.4%"
            change={2.8}
            trend="up"
          />
        </motion.div>

        {/* Row 2: Chart card (2 cols) + Sentiment + Liquidity */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <ChartCard
              title="Growth Trajectory"
              description="Users & revenue over 7 months"
              data={growthData}
              type="area"
              xAxisKey="name"
              yAxisKey="users"
              secondYAxisKey="revenue"
              color="#10B981"
              secondColor="#059669"
              height={260}
            />
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
                <p className="text-3xl font-bold text-on-surface">$1.98M</p>
                <p className="text-xs text-on-surface-variant">Available Cash</p>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-on-surface-variant">Runway</span>
                    <span className="font-medium text-on-surface">14 months</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-container">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "70%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-on-surface-variant">Budget Used</span>
                    <span className="font-medium text-on-surface">62%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-container">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "62%" }}
                      transition={{ duration: 1, delay: 0.7 }}
                      className="h-full rounded-full bg-on-surface-variant"
                    />
                  </div>
                </div>
              </div>
            </div>
          </WidgetCard>
        </motion.div>

        {/* Row 3: Ecosystem Health wide card */}
        <motion.div variants={itemVariants}>
          <WidgetCard title="Ecosystem Health" description="Platform vitals at a glance">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { label: "Uptime", value: "99.97%", icon: Shield, color: "text-primary" },
                { label: "API Latency", value: "142ms", icon: Zap, color: "text-primary" },
                { label: "Active Merchants", value: "2,412", icon: Users, color: "text-primary" },
                { label: "Transactions/day", value: "12,400", icon: BarChart3, color: "text-primary" },
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

        {/* Row 4: Tasks + Milestones + Recent Activity */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <WidgetCard title="Active Tasks" description={`${tasks.filter(t => !t.completed).length} pending`} action={{ label: "See All", onClick: () => router.push("/tasks") }}>
            <TaskList tasks={tasks} />
          </WidgetCard>

          <WidgetCard title="Milestones" description="Key dates ahead" action={{ label: "View All", onClick: () => router.push("/roadmaps") }}>
            <div className="space-y-3">
              {[
                { name: "Mobile Wallet Beta", date: "Aug 31", progress: 45, icon: Rocket },
                { name: "10K Merchants", date: "Sep 30", progress: 62, icon: Users },
                { name: "AI Credit GA", date: "Oct 15", progress: 30, icon: Sparkles },
                { name: "Series A Close", date: "Dec 31", progress: 15, icon: AlertCircle },
              ].map((m) => (
                <div key={m.name} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-container">
                    <m.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-medium text-on-surface">{m.name}</span>
                      <span className="shrink-0 text-[10px] text-on-surface-variant">{m.date}</span>
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
              ))}
            </div>
          </WidgetCard>

          <WidgetCard title="Recent Conversations" description="AI-powered insights" action={{ label: "History", onClick: () => router.push("/cofounder") }}>
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div key={conv.id} className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-container-low cursor-pointer">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-container">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-on-surface">{conv.title}</span>
                      <Sparkles className="h-3 w-3 shrink-0 text-primary" />
                    </div>
                    <p className="mt-0.5 truncate text-xs text-on-surface-variant">{conv.preview}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{conv.time}</span>
                </div>
              ))}
            </div>
          </WidgetCard>
        </motion.div>

        {/* Row 5: Competitor Watch + Company Vision */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <WidgetCard title="Competitor Watch" description="Tracking key competitors" action={{ label: "View All", onClick: () => router.push("/competitors") }}>
            <div className="space-y-2">
              {competitors.map((comp) => (
                <CompetitorCard key={comp.name} competitor={comp} />
              ))}
            </div>
          </WidgetCard>

          <WidgetCard title="Company Vision" description="North star & mission">
            <div className="space-y-4">
              <div className="rounded-lg bg-surface-container-low p-4">
                <p className="type-label-caps text-on-surface-variant">Mission</p>
                <p className="mt-1 text-sm text-on-surface leading-relaxed">{company.mission}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 rounded-lg bg-surface-container-low p-4">
                  <p className="type-label-caps text-on-surface-variant">North Star</p>
                  <p className="mt-1 text-2xl font-bold text-on-surface">18,240</p>
                  <p className="text-xs text-on-surface-variant">Active users</p>
                </div>
                <div className="flex-1 rounded-lg bg-surface-container-low p-4">
                  <p className="type-label-caps text-on-surface-variant">Target (EOY)</p>
                  <p className="mt-1 text-2xl font-bold text-primary">50,000</p>
                  <p className="text-xs text-on-surface-variant">Active users</p>
                </div>
              </div>
            </div>
          </WidgetCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
