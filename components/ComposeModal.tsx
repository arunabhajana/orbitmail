"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Square, Pencil, Paperclip, Image as ImageIcon, Smile, Bold, Italic, Underline, Trash2, Send, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_EMAILS } from '@/lib/data';

interface ComposeModalProps {
    onClose: () => void;
}

export default function ComposeModal({ onClose }: ComposeModalProps) {
    const [recipients, setRecipients] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Derive unique contacts from mock data
    const contacts = Array.from(new Set(MOCK_EMAILS.map(e => ({ name: e.sender, email: e.senderEmail }))))
        .filter((v, i, a) => a.findIndex(t => t.email === v.email) === i);

    const handleAddRecipient = (email: string) => {
        const trimmedEmail = email.trim();
        if (trimmedEmail && !recipients.includes(trimmedEmail)) {
            setRecipients([...recipients, trimmedEmail]);
        }
        setInputValue("");
        setIsDropdownOpen(false);
    };

    const handleRemoveRecipient = (email: string) => {
        setRecipients(recipients.filter(r => r !== email));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddRecipient(inputValue);
        } else if (e.key === 'Backspace' && !inputValue && recipients.length > 0) {
            handleRemoveRecipient(recipients[recipients.length - 1]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm"
            />

            {/* Modal Window */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="relative w-full max-w-2xl bg-white/70 backdrop-blur-xl rounded-xl shadow-2xl border border-white/40 overflow-hidden flex flex-col h-[600px] m-4"
            >
                {/* Windows Style Window Header */}
                <header className="flex items-center justify-between px-4 py-2.5 border-b border-black/5 relative select-none">
                    {/* Title (Left aligned like Windows apps often do, or centered) */}
                    <div className="flex items-center gap-3">
                        <Pencil className="w-3.5 h-3.5 text-primary" />
                        <h1 className="text-xs font-semibold text-foreground/70">New Message</h1>
                    </div>

                    {/* Windows Control Buttons (Right aligned) */}
                    <div className="flex items-center gap-1">
                        <button className="p-2 text-foreground/60 hover:bg-black/5 rounded-md transition-colors">
                            <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-2 text-foreground/60 hover:bg-black/5 rounded-md transition-colors">
                            <Square className="w-3 h-3" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-foreground/60 hover:bg-red-500 hover:text-white rounded-md transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </header>

                {/* Recipient & Subject Area */}
                <div className="flex flex-col">
                    {/* To Field */}
                    <div className="flex items-center gap-2 px-6 py-3 border-b border-black/5 relative">
                        <span className="text-muted-foreground text-sm font-medium w-12">To:</span>
                        <div className="flex flex-wrap gap-2 flex-1 items-center min-h-[32px]">
                            {recipients.map((email: string) => (
                                <motion.div
                                    layout
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    key={email}
                                    className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-medium border border-primary/20"
                                >
                                    <span>{email}</span>
                                    <X
                                        className="w-3 h-3 cursor-pointer hover:text-primary/70"
                                        onClick={() => handleRemoveRecipient(email)}
                                    />
                                </motion.div>
                            ))}
                            <input
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-0 placeholder:text-muted-foreground/50 outline-none"
                                placeholder={recipients.length === 0 ? "Add recipients..." : ""}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                            />
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={cn(
                                    "p-1.5 rounded-full flex items-center justify-center transition-all",
                                    isDropdownOpen ? "bg-primary text-white" : "text-primary hover:bg-primary/10"
                                )}
                            >
                                <UserPlus className="w-4 h-4" />
                            </button>

                            {/* Contacts Dropdown */}
                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 top-full mt-2 w-64 bg-white/80 backdrop-blur-2xl border border-white/40 rounded-xl shadow-2xl z-50 py-2 origin-top-right overflow-hidden shadow-primary/10"
                                    >
                                        <div className="px-3 pb-2 border-b border-black/5">
                                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Suggested Contacts</span>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto custom-scrollbar pt-1">
                                            {contacts.map(contact => (
                                                <button
                                                    key={contact.email}
                                                    onClick={() => handleAddRecipient(contact.email)}
                                                    className="w-full flex flex-col items-start px-3 py-2 hover:bg-primary/10 transition-colors group border-b border-black/[0.02] last:border-0"
                                                >
                                                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{contact.name}</span>
                                                    <span className="text-xs text-muted-foreground truncate w-full text-left">{contact.email}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Subject Field */}
                    <div className="flex items-center gap-2 px-6 py-3 border-b border-black/5">
                        <span className="text-muted-foreground text-sm font-medium w-12">Subject:</span>
                        <input
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-0 placeholder:text-muted-foreground/50 font-medium outline-none"
                            placeholder="Enter subject line"
                            type="text"
                        />
                    </div>
                </div>

                {/* Rich Text Editor Area */}
                <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col">
                    <textarea
                        className="flex-1 w-full bg-transparent border-none focus:ring-0 resize-none text-base p-0 placeholder:text-muted-foreground/40 leading-relaxed outline-none"
                        placeholder="Write your message here..."
                    />
                </div>

                {/* Toolbar & Actions Footer */}
                <footer className="px-4 py-3 border-t border-black/5 flex items-center justify-between bg-white/30">
                    <div className="flex items-center gap-1">
                        {/* Text Formatting */}
                        <button className="p-2 text-foreground/70 hover:bg-black/5 rounded-lg transition-colors">
                            <Bold className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-foreground/70 hover:bg-black/5 rounded-lg transition-colors">
                            <Italic className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-foreground/70 hover:bg-black/5 rounded-lg transition-colors">
                            <Underline className="w-4 h-4" />
                        </button>

                        <div className="w-[1px] h-6 bg-black/10 mx-1"></div>

                        {/* Attachments & Media */}
                        <button className="p-2 text-foreground/70 hover:bg-black/5 rounded-lg transition-colors">
                            <Paperclip className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-foreground/70 hover:bg-black/5 rounded-lg transition-colors">
                            <ImageIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-foreground/70 hover:bg-black/5 rounded-lg transition-colors">
                            <Smile className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="p-2 text-muted-foreground hover:text-red-500 transition-colors">
                            <Trash2 className="w-5 h-5" />
                        </button>

                        {/* Send Button */}
                        <button onClick={onClose} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-semibold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                            <span className="text-sm">Send</span>
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </footer>
            </motion.div>
        </div>
    );
}
