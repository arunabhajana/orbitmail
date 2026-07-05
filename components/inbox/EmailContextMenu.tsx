import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Reply, 
    ReplyAll, 
    Forward, 
    Archive, 
    Trash2, 
    Mail, 
    MailOpen, 
    Pin, 
    Clock, 
    Tag as TagIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface EmailContextMenuState {
    x: number;
    y: number;
    emailId: string;
    unread: boolean;
}

interface EmailContextMenuProps {
    contextMenu: EmailContextMenuState | null;
    onClose: () => void;
    onToggleRead?: (id: string) => void;
}

export const EmailContextMenu: React.FC<EmailContextMenuProps> = ({ 
    contextMenu, 
    onClose, 
    onToggleRead 
}) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (contextMenu) {
            // Delay adding listeners to prevent the initial right-click from immediately closing it
            const timer = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
                document.addEventListener('contextmenu', handleClickOutside);
            }, 50);
            return () => {
                clearTimeout(timer);
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('contextmenu', handleClickOutside);
            };
        }
    }, [contextMenu, onClose]);

    if (!mounted) return null;

    // Constrain to window bounds
    const maxW = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const maxH = typeof window !== 'undefined' ? window.innerHeight : 800;
    
    // Estimate menu size
    const menuWidth = 220; 
    const menuHeight = 350; 
    
    let x = contextMenu?.x || 0;
    let y = contextMenu?.y || 0;

    if (x + menuWidth > maxW) x -= menuWidth;
    if (y + menuHeight > maxH) y -= menuHeight;
    
    // Safety bounds
    x = Math.max(8, x);
    y = Math.max(8, y);

    const handleAction = (action: string, handler?: () => void) => {
        if (handler) {
            handler();
        } else {
            toast.info(`${action} is not implemented yet`);
        }
        onClose();
    };

    const content = (
        <AnimatePresence>
            {contextMenu && (
                <motion.div
                    ref={menuRef}
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    style={{ top: y, left: x }}
                    className="fixed z-[1000] w-56 bg-white/70 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden py-1.5 flex flex-col"
                    onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }} // prevent native menu on the menu itself
                >
                    {/* Reply group */}
                    <ContextMenuItem icon={<Reply size={16} />} label="Reply" onClick={() => handleAction('Reply')} />
                    <ContextMenuItem icon={<ReplyAll size={16} />} label="Reply All" onClick={() => handleAction('Reply All')} />
                    <ContextMenuItem icon={<Forward size={16} />} label="Forward" onClick={() => handleAction('Forward')} />
                    
                    <ContextMenuDivider />
                    
                    {/* Organize group */}
                    <ContextMenuItem icon={<Archive size={16} />} label="Archive" onClick={() => handleAction('Archive')} />
                    <ContextMenuItem icon={<Trash2 size={16} />} label="Delete" onClick={() => handleAction('Delete')} className="text-red-600 dark:text-red-400" />
                    <ContextMenuItem 
                        icon={contextMenu?.unread ? <MailOpen size={16} /> : <Mail size={16} />} 
                        label={contextMenu?.unread ? "Mark as Read" : "Mark as Unread"} 
                        onClick={() => handleAction(contextMenu?.unread ? 'Mark as Read' : 'Mark as Unread', () => { if (contextMenu) onToggleRead?.(contextMenu.emailId); })} 
                    />
                    
                    <ContextMenuDivider />
                    
                    {/* Actions group */}
                    <ContextMenuItem icon={<Pin size={16} />} label="Pin email" onClick={() => handleAction('Pin email')} />
                    <ContextMenuItem icon={<Clock size={16} />} label="Snooze" onClick={() => handleAction('Snooze')} />
                    <ContextMenuItem icon={<TagIcon size={16} />} label="Add tags" onClick={() => handleAction('Add tags')} />
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(content, document.body);
};

// Sub-components for styling
const ContextMenuItem = ({ 
    icon, 
    label, 
    onClick, 
    className 
}: { 
    icon: React.ReactNode, 
    label: string, 
    onClick: () => void,
    className?: string
}) => (
    <button
        onClick={(e) => {
            e.stopPropagation();
            onClick();
        }}
        className={cn(
            "w-full px-3 py-1.5 text-sm flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-left",
            "text-zinc-800 dark:text-zinc-200",
            className
        )}
    >
        <span className="opacity-70">{icon}</span>
        <span>{label}</span>
    </button>
);

const ContextMenuDivider = () => (
    <div className="h-[1px] bg-black/10 dark:bg-white/10 my-1.5 w-full" />
);
