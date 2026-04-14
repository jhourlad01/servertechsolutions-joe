import React from 'react';

interface InputErrorProps {
    messages?: string[];
    className?: string;
}

const InputError: React.FC<InputErrorProps> = ({ messages = [], className = '' }) => {
    if (messages.length === 0) return null;

    return (
        <div className={`space-y-1 ${className}`}>
            {messages.map((message, index) => (
                <p
                    className="text-xs text-red-500 font-bold tracking-tight animate-fade-in"
                    key={index}
                >
                    {message}
                </p>
            ))}
        </div>
    );
};

export default InputError;
