'use client';

import { useEffect, useState } from 'react';
import { Sparkle } from '@phosphor-icons/react';

interface Step {
    label: string;
    progress: number; // target % when this step is "active"
}

const STEPS: Step[] = [
    { label: 'Analysing your style…',    progress: 15 },
    { label: 'Composing the scene…',     progress: 35 },
    { label: 'Rendering materials…',     progress: 58 },
    { label: 'Applying lighting…',       progress: 76 },
    { label: 'Finishing details…',       progress: 90 },
];

// Each step is visible for this many ms before moving to the next
const STEP_DURATION = 480;

export function GeneratingOverlay(): React.JSX.Element {
    const [stepIndex, setStepIndex] = useState(0);
    const [visible, setVisible] = useState(true); // drives fade-out before swap
    const [displayedLabel, setDisplayedLabel] = useState(STEPS[0]!.label);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Kick off the first progress target immediately
        setProgress(STEPS[0]!.progress);

        let current = 0;
        let timer: ReturnType<typeof setTimeout>;

        const advance = () => {
            // Fade out current label
            setVisible(false);

            timer = setTimeout(() => {
                current = Math.min(current + 1, STEPS.length - 1);
                const step = STEPS[current]!;
                setStepIndex(current);
                setDisplayedLabel(step.label);
                setProgress(step.progress);
                setVisible(true);

                // Schedule next advance if not on last step
                if (current < STEPS.length - 1) {
                    timer = setTimeout(advance, STEP_DURATION);
                }
            }, 180); // 180ms fade-out gap, then swap text
        };

        // Start cycling after first step has been shown for STEP_DURATION
        timer = setTimeout(advance, STEP_DURATION);

        return () => clearTimeout(timer);
    }, []);

    const currentStep = STEPS[stepIndex]!;

    return (
        <div className="flex h-full min-h-0 flex-col items-center justify-center gap-10 animate-fade-in">
            {/* Pulsing icon */}
            <div className="relative flex items-center justify-center">
                <span className="absolute h-28 w-28 rounded-full bg-primary/8 motion-safe:animate-ping" style={{ animationDuration: '1.6s' }} />
                <span className="absolute h-20 w-20 rounded-full bg-primary/12 motion-safe:animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-primary/25 bg-primary/10">
                    <Sparkle
                        className="h-7 w-7 text-primary"
                        weight="fill"
                        style={{ animation: 'spin 3s linear infinite' }}
                    />
                </div>
            </div>

            {/* Step label */}
            <div className="flex flex-col items-center gap-2 text-center">
                <h3 className="text-base font-semibold text-foreground tracking-tight">
                    Generating your design
                </h3>
                <p
                    className="text-sm text-muted-foreground transition-opacity duration-180"
                    style={{ opacity: visible ? 1 : 0 }}
                >
                    {displayedLabel}
                </p>
            </div>

            {/* Progress bar + step dots */}
            <div className="flex w-72 flex-col items-center gap-3">
                {/* Bar */}
                <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full rounded-full bg-primary transition-all ease-out"
                        style={{
                            width: `${progress}%`,
                            transitionDuration: '600ms',
                        }}
                    />
                </div>

                {/* Step dots */}
                <div className="flex items-center gap-2">
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            className="rounded-full transition-all duration-300"
                            style={{
                                width: i === stepIndex ? 16 : 6,
                                height: 6,
                                backgroundColor: i <= stepIndex
                                    ? 'hsl(var(--primary))'
                                    : 'hsl(var(--muted-foreground) / 0.3)',
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
