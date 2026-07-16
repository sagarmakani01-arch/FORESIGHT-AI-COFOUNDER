"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Flame, Clock, ArrowUpRight, ArrowDownRight, Download } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn, formatCurrency } from "@/lib/utils";
import { useCompanyData } from "@/lib/hooks";
import PageHeader from "@/components/shared/page-header";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-16 w-full animate-pulse rounded-xl bg-surface-container" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-surface-container" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-xl bg-surface-container" />
    </div>
  );
}

export default function FinancePage() {
  const { data, loading, error } = useCompanyData();

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Finance" description="Track revenue, expenses, and financial health" />
        <div className="flex h-64 items-center justify-center rounded-xl bg-surface thin-border">
          <p className="text-on-surface-variant">{error}</p>
        </div>
      </div>
    );
  }

  if (!data?.company) {
    return (
      <div className="space-y-6">
        <PageHeader title="Finance" description="Track revenue, expenses, and financial health" />
        <div className="flex h-64 items-center justify-center rounded-xl bg-surface thin-border">
          <p className="text-on-surface-variant">Complete onboarding to view financial data.</p>
        </div>
      </div>
    );
  }

  const { financeEntries: entries, company: co } = data;

  const revenueEntries = entries.filter((e) => e.type.toLowerCase() === "revenue");
  const expenseEntries = entries.filter((e) => e.type.toLowerCase() === "expense");

  const totalRevenue = revenueEntries.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = expenseEntries.reduce((sum, e) => sum + e.amount, 0);
  const burnRate = co.monthlyBurn || totalExpenses;
  const runway = co.runway || (totalRevenue > 0 ? Math.round(totalExpenses / (totalRevenue / 7)) : 0);

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
  const monthlyData = allMonths.map((key) => {
    const [y, m] = key.split("-");
    return {
      name: monthNames[parseInt(m)],
      revenue: Math.round(monthlyRevenueMap[key] || 0),
      expenses: Math.round(monthlyExpenseMap[key] || 0),
    };
  });

  const categoryMap: Record<string, number> = {};
  expenseEntries.forEach((e) => {
    const cat = e.category.charAt(0).toUpperCase() + e.category.slice(1);
    categoryMap[cat] = (categoryMap[cat] || 0) + e.amount;
  });
  const totalCatAmount = Object.values(categoryMap).reduce((s, v) => s + v, 0) || 1;
  const categoryBreakdown = Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category,
      amount,
      pct: Math.round((amount / totalCatAmount) * 100),
    }))
    .sort((a, b) => b.amount - a.amount);

  const latestMonth = new Date().getMonth();
  const latestYear = new Date().getFullYear();
  const currentMonthRevenue = revenueEntries
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === latestMonth && d.getFullYear() === latestYear;
    })
    .reduce((sum, e) => sum + e.amount, 0);
  const prevMonthRevenue = revenueEntries
    .filter((e) => {
      const d = new Date(e.date);
      const prevM = latestMonth === 0 ? 11 : latestMonth - 1;
      const prevY = latestMonth === 0 ? latestYear - 1 : latestYear;
      return d.getMonth() === prevM && d.getFullYear() === prevY;
    })
    .reduce((sum, e) => sum + e.amount, 0);
  const revenueChange = prevMonthRevenue > 0 ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue * 100).toFixed(1) : "0";

  const currentMonthExpenses = expenseEntries
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === latestMonth && d.getFullYear() === latestYear;
    })
    .reduce((sum, e) => sum + e.amount, 0);
  const prevMonthExpenses = expenseEntries
    .filter((e) => {
      const d = new Date(e.date);
      const prevM = latestMonth === 0 ? 11 : latestMonth - 1;
      const prevY = latestMonth === 0 ? latestYear - 1 : latestYear;
      return d.getMonth() === prevM && d.getFullYear() === prevY;
    })
    .reduce((sum, e) => sum + e.amount, 0);
  const expenseChange = prevMonthExpenses > 0 ? ((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses * 100).toFixed(1) : "0";

  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance"
        description="Track revenue, expenses, and financial health"
        actions={[
          <button key="export" onClick={() => window.open('/api/export?entity=finance&format=csv')} className="flex items-center gap-2 px-3 py-2 rounded-full thin-border bg-surface text-on-surface-variant hover:text-on-surface transition-colors font-medium text-sm"><Download className="w-4 h-4" />Export CSV</button>,
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface thin-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container"><TrendingUp className="h-5 w-5 text-primary" /></div>
            {Number(revenueChange) !== 0 && (
              <span className={cn("flex items-center gap-1 text-xs font-semibold", Number(revenueChange) > 0 ? "text-primary" : "text-error")}>
                {Number(revenueChange) > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(Number(revenueChange))}%
              </span>
            )}
          </div>
          <div className="mt-4"><p className="type-label-caps text-on-surface-variant">Revenue (Total)</p><p className="mt-1 text-2xl font-bold text-on-surface">{formatCurrency(totalRevenue)}</p></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface thin-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container"><TrendingDown className="h-5 w-5 text-on-surface-variant" /></div>
            {Number(expenseChange) !== 0 && (
              <span className={cn("flex items-center gap-1 text-xs font-semibold", Number(expenseChange) > 0 ? "text-error" : "text-primary")}>
                {Number(expenseChange) > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(Number(expenseChange))}%
              </span>
            )}
          </div>
          <div className="mt-4"><p className="type-label-caps text-on-surface-variant">Expenses (Total)</p><p className="mt-1 text-2xl font-bold text-on-surface">{formatCurrency(totalExpenses)}</p></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface thin-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container"><Flame className="h-5 w-5 text-on-surface-variant" /></div>
          </div>
          <div className="mt-4"><p className="type-label-caps text-on-surface-variant">Monthly Burn</p><p className="mt-1 text-2xl font-bold text-on-surface">{formatCurrency(burnRate)}</p></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-surface thin-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container"><Clock className="h-5 w-5 text-primary" /></div>
          </div>
          <div className="mt-4"><p className="type-label-caps text-on-surface-variant">Runway</p><p className="mt-1 text-2xl font-bold text-on-surface">{runway} months</p></div>
        </motion.div>
      </div>

      <div className="bg-surface thin-border rounded-xl p-6">
        <h3 className="type-label-caps text-on-surface mb-4">Revenue vs Expenses</h3>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: "12px", color: "#1A1A1A" }} />
              <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
              <Area type="monotone" dataKey="expenses" stroke="#9CA3AF" strokeWidth={2} fill="url(#expGrad)" name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-on-surface-variant">No financial data to display</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-surface thin-border rounded-xl p-6">
          <h3 className="type-label-caps text-on-surface mb-4">Expense Breakdown</h3>
          {categoryBreakdown.length > 0 ? (
            <div className="space-y-4">
              {categoryBreakdown.map((cat) => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-on-surface">{cat.category}</span>
                    <span className="font-medium text-on-surface">{formatCurrency(cat.amount)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-container">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${cat.pct}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-primary" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant py-8 text-center">No expenses recorded</p>
          )}
        </div>

        <div className="bg-surface thin-border rounded-xl p-6">
          <h3 className="type-label-caps text-on-surface mb-4">Recent Transactions</h3>
          {sortedEntries.length > 0 ? (
            <div className="space-y-2">
              {sortedEntries.slice(0, 8).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b border-outline-variant last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", entry.type.toLowerCase() === "revenue" ? "bg-primary-container" : entry.type.toLowerCase() === "expense" ? "bg-surface-container" : "bg-primary-container")}>
                      {entry.type.toLowerCase() === "revenue" ? <ArrowUpRight className="h-4 w-4 text-primary" /> : <ArrowDownRight className="h-4 w-4 text-on-surface-variant" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-surface">{entry.description}</p>
                      <p className="text-xs text-on-surface-variant capitalize">{entry.category}</p>
                    </div>
                  </div>
                  <span className={cn("text-sm font-semibold", entry.type.toLowerCase() === "revenue" ? "text-primary" : "text-on-surface")}>
                    {entry.type.toLowerCase() === "revenue" ? "+" : "-"}{formatCurrency(entry.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant py-8 text-center">No transactions yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
