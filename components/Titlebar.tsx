"use client";

import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export default function Titlebar() {
    const appWindow = getCurrentWindow();
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        // Cycle between connected (green dot) and syncing (spinner)
        const interval = setInterval(() => {
            setIsSyncing(prev => !prev);
        }, 5000); // Toggle every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className="fixed top-0 left-0 right-0 h-[30px] z-50 grid grid-cols-[1fr_auto_1fr] items-center px-2.5 bg-[#f5f5f8]/75 backdrop-blur-[20px] border-b border-black/5"
            style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
        >

            {/* LEFT UTILITY: SYNC INDICATOR */}
            <div className="flex items-center gap-1.5 pl-1">
                <div
                    className="flex items-center gap-2 px-2 py-0.5 rounded-full select-none transition-all duration-300"
                    style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
                >
                    {isSyncing ? (
                        <>
                            <RefreshCw size={12} className="text-slate-500 animate-spin" />
                            <span className="text-[10px] font-medium text-slate-500 tracking-tight">Syncing...</span>
                        </>
                    ) : (
                        <>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]" />
                            <span className="text-[10px] font-medium text-slate-600 tracking-tight">Online</span>
                        </>
                    )}
                </div>
            </div>

            {/* CENTER BRAND */}
            <div className="justify-self-center font-[family-name:var(--font-inter)] font-semibold text-[13px] tracking-[0.3px] text-[#141414]/85 select-none pointer-events-none">
                OrionMail
            </div>

            {/* RIGHT WINDOWS CONTROLS */}
            <div className="justify-self-end flex gap-1.5 px-1.5">
                <button
                    onClick={() => appWindow.minimize()}
                    className="w-[36px] h-[26px] flex items-center justify-center rounded-md bg-transparent hover:bg-black/5 active:scale-95 transition-all text-black/70"
                    style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
                >
                    <Minus size={18} strokeWidth={2.5} />
                </button>

                <button
                    onClick={() => appWindow.toggleMaximize()}
                    className="w-[36px] h-[26px] flex items-center justify-center rounded-md bg-transparent hover:bg-black/5 active:scale-95 transition-all text-black/70"
                    style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
                >
                    <Square size={16} strokeWidth={2.5} rx={4} />
                </button>

                <button
                    onClick={() => appWindow.close()}
                    className="w-[36px] h-[26px] flex items-center justify-center rounded-md bg-transparent hover:bg-[#e81123] hover:text-white active:scale-95 transition-all text-black/70 group"
                    style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
                >
                    <X size={18} strokeWidth={2.5} className="group-hover:icon-white" />
                </button>
            </div>

        </div>
    );
}

