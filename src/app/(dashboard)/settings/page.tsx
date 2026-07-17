"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { User, Bell, Users, Link2, CreditCard, Shield, Save, Loader2, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/shared/page-header";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "team", label: "Team", icon: Users },
  { id: "providers", label: "Connect Providers", icon: Link2 },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "security", label: "Security", icon: Shield },
] as const;

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  createdAt: string;
}

interface CompanyData {
  name: string;
  industry: string;
  stage: string;
  teamSize: string;
  location: string;
  vision: string;
  mission: string;
  description: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [_companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [providers, setProviders] = useState<{ id: string; provider: string; baseUrl: string | null; model: string | null; isActive: boolean }[]>([]);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [newProvider, setNewProvider] = useState("openai");
  const [newApiKey, setNewApiKey] = useState("");
  const [newBaseUrl, setNewBaseUrl] = useState("");
  const [newModel, setNewModel] = useState("");
  const [savingProvider, setSavingProvider] = useState(false);

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUserData(data.user);
          setFullName(data.user.name || "");
          setEmail(data.user.email || "");
        }
        if (data.company) {
          setCompanyData(data.company);
          setCompanyName(data.company.name || "");
          setBio(data.company.description || "");
        }
      })
      .catch(() => {});

    fetch("/api/ai/providers")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProviders(data.data);
      })
      .catch(() => {});
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaved(false);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveProvider = async () => {
    if (!newApiKey.trim()) return;
    setSavingProvider(true);
    try {
      const res = await fetch("/api/ai/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: newProvider, apiKey: newApiKey, baseUrl: newBaseUrl || null, model: newModel || null }),
      });
      const data = await res.json();
      if (data.success) {
        setProviders((prev) => {
          const exists = prev.findIndex((p) => p.provider === newProvider);
          if (exists >= 0) {
            const updated = [...prev];
            updated[exists] = data.data;
            return updated;
          }
          return [...prev, data.data];
        });
        setNewApiKey("");
        setNewBaseUrl("");
        setNewModel("");
        setShowAddProvider(false);
      } else {
        alert(data.error || "Failed to save provider");
      }
    } catch {
      alert("Failed to save provider. Please try again.");
    }
    setSavingProvider(false);
  };

  const handleDeleteProvider = async (id: string) => {
    try {
      const res = await fetch(`/api/ai/providers?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setProviders((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(data.error || "Failed to delete provider");
      }
    } catch {
      alert("Failed to delete provider. Please try again.");
    }
  };

  const displayName = session?.user?.name || fullName || "User";
  const displayEmail = session?.user?.email || email || "";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account and preferences" />

      <div className="flex gap-6">
        <div className="w-56 flex-shrink-0">
          <div className="bg-surface thin-border rounded-xl p-2 space-y-0.5">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all", activeTab === tab.id ? "bg-primary-container text-primary" : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface")}>
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-surface thin-border rounded-xl p-6">
          {activeTab === "profile" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-lg font-bold text-white">{initials}</div>
                <div>
                  <p className="font-semibold text-on-surface">{displayName}</p>
                  <p className="text-sm text-on-surface-variant">{displayEmail}</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-on-surface">Profile Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="type-label-caps text-on-surface-variant mb-1.5 block">Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2.5 rounded-lg thin-border bg-surface text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="type-label-caps text-on-surface-variant mb-1.5 block">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-lg thin-border bg-surface text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="type-label-caps text-on-surface-variant mb-1.5 block">Company</label>
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full px-4 py-2.5 rounded-lg thin-border bg-surface text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="type-label-caps text-on-surface-variant mb-1.5 block">Role</label>
                  <input type="text" value={userData?.role || "Founder"} readOnly className="w-full px-4 py-2.5 rounded-lg thin-border bg-surface-container-low text-on-surface-variant text-sm" />
                </div>
              </div>
              <div>
                <label className="type-label-caps text-on-surface-variant mb-1.5 block">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-lg thin-border bg-surface text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
              <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-sm disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Save className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
              </button>
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
              <div className="flex items-center justify-between p-4 rounded-lg bg-surface-container-low">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white">{initials}</div>
                  <div>
                    <p className="text-sm font-medium text-on-surface">{displayName}</p>
                    <p className="text-xs text-on-surface-variant">{displayEmail}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-primary-container text-primary text-xs font-medium">Owner</span>
              </div>
            </motion.div>
          )}

          {activeTab === "providers" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-on-surface">Connect Providers</h3>
                  <p className="text-sm text-on-surface-variant mt-1">Add your own API keys to use your preferred AI models</p>
                </div>
                <button
                  onClick={() => setShowAddProvider(!showAddProvider)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Provider
                </button>
              </div>

              {showAddProvider && (
                <div className="p-5 rounded-xl bg-surface-container-low space-y-4 thin-border">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="type-label-caps text-on-surface-variant mb-1.5 block">Provider</label>
                      <select
                        value={newProvider}
                        onChange={(e) => setNewProvider(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg thin-border bg-surface text-on-surface text-sm outline-none"
                      >
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="google">Google (Gemini)</option>
                        <option value="ollama">Ollama (Local)</option>
                      </select>
                    </div>
                    <div>
                      <label className="type-label-caps text-on-surface-variant mb-1.5 block">API Key</label>
                      <input
                        type="password"
                        value={newApiKey}
                        onChange={(e) => setNewApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="w-full px-4 py-2.5 rounded-lg thin-border bg-surface text-on-surface text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="type-label-caps text-on-surface-variant mb-1.5 block">Base URL (optional)</label>
                      <input
                        type="text"
                        value={newBaseUrl}
                        onChange={(e) => setNewBaseUrl(e.target.value)}
                        placeholder="https://api.openai.com/v1"
                        className="w-full px-4 py-2.5 rounded-lg thin-border bg-surface text-on-surface text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="type-label-caps text-on-surface-variant mb-1.5 block">Model (optional)</label>
                      <input
                        type="text"
                        value={newModel}
                        onChange={(e) => setNewModel(e.target.value)}
                        placeholder="gpt-4o"
                        className="w-full px-4 py-2.5 rounded-lg thin-border bg-surface text-on-surface text-sm outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSaveProvider}
                      disabled={!newApiKey.trim() || savingProvider}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-sm disabled:opacity-50"
                    >
                      {savingProvider ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {savingProvider ? "Saving..." : "Save Provider"}
                    </button>
                    <button
                      onClick={() => { setShowAddProvider(false); setNewApiKey(""); setNewBaseUrl(""); setNewModel(""); }}
                      className="px-5 py-2.5 rounded-full thin-border text-on-surface-variant hover:text-on-surface transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {providers.length > 0 ? (
                <div className="space-y-3">
                  {providers.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold", p.isActive ? "bg-primary-container text-primary" : "bg-surface-container text-on-surface-variant")}>
                          {p.provider === "openai" ? "AI" : p.provider === "anthropic" ? "A" : p.provider === "google" ? "G" : "O"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-on-surface capitalize">{p.provider}</p>
                          <p className="text-xs text-on-surface-variant">{p.model || "Default model"}</p>
                          {p.baseUrl && <p className="text-xs text-on-surface-variant font-mono">{p.baseUrl}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                        </span>
                        <button
                          onClick={() => handleDeleteProvider(p.id)}
                          className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-surface-container-low text-center">
                  <AlertCircle className="w-8 h-8 mx-auto text-on-surface-variant/40 mb-3" />
                  <p className="text-sm text-on-surface-variant">No providers connected yet.</p>
                  <p className="text-xs text-on-surface-variant mt-1">Click &quot;Add Provider&quot; to connect your own AI API keys.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "billing" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-lg font-semibold text-on-surface">Billing & Subscription</h3>
              <div className="p-5 rounded-xl border-2 border-primary bg-primary-container">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-on-surface">Free Plan</p>
                    <p className="text-sm text-on-surface-variant">Use your own API keys — no subscription needed</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-medium">Current Plan</span>
                </div>
              </div>
              <div className="text-sm text-on-surface-variant">
                <p>No billing required — connect your own AI providers or use the built-in local AI.</p>
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
                  <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium">Disabled</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-outline-variant">
                  <div>
                    <p className="text-sm font-medium text-on-surface">Password</p>
                    <p className="text-xs text-on-surface-variant">Manage your password</p>
                  </div>
                  <button className="px-3 py-1.5 rounded-full thin-border text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors">Change</button>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-on-surface">Active Sessions</p>
                    <p className="text-xs text-on-surface-variant">1 device currently signed in</p>
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
