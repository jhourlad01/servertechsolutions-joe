"use client";

import React, { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { useParams } from "next/navigation";
import Link from "next/link";
import IssueModal from "@/components/IssueModal";
import IssueMessageThread from "@/components/IssueMessageThread";

interface Issue {
  id: string;
  title: string;
  description: string;
  created_at: string;
  category_id: number;
  priority_id: number;
  status_id: number;
  ai_summary?: string;
  ai_next_action?: string;
  category?: { name: string };
  priority?: { name: string; slug: string };
  status?: { id: number; name: string };
  assigned_user?: { id: string; name: string };
}

export default function IssueDetailPage() {
  const { id } = useParams();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [lookups, setLookups] = useState<{
    statuses: any[],
    priorities: any[],
    agents: any[]
  }>({
    statuses: [],
    priorities: [],
    agents: []
  });

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const response = await axios.get(`/api/issues/${id}`);
        setIssue(response.data.data || null);
      } catch (error) {
        console.error("Failed to fetch issue detail:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchIssue();

    const fetchLookups = async () => {
      try {
        const [s, p, a] = await Promise.all([
          axios.get('/api/lookups/statuses'),
          axios.get('/api/lookups/priorities'),
          axios.get('/api/lookups/agents')
        ]);
        setLookups({
          statuses: s.data.data,
          priorities: p.data.data,
          agents: a.data.data
        });
      } catch (e) {
        console.error("Lookup fetch failed", e);
      }
    };
    fetchLookups();
  }, [id]);

  if (loading) {
    return (
      <div className="p-10 animate-pulse">
        <div className="h-12 w-64 bg-white/5 rounded-xl mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[500px] bg-white/5 rounded-2xl"></div>
          <div className="h-[500px] bg-white/5 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="p-10 text-center text-[var(--text-muted)] transition-colors">
        <p className="text-xl font-bold uppercase tracking-widest">Issue Not Found</p>
        <Link href="/dashboard" className="text-neon-purple mt-4 block underline">Go Back</Link>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-14 animate-fade-in-up max-w-7xl mx-auto">
      <header className="mb-14 flex flex-col items-start justify-between">
        <div className="w-full">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/dashboard" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors text-sm">Issue Registry</Link>
            <span className="text-[var(--text-muted)] text-sm">/</span>
            <span className="text-neon-purple font-black uppercase tracking-widest text-xs">Issue {issue.id}</span>
          </div>
          <div className="flex justify-between items-start gap-4">
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-[var(--foreground)] mb-6 leading-tight transition-colors">{issue.title}</h1>
            <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 rounded-xl border border-[var(--border-strong)] bg-[var(--hover-bg)] text-[var(--foreground)] font-bold text-sm tracking-widest uppercase hover:border-neon-purple/50 transition-all shrink-0">
              Edit Issue
            </button>
          </div>
          <div className="flex gap-4 items-center">
             <span className="px-3 py-1 rounded bg-red-500 text-white text-[10px] font-black uppercase tracking-widest border border-red-500/20">{issue.priority?.name}</span>
             {(issue.priority?.slug === 'high' || issue.priority?.slug === 'critical') && (
               <span className="px-3 py-1 rounded bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/20 shadow-[0_0_10px_-2px_rgba(239,68,68,0.5)]">
                 Escalated
               </span>
             )}
             <span className="px-3 py-1 rounded bg-[var(--hover-bg)] border border-[var(--border-strong)] text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest transition-colors">{issue.status?.name}</span>
             <span className="text-[var(--text-muted)] text-sm font-medium transition-colors">Recorded {new Date(issue.created_at).toLocaleString()}</span>
          </div>
        </div>
      </header>

      <IssueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        issue={issue}
        onSuccess={(updatedIssue) => {
          setIssue(updatedIssue);
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Main Description */}
          <section className="glass-card p-8 lg:p-12 border-[var(--border-strong)]">
            <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-8 border-b border-[var(--border-subtle)] pb-4 transition-colors">Description</h3>
            <div className="text-[var(--foreground)] text-base font-medium leading-loose whitespace-pre-wrap transition-colors">
              {issue.description || 'No detailed log provided for this operational event.'}
            </div>
          </section>

          {/* AI Intelligence Section */}
          <section className="glass-card p-0 border-neon-purple/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-transparent pointer-events-none"></div>
            <div className="p-10 relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-neon-purple shadow-[0_0_15px_#a855f7] flex items-center justify-center text-white font-black text-xs">AI</div>
                <h3 className="text-xs font-black text-neon-purple uppercase tracking-[0.3em]">Issue Summary</h3>
              </div>
              
              <div className="space-y-8">
                <div>
                  <div className="text-[var(--foreground)] text-xl font-bold mb-3 italic transition-colors">&ldquo; {issue.ai_summary || 'Generating summary...'} &rdquo;</div>
                </div>
                
                <div className="pt-8 border-t border-[var(--border-subtle)]">
                  <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 transition-colors">Suggested Next Step</div>
                  <div className="bg-[var(--hover-bg)] border border-[var(--border-strong)] rounded-xl p-6 text-neon-cyan font-bold leading-relaxed border-l-4 border-l-neon-cyan transition-colors">
                    {issue.ai_next_action || 'Determining next steps...'}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Message Thread */}
          <IssueMessageThread issueId={id as string} />
        </div>

        <div className="space-y-10">
          {/* Quick Actions / Status Switcher */}
          <section className="glass-card p-8 lg:p-10 border-[var(--border-strong)] space-y-8 transition-all">
             <div>
               <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 transition-colors">Operational Status</h3>
               <select 
                 value={issue.status_id}
                 onChange={async (e) => {
                   const sid = parseInt(e.target.value);
                   try {
                     const res = await axios.patch(`/api/issues/${issue.id}/status`, { status_id: sid });
                     setIssue({ ...issue, status_id: sid, status: res.data.data.status });
                   } catch (err) { console.error(err); }
                 }}
                 className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--foreground)] focus:outline-none focus:border-neon-purple/50 transition-all appearance-none cursor-pointer"
               >
                 {lookups.statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
               </select>
             </div>

             <div>
               <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 transition-colors">Priority Escalation</h3>
               <select 
                 value={issue.priority_id}
                 onChange={async (e) => {
                   const pid = parseInt(e.target.value);
                   try {
                     const res = await axios.patch(`/api/issues/${issue.id}/escalate`, { priority_id: pid });
                     setIssue({ ...issue, priority_id: pid, priority: res.data.data.priority });
                   } catch (err) { console.error(err); }
                 }}
                 className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--foreground)] focus:outline-none focus:border-neon-purple/50 transition-all appearance-none cursor-pointer"
               >
                 {lookups.priorities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
               </select>
             </div>

             <div>
               <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 transition-colors">Direct Assignment</h3>
               <select 
                 value={issue.assigned_user?.id || ""}
                 onChange={async (e) => {
                   const uid = e.target.value;
                   try {
                     const res = await axios.patch(`/api/issues/${issue.id}/assign`, { user_id: uid });
                     setIssue({ ...issue, assigned_user: res.data.data.assigned_user });
                   } catch (err) { console.error(err); }
                 }}
                 className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--foreground)] focus:outline-none focus:border-neon-purple/50 transition-all appearance-none cursor-pointer"
               >
                 <option value="">Unassigned</option>
                 {lookups.agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
               </select>
             </div>
          </section>

          {/* Metadata Sidebar */}
          <section className="glass-card p-8 lg:p-10 border-[var(--border-strong)]">
            <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-8 transition-colors">Details</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 transition-colors">Category</label>
                <div className="text-[var(--foreground)] font-bold transition-colors">{issue.category?.name}</div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 transition-colors">Internal ID</label>
                <div className="text-[var(--foreground)] font-bold opacity-50 text-xs tabular-nums transition-colors">{issue.id}</div>
              </div>
              <div className="pt-6 border-t border-[var(--border-subtle)]">
                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 text-center transition-colors">Assigned To</label>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--hover-bg)] border border-[var(--border-strong)] flex items-center justify-center text-neon-purple text-2xl font-black mb-3">
                    {issue.assigned_user?.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                  </div>
                  <div className="text-[var(--foreground)] font-bold text-center transition-colors">{issue.assigned_user?.name || 'Unassigned'}</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
