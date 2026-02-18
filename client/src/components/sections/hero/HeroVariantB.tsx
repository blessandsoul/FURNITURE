'use client';

import Link from 'next/link';
import { ArrowRight, Sparkle, Lightning } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { BeforeAfterSlider } from '@/features/configurator/components/result/BeforeAfterSlider';
import { ROUTES } from '@/lib/constants/routes';

// Placeholder data URIs — TODO: Replace with real room photos
const BEFORE_SRC = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500'%3E%3Crect width='800' height='500' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' font-family='system-ui' font-size='18' fill='%236b7280'%3EYour room before%3C/text%3E%3C/svg%3E";
const AFTER_SRC = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500'%3E%3Crect width='800' height='500' fill='%23fef3c7'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' font-family='system-ui' font-size='18' fill='%23d97706'%3EAfter AI redesign%3C/text%3E%3C/svg%3E";

export function HeroVariantB(): React.JSX.Element {
    return (
        <section className="relative flex min-h-[90dvh] flex-col items-center justify-center overflow-hidden px-4 py-20">
            {/* Background */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                    backgroundImage: `
                        radial-gradient(ellipse 80% 60% at 50% -20%, oklch(0.546 0.245 262.881 / 0.08) 0%, transparent 70%),
                        radial-gradient(ellipse 60% 40% at 80% 80%, oklch(0.705 0.213 47.604 / 0.06) 0%, transparent 60%)
                    `,
                }}
            />

            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[--border-crisp] bg-[--surface-enamel] px-3.5 py-1.5 shadow-[--shadow-enamel] backdrop-blur-md">
                <Sparkle className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">AI-Powered Room Redesign</span>
            </div>

            {/* Headline */}
            <h1 className="mx-auto max-w-3xl text-balance text-center text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Transform Any Room with{' '}
                <span className="text-primary">AI Design</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-balance text-center text-lg leading-relaxed text-muted-foreground">
                Upload a photo of your room, choose a style, and watch AI bring it to life —
                new furniture, colors, and atmosphere in seconds.
            </p>

            {/* Before/After Slider */}
            <div className="mt-10 w-full max-w-2xl">
                <BeforeAfterSlider
                    beforeSrc={BEFORE_SRC}
                    afterSrc={AFTER_SRC}
                    beforeLabel="Your room"
                    afterLabel="After AI Design"
                    className="shadow-2xl"
                />
                <p className="mt-3 text-center text-xs text-muted-foreground">
                    Drag the handle to compare &mdash; real results from Atlas customers
                </p>
            </div>

            {/* CTA */}
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="gap-2 px-8 motion-safe:transition-transform motion-safe:active:scale-[0.98]">
                    <Link href={ROUTES.CONFIGURATOR.ROOT}>
                        Try Room Reimagine
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                    <Link href={ROUTES.REGISTER}>Create Free Account</Link>
                </Button>
            </div>

            {/* Tags */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                {['Upload any photo', 'AI redesign in seconds', '8 design styles', 'Before & after comparison'].map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[--border-crisp] bg-[--surface-enamel] px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-md"
                    >
                        <Lightning className="h-3 w-3 text-primary" />
                        {tag}
                    </span>
                ))}
            </div>
        </section>
    );
}