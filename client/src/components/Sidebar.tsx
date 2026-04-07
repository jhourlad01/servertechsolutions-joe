"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  // Hide sidebar on the landing page and login page
  const hideSidebar = pathname === "/" || pathname === "/login";
  if (hideSidebar) return null;

  return (
    <aside className={`h-screen bg-slate-950 border-r border-white/5 flex flex-col transition-all duration-500 ease-in-out ${collapsed ? "w-20" : "w-72"}`}>
      <div className="p-8 flex items-center justify-between">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-3 no-underline group">
            <div className="w-10 h-10 bg-neon-purple rounded-xl flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_-5px_#a855f7] group-hover:scale-110 transition-transform">S</div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-white leading-none">ServerTech</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Registry Alpha</span>
            </div>
          </Link>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:border-white/20 transition-all"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-10 mt-10">
        <div>
          {!collapsed && <div className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Operations</div>}
          <div className="space-y-1">
            <Link 
              href="/dashboard" 
              className={`sidebar-link ${pathname === "/dashboard" ? "active" : ""}`}
            >
              <span className="text-lg">📁</span>
              {!collapsed && <span>Issues</span>}
            </Link>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all mt-1">
              <span className="text-lg">➕</span>
              {!collapsed && <span>Report Issue</span>}
            </button>
          </div>
        </div>
      </nav>

      <div className="p-6 border-t border-white/5 space-y-3">
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all group"
        >
          <span className="text-lg group-hover:rotate-180 transition-transform duration-500">🌓</span>
          {!collapsed && <span className="font-bold text-xs uppercase tracking-widest">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <Link 
          href="/login" 
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all no-underline"
        >
          <span className="text-lg">🚪</span>
          {!collapsed && <span className="font-bold text-xs uppercase tracking-widest">Logout</span>}
        </Link>
      </div>
    </aside>
  );
}
