"use client";

import { getCurrentWindow } from "@tauri-apps/api/window";
import { Search } from "lucide-react";

export default function Titlebar() {
    const appWindow = getCurrentWindow();

    return (
        <div
            className="fixed top-0 left-0 right-0 h-[30px] z-50 grid grid-cols-[1fr_auto_1fr] items-center px-2.5 bg-[#f5f5f8]/75 backdrop-blur-[20px] border-b border-black/5"
            style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
        >

            {/* LEFT UTILITY */}
            <div className="flex items-center gap-1.5">
                <button
                    className="w-[26px] h-[26px] flex items-center justify-center rounded-md hover:bg-black/5 transition-colors cursor-default"
                    style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
                >
                    <Search size={16} className="text-black/80" />
                </button>
            </div>

            {/* CENTER BRAND */}
            <div className="justify-self-center font-[family-name:var(--font-inter)] font-semibold text-[13px] tracking-[0.3px] text-[#141414]/85 select-none pointer-events-none">
                OrionMail
            </div>

            {/* RIGHT WINDOWS CONTROLS */}
            <div className="justify-self-end flex">
                <button
                    onClick={() => appWindow.minimize()}
                    className="w-[46px] h-[30px] flex items-center justify-center bg-transparent hover:bg-black/10 transition-colors text-[13px]"
                    style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
                >
                    —
                </button>

                <button
                    onClick={() => appWindow.toggleMaximize()}
                    className="w-[46px] h-[30px] flex items-center justify-center bg-transparent hover:bg-black/10 transition-colors text-[13px]"
                    style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
                >
                    □
                </button>

                <button
                    onClick={() => appWindow.close()}
                    className="w-[46px] h-[30px] flex items-center justify-center bg-transparent hover:bg-[#e81123] hover:text-white transition-colors text-[13px]"
                    style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
                >
                    ✕
                </button>
            </div>

        </div>
    );
}
