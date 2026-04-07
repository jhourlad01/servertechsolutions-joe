"use client";

import React, { useEffect, useState } from "react";
import axios from "@/lib/axios";
import Link from "next/link";

export default function DashboardPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await axios.get("/api/issues");
        setIssues(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch issues:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]';
      case 'high': return 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.4)]';
      case 'medium': return 'bg-amber-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="p-10 animate-fade-in-up">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-white">Issue Registry</h1>
          <p className="text-slate-400 mt-3 text-lg font-medium">List and track all submitted issues.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Search issues..." 
              className="bg-slate-900/50 border border-white/10 rounded-xl px-5 py-3 text-sm w-72 focus:outline-none focus:border-neon-purple/50 transition-all backdrop-blur-sm"
            />
          </div>
          <button className="btn-primary flex items-center gap-2">
            <span className="text-xl">+</span> Report Issue
          </button>
        </div>
      </header>

      {/* Stats QuickView */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Active Issues", value: issues.length, color: "text-neon-purple" },
          { label: "Unassigned", value: issues.filter(i => !i.assigned_agent_id).length, color: "text-neon-cyan" },
          { label: "Critical", value: issues.filter(i => i.priority?.slug === 'critical').length, color: "text-red-500" },
          { label: "Resolved (24h)", value: "12", color: "text-green-500" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 border-white/5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</div>
            <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="glass-card border-white/5 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">ID</th>
              <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Category</th>
              <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Priority</th>
              <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Last Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-8 py-8 h-20 bg-white/5 mb-2"></td>
                </tr>
              ))
            ) : issues.length > 0 ? (
              issues.map((issue) => (
                <tr key={issue.id} className="hover:bg-white/5 transition-all group cursor-pointer">
                  <td className="px-8 py-6">
                    <Link href={`/issues/${issue.id}`} className="block no-underline">
                      <div className="font-bold text-white group-hover:text-neon-purple transition-colors">{issue.identification_number}</div>
                      <div className="text-sm text-slate-400 mt-1 line-clamp-1">{issue.title}</div>
                    </Link>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter bg-slate-800 text-slate-300 border border-white/10">
                      {issue.category?.name || 'General'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${getPriorityColor(issue.priority?.name || 'Low')}`}></span>
                      <span className="text-sm text-white font-bold">{issue.priority?.name || 'Normal'}</span>
                      {(issue.priority?.slug === 'high' || issue.priority?.slug === 'critical') && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest border border-red-500/30">
                          Escalated
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[11px] font-black tracking-widest ${issue.status?.slug === 'new' ? 'text-neon-purple' : 'text-slate-500'} uppercase`}>
                      {issue.status?.name || 'PENDING'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right text-sm text-slate-500 font-bold tabular-nums">
                    {new Date(issue.updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-bold uppercase tracking-widest">
                  No issues found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
