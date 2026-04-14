"use client";

import React, { useEffect, useState, useRef } from "react";
import api from "@/lib/axios";
import axios from "axios";
import { PaperAirplaneIcon, PaperClipIcon, DocumentIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/components/Toast";

interface Message {
    id: number;
    content: string;
    type: string;
    upload?: {
        id: string;
        original_filename: string;
        file_path: string;
        download_url: string;
    };
    user: {
        id: number;
        name: string;
    };
    created_at: string;
}

export default function IssueMessageThread({ issueId }: { issueId: string }) {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchMessages = React.useCallback(async () => {
        try {
            const response = await api.get(`/api/issues/${issueId}/messages`);
            setMessages(response.data.data);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    }, [issueId]);

    useEffect(() => {
        fetchMessages();

        window.addEventListener("refresh-issue-thread", fetchMessages);
        return () => window.removeEventListener("refresh-issue-thread", fetchMessages);
    }, [fetchMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() && !selectedFile) return;

        setIsSending(true);
        setError(null);
        const formData = new FormData();
        if (newMessage.trim()) formData.append("content", newMessage);
        if (selectedFile) formData.append("attachment", selectedFile);

        try {
            const response = await api.post(`/api/issues/${issueId}/messages`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setMessages([...messages, response.data.data]);
            setNewMessage("");
            setSelectedFile(null);
            showToast("Update transmitted to registry.", "success");
        } catch (err: unknown) {
            console.error("Failed to send message:", err);
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 422) {
                    const firstError = Object.values(err.response.data.errors as Record<string, string[]>)[0][0];
                    setError(firstError);
                } else {
                    setError("Network error: Failed to reach command hub.");
                }
            }
        } finally {
            setIsSending(false);
        }
    };

    return (
        <section className="glass-card flex flex-col h-[600px] border-[var(--border-strong)] overflow-hidden">
            <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--hover-bg)]">
                <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Message Thread</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-[var(--border-strong)] scrollbar-track-transparent">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] opacity-50 space-y-4">
                        <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-current flex items-center justify-center text-xl font-bold">?</div>
                        <p className="text-xs font-black uppercase tracking-widest">No activity recorded yet</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.type === 'system' ? 'items-center' : (msg.user.id?.toString() === user?.id?.toString() ? 'items-end' : 'items-start')}`}>
                            {msg.type !== 'system' && (
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-tighter">{msg.user.name}</span>
                                    <span className="text-[9px] font-medium text-[var(--text-muted)] opacity-40">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            )}
                            {msg.type === 'system' ? (
                                <div className="w-full flex items-center gap-4 py-2">
                                    <div className="flex-1 h-px bg-[var(--border-subtle)]"></div>
                                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap bg-[var(--hover-bg)] px-3 py-1 rounded-full border border-[var(--border-subtle)]">
                                        {msg.content.replace(/\*\*(.*?)\*\*/g, '$1')}
                                    </span>
                                    <div className="flex-1 h-px bg-[var(--border-subtle)]"></div>
                                </div>
                            ) : msg.type === 'file' ? (
                                <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed transition-all shadow-lg ${
                                    msg.user.id === 1 
                                    ? 'bg-neon-purple/10 border border-neon-purple/30 text-white rounded-tr-none' 
                                    : 'bg-[var(--hover-bg)] border border-[var(--border-strong)] text-[var(--foreground)] rounded-tl-none'
                                }`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--background)] flex items-center justify-center text-neon-cyan border border-[var(--border-subtle)]">
                                            <DocumentIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold truncate max-w-[200px]">{msg.content}</span>
                                            <a 
                                                href={msg.upload?.download_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-[10px] font-black text-neon-purple uppercase tracking-widest hover:underline mt-1 truncate max-w-[200px]"
                                            >
                                                {msg.upload?.original_filename || "Download Asset"}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed transition-all shadow-lg ${
                                    msg.user.id === 1 
                                    ? 'bg-neon-purple/10 border border-neon-purple/30 text-white rounded-tr-none' 
                                    : 'bg-[var(--hover-bg)] border border-[var(--border-strong)] text-[var(--foreground)] rounded-tl-none'
                                }`}>
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-6 bg-[var(--hover-bg)] border-t border-[var(--border-subtle)] relative">
                {error && (
                    <div className="absolute -top-12 left-6 right-6 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse z-10 flex justify-between items-center">
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="hover:text-white">✕</button>
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="relative group">
                    <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Log update or attach report..."
                        className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-2xl py-4 pl-6 pr-28 text-sm focus:outline-none focus:border-neon-purple/50 transition-all placeholder:text-[var(--text-muted)]/50 placeholder:font-black placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"
                        disabled={isSending}
                    />
                    
                    <div className="absolute right-2 top-2 bottom-2 flex gap-2">
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-3 rounded-xl hover:bg-white/5 transition-colors ${selectedFile ? 'text-neon-cyan' : 'text-[var(--text-muted)]'}`}
                            disabled={isSending}
                        >
                            <PaperClipIcon className="w-5 h-5" />
                        </button>
                        <button 
                            type="submit"
                            className="bg-neon-purple hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:shadow-none text-white p-3 rounded-xl transition-all"
                            disabled={isSending || (!newMessage.trim() && !selectedFile)}
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />

                    {selectedFile && (
                        <div className="absolute -top-12 left-0 right-0 px-2 slide-in-top">
                            <div className="bg-[var(--background)] border border-neon-cyan/30 rounded-lg p-2 flex items-center justify-between shadow-xl">
                                <div className="flex items-center gap-2">
                                    <DocumentIcon className="w-4 h-4 text-neon-cyan" />
                                    <span className="text-[10px] font-black uppercase text-neon-cyan truncate max-w-[200px]">{selectedFile.name}</span>
                                </div>
                                <button type="button" onClick={() => setSelectedFile(null)} className="text-red-500 hover:text-red-400 text-[10px] font-black uppercase px-2">Cancel</button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </section>
    );
}
