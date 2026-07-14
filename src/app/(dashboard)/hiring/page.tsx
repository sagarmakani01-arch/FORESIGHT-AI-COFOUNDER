"use client";

import { motion } from "framer-motion";
import { Plus, Users, MapPin, DollarSign, Clock, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/shared/page-header";

const positions = [
  { id: "1", title: "Senior Backend Engineer", department: "Engineering", location: "Mumbai (Hybrid)", salary: "$80K-$120K", status: "active", applicants: 24, stage: "interviewing" },
  { id: "2", title: "ML Engineer", department: "Engineering", location: "Mumbai (Remote)", salary: "$90K-$130K", status: "active", applicants: 18, stage: "screening" },
  { id: "3", title: "Frontend Engineer", department: "Engineering", location: "Mumbai (Hybrid)", salary: "$70K-$100K", status: "active", applicants: 32, stage: "interviewing" },
  { id: "4", title: "DevOps/SRE", department: "Engineering", location: "Remote", salary: "$85K-$115K", status: "paused", applicants: 12, stage: "sourcing" },
  { id: "5", title: "Product Designer", department: "Product", location: "Mumbai (On-site)", salary: "$60K-$85K", status: "active", applicants: 41, stage: "offer" },
];

const team = [
  { name: "Sagar Makani", role: "Founder & CEO", department: "Leadership" },
  { name: "Priya Mehta", role: "CTO", department: "Engineering" },
  { name: "Ravi Kumar", role: "Lead Backend Engineer", department: "Engineering" },
  { name: "Anita Desai", role: "Product Manager", department: "Product" },
  { name: "Vikram Singh", role: "ML Engineer", department: "Engineering" },
  { name: "Neha Gupta", role: "Marketing Lead", department: "Marketing" },
];

const pipelineStages = ["Sourcing", "Screening", "Interviewing", "Offer", "Hired"];

export default function HiringPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Hiring" description="Manage positions and recruitment pipeline" actions={[
        <button key="new" className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-sm"><Plus className="w-4 h-4" />Open Position</button>,
      ]} />

      {/* Pipeline Overview */}
      <div className="bg-surface thin-border rounded-xl p-6">
        <h3 className="type-label-caps text-on-surface mb-4">Recruitment Pipeline</h3>
        <div className="flex gap-4">
          {pipelineStages.map((stage, i) => {
            const count = positions.filter((p) => {
              if (stage === "Sourcing") return p.stage === "sourcing";
              if (stage === "Screening") return p.stage === "screening";
              if (stage === "Interviewing") return p.stage === "interviewing";
              if (stage === "Offer") return p.stage === "offer";
              return false;
            }).length;
            return (
              <div key={stage} className="flex items-center gap-3 flex-1">
                <div className={cn("flex-1 rounded-lg p-3 text-center", count > 0 ? "bg-primary-container" : "bg-surface-container-low")}>
                  <p className="text-2xl font-bold text-on-surface">{count}</p>
                  <p className="text-xs text-on-surface-variant">{stage}</p>
                </div>
                {i < pipelineStages.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Positions List */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="type-label-caps text-on-surface">Open Positions</h3>
          {positions.map((pos) => (
            <motion.div key={pos.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface thin-border rounded-xl p-4 flex items-center gap-4 hover:shadow-card transition-all">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-on-surface">{pos.title}</h4>
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", pos.status === "active" ? "bg-primary-container text-primary" : "bg-surface-container text-on-surface-variant")}>{pos.status}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{pos.department}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{pos.location}</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{pos.salary}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-on-surface">{pos.applicants}</p>
                <p className="text-xs text-on-surface-variant">applicants</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Team Overview */}
        <div>
          <h3 className="type-label-caps text-on-surface mb-3">Team ({team.length})</h3>
          <div className="bg-surface thin-border rounded-xl p-4 space-y-3">
            {team.map((member) => (
              <div key={member.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container-low transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">{member.name.split(" ").map((n) => n[0]).join("")}</div>
                <div>
                  <p className="text-sm font-medium text-on-surface">{member.name}</p>
                  <p className="text-xs text-on-surface-variant">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
