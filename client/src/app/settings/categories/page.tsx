"use client";

import React, { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { TagIcon, PencilSquareIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/components/Toast";

interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
}

export default function CategoryManagementPage() {
    const { user } = useAuth({ middleware: 'auth' });
    const { showToast } = useToast();
    const [data, setData] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEdit, setIsEdit] = useState(false);
    const [selected, setSelected] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: "", slug: "", description: "" });

    const fetchData = async () => {
        try {
            const res = await axios.get("/api/lookups/categories");
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
                await axios.put(`/api/lookups/categories/${selected.id}`, formData);
                showToast("Category definition synchronized.", "success");
            } else {
                await axios.post("/api/lookups/categories", formData);
                showToast("New category registered.", "success");
            }
            fetchData();
            setIsEdit(false);
            setSelected(null);
            setFormData({ name: "", slug: "", description: "" });
        } catch (e) {
            console.error("Save failed", e);
            showToast("Failed to commit category changes.", "error");
        }
    };

    if (loading) return <div className="p-10 animate-pulse bg-white/5 h-64 rounded-xl"></div>;

    return (
        <div className="p-8 lg:p-14 animate-fade-in-up">
            <header className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight flex items-center gap-4">
                    <TagIcon className="w-8 h-8 text-neon-cyan" />
                    Categories
                </h1>
                <button 
                  onClick={() => { setIsEdit(true); setSelected(null); setFormData({ name: "", slug: "", description: "" }); }}
                  className="bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-neon-cyan/20 transition-all flex items-center gap-2"
                >
                    <PlusIcon className="w-4 h-4" /> Add Category
                </button>
            </header>

            {isEdit && (
                <section className="glass-card p-8 mb-10 border-neon-cyan/20 animate-fade-in">
                    <h2 className="text-xs font-black text-neon-cyan uppercase tracking-widest mb-6">
                        {selected ? 'Update Registry Category' : 'Create New Registry Category'}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Internal Slug</label>
                            <input 
                                value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})}
                                required className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-xl p-4 text-sm font-bold focus:border-neon-cyan transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Display Name</label>
                            <input 
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                required className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-xl p-4 text-sm font-bold focus:border-neon-cyan transition-all outline-none"
                            />
                        </div>
                         <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Description</label>
                            <textarea 
                                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                rows={3} className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-xl p-4 text-sm font-bold focus:border-neon-cyan transition-all outline-none"
                            />
                        </div>
                        <div className="flex gap-4">
                            <button type="submit" className="bg-neon-cyan text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest">Save</button>
                            <button type="button" onClick={() => setIsEdit(false)} className="px-8 py-3 rounded-xl text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">Cancel</button>
                        </div>
                    </form>
                </section>
            )}

            <div className="glass-card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[var(--hover-bg)] border-b border-[var(--border-subtle)]">
                        <tr>
                            <th className="p-6 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Internal Slug</th>
                            <th className="p-6 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Display Name</th>
                            <th className="p-6 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Description</th>
                            <th className="p-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)] text-sm">
                        {data.map(item => (
                            <tr key={item.id} className="hover:bg-white/[0.02]">
                                <td className="p-6 font-black text-neon-cyan/70 tabular-nums">{item.slug}</td>
                                <td className="p-6 font-bold">{item.name}</td>
                                <td className="p-6 text-[var(--text-muted)]">{item.description}</td>
                                <td className="p-6 text-right flex justify-end gap-2">
                                    <button onClick={() => { setIsEdit(true); setSelected(item); setFormData({ name: item.name, slug: item.slug, description: item.description || "" }); }} className="p-2 border border-[var(--border-strong)] rounded-lg hover:border-neon-cyan transition-colors">
                                        <PencilSquareIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={async () => { 
                                        if(confirm('Delete?')) { 
                                            try {
                                                await axios.delete(`/api/lookups/categories/${item.id}`); 
                                                showToast("Category purged from registry.", "info");
                                                fetchData(); 
                                            } catch (e) {
                                                showToast("Purge failed: Dependencies exist.", "error");
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
