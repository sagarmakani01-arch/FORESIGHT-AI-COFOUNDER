"use client";

import { useState, useEffect, FormEvent } from "react";
import { motion } from "framer-motion";
import { Plus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanyData } from "@/lib/hooks";
import PageHeader from "@/components/shared/page-header";
import { Modal, FormField, inputClass, SubmitButton } from "@/components/shared/modal";

const pipelineStages = ["Sourcing", "Screening", "Interviewing", "Offer", "Hired"];

type Position = { id: string; title: string; department: string; status: string };

export default function HiringPage() {
  const { data, loading } = useCompanyData();
  const company = data?.company;
  const teamSize = company?.teamSize ?? 0;

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDepartment, setFormDepartment] = useState("");
  const [positions, setPositions] = useState<Position[]>([]);
  const [positionsLoading, setPositionsLoading] = useState(true);

  async function fetchPositions() {
    try {
      const res = await fetch("/api/positions");
      const json = await res.json();
      if (json.success) setPositions(json.data);
    } catch (err) {
      console.error("Failed to fetch positions", err);
    } finally {
      setPositionsLoading(false);
    }
  }

  useEffect(() => {
    fetchPositions();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formTitle.trim() || !formDepartment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: formTitle.trim(), department: formDepartment.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchPositions();
        setModalOpen(false);
        setFormTitle("");
        setFormDepartment("");
      }
    } catch (err) {
      console.error("Failed to create position", err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || positionsLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Hiring" description="Manage positions and recruitment pipeline" actions={[]} />
        <div className="bg-surface thin-border rounded-xl p-6 animate-pulse h-32" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="bg-surface thin-border rounded-xl h-64 animate-pulse" />
          <div className="bg-surface thin-border rounded-xl h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Hiring" description="Manage positions and recruitment pipeline" actions={[
        <button key="new" onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-sm"><Plus className="w-4 h-4" />Open Position</button>,
      ]} />

      <div className="bg-surface thin-border rounded-xl p-6">
        <h3 className="type-label-caps text-on-surface mb-4">Recruitment Pipeline</h3>
        <div className="flex gap-4">
          {pipelineStages.map((stage, i) => (
            <div key={stage} className="flex items-center gap-3 flex-1">
              <div className="flex-1 rounded-lg p-3 text-center bg-surface-container-low">
                <p className="text-2xl font-bold text-on-surface">0</p>
                <p className="text-xs text-on-surface-variant">{stage}</p>
              </div>
              {i < pipelineStages.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <h3 className="type-label-caps text-on-surface">Open Positions</h3>
          {positions.length === 0 ? (
            <div className="bg-surface thin-border rounded-xl p-8 text-center text-on-surface-variant text-sm">
              No open positions. Click &quot;Open Position&quot; to start recruiting.
            </div>
          ) : (
            <div className="space-y-3">
              {positions.map((pos) => (
                <motion.div key={pos.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-surface thin-border rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-on-surface">{pos.title}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{pos.department}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-primary-container text-primary text-[10px] font-semibold uppercase">{pos.status}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="type-label-caps text-on-surface mb-3">Team ({teamSize})</h3>
          <div className="bg-surface thin-border rounded-xl p-4 space-y-3">
            {teamSize > 0 ? (
              <p className="text-sm text-on-surface-variant">
                Your team has <strong className="text-on-surface">{teamSize}</strong> member{teamSize !== 1 ? "s" : ""}.
              </p>
            ) : (
              <p className="text-sm text-on-surface-variant">No team members yet.</p>
            )}
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Open Position">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Job Title" required>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className={inputClass}
              required
            />
          </FormField>
          <FormField label="Department" required>
            <input
              type="text"
              value={formDepartment}
              onChange={(e) => setFormDepartment(e.target.value)}
              placeholder="e.g. Engineering, Design, Marketing"
              className={inputClass}
              required
            />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
              Cancel
            </button>
            <SubmitButton loading={submitting}>Open Position</SubmitButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
