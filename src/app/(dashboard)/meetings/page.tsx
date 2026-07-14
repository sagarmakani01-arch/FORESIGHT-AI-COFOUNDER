"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Calendar, Clock, Users, Video, MapPin, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/shared/page-header";

const meetings = [
  { id: "1", title: "Weekly Team Standup", date: "2026-07-14", time: "10:00 AM", duration: "30 min", attendees: ["Sagar", "Priya", "Ravi", "Anita"], type: "recurring", notes: "Review sprint progress, blockers, and weekly goals." },
  { id: "2", title: "Investor Meeting - Sequoia", date: "2026-07-18", time: "2:00 PM", duration: "60 min", attendees: ["Sagar", "Anand Piramal"], type: "external", notes: "Discuss AI credit scoring metrics and Series A terms." },
  { id: "3", title: "Product Review - Wallet v2.0", date: "2026-07-15", time: "11:00 AM", duration: "45 min", attendees: ["Sagar", "Priya", "Anita", "Vikram"], type: "internal", notes: "Review biometric auth demo and P2P transfer flow." },
  { id: "4", title: "BharatPe Partnership Call", date: "2026-07-16", time: "3:00 PM", duration: "30 min", attendees: ["Sagar", "Neha"], type: "external", notes: "Finalize QR code integration timeline and merchant onboarding." },
  { id: "5", title: "Board Update (Async)", date: "2026-07-20", time: "All Day", duration: "—", attendees: ["Sagar", "Sarah Chen"], type: "recurring", notes: "Monthly board update via email. Include KPIs, financials, and milestones." },
];

const todayCalendar = [
  { time: "10:00", title: "Team Standup", duration: "30m" },
  { time: "11:00", title: "Product Review", duration: "45m" },
  { time: "14:00", title: "Sequoia Meeting Prep", duration: "30m" },
  { time: "15:00", title: "BharatPe Call", duration: "30m" },
];

export default function MeetingsPage() {
  const [selectedMeeting, setSelectedMeeting] = useState(meetings[0]);

  return (
    <div className="space-y-6">
      <PageHeader title="Meetings" description="Schedule and manage your meetings" actions={[
        <button key="new" className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-sm"><Plus className="w-4 h-4" />New Meeting</button>,
      ]} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upcoming Meetings */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="type-label-caps text-on-surface">Upcoming</h3>
          {meetings.map((meeting) => (
            <motion.div key={meeting.id} whileHover={{ x: 2 }} onClick={() => setSelectedMeeting(meeting)} className={cn("bg-surface thin-border rounded-xl p-4 cursor-pointer transition-all hover:shadow-card", selectedMeeting.id === meeting.id && "ring-2 ring-primary/20")}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-on-surface">{meeting.title}</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(meeting.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{meeting.time}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{meeting.attendees.length}</span>
                  </div>
                </div>
                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", meeting.type === "external" ? "bg-primary-container text-primary" : meeting.type === "recurring" ? "bg-surface-container text-on-surface-variant" : "bg-surface-container text-on-surface-variant")}>
                  {meeting.type}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Today's Schedule + Notes */}
        <div className="space-y-4">
          <div className="bg-surface thin-border rounded-xl p-5">
            <h3 className="type-label-caps text-on-surface mb-3">Today&apos;s Schedule</h3>
            <div className="space-y-2">
              {todayCalendar.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-surface-container-low">
                  <span className="text-xs font-mono text-on-surface-variant w-12 shrink-0">{item.time}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-on-surface">{item.title}</p>
                    <p className="text-xs text-on-surface-variant">{item.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface thin-border rounded-xl p-5">
            <h3 className="type-label-caps text-on-surface mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />Meeting Notes</h3>
            <p className="text-xs text-on-surface-variant mb-2">{selectedMeeting.title}</p>
            <p className="text-sm text-on-surface leading-relaxed">{selectedMeeting.notes}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {selectedMeeting.attendees.map((a) => (
                <span key={a} className="px-2 py-0.5 rounded-full bg-surface-container text-xs text-on-surface-variant">{a}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
