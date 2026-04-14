"use client";

import React, { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { ExclamationTriangleIcon, PencilSquareIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/components/Toast";

interface Priority {
    id: number;
    name: string;
    slug: string;
    color?: string;
    weight?: number;
}

export default function PriorityManagementPage() {
    useAuth({ middleware: 'auth' });
    const { showToast } = useToast();
    const [data, setData] = useState<Priority[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEdit, setIsEdit] = useState(false);
    const [selected, setSelected] = useState<Priority | null>(null);
    const [formData, setFormData] = useState({ name: "", slug: "", color: "#ffffff", weight: 0 });

    const fetchData = async () => {
        try {
            const res = await axios.get("/api/lookups/priorities");
            setData(res.data.data);
        } catch (e) {
            console.error("Fetch failed", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selected) {
                await axios.put(`/api/lookups/priorities/${selected.id}`, formData);
                showToast("Severity tier synchronized.", "success");
            } else {
                await axios.post("/api/lookups/priorities", formData);
                showToast("New priority tier registered.", "success");
            }
            fetchData();
            setIsEdit(false);
            setSelected(null);
            setFormData({ name: "", slug: "", color: "#ffffff", weight: 0 });
        } catch (e) {
            console.error("Save failed", e);
            showToast("Failed to commit severity changes.", "error");
        }
    };

    if (loading) return <div className="p-10 animate-pulse bg-white/5 h-64 rounded-xl"></div>;

    return (
        <div className="p-8 lg:p-14 animate-fade-in-up">
            <header className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight flex items-center gap-4">
                    <ExclamationTriangleIcon className="w-8 h-8 text-orange-500" />
                    Priorities
                </h1>
                <button 
                  onClick={() => { setIsEdit(true); setSelected(null); setFormData({ name: "", slug: "", color: "#ffffff", weight: 0 }); }}
                  className="bg-orange-500/10 border border-orange-500/30 text-orange-500 px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-orange-500/20 transition-all flex items-center gap-2"
                >
                    <PlusIcon className="w-4 h-4" /> Add Priority
                </button>
            </header>

            {isEdit && (
                <section className="glass-card p-8 mb-10 border-orange-500/20 animate-fade-in">
                    <h2 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-6">
                        {selected ? 'Update Severity Tier' : 'Create New Severity Tier'}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Internal Slug</label>
                            <input 
                                value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})}
                                required className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-xl p-4 text-sm font-bold focus:border-orange-500 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Display Name</label>
                            <input 
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                required className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-xl p-4 text-sm font-bold focus:border-orange-500 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Visual Color (Hex)</label>
                            <div className="flex gap-4">
                                <input 
                                    type="color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})}
                                    className="h-12 w-12 rounded-xl bg-transparent border-none cursor-pointer"
                                />
                                <input 
                                    value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})}
                                    className="flex-1 bg-[var(--background)] border border-[var(--border-strong)] rounded-xl p-4 text-sm font-bold focus:border-orange-500 transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Calculation Weight (0-100)</label>
                            <input 
                                type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: parseInt(e.target.value)})}
                                required className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-xl p-4 text-sm font-bold focus:border-orange-500 transition-all outline-none"
                            />
                        </div>
                        <div className="flex gap-4">
                            <button type="submit" className="bg-orange-500 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest">Save</button>
                            <button type="button" onClick={() => setIsEdit(false)} className="px-8 py-3 rounded-xl text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">Cancel</button>
                        </div>
                    </form>
                </section>
            )}

            <div className="glass-card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[var(--hover-bg)] border-b border-[var(--border-subtle)]">
                        <tr>
                            <th className="p-6 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Tier Mapping</th>
                            <th className="p-6 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Display Node</th>
                            <th className="p-6 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Escalation Weight</th>
                            <th className="p-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)] text-sm">
                        {data.map(item => (
                            <tr key={item.id} className="hover:bg-white/[0.02]">
                                <td className="p-6 font-black text-[var(--text-muted)] tabular-nums">{item.slug}</td>
                                <td className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: item.color }}></div>
                                        <span className="font-bold">{item.name}</span>
                                    </div>
                                </td>
                                <td className="p-6 font-mono text-neon-cyan">{item.weight} pts</td>
                                <td className="p-6 text-right flex justify-end gap-2">
                                    <button onClick={() => { setIsEdit(true); setSelected(item); setFormData({ name: item.name, slug: item.slug, color: item.color || "#ffffff", weight: item.weight || 0 }); }} className="p-2 border border-[var(--border-strong)] rounded-lg hover:border-orange-500 transition-colors">
                                        <PencilSquareIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={async () => {
                                        if(confirm('Delete?')) { 
                                            try {
                                                await axios.delete(`/api/lookups/priorities/${item.id}`); 
                                                showToast("Priority tier purged.", "info");
                                                fetchData(); 
                                            } catch {
                                                showToast("Purge failed: Locked dependency.", "warning");
                                            }
                                        } 
                                    }} className="p-2 border border-[var(--border-strong)] rounded-lg hover:border-red-500 transition-colors">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
