"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Megaphone } from "lucide-react";
import PageHeader from "@/components/shared/page-header";
import { useCompanyData } from "@/lib/hooks";
import { Modal, FormField, inputClass, selectClass, SubmitButton } from "@/components/shared/modal";

export default function MarketingPage() {
  const { data, loading } = useCompanyData();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", type: "email", budget: "" });
  const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string; type: string; status: string; budget: string }>>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/campaigns");
        const json = await res.json();
        if (json.success) setCampaigns(json.data);
      } catch (err) {
        console.error("Failed to fetch campaigns", err);
      } finally {
        setCampaignsLoading(false);
      }
    })();
  }, []);

  if (loading || campaignsLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Marketing" description="Campaign management and performance tracking" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface thin-border rounded-xl p-5 animate-pulse">
              <div className="h-10 w-10 rounded-lg bg-surface-container" />
              <div className="mt-4 space-y-2">
                <div className="h-3 w-20 bg-surface-container rounded" />
                <div className="h-6 w-16 bg-surface-container rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, type: form.type, budget: form.budget }),
      });
      const json = await res.json();
      if (json.success) {
        const refresh = await fetch("/api/campaigns");
        const rj = await refresh.json();
        if (rj.success) setCampaigns(rj.data);
        setForm({ name: "", type: "email", budget: "" });
        setModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to create campaign", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Marketing" description="Campaign management and performance tracking" actions={[
        <button key="new" onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-sm"><Plus className="w-4 h-4" />New Campaign</button>,
      ]} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Campaign">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Campaign Name" required>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Summer Sale 2026" required />
          </FormField>
          <FormField label="Type" required>
            <select className={selectClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="email">Email</option>
              <option value="social">Social</option>
              <option value="content">Content</option>
              <option value="referral">Referral</option>
              <option value="partnership">Partnership</option>
            </select>
          </FormField>
          <FormField label="Budget">
            <input className={inputClass} value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="e.g. $5,000" />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
            <SubmitButton loading={submitting}>Create Campaign</SubmitButton>
          </div>
        </form>
      </Modal>

      {campaigns.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center mb-4">
            <Megaphone className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-on-surface mb-2">No campaigns yet</h3>
          <p className="text-on-surface-variant max-w-md">
            Create your first marketing campaign to track channels, measure performance, and manage your content calendar.
          </p>
          {data?.company && (
            <p className="text-sm text-muted-foreground mt-4 max-w-lg">
              Marketing for <span className="font-medium text-on-surface">{data.company.name}</span> — {data.company.industry}
            </p>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface thin-border rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-on-surface">{c.name}</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-container text-primary">{c.status}</span>
              </div>
              <div className="space-y-1 text-xs text-on-surface-variant">
                <p>Type: {c.type.charAt(0).toUpperCase() + c.type.slice(1)}</p>
                {c.budget && <p>Budget: {c.budget}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
