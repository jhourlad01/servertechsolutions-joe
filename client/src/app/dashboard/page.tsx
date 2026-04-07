"use client";

import React, { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import IssueModal from "@/components/IssueModal";

interface DashboardIssue {
    id: string;
    identification_number?: string;
    title: string;
    priority: { name: string; slug: string };
    status: { name: string; slug?: string };
    category: { name: string };
    assigned_user?: { name: string };
    assigned_agent_id?: string;
    updated_at: string;
    created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [issues, setIssues] = useState<DashboardIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status_id: "",
    category_id: "",
    priority_id: ""
  });

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await axios.get(`/api/issues?${queryParams}`);
        setIssues(response.data.data || []);
      } catch (err: unknown) {
        console.error("Failed to fetch issues:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [filters]);

  useEffect(() => {
    const handleOpenModal = () => setIsModalOpen(true);
    window.addEventListener('open-issue-modal', handleOpenModal);
    return () => window.removeEventListener('open-issue-modal', handleOpenModal);
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
    <div className="p-8 lg:p-16 animate-fade-in-up max-w-7xl mx-auto">
      <header className="flex flex-col mb-20 gap-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-[var(--foreground)] transition-colors">Issue Registry</h1>
            <p className="text-[var(--text-muted)] mt-2 text-xs font-bold uppercase tracking-[0.2em] transition-colors">System Operations & Registry Alpha</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 text-xs font-black uppercase tracking-widest px-8 py-3.5 shadow-neon-purple/20 shadow-xl transition-all hover:scale-[1.02]">
            <span className="text-xl leading-none">+</span> Report Issue
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[var(--border-subtle)]">
          <div className="flex flex-wrap gap-2.5">
            <select 
              value={filters.status_id}
              onChange={(e) => setFilters({...filters, status_id: e.target.value})}
              className="bg-[var(--background)] border border-[var(--border-strong)] rounded-xl px-5 py-3 text-[10px] uppercase font-black tracking-widest w-40 text-[var(--foreground)] focus:outline-none focus:border-neon-purple/50 appearance-none transition-all cursor-pointer hover:bg-[var(--hover-bg)]"
            >
              <option value="">All Statuses</option>
              <option value="1">New</option>
              <option value="2">In Progress</option>
              <option value="3">Resolved</option>
            </select>
            <select 
              value={filters.category_id}
              onChange={(e) => setFilters({...filters, category_id: e.target.value})}
              className="bg-[var(--background)] border border-[var(--border-strong)] rounded-xl px-5 py-3 text-[10px] uppercase font-black tracking-widest w-40 text-[var(--foreground)] focus:outline-none focus:border-neon-purple/50 appearance-none transition-all cursor-pointer hover:bg-[var(--hover-bg)]"
            >
              <option value="">All Categories</option>
              <option value="1">Network</option>
              <option value="2">Hardware</option>
              <option value="3">Software</option>
            </select>
            <select 
              value={filters.priority_id}
              onChange={(e) => setFilters({...filters, priority_id: e.target.value})}
              className="bg-[var(--background)] border border-[var(--border-strong)] rounded-xl px-5 py-3 text-[10px] uppercase font-black tracking-widest w-40 text-[var(--foreground)] focus:outline-none focus:border-neon-purple/50 appearance-none transition-all cursor-pointer hover:bg-[var(--hover-bg)]"
            >
              <option value="">All Priorities</option>
              <option value="1">Low</option>
              <option value="2">Medium</option>
              <option value="3">High</option>
              <option value="4">Critical</option>
            </select>
          </div>
          <div className="relative group flex-1 max-w-sm">
            <input 
              type="text" 
              placeholder="Search registry entries..." 
              className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-xl px-6 py-3 text-sm text-[var(--foreground)] focus:outline-none focus:border-neon-purple/50 transition-all backdrop-blur-sm placeholder:text-[var(--text-muted)] placeholder:text-xs font-medium"
            />
          </div>
        </div>
      </header>


      <IssueModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={(newIssue) => {
          setIssues([newIssue, ...issues]);
          router.push(`/issues/${newIssue.id}`);
        }} 
      />

      {/* Stats QuickView */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
        {[
          { label: "Active Issues", value: issues.length, color: "text-neon-purple" },
          { label: "Unassigned", value: issues.filter(i => !i.assigned_agent_id).length, color: "text-neon-cyan" },
          { label: "Critical", value: issues.filter(i => i.priority?.slug === 'critical').length, color: "text-red-500" },
          { label: "Resolved (24h)", value: "12", color: "text-green-500" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-8">
            <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3 transition-colors">{stat.label}</div>
            <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--hover-bg)]">
              <th className="px-8 py-5 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest transition-colors">ID</th>
              <th className="px-8 py-5 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest transition-colors">Category</th>
              <th className="px-8 py-5 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest transition-colors">Priority</th>
              <th className="px-8 py-5 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest transition-colors">Status</th>
              <th className="px-8 py-5 text-right text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest transition-colors">Last Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-8 py-8 h-20 bg-white/5 mb-2"></td>
                </tr>
              ))
            ) : issues.length > 0 ? (
              issues.map((issue) => (
                <tr 
                  key={issue.id} 
                  className="hover:bg-[var(--hover-bg)] transition-all group cursor-pointer"
                  onClick={() => router.push(`/issues/${issue.id}`)}
                >
                  <td className="px-8 py-6">
                    <div className="block no-underline">
                      <div className="font-bold text-[var(--foreground)] group-hover:text-neon-purple transition-colors">{issue.identification_number}</div>
                      <div className="text-sm text-[var(--text-muted)] mt-1 line-clamp-1 transition-colors">{issue.title}</div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter bg-[var(--background)] text-[var(--text-muted)] border border-[var(--border-strong)] transition-colors">
                      {issue.category?.name || 'General'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${getPriorityColor(issue.priority?.name || 'Low')}`}></span>
                      <span className="text-sm text-[var(--foreground)] font-bold transition-colors">{issue.priority?.name || 'Normal'}</span>
                      {(issue.priority?.slug === 'high' || issue.priority?.slug === 'critical') && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest border border-red-500/30">
                          Escalated
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[11px] font-black tracking-widest ${issue.status?.slug === 'new' ? 'text-neon-purple' : 'text-[var(--text-muted)]'} uppercase transition-colors`}>
                      {issue.status?.name || 'PENDING'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right text-sm text-[var(--text-muted)] font-bold tabular-nums transition-colors">
                    {new Date(issue.updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-[var(--text-muted)] font-bold uppercase tracking-widest transition-colors">
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
