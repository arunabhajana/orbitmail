"use client";

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailListProps {
    className?: string;
    onSelectEmail?: (email: any) => void;
    selectedEmailId?: string | null;
}

const MOCK_EMAILS = [
    {
        id: '1',
        sender: 'Elena Ross',
        subject: 'Q4 Design Systems Update',
        preview: "Hi Team, I've attached the latest updates for our design system components including the new glassmorphism layer styles...",
        time: '10:24 AM',
        unread: true,
    },
    {
        id: '2',
        sender: 'GitHub',
        subject: '[v2.4.0] Release Notes',
        preview: "A new release has been published for the core-ui repository with glassmorphism support and improved accessibility.",
        time: '9:15 AM',
        unread: true,
    },
    {
        id: '3',
        sender: 'Marco Valesquez',
        subject: 'Project Timeline Revision',
        preview: "The stakeholder meeting resulted in a few adjustments to our Q4 roadmap. Can we sync tomorrow morning?",
        time: 'Yesterday',
        unread: false,
    },
    {
        id: '4',
        sender: 'Dribbble',
        subject: 'New Inspiration for you',
        preview: "Check out these trending shots in UI/UX Design this week from artists you follow.",
        time: 'Nov 12',
        unread: false,
    },
];

const EmailList: React.FC<EmailListProps> = ({ className, onSelectEmail, selectedEmailId }) => {
    return (
        <main className={cn("glass-list", className)}>
            {/* Search & Filter Area */}
            <div className="p-4 space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        className="w-full bg-white/50 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                        placeholder="Search messages..."
                        type="text"
                    />
                </div>
                <div className="flex gap-4 border-b border-black/5 pb-1">
                    <button className="text-slate-900 border-b-2 border-primary pb-2 text-sm font-semibold">All</button>
                    <button className="text-slate-500 pb-2 text-sm font-medium hover:text-slate-900 transition-colors">Unread</button>
                    <button className="text-slate-500 pb-2 text-sm font-medium hover:text-slate-900 transition-colors">Flagged</button>
                </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {MOCK_EMAILS.map((email) => (
                    <div
                        key={email.id}
                        onClick={() => onSelectEmail && onSelectEmail(email)}
                        className={cn(
                            "px-4 py-4 cursor-pointer transition-colors border-b border-black/5",
                            selectedEmailId === email.id
                                ? "bg-primary/10 border-l-4 border-l-primary" // Selected Message
                                : "hover:bg-white/40 border-l-4 border-transparent" // Regular/Unread Message
                        )}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                                {email.unread && selectedEmailId !== email.id && (
                                    <span className="w-2 h-2 rounded-full bg-primary shrink-0"></span>
                                )}
                                <span className={cn("text-sm",
                                    selectedEmailId === email.id || email.unread ? "font-bold text-slate-900" : "font-medium text-slate-700"
                                )}>
                                    {email.sender}
                                </span>
                            </div>
                            <span className={cn("text-[11px] font-medium",
                                selectedEmailId === email.id ? "text-primary" : "text-slate-400"
                            )}>
                                {email.time}
                            </span>
                        </div>
                        <h4 className={cn("text-sm mb-1 truncate",
                            selectedEmailId === email.id ? "font-semibold text-slate-800" : "font-medium text-slate-700"
                        )}>
                            {email.subject}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                            {email.preview}
                        </p>
                    </div>
                ))}
            </div>
        </main>
    );
};

export default EmailList;
