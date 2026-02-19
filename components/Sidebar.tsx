"use client";

import React from 'react';
import {
    Inbox,
    Send,
    File,
    Trash2,
    Pencil // For 'Compose' icon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
    className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
    return (
        <aside className={cn("glass-sidebar", className)}>
            {/* User Profile */}
            <div className="p-6 flex items-center gap-3">
                <div
                    className="w-10 h-10 rounded-full bg-cover bg-center border border-white/40"
                    style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDdiZ7ujUV58y1iBHcNcbPeLlWZ5RH7ErjzTXlEzZ1-7AXIlly7ReiUTLV4rBb5aTg67WXELK_7d2YCaCs5PrHL4YHDas9W5SU6YFEvdzExUvazhF-Fn2hXtfWj-RciAcyhpbiluDPF18G1mbXhLjySXZZ_KAWrXiQ75D-d-1VTPM2r-xruG9rt9YMBnaz_C8d6da2s6B6tP43m9lvbzRVyktdrNeuHDTb9i8qYcoWO5aF7hCrJSQuFtIAgZCZyBBucg6Pg4NRtC-Gd')` }}
                />
                <div className="flex flex-col overflow-hidden">
                    <span className="text-slate-900 font-semibold text-sm truncate">Elena Ross</span>
                    <span className="text-slate-500 text-xs truncate">elena.ross@design.com</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-1">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary cursor-pointer">
                    <Inbox className="w-5 h-5" />
                    <span className="text-sm font-medium">Inbox</span>
                    <span className="ml-auto text-xs font-semibold px-2 py-0.5 bg-primary/20 rounded-full">12</span>
                </div>

                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-white/30 transition-colors cursor-pointer">
                    <Send className="w-5 h-5" />
                    <span className="text-sm font-medium">Sent</span>
                </div>

                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-white/30 transition-colors cursor-pointer">
                    <File className="w-5 h-5" />
                    <span className="text-sm font-medium">Drafts</span>
                </div>

                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-white/30 transition-colors cursor-pointer">
                    <Trash2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Trash</span>
                </div>

                {/* Custom Tags Section */}
                <div className="mt-8 px-3">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Tags</h3>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-white/30 transition-colors cursor-pointer">
                            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                            <span className="text-sm font-medium">Work</span>
                        </div>
                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-white/30 transition-colors cursor-pointer">
                            <span className="w-2 h-2 rounded-full bg-green-400"></span>
                            <span className="text-sm font-medium">Personal</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Compose Button */}
            <div className="p-4">
                <button className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all font-medium text-sm">
                    <Pencil className="w-[18px] h-[18px]" />
                    Compose
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
