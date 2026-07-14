"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, TrendingUp, Users, Eye, MousePointerClick, BarChart3, Calendar, Megaphone } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/shared/page-header";

const campaigns = [
  { id: "1", name: "Google Ads - Merchant Acquisition", status: "active", budget: 18500, spent: 12400, leads: 342, conv: 12.5 },
  { id: "2", name: "LinkedIn - Enterprise Outreach", status: "active", budget: 8000, spent: 5200, leads: 89, conv: 8.2 },
  { id: "3", name: "Content Marketing - Blog + SEO", status: "active", budget: 5000, spent: 3800, leads: 560, conv: 4.8 },
  { id: "4", name: "Referral Program Launch", status: "paused", budget: 10000, spent: 2100, leads: 128, conv: 18.3 },
];

const channelData = [
  { name: "Google Ads", leads: 342, spend: 12400 },
  { name: "LinkedIn", leads: 89, spend: 5200 },
  { name: "SEO/Content", leads: 560, spend: 3800 },
  { name: "Referrals", leads: 128, spend: 2100 },
  { name: "Direct", leads: 95, spend: 0 },
];

const contentCalendar = [
  { date: "Jul 15", title: "Blog: AI Credit Scoring Explained", type: "blog", status: "scheduled" },
  { date: "Jul 18", title: "LinkedIn: Merchant Success Story", type: "social", status: "draft" },
  { date: "Jul 20", title: "Newsletter: July Product Update", type: "email", status: "scheduled" },
  { date: "Jul 22", title: "Twitter Thread: Fintech Trends", type: "social", status: "idea" },
  { date: "Jul 25", title: "Blog: Emerging Markets Opportunity", type: "blog", status: "idea" },
];

export default function MarketingPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Marketing" description="Campaign management and performance tracking" actions={[
        <button key="new" className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-sm"><Plus className="w-4 h-4" />New Campaign</button>,
      ]} />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Leads", value: "1,214", change: "+18.3%", icon: Users },
          { label: "Conversion Rate", value: "9.7%", change: "+2.1%", icon: MousePointerClick },
          { label: "Ad Spend", value: "$23,500", change: "-8.2%", icon: Megaphone },
          { label: "Cost per Lead", value: "$19.36", change: "-12.5%", icon: TrendingUp },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-surface thin-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container"><stat.icon className="h-5 w-5 text-primary" /></div>
              <span className="text-xs font-semibold text-primary">{stat.change}</span>
            </div>
            <div className="mt-4"><p className="type-label-caps text-on-surface-variant">{stat.label}</p><p className="mt-1 text-2xl font-bold text-on-surface">{stat.value}</p></div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Channel Performance Chart */}
        <div className="bg-surface thin-border rounded-xl p-6">
          <h3 className="type-label-caps text-on-surface mb-4">Channel Performance</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={channelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} />
              <YAxis stroke="#9CA3AF" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: "12px", color: "#1A1A1A" }} />
              <Bar dataKey="leads" fill="#10B981" radius={[4, 4, 0, 0]} name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Content Calendar */}
        <div className="bg-surface thin-border rounded-xl p-6">
          <h3 className="type-label-caps text-on-surface mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />Content Calendar</h3>
          <div className="space-y-2">
            {contentCalendar.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low">
                <span className="text-xs font-medium text-on-surface-variant w-12 shrink-0">{item.date}</span>
                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase shrink-0", item.type === "blog" ? "bg-primary-container text-primary" : item.type === "social" ? "bg-surface-container text-on-surface-variant" : "bg-surface-container text-on-surface-variant")}>{item.type}</span>
                <span className="text-sm text-on-surface flex-1">{item.title}</span>
                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", item.status === "scheduled" ? "bg-primary-container text-primary" : item.status === "draft" ? "bg-surface-container text-on-surface-variant" : "bg-surface-container text-muted-foreground")}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-surface thin-border rounded-xl p-6">
        <h3 className="type-label-caps text-on-surface mb-4">Active Campaigns</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="text-left px-4 py-3 type-label-caps text-on-surface-variant">Campaign</th>
                <th className="text-left px-4 py-3 type-label-caps text-on-surface-variant">Budget</th>
                <th className="text-left px-4 py-3 type-label-caps text-on-surface-variant">Spent</th>
                <th className="text-left px-4 py-3 type-label-caps text-on-surface-variant">Leads</th>
                <th className="text-left px-4 py-3 type-label-caps text-on-surface-variant">Conv.</th>
                <th className="text-left px-4 py-3 type-label-caps text-on-surface-variant">Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-outline-variant last:border-0">
                  <td className="px-4 py-3 text-sm font-medium text-on-surface">{c.name}</td>
                  <td className="px-4 py-3 text-sm text-on-surface">${c.budget.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-on-surface">${c.spent.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-on-surface">{c.leads}</td>
                  <td className="px-4 py-3 text-sm text-on-surface">{c.conv}%</td>
                  <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", c.status === "active" ? "bg-primary-container text-primary" : "bg-surface-container text-on-surface-variant")}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
