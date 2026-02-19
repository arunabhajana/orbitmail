"use client";

import React from 'react';
import {
    Archive,
    Trash2,
    Reply,
    MoreVertical,
    AlertOctagon, // Report
    CloudDownload,
    File,
    Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailDetailProps {
    className?: string;
    email?: any;
}

const EmailDetail: React.FC<EmailDetailProps> = ({ className, email }) => {
    // Note: In a real app we would use 'email' data. For this "Reset" we strictly force the HTML content.

    return (
        <section className={cn("bg-white", className)}>
            {/* Reading Pane Toolbar */}
            <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-4">
                    <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
                        <Archive className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
                        <AlertOctagon className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        <Reply className="w-[18px] h-[18px]" />
                        Reply
                    </button>
                    <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Email Content */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <header className="mb-10">
                    <h1 className="text-2xl font-bold text-slate-900 mb-6 leading-tight">Q4 Design Systems Update</h1>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-full bg-cover bg-center"
                                style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBCWme6Wdx-sj2lQmCJDfa1Bi5Oln1f8szL15D6TM5LnGMoNyJBoHKOLugh_zSVEvq-5SNCBrfBmUWFy46qHlx8rc4kBle-Exs_cp6BceQHwtof8WLX1s-kxv4sMaIgKuZsohUraUW_lZrzVdGKD1BZ250HIFDBt12ODA_9nceORIo7j8hLUcB2oRYHhBG3wWw5LB4mnSQ55eewTq7kphdimvki0adYDsaI7ZfuqX47Q3pvqCoH1dHrw74Y6DfE4EDk1qlMqiVlt-0G')` }}
                            />
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900">Elena Ross</span>
                                    <span className="text-slate-400 text-sm">&lt;elena@design.com&gt;</span>
                                </div>
                                <span className="text-slate-500 text-sm">To: Team Design, Core UI Group</span>
                            </div>
                        </div>
                        <span className="text-slate-400 text-sm">Oct 24, 2023, 10:24 AM</span>
                    </div>
                </header>

                <article className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4">
                    <p>Hi Team,</p>
                    <p>I've just finalized the latest updates for our design system components. This quarter we are focusing heavily on "Spatial UI" principles, which includes our new glassmorphism layer styles and refined shadow depths.</p>
                    <p>Key highlights in this update:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>New Backdrop Blur Utility:</strong> Standardized 16px and 24px blur variants for sidebar and navigation components.</li>
                        <li><strong>Refined Borders:</strong> 1px semi-transparent white borders to simulate light catching on glass edges.</li>
                        <li><strong>Accessibility Improvements:</strong> Increased contrast ratios for text overlays on translucent backgrounds.</li>
                    </ul>
                    <p>I've attached the Figma file with the updated library. Please take a look and provide your feedback by Friday EOD so we can begin the handoff to the engineering team.</p>
                    <p>Best regards,<br /><span className="font-semibold">Elena Ross</span><br /><span className="text-sm text-slate-500">Lead Product Designer</span></p>
                </article>

                {/* Attachment Placeholder */}
                <div className="mt-12 p-4 border border-slate-100 rounded-xl bg-slate-50 flex items-center gap-4 max-w-sm">
                    <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center text-primary">
                        <File className="w-5 h-5" /> // Use specific icon
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">Q4_Design_Specs.fig</p>
                        <p className="text-xs text-slate-500">24.5 MB • Figma Document</p>
                    </div>
                    <button className="text-slate-400 hover:text-primary transition-colors">
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default EmailDetail;
