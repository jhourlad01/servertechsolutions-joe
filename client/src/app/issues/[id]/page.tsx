"use client";

import React, { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function IssueDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="p-10 text-center text-slate-500">
        <p className="text-xl font-bold uppercase tracking-widest">Issue Not Found</p>
        <Link href="/dashboard" className="text-neon-purple mt-4 block underline">Go Back</Link>
      </div>
    );
  }

  return (
    <div className="p-10 animate-fade-in-up">
      <header className="mb-10 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Link href="/dashboard" className="text-slate-500 hover:text-white transition-colors">Issue Registry</Link>
            <span className="text-slate-700">/</span>
            <span className="text-neon-purple font-black uppercase tracking-widest text-xs">Issue {issue.id}</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white mb-4 leading-tight">{issue.title}</h1>
          <div className="flex gap-4 items-center">
             <span className="px-3 py-1 rounded bg-red-500 text-white text-[10px] font-black uppercase tracking-widest border border-red-500/20">{issue.priority?.name}</span>
             {(issue.priority?.slug === 'high' || issue.priority?.slug === 'critical') && (
               <span className="px-3 py-1 rounded bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/20 shadow-[0_0_10px_-2px_rgba(239,68,68,0.5)]">
                 Escalated
               </span>
             )}
             <span className="px-3 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest">{issue.status?.name}</span>
             <span className="text-slate-500 text-sm font-medium">Recorded {new Date(issue.created_at).toLocaleString()}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Description */}
          <section className="glass-card p-10 border-white/5">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-6 border-b border-white/5 pb-2">Description</h3>
            <div className="text-slate-300 text-lg font-medium leading-relaxed whitespace-pre-wrap">
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
                  <div className="text-white text-xl font-bold mb-3 italic">" {issue.ai_summary || 'Generating summary...'} "</div>
                </div>
                
                <div className="pt-8 border-t border-white/5">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Suggested Next Step</div>
                  <div className="bg-slate-950/50 border border-white/5 rounded-xl p-6 text-neon-cyan font-bold leading-relaxed border-l-4 border-l-neon-cyan">
                    {issue.ai_next_action || 'Determining next steps...'}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Metadata Sidebar */}
          <section className="glass-card p-8 border-white/5">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Details</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Category</label>
                <div className="text-white font-bold">{issue.category?.name}</div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Internal ID</label>
                <div className="text-white font-bold opacity-50 text-xs tabular-nums">{issue.id}</div>
              </div>
              <div className="pt-6 border-t border-white/5">
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 text-center">Assigned To</label>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neon-purple text-2xl font-black mb-3">
                    {issue.assigned_agent?.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                  </div>
                  <div className="text-white font-bold text-center">{issue.assigned_agent?.name || 'Unassigned'}</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
