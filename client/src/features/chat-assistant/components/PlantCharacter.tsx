'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import type { CharacterState } from '../types';
import type { Variants } from 'motion/react';

interface PlantCharacterProps {
    state: CharacterState;
    size?: number;
    className?: string;
}

export function PlantCharacter({ state, size = 48, className }: PlantCharacterProps): React.ReactElement {
    const [isBlinking, setIsBlinking] = React.useState(false);
    const [mouseOffset, setMouseOffset] = React.useState({ x: 0, y: 0 });
    const svgRef = React.useRef<SVGSVGElement>(null);

    // Blinking
    React.useEffect(() => {
        if (state === 'idle' || state === 'listening') {
            const interval = setInterval(() => {
                setIsBlinking(true);
                setTimeout(() => setIsBlinking(false), 150);
            }, 3000 + Math.random() * 2000);
            return (): void => clearInterval(interval);
        }
    }, [state]);

    // Mouse tracking
    React.useEffect(() => {
        if (state === 'sleeping') return;

        const handleMouseMove = (e: MouseEvent): void => {
            if (!svgRef.current) return;
            const rect = svgRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = e.clientX - centerX;
            const deltaY = e.clientY - centerY;
            const maxOffset = 3;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const normalizedX = distance > 0 ? (deltaX / distance) * Math.min(distance / 80, 1) * maxOffset : 0;
            const normalizedY = distance > 0 ? (deltaY / distance) * Math.min(distance / 80, 1) * maxOffset : 0;
            setMouseOffset({ x: normalizedX, y: normalizedY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return (): void => window.removeEventListener('mousemove', handleMouseMove);
    }, [state]);

    const isSleeping = state === 'sleeping';

    const getEyeScaleY = (): number => {
        if (isSleeping) return 0.05;
        if (isBlinking) return 0.1;
        if (state === 'thinking') return 0.8;
        return 1;
    };

    const getStemBend = (): number => {
        switch (state) {
            case 'sleeping': return 25;
            case 'thinking': return -5;
            case 'listening': return mouseOffset.x * 2;
            case 'talking': return 0;
            case 'happy': return 0;
            default: return 0;
        }
    };

    const stemVariants: Variants = {
        idle: { rotate: [0, 2, -2, 0], scaleY: [1, 0.98, 1], transition: { repeat: Infinity, duration: 4, ease: 'easeInOut' } },
        listening: { rotate: mouseOffset.x * 2, scaleY: 1.05, transition: { duration: 0.3 } },
        thinking: { rotate: [-5, 5, -5], scaleY: [1, 0.95, 1], transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' } },
        talking: {
            rotate: [-3, 3, -3],
            y: [0, -2, 0],
            scaleY: [1, 1.02, 1],
            transition: { repeat: Infinity, duration: 0.8, ease: 'easeInOut' }
        },
        happy: {
            rotate: [0, 2, -2, 0],
            scaleY: [1, 0.98, 1],
            transition: { repeat: Infinity, duration: 4, ease: 'easeInOut' }
        },
        sleeping: { rotate: 25, scaleY: 0.85, transition: { duration: 1, ease: 'easeInOut' } }
    };

    const leafVariants: Variants = {
        idle: { rotate: [0, -3, 3, 0], transition: { repeat: Infinity, duration: 5, ease: 'easeInOut' } },
        listening: { rotate: -10, transition: { duration: 0.3 } },
        thinking: { rotate: [0, -8, 0], transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' } },
        talking: {
            rotate: [0, -10, 0],
            transition: { repeat: Infinity, duration: 0.8, ease: 'easeInOut' }
        },
        happy: {
            rotate: [0, -3, 3, 0],
            transition: { repeat: Infinity, duration: 5, ease: 'easeInOut' }
        },
        sleeping: { rotate: -40, transition: { duration: 1, ease: 'easeInOut' } }
    };

    // Sage Green from AtlasFurniture palette: oklch(0.53 0.06 140)
    // Espresso base: oklch(0.28 0.055 48)

    return (
        <motion.svg
            ref={svgRef}
            viewBox="0 0 100 120"
            width={size}
            height={size * 1.2}
            className={className}
        >
            {/* Base shadow */}
            <ellipse cx="50" cy="112" rx="20" ry="4" fill="oklch(0.20 0.02 50 / 0.15)" />

            {/* Pot Base */}
            <path d="M35 85 L65 85 L60 110 L40 110 Z" fill="oklch(0.93 0.020 72)" stroke="oklch(0.28 0.055 48)" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M33 80 L67 80 L65 85 L35 85 Z" fill="oklch(0.90 0.030 72)" stroke="oklch(0.28 0.055 48)" strokeWidth="1.5" strokeLinejoin="round" />
            <ellipse cx="50" cy="80" rx="17" ry="3" fill="oklch(0.28 0.055 48)" />

            {/* Glow aura */}
            <motion.ellipse
                cx="50" cy="55" rx="30" ry="30"
                fill="oklch(0.53 0.06 140)"
                animate={{
                    opacity: isSleeping ? 0.02 : state === 'happy' ? 0.3 : state === 'talking' ? [0.1, 0.25, 0.1] : 0.15,
                    scale: state === 'thinking' ? [1, 1.1, 1] : 1
                }}
                transition={{ repeat: Infinity, duration: state === 'talking' ? 0.8 : 2, ease: 'easeInOut' }}
            />

            {/* Main plant body */}
            <motion.g
                animate={state}
                variants={stemVariants}
                style={{ originX: '50px', originY: '80px' }}
            >
                {/* Stem */}
                <path d="M50 80 Q50 60 50 45" fill="none" stroke="oklch(0.53 0.06 140)" strokeWidth="4" strokeLinecap="round" />

                {/* Body (Main Bud/Head) */}
                <motion.path
                    d="M50 45 C35 45 35 25 50 15 C65 25 65 45 50 45 Z"
                    fill="oklch(0.53 0.06 140)"
                    stroke="oklch(0.28 0.055 48)"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    animate={
                        state === 'talking'
                            ? { rotate: [5, -5, 5], transition: { repeat: Infinity, duration: 0.6, ease: 'easeInOut' } }
                            : { rotate: 0 }
                    }
                    style={{ originX: '50px', originY: '45px' }}
                />

                {/* Side Leaf (animates separately) */}
                <motion.g animate={state} variants={leafVariants} style={{ originX: '50px', originY: '60px' }}>
                    <path d="M50 60 Q65 60 60 45 Q55 55 50 60 Z" fill="oklch(0.63 0.08 135)" stroke="oklch(0.28 0.055 48)" strokeWidth="1" strokeLinejoin="round" />
                </motion.g>

                {/* Eyes */}
                <g>
                    {/* Left Eye Base & White Outline */}
                    <circle cx="43" cy="32" r="4" fill="oklch(0.28 0.055 48)" />
                    {/* Left Eye Blink/Shape */}
                    <motion.ellipse
                        cx="43"
                        cy="32"
                        rx="3"
                        ry="3.5"
                        fill="white"
                        animate={{ scaleY: getEyeScaleY() }}
                        transition={{ duration: 0.1 }}
                    />
                    {/* Left Pupil (Moves with Mouse) */}
                    {!isSleeping && (
                        <circle cx={43 + mouseOffset.x * 0.7} cy={32 + mouseOffset.y * 0.7} r="1.5" fill="oklch(0.28 0.055 48)" />
                    )}

                    {/* Right Eye Base & White Outline */}
                    <circle cx="57" cy="32" r="4" fill="oklch(0.28 0.055 48)" />
                    {/* Right Eye Blink/Shape */}
                    <motion.ellipse
                        cx="57"
                        cy="32"
                        rx="3"
                        ry="3.5"
                        fill="white"
                        animate={{ scaleY: getEyeScaleY() }}
                        transition={{ duration: 0.1 }}
                    />
                    {/* Right Pupil (Moves with Mouse) */}
                    {!isSleeping && (
                        <circle cx={57 + mouseOffset.x * 0.7} cy={32 + mouseOffset.y * 0.7} r="1.5" fill="oklch(0.28 0.055 48)" />
                    )}
                </g>

                {/* Happy/Talking Mouth */}
                {(state === 'happy' || state === 'talking') && (
                    <motion.path
                        initial={{ opacity: 0 }}
                        animate={
                            state === 'talking'
                                ? {
                                    opacity: 1,
                                    d: [
                                        "M47 38 Q50 41 53 38",
                                        "M47 38 Q50 39 53 38",
                                        "M47 38 Q50 41 53 38"
                                    ]
                                }
                                : {
                                    opacity: 1,
                                    d: "M46 38 Q50 42 54 38"
                                }
                        }
                        transition={
                            state === 'talking'
                                ? { d: { repeat: Infinity, duration: 0.8, ease: "easeInOut" }, opacity: { duration: 0.3 } }
                                : { duration: 0.3 }
                        }
                        fill="none"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                )}

                {/* Closed Mouth (Idle/Listening) */}
                {(state === 'idle' || state === 'listening' || state === 'thinking') && (
                    <path d="M48 38 L52 38" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                )}
            </motion.g>

            {/* Sparkles / Spores for Thinking */}
            {state === 'thinking' && (
                <g>
                    <motion.circle cx="30" cy="30" r="2" fill="oklch(0.97 0.04 100)"
                        animate={{ opacity: [0, 1, 0], y: [30, 20], scale: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} />
                    <motion.circle cx="70" cy="40" r="1.5" fill="oklch(0.97 0.04 100)"
                        animate={{ opacity: [0, 1, 0], y: [40, 25], scale: [0.5, 1.2, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} />
                    <motion.circle cx="45" cy="15" r="2.5" fill="oklch(0.97 0.04 100)"
                        animate={{ opacity: [0, 1, 0], y: [15, 5], scale: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.8, delay: 0.2 }} />
                </g>
            )}

            {/* Sleeping ZZZ */}
            {isSleeping && (
                <g>
                    <motion.text x="65" y="30" fill="oklch(0.53 0.06 140)" fontSize="9" fontWeight="bold"
                        animate={{ opacity: [0, 1, 0], y: [30, 25, 20], x: [65, 68, 71] }}
                        transition={{ repeat: Infinity, duration: 2, delay: 0 }}>z</motion.text>
                    <motion.text x="73" y="22" fill="oklch(0.53 0.06 140)" fontSize="7" fontWeight="bold"
                        animate={{ opacity: [0, 1, 0], y: [22, 17, 12], x: [73, 76, 79] }}
                        transition={{ repeat: Infinity, duration: 2, delay: 0.3 }}>z</motion.text>
                </g>
            )}
        </motion.svg>
    );
}
