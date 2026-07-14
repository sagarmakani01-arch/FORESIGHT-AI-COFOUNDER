"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Bell, Users, Key, CreditCard, Shield, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/shared/page-header";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "team", label: "Team", icon: Users },
  { id: "api-keys", label: "API Keys", icon: Key },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "security", label: "Security", icon: Shield },
] as const;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account and preferences" />

      <div className="flex gap-6">
        {/* Tab Sidebar */}
        <div className="w-56 flex-shrink-0">
          <div className="bg-surface thin-border rounded-xl p-2 space-y-0.5">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all", activeTab === tab.id ? "bg-primary-container text-primary" : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface")}>
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 bg-surface thin-border rounded-xl p-6">
          {activeTab === "profile" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-lg font-semibold text-on-surface">Profile Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="type-label-caps text-on-surface-variant mb-1.5 block">Full Name</label>
                  <input type="text" defaultValue="Sagar Makani" className="w-full px-4 py-2.5 rounded-lg thin-border bg-surface text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="type-label-caps text-on-surface-variant mb-1.5 block">Email</label>
                  <input type="email" defaultValue="sagar@nexuspay.io" className="w-full px-4 py-2.5 rounded-lg thin-border bg-surface text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="type-label-caps text-on-surface-variant mb-1.5 block">Company</label>
                  <input type="text" defaultValue="NexusPay" className="w-full px-4 py-2.5 rounded-lg thin-border bg-surface text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="type-label-caps text-on-surface-variant mb-1.5 block">Role</label>
                  <input type="text" defaultValue="Founder & CEO" className="w-full px-4 py-2.5 rounded-lg thin-border bg-surface text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div>
                <label className="type-label-caps text-on-surface-variant mb-1.5 block">Bio</label>
                <textarea defaultValue="Building AI-powered financial infrastructure for the underbanked." rows={3} className="w-full px-4 py-2.5 rounded-lg thin-border bg-surface text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-sm"><Save className="w-4 h-4" />Save Changes</button>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-lg font-semibold text-on-surface">Notification Preferences</h3>
              {["Email notifications for new messages", "Weekly summary reports", "Milestone deadline reminders", "Investor activity alerts", "Task assignment notifications", "System updates and maintenance"].map((item) => (
                <label key={item} className="flex items-center justify-between py-2 border-b border-outline-variant">
                  <span className="text-sm text-on-surface">{item}</span>
                  <div className="relative">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-10 h-6 rounded-full bg-surface-container peer-checked:bg-primary transition-colors" />
                    <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
                  </div>
                </label>
              ))}
            </motion.div>
          )}

          {activeTab === "team" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-lg font-semibold text-on-surface">Team Members</h3>
              {[
                { name: "Sagar Makani", email: "sagar@nexuspay.io", role: "Owner" },
                { name: "Priya Mehta", email: "priya@nexuspay.io", role: "Admin" },
              ].map((member) => (
                <div key={member.email} className="flex items-center justify-between p-4 rounded-lg bg-surface-container-low">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white">{member.name.split(" ").map((n) => n[0]).join("")}</div>
                    <div>
                      <p className="text-sm font-medium text-on-surface">{member.name}</p>
                      <p className="text-xs text-on-surface-variant">{member.email}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-primary-container text-primary text-xs font-medium">{member.role}</span>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "api-keys" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-lg font-semibold text-on-surface">API Keys</h3>
              <div className="p-4 rounded-lg bg-surface-container-low">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-on-surface">Production Key</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary-container text-primary text-xs font-medium">Active</span>
                </div>
                <code className="text-xs text-on-surface-variant font-mono">sk_live_••••••••••••••••••••4f2a</code>
              </div>
              <div className="p-4 rounded-lg bg-surface-container-low">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-on-surface">Test Key</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium">Active</span>
                </div>
                <code className="text-xs text-on-surface-variant font-mono">sk_test_••••••••••••••••••••8b1c</code>
              </div>
            </motion.div>
          )}

          {activeTab === "billing" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-lg font-semibold text-on-surface">Billing & Subscription</h3>
              <div className="p-5 rounded-xl border-2 border-primary bg-primary-container">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-on-surface">Pro Plan</p>
                    <p className="text-sm text-on-surface-variant">$49/month · Billed monthly</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-medium">Current Plan</span>
                </div>
              </div>
              <div className="text-sm text-on-surface-variant">
                <p>Next billing date: August 1, 2026</p>
                <p>Payment method: Visa ending in 4242</p>
              </div>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-lg font-semibold text-on-surface">Security Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-outline-variant">
                  <div>
                    <p className="text-sm font-medium text-on-surface">Two-Factor Authentication</p>
                    <p className="text-xs text-on-surface-variant">Add an extra layer of security</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-primary-container text-primary text-xs font-medium">Enabled</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-outline-variant">
                  <div>
                    <p className="text-sm font-medium text-on-surface">Password</p>
                    <p className="text-xs text-on-surface-variant">Last changed 30 days ago</p>
                  </div>
                  <button className="px-3 py-1.5 rounded-full thin-border text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors">Change</button>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-on-surface">Active Sessions</p>
                    <p className="text-xs text-on-surface-variant">2 devices currently signed in</p>
                  </div>
                  <button className="px-3 py-1.5 rounded-full thin-border text-xs font-medium text-error hover:bg-error-container transition-colors">Revoke All</button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
