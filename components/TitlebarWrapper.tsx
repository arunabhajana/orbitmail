"use client";

import dynamic from "next/dynamic";

const Titlebar = dynamic(() => import("./Titlebar"), { ssr: false });

export default function TitlebarWrapper() {
    return <Titlebar />;
}
