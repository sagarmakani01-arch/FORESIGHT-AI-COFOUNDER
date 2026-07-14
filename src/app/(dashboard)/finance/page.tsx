"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, TrendingDown, Flame, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn, formatCurrency } from "@/lib/utils";
import { financeEntries } from "@/lib/data";
import PageHeader from "@/components/shared/page-header";

const monthlyData = [
  { name: "Jan", revenue: 28500, expenses: 95000 },
  { name: "Feb", revenue: 35800, expenses: 102000 },
  { name: "Mar", revenue: 42400, expenses: 118000 },
  { name: "Apr", revenue: 52100, expenses: 125000 },
  { name: "May", revenue: 62300, expenses: 132000 },
  { name: "Jun", revenue: 72800, expenses: 138000 },
  { name: "Jul", revenue: 88700, expenses: 142000 },
];

const totalRevenue = financeEntries.filter((e) => e.type === "revenue").reduce((sum, e) => sum + e.amount, 0);
const totalExpenses = financeEntries.filter((e) => e.type === "expense").reduce((sum, e) => sum + e.amount, 0);
const burnRate = 142000;
const runway = 14;

const categoryBreakdown = [
  { category: "Engineering", amount: 68000, pct: 48 },
  { category: "Marketing", amount: 31000, pct: 22 },
  { category: "Operations", amount: 24000, pct: 17 },
  { category: "Admin", amount: 19000, pct: 13 },
];

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Finance" description="Track revenue, expenses, and financial health" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface thin-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container"><TrendingUp className="h-5 w-5 text-primary" /></div>
            <span className="flex items-center gap-1 text-xs font-semibold text-primary"><ArrowUpRight className="h-3 w-3" />12.5%</span>
          </div>
          <div className="mt-4"><p className="type-label-caps text-on-surface-variant">Revenue (MTD)</p><p className="mt-1 text-2xl font-bold text-on-surface">{formatCurrency(totalRevenue)}</p></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface thin-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container"><TrendingDown className="h-5 w-5 text-on-surface-variant" /></div>
            <span className="flex items-center gap-1 text-xs font-semibold text-primary"><ArrowDownRight className="h-3 w-3" />-3.1%</span>
          </div>
          <div className="mt-4"><p className="type-label-caps text-on-surface-variant">Expenses (MTD)</p><p className="mt-1 text-2xl font-bold text-on-surface">{formatCurrency(totalExpenses)}</p></div>
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

      {/* Revenue vs Expenses Chart */}
      <div className="bg-surface thin-border rounded-xl p-6">
        <h3 className="type-label-caps text-on-surface mb-4">Revenue vs Expenses</h3>
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
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Category Breakdown */}
        <div className="bg-surface thin-border rounded-xl p-6">
          <h3 className="type-label-caps text-on-surface mb-4">Expense Breakdown</h3>
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
        </div>

        {/* Recent Entries */}
        <div className="bg-surface thin-border rounded-xl p-6">
          <h3 className="type-label-caps text-on-surface mb-4">Recent Transactions</h3>
          <div className="space-y-2">
            {financeEntries.slice(0, 8).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-2 border-b border-outline-variant last:border-0">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", entry.type === "revenue" ? "bg-primary-container" : entry.type === "expense" ? "bg-surface-container" : "bg-primary-container")}>
                    {entry.type === "revenue" ? <ArrowUpRight className="h-4 w-4 text-primary" /> : <ArrowDownRight className="h-4 w-4 text-on-surface-variant" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-on-surface">{entry.description}</p>
                    <p className="text-xs text-on-surface-variant capitalize">{entry.category}</p>
                  </div>
                </div>
                <span className={cn("text-sm font-semibold", entry.type === "revenue" ? "text-primary" : "text-on-surface")}>
                  {entry.type === "revenue" ? "+" : "-"}{formatCurrency(entry.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
