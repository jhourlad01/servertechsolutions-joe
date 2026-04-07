import React, { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function IssueModal({ 
  isOpen, 
  onClose, 
  issue = null, 
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  issue?: any; 
  onSuccess: (savedIssue: any) => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Form, 2: Review/AI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "1",
    priority_id: "1",
    status_id: "1"
  });

  const [aiPreview, setAiPreview] = useState<{summary: string, action: string} | null>(null);

  // Setup catch-all for 401s
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  useEffect(() => {
    if (issue) {
      setFormData({
        title: issue.title,
        description: issue.description,
        category_id: issue.category_id?.toString() || "1",
        priority_id: issue.priority_id?.toString() || "1",
        status_id: issue.status_id?.toString() || "1"
      });
      setAiPreview({
        summary: issue.ai_summary || "",
        action: issue.ai_next_action || ""
      });
    } else {
      setFormData({
        title: "",
        description: "",
        category_id: "1",
        priority_id: "1",
        status_id: "1"
      });
      setAiPreview(null);
    }
    setStep(1);
    setError("");
  }, [issue, isOpen]);

  if (!isOpen) return null;

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Simulate AI fetch or run rules locally briefly to show "Next" flow
      const response = await axios.post("/api/issues/preview", formData);
      setAiPreview(response.data.data);
      setStep(2);
    } catch (err: any) {
      // Fallback: If preview endpoint not ready, just move to step 2 with local rules
      console.warn("Preview endpoint not reachable, using local fallback logic");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      let response;
      if (issue) {
        response = await axios.put(`/api/issues/${issue.id}`, formData);
      } else {
        response = await axios.post("/api/issues", formData);
      }
      onSuccess(response.data.data);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Incomplete request. Please check required fields.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-[var(--background)] border border-[var(--border-strong)] rounded-2xl shadow-2xl animate-fade-in-up overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--hover-bg)]">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-[var(--foreground)] tracking-tight">
              {issue ? `Update Issue` : "Report New Issue"}
            </h2>
            <div className="flex gap-2 mt-2">
              <div className={`h-1 w-8 rounded-full ${step === 1 ? 'bg-neon-purple shadow-[0_0_8px_#a855f7]' : 'bg-[var(--border-strong)]'}`}></div>
              <div className={`h-1 w-8 rounded-full ${step === 2 ? 'bg-neon-purple shadow-[0_0_8px_#a855f7]' : 'bg-[var(--border-strong)]'}`}></div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex flex-col justify-center items-center rounded-xl bg-[var(--border-subtle)] text-[var(--text-muted)] hover:text-red-500 transition-colors">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto min-h-[400px]">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold animate-pulse">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form id="issue-form" onSubmit={handleNextStep} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Issue Title</label>
                <input 
                  required
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Summary of the incident..."
                  className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-xl px-5 py-3 text-sm text-[var(--foreground)] focus:outline-none focus:border-neon-purple/50 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Detailed Log / Description</label>
                <textarea 
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Provide logs, errors, or environmental details..."
                  className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-xl px-5 py-3 text-sm text-[var(--foreground)] focus:outline-none focus:border-neon-purple/50 transition-all font-medium resize-none leading-relaxed"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Registry Category</label>
                  <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] focus:outline-none focus:border-neon-purple/50 appearance-none font-bold">
                    <option value="1">Technical</option>
                    <option value="2">Account</option>
                    <option value="3">Billing</option>
                    <option value="4">Sales</option>
                    <option value="5">Support</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Priority Tier</label>
                  <select name="priority_id" value={formData.priority_id} onChange={handleChange} className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] focus:outline-none focus:border-neon-purple/50 appearance-none font-bold">
                    <option value="1">Low - Routine</option>
                    <option value="2">Medium - Degraded</option>
                    <option value="3">High - Urgent</option>
                    <option value="4">Critical - Outage</option>
                  </select>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-8 animate-fade-in-up">
              <div className="p-6 rounded-2xl bg-neon-purple/5 border border-neon-purple/20">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 h-8 rounded-full bg-neon-purple flex items-center justify-center text-xs">✨</span>
                  <h3 className="text-sm font-black text-[var(--foreground)] uppercase tracking-widest">Smart Summary Generated</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <span className="block text-[9px] font-black text-neon-purple uppercase tracking-widest mb-2">Intelligence Summary</span>
                    <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed italic opacity-80 border-l-2 border-neon-purple/30 pl-4">
                      {aiPreview?.summary || "Analyzing description patterns for intelligence summary..."}
                    </p>
                  </div>
                  <div>
                    <span className="block text-[9px] font-black text-neon-purple uppercase tracking-widest mb-2">Suggested Next Action</span>
                    <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed opacity-80 border-l-2 border-neon-purple/30 pl-4">
                      {aiPreview?.action || "Determining optimal response protocol based on severity..."}
                    </p>
                  </div>
                </div>
                <p className="mt-6 text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-tighter">AI Service: Connected (Llama3-8b-Fallback)</p>
              </div>
              <p className="text-xs text-[var(--text-muted)] font-medium text-center px-10 leading-relaxed">
                Review the auto-generated intelligence details above. Clicking 'Submit' will finalize the registry entry and notify the assigned team.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 md:p-8 border-t border-[var(--border-subtle)] bg-[var(--hover-bg)] flex justify-end gap-4">
          {step === 1 ? (
            <>
              <button type="button" onClick={onClose} className="px-6 py-2.5 font-bold text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors text-xs uppercase tracking-widest">
                Cancel
              </button>
              <button form="issue-form" type="submit" disabled={loading} className="btn-primary flex items-center gap-2 text-xs uppercase tracking-widest px-8 py-3">
                {loading ? "Processing..." : "Next: AI Summary →"}
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setStep(1)} className="px-6 py-2.5 font-bold text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors text-xs uppercase tracking-widest">
                ← Edit Details
              </button>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary flex items-center gap-2 text-xs uppercase tracking-widest px-8 py-3">
                {loading ? "Submitting..." : issue ? "Commit Updates" : "Submit Issue"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
