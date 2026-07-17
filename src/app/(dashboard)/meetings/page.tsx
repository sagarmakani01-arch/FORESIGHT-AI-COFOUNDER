"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Calendar, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanyData } from "@/lib/hooks";
import PageHeader from "@/components/shared/page-header";
import { Modal, FormField, inputClass, SubmitButton } from "@/components/shared/modal";

export default function MeetingsPage() {
  const { data, loading } = useCompanyData();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", attendees: "", notes: "" });
  const [meetings, setMeetings] = useState<Array<{ id: string; title: string; date: string; attendees: string; notes: string }>>([]);
  const [meetingsLoading, setMeetingsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/meetings");
        const json = await res.json();
        if (json.success) {
          setMeetings(json.data.map((m: { id: string; title: string; date: string; attendees: string; notes: string; status: string }) => ({
            ...m,
            date: m.date,
          })));
        }
      } catch (err) {
        console.error("Failed to fetch meetings", err);
      } finally {
        setMeetingsLoading(false);
      }
    })();
  }, []);

  const milestoneMeetings = useMemo(() => {
    if (!data) return [];
    return (data.milestones ?? [])
      .filter((m) => m.status.toLowerCase() !== "completed" && m.status.toLowerCase() !== "cancelled")
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .map((m) => ({
        id: m.id,
        title: m.title,
        date: m.deadline,
        notes: m.description || "No notes.",
        status: m.status.replace(/_/g, " ").toLowerCase(),
      }));
  }, [data]);

  const allMeetings = useMemo(() => {
    const customMeetings = meetings.map((m) => ({ ...m, status: "scheduled" }));
    return [...customMeetings, ...milestoneMeetings];
  }, [meetings, milestoneMeetings]);

  const selectedMeeting = allMeetings[selectedIdx] ?? allMeetings[0];

  if (loading || meetingsLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Meetings" description="Schedule and manage your meetings" actions={[]} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="bg-surface thin-border rounded-xl p-4 animate-pulse h-20" />)}
          </div>
          <div className="bg-surface thin-border rounded-xl h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, date: form.date, attendees: form.attendees, notes: form.notes }),
      });
      const json = await res.json();
      if (json.success) {
        const refresh = await fetch("/api/meetings");
        const rj = await refresh.json();
        if (rj.success) setMeetings(rj.data.map((m: { id: string; title: string; date: string; attendees: string; notes: string; status: string }) => ({ ...m, date: m.date })));
        setForm({ title: "", date: "", attendees: "", notes: "" });
        setModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to create meeting", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Meetings" description="Schedule and manage your meetings" actions={[
        <button key="new" onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-sm"><Plus className="w-4 h-4" />New Meeting</button>,
      ]} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Meeting">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Title" required>
            <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Q3 Planning" required />
          </FormField>
          <FormField label="Date & Time" required>
            <input type="datetime-local" className={inputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </FormField>
          <FormField label="Attendees">
            <input className={inputClass} value={form.attendees} onChange={(e) => setForm({ ...form, attendees: e.target.value })} placeholder="e.g. Alice, Bob, Charlie" />
          </FormField>
          <FormField label="Notes">
            <textarea className={inputClass} rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Agenda, talking points..." />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
            <SubmitButton loading={submitting}>Create Meeting</SubmitButton>
          </div>
        </form>
      </Modal>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <h3 className="type-label-caps text-on-surface">Upcoming</h3>
          {allMeetings.length === 0 ? (
            <div className="bg-surface thin-border rounded-xl p-12 text-center text-on-surface-variant text-sm">
              No meetings scheduled. Upcoming milestones will appear here.
            </div>
          ) : (
            allMeetings.map((meeting, idx) => (
              <motion.div key={meeting.id} whileHover={{ x: 2 }} onClick={() => setSelectedIdx(idx)} className={cn("bg-surface thin-border rounded-xl p-4 cursor-pointer transition-all hover:shadow-card", selectedMeeting?.id === meeting.id && "ring-2 ring-primary/20")}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-on-surface">{meeting.title}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(meeting.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />All Day</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-container text-primary">
                    {meeting.status}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-surface thin-border rounded-xl p-5">
            <h3 className="type-label-caps text-on-surface mb-3">Today&apos;s Schedule</h3>
            <div className="space-y-2">
              {allMeetings.length === 0 ? (
                <p className="text-sm text-on-surface-variant p-2">No events today.</p>
              ) : (
                allMeetings.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-surface-container-low">
                    <span className="text-xs font-mono text-on-surface-variant w-12 shrink-0">All Day</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-on-surface">{item.title}</p>
                      <p className="text-xs text-on-surface-variant">{item.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-surface thin-border rounded-xl p-5">
            <h3 className="type-label-caps text-on-surface mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />Meeting Notes</h3>
            {selectedMeeting ? (
              <>
                <p className="text-xs text-on-surface-variant mb-2">{selectedMeeting.title}</p>
                <p className="text-sm text-on-surface leading-relaxed">{selectedMeeting.notes}</p>
              </>
            ) : (
              <p className="text-sm text-on-surface-variant">Select a meeting to view notes.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
