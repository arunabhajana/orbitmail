import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Loader2, Tag as TagIcon } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';
import { Tag } from '@/lib/types';

// Predefined Gmail compatible colors
const GMAIL_COLORS = [
    { bg: "#fb4c2f", text: "#ffffff" },
    { bg: "#ffad47", text: "#ffffff" },
    { bg: "#fad165", text: "#000000" },
    { bg: "#16a766", text: "#ffffff" },
    { bg: "#43d692", text: "#000000" },
    { bg: "#4a86e8", text: "#ffffff" },
    { bg: "#a479e2", text: "#ffffff" },
    { bg: "#f691b2", text: "#ffffff" },
    { bg: "#f6c5be", text: "#000000" },
    { bg: "#ffe6c7", text: "#000000" },
    { bg: "#fef1d1", text: "#000000" },
    { bg: "#b9e4d0", text: "#000000" },
    { bg: "#c6f3de", text: "#000000" },
    { bg: "#c9daf8", text: "#000000" },
    { bg: "#e4d7f5", text: "#000000" },
    { bg: "#fcdee8", text: "#000000" },
    { bg: "#e66550", text: "#ffffff" },
    { bg: "#ffbc6b", text: "#000000" },
    { bg: "#fcba03", text: "#000000" },
    { bg: "#51b749", text: "#ffffff" },
    { bg: "#5c86c1", text: "#ffffff" },
    { bg: "#8e63ce", text: "#ffffff" },
    { bg: "#e07798", text: "#ffffff" },
    { bg: "#cc3a21", text: "#ffffff" },
    { bg: "#eaa041", text: "#ffffff" },
    { bg: "#149e60", text: "#ffffff" },
    { bg: "#683bb7", text: "#ffffff" },
    { bg: "#c63a73", text: "#ffffff" },
];

interface CreateTagModalProps {
    onClose: () => void;
}

export const CreateTagModal: React.FC<CreateTagModalProps> = ({ onClose }) => {
    const [name, setName] = useState('');
    const [parentTag, setParentTag] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<{ bg: string, text: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [existingTags, setExistingTags] = useState<Tag[]>([]);

    React.useEffect(() => {
        invoke<Tag[]>('get_all_tags')
            .then(setExistingTags)
            .catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const trimmedName = name.trim();
        if (!trimmedName) {
            toast.error('Tag name cannot be empty');
            return;
        }

        if (trimmedName.includes('/')) {
            toast.error('Tag name cannot contain "/" (use the Parent Tag dropdown instead)');
            return;
        }

        const fullName = parentTag ? `${parentTag}/${trimmedName}` : trimmedName;

        // Check for duplicates
        if (existingTags.some(t => t.name.toLowerCase() === fullName.toLowerCase())) {
            toast.error('A tag with this name already exists');
            return;
        }

        setIsSubmitting(true);
        try {
            await invoke('create_tag', {
                name: fullName,
                bgColor: selectedColor?.bg || null,
                textColor: selectedColor?.text || null
            });
            toast.success('Tag created successfully');
            onClose();
        } catch (error) {
            console.error('Failed to create tag:', error);
            toast.error('Failed to create tag', { description: String(error) });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-md overflow-hidden bg-white/85 dark:bg-[#18181b]/92 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-xl shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <TagIcon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-[14px] font-semibold text-foreground dark:text-white leading-none">
                                Create New Tag
                            </p>
                            <p className="text-[11px] text-muted-foreground dark:text-white/50 mt-1">
                                Organize your emails with custom labels
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-muted-foreground dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-5 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[12px] font-medium text-foreground/80 dark:text-white/80">
                            Tag Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Invoices"
                            className="w-full text-sm bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 outline-none text-foreground dark:text-white placeholder:text-muted-foreground/40 dark:placeholder:text-white/25 transition-all duration-150 focus:ring-2 focus:ring-primary/35"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[12px] font-medium text-foreground/80 dark:text-white/80">
                            Nest under (Optional)
                        </label>
                        <select
                            value={parentTag}
                            onChange={(e) => setParentTag(e.target.value)}
                            className="w-full text-sm bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 outline-none text-foreground dark:text-white transition-all duration-150 focus:ring-2 focus:ring-primary/35 appearance-none cursor-pointer"
                        >
                            <option value="" className="bg-white dark:bg-[#18181b]">None (Top level)</option>
                            {existingTags.filter(t => t.tag_type === 'user').map(tag => (
                                <option key={tag.id} value={tag.name} className="bg-white dark:bg-[#18181b]">
                                    {tag.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-[12px] font-medium text-foreground/80 dark:text-white/80">
                                Color (Optional)
                            </label>
                            {selectedColor && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedColor(null)}
                                    className="text-[10px] text-primary hover:text-primary/80 transition-colors font-medium"
                                >
                                    Clear color
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-8 gap-2 p-1 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-xl">
                            {GMAIL_COLORS.map((color, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-sm ${selectedColor?.bg === color.bg ? 'scale-110 ring-2 ring-offset-2 ring-primary dark:ring-offset-[#18181b]' : 'hover:scale-110'}`}
                                    style={{ backgroundColor: color.bg, color: color.text }}
                                    title={color.bg}
                                >
                                    {selectedColor?.bg === color.bg && <Check className="w-3.5 h-3.5" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 pt-5 border-t border-black/5 dark:border-white/5 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-[12px] font-medium rounded-lg text-muted-foreground dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/8 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !name.trim()}
                            className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 transition-colors shadow-sm shadow-primary/20"
                        >
                            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Create Tag
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
