"use client";

import React, { useLayoutEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import gsap from 'gsap';

interface OrbitLoaderProps {
    className?: string;
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

const OrbitLoader: React.FC<OrbitLoaderProps> = ({
    className,
    message = "Retrieving from orbit...",
    size = 'md'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const centerRef = useRef<HTMLDivElement>(null);
    const starRefs = useRef<(HTMLDivElement | null)[]>([]);

    const sizeClasses = {
        sm: 'w-12 h-12',
        md: 'w-24 h-24',
        lg: 'w-40 h-40'
    };

    const centerSizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-6 h-6',
        lg: 'w-10 h-10'
    };

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // 1. Animate Center Orb (Pulse)
            gsap.to(centerRef.current, {
                scale: 1.2,
                opacity: 0.8,
                duration: 1.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            // 2. Animate Stars in Orbits
            starRefs.current.forEach((star, i) => {
                if (!star) return;

                // Randomize orbit properties
                const radius = (i + 1) * (size === 'sm' ? 15 : size === 'lg' ? 40 : 25);
                const duration = 2 + Math.random() * 3 + (i * 0.5);
                const delay = -Math.random() * duration;

                gsap.set(star, {
                    x: radius,
                    transformOrigin: `-${radius}px center`
                });

                gsap.to(star, {
                    rotation: 360,
                    duration: duration,
                    repeat: -1,
                    ease: "none",
                    delay: delay
                });

                // Subtle twinkle for the star itself
                gsap.to(star, {
                    opacity: 0.3,
                    scale: 0.7,
                    duration: 0.5 + Math.random(),
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            });

            // 3. Text Pulse
            gsap.fromTo(".loader-text",
                { opacity: 0.5 },
                { opacity: 1, duration: 1.2, repeat: -1, yoyo: true, ease: "sine.inOut" }
            );

        }, containerRef);

        return () => ctx.revert();
    }, [size]);

    return (
        <div ref={containerRef} className={cn("flex flex-col items-center justify-center gap-6", className)}>
            <div className={cn("relative flex items-center justify-center", sizeClasses[size])}>
                {/* Background Glow */}
                <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full scale-150 animate-pulse" />

                {/* Central Orb */}
                <div
                    ref={centerRef}
                    className={cn(
                        "relative z-10 rounded-full bg-gradient-to-tr from-primary via-primary/80 to-purple-500 shadow-[0_0_20px_rgba(39,123,241,0.4)]",
                        centerSizeClasses[size]
                    )}
                />

                {/* Orbiting Stars */}
                {[...Array(size === 'sm' ? 2 : 4)].map((_, i) => (
                    <div
                        key={i}
                        ref={el => { starRefs.current[i] = el; }}
                        className="absolute w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white] dark:shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                    />
                ))}

                {/* Subtle Orbital Rings */}
                {[...Array(size === 'sm' ? 2 : 4)].map((_, i) => {
                    const radius = (i + 1) * (size === 'sm' ? 15 : size === 'lg' ? 40 : 25);
                    return (
                        <div
                            key={`ring-${i}`}
                            className="absolute rounded-full border border-white/5 dark:border-white/10 pointer-events-none"
                            style={{
                                width: radius * 2,
                                height: radius * 2,
                            }}
                        />
                    );
                })}
            </div>

            {message && (
                <div className="text-center space-y-1">
                    <p className="loader-text text-sm font-bold uppercase tracking-[0.2em] text-foreground/70 dark:text-white/60">
                        {message}
                    </p>
                    <div className="flex items-center justify-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1 h-1 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1 h-1 rounded-full bg-primary/40 animate-bounce" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrbitLoader;
