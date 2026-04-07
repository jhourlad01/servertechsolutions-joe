"use client";

import React, { useState } from "react";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateIssuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "1",
    priority_id: "1",
    status_id: "1"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/issues", formData);
      // Auto-redirect to the newly created issue page
      router.push(`/issues/${response.data.data.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to submit issue. Please check your inputs.");
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-8 lg:p-14 animate-fade-in-up max-w-5xl mx-auto">
      <header className="mb-10 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Link href="/dashboard" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors text-sm">Issue Registry</Link>
            <span className="text-[var(--text-muted)] text-sm">/</span>
            <span className="text-neon-purple font-black text-xs uppercase tracking-widest">Report Issue</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[var(--foreground)] transition-colors">Report New Issue</h1>
          <p className="text-[var(--text-muted)] mt-4 text-sm font-medium transition-colors">Submit a new operational ticket into the system.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="glass-card p-8 lg:p-12 border-[var(--border-strong)] space-y-10">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold animate-pulse">
            {error}
          </div>
        )}

        <div className="space-y-8">
          <div>
            <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-wider mb-3 transition-colors">Issue Title</label>
            <input 
              required
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Main database replication lagging"
              className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-xl px-5 py-3.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-neon-purple/50 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-wider mb-3 transition-colors">Detailed Description</label>
            <textarea 
              required
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              placeholder="Provide system logs, error codes, and replication steps..."
              className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-xl px-5 py-4 text-sm text-[var(--foreground)] focus:outline-none focus:border-neon-purple/50 transition-all font-medium resize-none leading-relaxed"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div>
              <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-wider mb-3 transition-colors">Category</label>
              <select 
                name="category_id" 
                value={formData.category_id} 
                onChange={handleChange}
                className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-xl px-5 py-3.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-neon-purple/50 transition-all font-bold appearance-none"
              >
                <option value="1">Network Infrastructure</option>
                <option value="2">Hardware / Server</option>
                <option value="3">Software Application</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-wider mb-3 transition-colors">Priority Level</label>
              <select 
                name="priority_id" 
                value={formData.priority_id} 
                onChange={handleChange}
                className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-xl px-5 py-3.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-neon-purple/50 transition-all font-bold appearance-none"
              >
                <option value="1">Low - Routine</option>
                <option value="2">Medium - Degraded</option>
                <option value="3">High - Urgent</option>
                <option value="4">Critical - Outage</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-[var(--border-subtle)] flex justify-end gap-6">
          <Link href="/dashboard" className="px-6 py-3 font-bold text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors text-sm">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary flex items-center gap-2 text-sm px-6 py-3"
          >
            {loading ? "Submitting..." : "Submit to Registry"}
          </button>
        </div>
      </form>
    </div>
  );
}
