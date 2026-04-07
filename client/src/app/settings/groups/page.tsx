"use client";

import React, { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { UserGroupIcon, PencilSquareIcon, TrashIcon, PlusIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

interface Group {
    id: string;
    name: string;
    slug: string;
    description: string;
    roles: { id: number; name: string }[];
}

export default function GroupManagementPage() {
    const [data, setData] = useState<Group[]>([]);
    const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEdit, setIsEdit] = useState(false);
    const [selected, setSelected] = useState<Group | null>(null);
    const [formData, setFormData] = useState({ name: "", slug: "", description: "", role_ids: [] as number[] });

    const fetchData = async () => {
        try {
            const [gRes, rRes] = await Promise.all([
                axios.get("/api/iam/groups"),
                axios.get("/api/iam/roles")
            ]);
            setData(gRes.data.data);
            setRoles(rRes.data.data);
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
                await axios.put(`/api/iam/groups/${selected.id}`, formData);
            } else {
                await axios.post("/api/iam/groups", formData);
            }
            fetchData();
            setIsEdit(false);
            setSelected(null);
            setFormData({ name: "", slug: "", description: "", role_ids: [] });
        } catch (e) {
            console.error("Save failed", e);
        }
    };

    if (loading) return <div className="p-10 animate-pulse bg-white/5 h-64 rounded-xl"></div>;

    return (
        <div className="p-8 lg:p-14 animate-fade-in-up">
            <header className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight flex items-center gap-4">
                    <UserGroupIcon className="w-8 h-8 text-neon-purple" />
                    Operational Groups
                </h1>
                <button 
                  onClick={() => { setIsEdit(true); setSelected(null); setFormData({ name: "", slug: "", description: "", role_ids: [] }); }}
                  className="bg-neon-purple/10 border border-neon-purple/30 text-neon-purple px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-neon-purple/20 transition-all flex items-center gap-2"
                >
                    <PlusIcon className="w-4 h-4" /> Add Group
                </button>
            </header>

            {isEdit && (
                <section className="glass-card p-8 mb-10 border-neon-purple/20 animate-fade-in">
                    <h2 className="text-xs font-black text-neon-purple uppercase tracking-widest mb-6">
                        {selected ? 'Update Group Node' : 'Create New Group Node'}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Group Internal Slug</label>
                                <input 
                                    value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})}
                                    required className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-xl p-4 text-sm font-bold focus:border-neon-purple transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Internal Title</label>
                                <input 
                                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                    required className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-xl p-4 text-sm font-bold focus:border-neon-purple transition-all outline-none"
                                />
                            </div>
                             <div>
                                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Mission Description</label>
                                <textarea 
                                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                    rows={3} className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-xl p-4 text-sm font-bold focus:border-neon-purple transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div>
                             <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4">Inherent Roles (Inherited Permissions)</label>
                             <div className="bg-[var(--hover-bg)] border border-[var(--border-strong)] rounded-xl p-6 h-[256px] overflow-y-auto space-y-3 custom-scrollbar">
                                {roles.map(role => (
                                    <label key={role.id} className="flex items-center gap-3 cursor-pointer group">
                                        <input 
                                          type="checkbox" 
                                          checked={formData.role_ids.includes(role.id)} 
                                          onChange={e => {
                                              const ids = e.target.checked 
                                                ? [...formData.role_ids, role.id]
                                                : formData.role_ids.filter(id => id !== role.id);
                                              setFormData({...formData, role_ids: ids});
                                          }}
                                          className="w-4 h-4 rounded border-[var(--border-strong)] bg-transparent text-neon-purple"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-[var(--foreground)] group-hover:text-neon-cyan transition-colors">{role.name}</span>
                                        </div>
                                    </label>
                                ))}
                             </div>
                        </div>
                        <div className="md:col-span-2 flex gap-4 pt-6 border-t border-[var(--border-subtle)]">
                            <button type="submit" className="bg-neon-purple text-white px-10 py-4 rounded-xl text-xs font-black uppercase tracking-widest">Commit Changes</button>
                            <button type="button" onClick={() => setIsEdit(false)} className="px-10 py-4 rounded-xl text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">Abort</button>
                        </div>
                    </form>
                </section>
            )}

            <div className="glass-card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[var(--hover-bg)] border-b border-[var(--border-subtle)]">
                        <tr>
                            <th className="p-6 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Operational Group</th>
                            <th className="p-6 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Inherent Authority</th>
                            <th className="p-6 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Description</th>
                            <th className="p-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)] text-sm">
                        {data.map(item => (
                            <tr key={item.id} className="hover:bg-white/[0.02]">
                                <td className="p-6">
                                    <div className="font-bold text-[var(--foreground)]">{item.name}</div>
                                    <div className="text-[10px] font-black text-neon-purple/50 uppercase italic tracking-tighter tabular-nums">{item.slug}</div>
                                </td>
                                <td className="p-6">
                                    <div className="flex flex-wrap gap-2">
                                        {item.roles.map(role => (
                                            <span key={role.id} className="px-2 py-0.5 rounded-lg border border-neon-cyan/20 bg-neon-cyan/5 text-neon-cyan text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                                <ShieldCheckIcon className="w-2 h-2" />
                                                {role.name}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-6 text-[var(--text-muted)] italic max-w-xs truncate">{item.description}</td>
                                <td className="p-6 text-right flex justify-end gap-2 h-full py-auto">
                                    <button onClick={() => { setIsEdit(true); setSelected(item); setFormData({ name: item.name, slug: item.slug, description: item.description || "", role_ids: item.roles.map(r => r.id) }); }} className="p-2.5 border border-[var(--border-strong)] rounded-lg hover:border-neon-purple transition-colors">
                                        <PencilSquareIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={async () => { if(confirm('Delete?')) { await axios.delete(`/api/iam/groups/${item.id}`); fetchData(); } }} className="p-2.5 border border-[var(--border-strong)] rounded-lg hover:border-red-500 transition-colors">
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
