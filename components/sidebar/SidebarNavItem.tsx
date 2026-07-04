"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";
import { NavItemConfig, Tag } from "@/lib/types";

export const NavItem = memo(({ icon: Icon, label, id, badge, highlight, onClick }: NavItemConfig & { onClick?: () => void }) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full flex items-center gap-3 pl-4 pr-3 py-2 rounded-lg text-sm transition-all duration-200 outline-none items-center",
            highlight
                ? "bg-white/60 dark:bg-white/10 text-foreground dark:text-white/90 font-medium shadow-sm ring-1 ring-black/5 dark:ring-white/5" // Active state
                : "text-muted-foreground dark:text-white/60 font-medium hover:text-foreground dark:hover:text-white/90 hover:bg-white/40 dark:hover:bg-white/5" // Inactive state
        )}
    >
        <Icon
            className={cn(
                "w-[18px] h-[18px] transition-colors",
                highlight ? "text-primary" : "text-muted-foreground"
            )}
        />
        <span className="flex-1 text-left truncate">{label}</span>
        {badge && (
            <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-md font-semibold",
                highlight
                    ? "bg-white/50 dark:bg-white/20 text-foreground dark:text-white/90"
                    : "text-muted-foreground/70 dark:text-white/40"
            )}>
                {badge}
            </span>
        )}
    </button>
));
NavItem.displayName = "NavItem";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GMAIL_TAG_COLORS } from "@/lib/types";

export const TagItem = memo(({ tag, highlight, onClick, onColorChange }: { tag: Tag, highlight?: boolean, onClick?: () => void, onColorChange?: (tagId: string, bg: string, text: string) => void }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const handleColorPick = (e: React.MouseEvent, bg: string, text: string) => {
        e.stopPropagation();
        setIsPickerOpen(false);
        if (onColorChange) onColorChange(tag.id, bg, text);
    };

    return (
        <div 
            className="flex flex-col"
            onMouseEnter={() => setIsHovered(true)} 
            onMouseLeave={() => setIsHovered(false)}
        >
            <button 
                onClick={onClick} 
                className={cn("w-full flex items-center gap-3 pl-4 pr-2 py-2 rounded-lg text-sm transition-all duration-200 outline-none", 
                    highlight ? "bg-white/60 dark:bg-white/10 text-foreground dark:text-white/90 font-medium shadow-sm ring-1 ring-black/5 dark:ring-white/5" 
                              : "font-medium text-muted-foreground dark:text-white/60 hover:text-foreground dark:hover:text-white/90 hover:bg-white/40 dark:hover:bg-white/5")}
            >
                <span className="w-2.5 h-2.5 rounded-full ring-1 ring-black/5 flex-shrink-0" style={{ backgroundColor: tag.bg_color || '#9ca3af' }} />
                <span className="truncate flex-1 text-left">{tag.name}</span>
                
                {(isHovered || isPickerOpen) && (
                    <div 
                        className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsPickerOpen(!isPickerOpen);
                        }}
                    >
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </div>
                )}
            </button>

            <AnimatePresence>
                {isPickerOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="py-2 px-3 pb-3 grid grid-cols-6 gap-2">
                            {GMAIL_TAG_COLORS.slice(0, 30).map((color, i) => (
                                <button
                                    key={i}
                                    onClick={(e) => handleColorPick(e, color.bg, color.text)}
                                    className="w-5 h-5 rounded-full ring-1 ring-black/10 dark:ring-white/10 hover:scale-125 transition-transform"
                                    style={{ backgroundColor: color.bg }}
                                    title="Set tag color"
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});
TagItem.displayName = "TagItem";
