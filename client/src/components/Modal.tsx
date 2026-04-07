import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  headerChildren?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  headerChildren,
  children,
  footer,
  maxWidth = "max-w-2xl"
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  // Handle body scroll locking
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div 
        className={`relative w-full ${maxWidth} bg-[var(--background)] border border-[var(--border-strong)] rounded-2xl shadow-2xl animate-fade-in-up overflow-hidden max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        {(title || headerChildren) && (
          <div className="p-6 md:p-8 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--hover-bg)]">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-[var(--foreground)] tracking-tight">
                {title}
              </h2>
              {headerChildren && (
                <div className="mt-2 text-sm">
                  {headerChildren}
                </div>
              )}
            </div>
            <button 
              onClick={onClose} 
              className="w-8 h-8 flex flex-col justify-center items-center rounded-xl bg-[var(--border-subtle)] text-[var(--text-muted)] hover:text-red-500 transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="p-6 md:p-8 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-6 md:p-8 border-t border-[var(--border-subtle)] bg-[var(--hover-bg)] flex justify-end gap-4 shadow-[0_-4px_24px_rgba(0,0,0,0.1)]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
