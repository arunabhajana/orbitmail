"use client";

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const AppearanceSection = memo(() => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
    >
        {/* Theme Selection */}
        <div className="p-8 rounded-3xl bg-secondary/30 border border-white/20 backdrop-blur-md">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6">Interface Theme</h3>

            <div className="grid grid-cols-3 gap-6">
                {/* Light Mode */}
                <button className="flex flex-col gap-3 group">
                    <div className="aspect-[4/3] w-full bg-white rounded-lg border-2 border-primary shadow-sm overflow-hidden relative p-2 transition-all">
                        <div className="w-full h-full bg-[#f6f7f8] rounded-md border border-black/5 flex flex-col gap-1.5 p-2">
                            <div className="w-3/4 h-2 bg-black/10 rounded-full"></div>
                            <div className="w-1/2 h-2 bg-black/5 rounded-full"></div>
                        </div>
                    </div>
                    <span className="text-sm font-medium text-primary">Light Mode</span>
                </button>

                {/* Dark Mode */}
                <button className="flex flex-col gap-3 group">
                    <div className="aspect-[4/3] w-full bg-[#1e1e1e] rounded-lg border-2 border-transparent hover:border-white/10 shadow-sm overflow-hidden relative p-2 transition-all">
                        <div className="w-full h-full bg-white/5 rounded-md border border-white/5 flex flex-col gap-1.5 p-2">
                            <div className="w-3/4 h-2 bg-white/20 rounded-full"></div>
                            <div className="w-1/2 h-2 bg-white/10 rounded-full"></div>
                        </div>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">Dark Mode</span>
                </button>

                {/* System */}
                <button className="flex flex-col gap-3 group">
                    <div className="aspect-[4/3] w-full bg-gradient-to-br from-white to-[#1e1e1e] rounded-lg border-2 border-transparent hover:border-black/10 dark:hover:border-white/10 shadow-sm overflow-hidden relative p-2 transition-all">
                        <div className="w-full h-full flex flex-col gap-1.5 p-2 justify-center">
                            <div className="w-3/4 h-2 bg-black/20 backdrop-blur-sm rounded-full mx-auto"></div>
                            <div className="w-1/2 h-2 bg-black/10 backdrop-blur-sm rounded-full mx-auto"></div>
                        </div>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">System</span>
                </button>
            </div>

            <div className="mt-10 flex items-center justify-between">
                <div>
                    <h4 className="font-semibold text-foreground">Message Density</h4>
                    <p className="text-sm text-muted-foreground mt-1">Control how much information you see at once.</p>
                </div>
                <div className="flex bg-black/5 p-1 rounded-lg">
                    {['Compact', 'Default', 'Relaxed'].map((d, i) => (
                        <button
                            key={d}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                i === 1 ? "bg-white text-black shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-10 flex items-center justify-between">
                <h4 className="font-semibold text-foreground">Accent Color</h4>
                <div className="flex gap-3">
                    {['bg-blue-500', 'bg-purple-500', 'bg-rose-500', 'bg-emerald-500', 'bg-orange-500'].map((color, i) => (
                        <button
                            key={color}
                            className={cn(
                                "w-8 h-8 rounded-full ring-2 ring-offset-2 ring-offset-white/0 transition-all",
                                color,
                                i === 0 ? "ring-primary scale-110" : "ring-transparent hover:scale-110"
                            )}
                        />
                    ))}
                </div>
            </div>
        </div>
    </motion.div>
));
AppearanceSection.displayName = "AppearanceSection";
