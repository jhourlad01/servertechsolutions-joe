"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("superadmin@servertech.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // First, get CSRF cookie (standard Sanctum flow)
      await axios.get("/sanctum/csrf-cookie");
      
      // Then, attempt login
      await axios.post("/login", { email, password });
      
      // Success - redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login failed:", err);
      if (err.response?.status === 422) {
        setError("Invalid email or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_50%)] pointer-events-none"></div>
      
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neon-purple shadow-[0_0_30px_-5px_#a855f7] mb-6 text-white text-3xl font-black">
            S
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-[var(--foreground)] mb-2 transition-colors">ServerTech</h1>
          <p className="text-[var(--text-muted)] font-medium transition-colors">Issue Intake System</p>
        </div>

        <div className="glass-card p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold text-center animate-pulse">
              {error}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-bold text-[var(--text-muted)] mb-2 uppercase tracking-tight transition-colors">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-neon-purple/50 transition-all"
                placeholder="name@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[var(--text-muted)] mb-2 uppercase tracking-tight transition-colors">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-neon-purple/50 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-lg"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-[var(--border-subtle)] text-center">
            <p className="text-sm text-[var(--text-muted)] mb-4 transition-colors">Test Accounts</p>
            <div className="flex flex-col gap-2">
              <code className="text-xs text-neon-purple bg-neon-purple/10 py-2 rounded-lg px-2 border border-neon-purple/20">
                superadmin@servertech.com / password
              </code>
            </div>
          </div>
        </div>
        
        <p className="text-center mt-8 text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold transition-colors">
          Protected by ServerTech Shield v4.2
        </p>
      </div>
    </div>
  );
}
