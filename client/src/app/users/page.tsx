"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import axios from "axios";
import { UserPlusIcon, TrashIcon, PencilSquareIcon, ShieldCheckIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import InputError from "@/components/InputError";
import { useToast } from "@/components/Toast";

interface User {
    id: string;
    name: string;
    email: string;
    roles: { id: number; name: string }[];
    groups: { id: number; name: string; slug: string }[];
    created_at: string;
}

export default function UserManagementPage() {
    const { showToast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [status, setStatus] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role_ids: [] as number[],
        group_ids: [] as number[],
    });

    const [lookups, setLookups] = useState({ 
        roles: [] as { id: number; name: string }[], 
        groups: [] as { id: number; name: string }[] 
    });

    const fetchUsers = async () => {
        try {
            const response = await api.get("/api/users");
            setUsers(response.data.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLookups = async () => {
        try {
            const response = await api.get("/api/iam/lookups");
            setLookups(response.data);
        } catch (error) {
            console.error("Failed to fetch lookups", error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchLookups();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setStatus("");
        try {
            if (editingUser) {
                await api.put(`/api/users/${editingUser.id}`, formData);
                showToast("User record updated.", "success");
            } else {
                await api.post("/api/users", formData);
                showToast("User successfully provisioned.", "success");
            }
            fetchUsers();
            closeModal();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 422) {
                    setErrors(error.response.data.errors);
                    showToast("Provisioning failed: Validation error.", "warning");
                } else {
                    setStatus("CRITICAL ERROR: Failed to save user record.");
                    showToast("System Failure: User save aborted.", "error");
                }
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/api/users/${id}`);
            fetchUsers();
            showToast("User record purged.", "success");
        } catch (error) {
            console.error("Failed to delete user", error);
            showToast("Deauthentication failed.", "error");
        }
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: "",
            role_ids: user.roles.map(r => r.id),
            group_ids: user.groups.map(g => g.id),
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setFormData({ name: "", email: "", password: "", role_ids: [], group_ids: [] });
    };

    if (loading) return <div className="p-10 animate-pulse space-y-4"><div className="h-10 bg-white/5 rounded w-1/4"></div><div className="h-64 bg-white/5 rounded"></div></div>;

    return (
        <div className="p-8 lg:p-14 animate-fade-in-up">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-14 gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">Users</h1>
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mt-2 italic flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse"></span>
                        Standardizing User Provisioning
                    </p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-neon-purple hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all"
                >
                    <UserPlusIcon className="w-5 h-5" />
                    Provision User
                </button>
            </header>

            <section className="glass-card overflow-hidden border-[var(--border-strong)]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[var(--hover-bg)] border-b border-[var(--border-subtle)]">
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">User Entity</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Security Roles</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Departmental Groups</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-right">Operational Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center text-neon-purple font-black transition-transform group-hover:scale-110">
                                            {user.name[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold text-[var(--foreground)]">{user.name}</div>
                                            <div className="text-[10px] font-medium text-[var(--text-muted)] opacity-60">Provisioned {new Date(user.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="flex flex-wrap gap-2">
                                        {user.roles.map(role => (
                                            <span key={role.id} className="px-2 py-0.5 rounded-lg border border-neon-cyan/20 bg-neon-cyan/5 text-neon-cyan text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                                <ShieldCheckIcon className="w-2 h-2" />
                                                {role.name}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="flex flex-wrap gap-2">
                                        {user.groups.map(group => (
                                            <span key={group.id} className="px-2 py-0.5 rounded-lg border border-[var(--border-strong)] bg-[var(--hover-bg)] text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                                <UserGroupIcon className="w-2 h-2" />
                                                {group.name}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => openEditModal(user)} className="p-2.5 rounded-lg bg-[var(--hover-bg)] border border-[var(--border-strong)] text-[var(--text-muted)] hover:text-neon-purple hover:border-neon-purple/30 transition-all shadow-sm">
                                            <PencilSquareIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(user.id)} className="p-2.5 rounded-lg bg-[var(--hover-bg)] border border-[var(--border-strong)] text-[var(--text-muted)] hover:text-red-500 hover:border-red-500/30 transition-all shadow-sm">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* User Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="glass-card w-full max-w-2xl border-[var(--border-strong)] shadow-2xl relative overflow-hidden slide-in-top">
                        <div className="p-8 border-b border-[var(--border-subtle)] bg-[var(--hover-bg)]">
                            <h2 className="text-xl font-black text-[var(--foreground)] tracking-tight">{editingUser ? 'Update User' : 'Provision New User'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            {status && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold animate-pulse">
                                    {status}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Display Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-xl p-4 text-sm font-bold focus:border-neon-purple/50 transition-all outline-none"
                                    />
                                    <InputError messages={errors.name} className="mt-2" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Email Node</label>
                                    <input 
                                        type="email" 
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-xl p-4 text-sm font-bold focus:border-neon-purple/50 transition-all outline-none"
                                    />
                                    <InputError messages={errors.email} className="mt-2" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Access Credentials (Password)</label>
                                <input 
                                    type="password" 
                                    placeholder={editingUser ? "(Leave blank to keep current)" : "Minimum 8 chars"}
                                    required={!editingUser}
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-xl p-4 text-sm font-bold focus:border-neon-purple/50 transition-all outline-none"
                                />
                                <InputError messages={errors.password} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4">Assign Authorization Roles</label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto p-4 bg-[var(--hover-bg)] rounded-xl border border-[var(--border-subtle)] scrollbar-thin">
                                        {lookups.roles.map(role => (
                                            <label key={role.id} className="flex items-center gap-3 cursor-pointer group">
                                                <input 
                                                    type="checkbox"
                                                    checked={formData.role_ids.includes(role.id)}
                                                    onChange={(e) => {
                                                        const ids = e.target.checked 
                                                            ? [...formData.role_ids, role.id]
                                                            : formData.role_ids.filter(id => id !== role.id);
                                                        setFormData({...formData, role_ids: ids});
                                                    }}
                                                    className="w-4 h-4 rounded-lg bg-[var(--background)] border-[var(--border-strong)] text-neon-purple focus:ring-0"
                                                />
                                                <span className="text-xs font-bold text-[var(--text-muted)] group-hover:text-neon-cyan transition-colors">{role.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4">Departmental Group Hub</label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto p-4 bg-[var(--hover-bg)] rounded-xl border border-[var(--border-subtle)] scrollbar-thin">
                                        {lookups.groups.map(group => (
                                            <label key={group.id} className="flex items-center gap-3 cursor-pointer group">
                                                <input 
                                                    type="checkbox"
                                                    checked={formData.group_ids.includes(group.id)}
                                                    onChange={(e) => {
                                                        const ids = e.target.checked 
                                                            ? [...formData.group_ids, group.id]
                                                            : formData.group_ids.filter(id => id !== group.id);
                                                        setFormData({...formData, group_ids: ids});
                                                    }}
                                                    className="w-4 h-4 rounded-lg bg-[var(--background)] border-[var(--border-strong)] text-neon-purple focus:ring-0"
                                                />
                                                <span className="text-xs font-bold text-[var(--text-muted)] group-hover:text-neon-cyan transition-colors">{group.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-[var(--border-subtle)]">
                                <button 
                                    type="button" 
                                    onClick={closeModal}
                                    className="flex-1 bg-[var(--hover-bg)] border border-[var(--border-strong)] text-[var(--text-muted)] py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:border-[var(--border-stronger)] transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 bg-neon-purple text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
                                >
                                    {editingUser ? 'Update User' : 'Add User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
