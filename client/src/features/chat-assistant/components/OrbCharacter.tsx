'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { CharacterState } from '../types';
import type { Variants } from 'motion/react';

interface OrbCharacterProps {
    state: CharacterState;
    size?: number;
    className?: string;
}

export function OrbCharacter({ state, size = 48, className }: OrbCharacterProps): React.ReactElement {
    const [mouseOffset, setMouseOffset] = React.useState({ x: 0, y: 0 });
    const svgRef = React.useRef<SVGSVGElement>(null);

    // Mouse tracking for subtle parallax effect
    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent): void => {
            if (!svgRef.current) return;
            const rect = svgRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = e.clientX - centerX;
            const deltaY = e.clientY - centerY;
            const maxOffset = 5;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const normalizedX = distance > 0 ? (deltaX / distance) * Math.min(distance / 100, 1) * maxOffset : 0;
            const normalizedY = distance > 0 ? (deltaY / distance) * Math.min(distance / 100, 1) * maxOffset : 0;
            setMouseOffset({ x: normalizedX, y: normalizedY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return (): void => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Base colors derived from AtlasFurniture premium theme
    // Espresso (Dark Brown): oklch(0.28 0.055 48)
    // Sand Stone: oklch(0.93 0.020 72)
    // Terracotta: oklch(0.55 0.12 40)

    const coreVariants: Variants = {
        idle: {
            scale: [1, 1.05, 1],
            rotate: [0, 90, 180, 270, 360],
            transition: {
                scale: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
                rotate: { repeat: Infinity, duration: 20, ease: 'linear' }
            }
        },
        listening: {
            scale: [1.1, 1.15, 1.1],
            rotate: [0, -45],
            transition: {
                scale: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
                rotate: { duration: 0.5, ease: 'easeOut' }
            }
        },
        thinking: {
            scale: [0.9, 1.1, 0.9],
            rotate: [0, 180, 360],
            transition: {
                scale: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
                rotate: { repeat: Infinity, duration: 4, ease: 'linear' }
            }
        },
        talking: {
            scale: [1, 1.25, 1, 1.1, 1],
            rotate: [0, 45, 0, -45, 0],
            transition: { repeat: Infinity, duration: 0.8, ease: 'circOut' }
        },
        happy: {
            scale: [1, 1.2, 1],
            rotate: [0, 360],
            transition: {
                scale: { repeat: Infinity, duration: 0.6, ease: 'easeInOut' },
                rotate: { repeat: Infinity, duration: 2, ease: 'linear' }
            }
        },
        sleeping: {
            scale: [0.8, 0.82, 0.8],
            rotate: 0,
            transition: { repeat: Infinity, duration: 6, ease: 'easeInOut' }
        }
    };

    const ringVariants: Variants = {
        idle: {
            rotate: 0,
            scale: [1, 1.02, 1],
            opacity: 0.4,
            transition: { repeat: Infinity, duration: 5, ease: 'easeInOut' }
        },
        listening: {
            rotate: 45,
            scale: 1.2,
            opacity: 0.8,
            transition: { duration: 0.6, ease: 'easeOut' }
        },
        thinking: {
            rotate: [0, -360],
            scale: [1, 1.1, 1],
            opacity: 0.6,
            transition: { repeat: Infinity, duration: 6, ease: 'linear' }
        },
        talking: {
            rotate: [0, 15, -15, 0],
            scale: [1.1, 1.3, 1.1],
            opacity: [0.6, 1, 0.6],
            transition: { repeat: Infinity, duration: 0.8, ease: 'easeInOut' }
        },
        happy: {
            rotate: [0, 360],
            scale: [1.1, 1.3, 1.1],
            opacity: 0.9,
            transition: { repeat: Infinity, duration: 3, ease: 'linear' }
        },
        sleeping: {
            rotate: 0,
            scale: 0.85,
            opacity: 0.1,
            transition: { duration: 1, ease: 'easeInOut' }
        }
    };

    return (
        <motion.svg
            ref={svgRef}
            viewBox="0 0 100 100"
            width={size}
            height={size}
            className={className}
            initial="idle"
            animate={state === 'sleeping' ? 'idle' : state} // Keep idle animation instead of completely sleeping
        >
            <defs>
                {/* Core Gradient - Warm Espresso to Terracotta tint */}
                <radialGradient id="coreGradient" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                    <stop offset="0%" stopColor="oklch(0.55 0.12 40)" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="oklch(0.28 0.055 48)" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="oklch(0.18 0.04 48)" stopOpacity="1" />
                </radialGradient>

                {/* Aura Gradient */}
                <radialGradient id="auraGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="oklch(0.55 0.12 40)" stopOpacity="0.3" />
                    <stop offset="70%" stopColor="oklch(0.28 0.055 48)" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="oklch(0.28 0.055 48)" stopOpacity="0" />
                </radialGradient>

                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Floating Group with Parallax */}
            <motion.g
                animate={{ x: mouseOffset.x, y: mouseOffset.y }}
                transition={{ type: 'spring', stiffness: 50, damping: 20 }}
            >
                {/* Outer Aura Glow */}
                <motion.circle
                    cx="50" cy="50" r="45"
                    fill="url(#auraGradient)"
                    variants={{
                        idle: { scale: [1, 1.1, 1], opacity: 0.5, transition: { repeat: Infinity, duration: 4 } },
                        listening: { scale: 1.2, opacity: 0.8, transition: { duration: 0.3 } },
                        thinking: { scale: [0.9, 1.15, 0.9], opacity: 0.6, transition: { repeat: Infinity, duration: 1.5 } },
                        talking: { scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5], transition: { repeat: Infinity, duration: 0.8 } },
                        happy: { scale: [1, 1.2, 1], opacity: 0.9, transition: { repeat: Infinity, duration: 0.5 } },
                        sleeping: { scale: 0.8, opacity: 0.2, transition: { duration: 1 } }
                    }}
                />

                {/* Orbiting Orbital Ring 1 */}
                <motion.ellipse
                    cx="50" cy="50" rx="36" ry="12"
                    fill="none"
                    stroke="oklch(0.55 0.12 40)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeDasharray="40 100"
                    variants={ringVariants}
                    style={{ originX: '50px', originY: '50px' }}
                />

                {/* Orbiting Orbital Ring 2 (Counter rotating) */}
                <motion.ellipse
                    cx="50" cy="50" rx="12" ry="36"
                    fill="none"
                    stroke="oklch(0.93 0.020 72)"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeDasharray="30 80"
                    variants={{
                        ...ringVariants,
                        idle: { ...ringVariants.idle as any, rotate: [0, -360], transition: { repeat: Infinity, duration: 15, ease: 'linear' } },
                        thinking: { ...ringVariants.thinking as any, rotate: [0, 360], transition: { repeat: Infinity, duration: 8, ease: 'linear' } },
                        talking: { ...ringVariants.talking as any, rotate: [45, 60, 30, 45], transition: { repeat: Infinity, duration: 0.8, ease: 'easeInOut' } },
                    }}
                    style={{ originX: '50px', originY: '50px' }}
                />

                {/* Inner Solid Core */}
                <motion.path
                    d="M50 20 C66 20 80 34 80 50 C80 66 66 80 50 80 C34 80 20 66 20 50 C20 34 34 20 50 20"
                    fill="url(#coreGradient)"
                    filter="url(#glow)"
                    variants={coreVariants}
                    style={{ originX: '50px', originY: '50px' }}
                />

                {/* Dynamic Center Dot (Pupil / Voice Box) */}
                <motion.circle
                    cx="50" cy="50"
                    fill="oklch(0.97 0.008 75)"
                    variants={{
                        idle: { r: 3, opacity: 0.8, transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' } },
                        listening: { r: [4, 6, 4], opacity: 1, transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' } },
                        thinking: { r: 2, opacity: [0.3, 1, 0.3], transition: { repeat: Infinity, duration: 0.5, ease: 'linear' } },
                        talking: {
                            r: [2, 12, 4, 8, 2],
                            opacity: 1,
                            transition: { repeat: Infinity, duration: 0.8, ease: 'circOut' }
                        },
                        happy: { r: [3, 6, 3], opacity: 1, transition: { repeat: Infinity, duration: 0.5, ease: 'easeInOut' } },
                        sleeping: { r: 2, opacity: 0.3, transition: { duration: 1 } }
                    }}
                />

                {/* Thinking Particles Overlay */}
                <AnimatePresence>
                    {state === 'thinking' && (
                        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <motion.circle cx="34" cy="34" r="2" fill="oklch(0.93 0.020 72)" animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], x: [0, -5], y: [0, -5] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} />
                            <motion.circle cx="66" cy="34" r="1.5" fill="oklch(0.93 0.020 72)" animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], x: [0, 5], y: [0, -5] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} />
                            <motion.circle cx="50" cy="22" r="2.5" fill="oklch(0.55 0.12 40)" animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], y: [0, -8] }} transition={{ repeat: Infinity, duration: 1.8, delay: 0.8 }} />
                        </motion.g>
                    )}
                </AnimatePresence>
            </motion.g>
        </motion.svg>
    );
}
