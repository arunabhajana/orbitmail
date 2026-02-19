"use client";

import { getCurrentWindow } from "@tauri-apps/api/window";

export default function Titlebar() {
    const appWindow = getCurrentWindow();

    return (
        <div
            className="titlebar flex items-center justify-between px-4"
            data-tauri-drag-region
        >
            {/* Left spacer */}
            <div className="w-24" />

            {/* Center Brand */}
            <div className="brand">
                OrionMail
            </div>

            {/* Window Controls */}
            <div className="controls flex gap-2">
                <button
                    onClick={() => appWindow.minimize()}
                    className="win-btn"
                >
                    —
                </button>

                <button
                    onClick={() => appWindow.toggleMaximize()}
                    className="win-btn"
                >
                    □
                </button>

                <button
                    onClick={() => appWindow.close()}
                    className="win-btn close"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
