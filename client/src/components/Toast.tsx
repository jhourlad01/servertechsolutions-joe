"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
                {toasts.map((toast) => (
                    <div 
                        key={toast.id}
                        className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl border backdrop-blur-md shadow-2xl animate-fade-in-right transition-all duration-300 ${
                            toast.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                            toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                            toast.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                            'bg-neon-purple/10 border-neon-purple/30 text-neon-purple'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            {toast.type === 'success' && <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />}
                            {toast.type === 'error' && <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />}
                            {toast.type === 'warning' && <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />}
                            {toast.type === 'info' && <InformationCircleIcon className="w-5 h-5 flex-shrink-0" />}
                            
                            <span className="text-xs font-black uppercase tracking-widest leading-none">
                                {toast.message}
                            </span>
                        </div>
                        <button 
                            onClick={() => removeToast(toast.id)}
                            className="ml-4 p-1 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <XMarkIcon className="w-4 h-4 opacity-50 hover:opacity-100" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
