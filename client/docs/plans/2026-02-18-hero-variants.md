# Hero Variants Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current static text-only HeroSection with three distinct visual variants (A, B, C) plus a dev-only switcher, keeping the same text/CTA content.

**Architecture:** `HeroSection.tsx` becomes a thin Server Component that reads a `heroVariant` cookie (written by client switcher) and renders one of three sub-components: `HeroVariantA`, `HeroVariantB`, `HeroVariantC`. A `HeroVariantSwitcher` client component floats bottom-right in `NODE_ENV=development` only. Default variant is `C`.

**Tech Stack:** Next.js 16 App Router (cookies API for server-side read), React 19, Tailwind 4, Phosphor Icons SSR, `js-cookie` or native `document.cookie` for client write, existing `BeforeAfterSlider` component reused for variant B.

---

## File Map

| Action | Path |
|--------|------|
| Rewrite | `src/components/sections/HeroSection.tsx` |
| Create | `src/components/sections/hero/HeroVariantA.tsx` |
| Create | `src/components/sections/hero/HeroVariantB.tsx` |
| Create | `src/components/sections/hero/HeroVariantC.tsx` |
| Create | `src/components/sections/hero/HeroVariantSwitcher.tsx` |
| Modify | `src/app/globals.css` (add `@keyframes float`) |

---

## Task 1: Add `@keyframes float` to globals.css

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Add animation after existing keyframes block**

Find the existing `@keyframes scaleIn` block and add immediately after:

```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-10px); }
}
```

And in the `@media (prefers-reduced-motion: no-preference)` utilities block, add:

```css
.animate-float {
  animation: float 4s ease-in-out infinite;
}
```

**Step 2: Verify globals.css compiles**

Run: `cd client && npm run dev` — check no CSS errors in terminal.

---

## Task 2: Create `HeroVariantA.tsx` — Floating Product Card

**Files:**
- Create: `src/components/sections/hero/HeroVariantA.tsx`

**Full component:**

```tsx
import Link from 'next/link';
import { ArrowRight, Sparkle, Lightning, Armchair } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';

const COLOR_SWATCHES = [
    { label: 'Cream',    hex: '#F5F0E8' },
    { label: 'Charcoal', hex: '#3D3D3D' },
    { label: 'Sand',     hex: '#C4A882' },
] as const;

export function HeroVariantA(): React.JSX.Element {
    return (
        <section className="relative flex min-h-[90dvh] flex-col items-center justify-center overflow-hidden px-4 py-24 lg:flex-row lg:items-center lg:gap-16">
            {/* Background gradients */}
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

            {/* Left — text */}
            <div className="flex flex-col items-center text-center lg:flex-1 lg:items-start lg:text-left">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[--border-crisp] bg-[--surface-enamel] px-3.5 py-1.5 shadow-[--shadow-enamel] backdrop-blur-md">
                    <Sparkle className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-foreground">AI-Powered Furniture Design</span>
                </div>

                <h1 className="max-w-xl text-balance text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
                    Design Your Perfect{' '}
                    <span className="text-primary">Furniture</span>{' '}
                    in Minutes
                </h1>

                <p className="mt-6 max-w-md text-balance text-lg leading-relaxed text-muted-foreground">
                    Pick a style, choose your materials and colors, and watch AI bring
                    your custom furniture to life — with real-time pricing.
                </p>

                <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
                    <Button asChild size="lg" className="gap-2 px-8 motion-safe:transition-transform motion-safe:active:scale-[0.98]">
                        <Link href={ROUTES.CONFIGURATOR.ROOT}>
                            Start Designing
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="gap-2">
                        <Link href={ROUTES.REGISTER}>
                            Create Free Account
                        </Link>
                    </Button>
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                    {['No design skills needed', 'Real-time pricing', '8 furniture types', 'Instant preview'].map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[--border-crisp] bg-[--surface-enamel] px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-md"
                        >
                            <Lightning className="h-3 w-3 text-primary" />
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Right — floating product card */}
            <div className="mt-16 lg:mt-0 lg:flex-1 lg:flex lg:justify-center">
                <div className="animate-float relative w-full max-w-sm rounded-2xl border border-[--border-crisp] bg-[--surface-enamel] p-5 shadow-xl shadow-foreground/10 backdrop-blur-md motion-reduce:animate-none">
                    {/* Decorative glow */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-px -z-10 rounded-2xl opacity-40"
                        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.546 0.245 262.881 / 0.2), transparent)' }}
                    />

                    {/* Card header */}
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Armchair className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold text-foreground">Custom Walnut Sofa</span>
                        </div>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">3-Seater</span>
                    </div>

                    {/* Product image placeholder */}
                    <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-muted/60">
                        {/* TODO: Replace with real product render image */}
                        <div className="flex flex-col items-center gap-2 text-muted-foreground/60">
                            <Armchair className="h-16 w-16" />
                            <span className="text-xs font-medium">AI Render Preview</span>
                        </div>
                    </div>

                    {/* Color swatches */}
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Color:</span>
                        <div className="flex gap-1.5">
                            {COLOR_SWATCHES.map((swatch, i) => (
                                <div
                                    key={swatch.label}
                                    title={swatch.label}
                                    className={`h-5 w-5 rounded-full border-2 ${i === 0 ? 'border-primary ring-2 ring-primary/30' : 'border-border/50'}`}
                                    style={{ backgroundColor: swatch.hex }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Price + CTA */}
                    <div className="mt-4 flex items-center justify-between">
                        <div>
                            <span className="text-xl font-bold tabular-nums text-foreground">$1,050</span>
                            <span className="ml-1 text-xs text-muted-foreground">incl. delivery</span>
                        </div>
                        <Button asChild size="sm" className="gap-1.5">
                            <Link href={ROUTES.CONFIGURATOR.ROOT}>
                                Customize
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
```

**Step 2: Verify no TypeScript errors**

```bash
cd client && npx tsc --noEmit
```

Expected: no output (clean).

---

## Task 3: Create `HeroVariantB.tsx` — Before/After Slider

**Files:**
- Create: `src/components/sections/hero/HeroVariantB.tsx`

**Key decision:** `BeforeAfterSlider` is a `'use client'` component. `HeroVariantB` must be `'use client'` too (it directly renders an interactive component). This is acceptable — the hero is already a visually rich section.

**Full component:**

```tsx
'use client';

import Link from 'next/link';
import { ArrowRight, Sparkle, Lightning } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { BeforeAfterSlider } from '@/features/configurator/components/result/BeforeAfterSlider';
import { ROUTES } from '@/lib/constants/routes';

// Placeholder data URIs (grey gradient "before", warm gradient "after")
// TODO: Replace BEFORE_SRC / AFTER_SRC with real room photos
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
```

**Step 2: Verify no TypeScript errors**

```bash
cd client && npx tsc --noEmit
```

---

## Task 4: Create `HeroVariantC.tsx` — Live Mini Configurator

**Files:**
- Create: `src/components/sections/hero/HeroVariantC.tsx`

**Architecture:** `HeroVariantC` is a Server Component. The interactive card is extracted to a separate `HeroConfiguratorCard` client component in the same file (using `'use client'` at the top of the file — this makes the entire file client, which is fine since the card IS the interactive piece and the section is split-layout).

**Note:** Since `HeroConfiguratorCard` needs `useState`, the whole `HeroVariantC.tsx` file must be `'use client'`. Alternatively, split into two files. For simplicity, use a single file with `'use client'` — acceptable here since the entire right half is interactive.

**Full component:**

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkle, Lightning, Sofa } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants/routes';

const COLOR_OPTIONS = [
    { id: 'cream',    label: 'Cream',    hex: '#F5F0E8', modifier: 0 },
    { id: 'charcoal', label: 'Charcoal', hex: '#3D3D3D', modifier: 10 },
    { id: 'sand',     label: 'Sand',     hex: '#C4A882', modifier: 0 },
    { id: 'forest',   label: 'Forest',   hex: '#4A5E4A', modifier: 25 },
    { id: 'rust',     label: 'Rust',     hex: '#B05A3A', modifier: 15 },
] as const;

const BASE_PRICE = 850;

function HeroConfiguratorCard(): React.JSX.Element {
    const [selectedColor, setSelectedColor] = useState<string>('cream');

    const activeColor = COLOR_OPTIONS.find((c) => c.id === selectedColor) ?? COLOR_OPTIONS[0];
    const total = BASE_PRICE + activeColor.modifier;

    return (
        <div className="relative w-full max-w-sm rounded-2xl border border-[--border-crisp] bg-[--surface-enamel] p-5 shadow-xl shadow-foreground/10 backdrop-blur-md">
            {/* Glow effect */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-px -z-10 rounded-2xl opacity-50"
                style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, oklch(0.546 0.245 262.881 / 0.15), transparent)' }}
            />

            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sofa className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Custom Sofa</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-wide text-primary">Live</span>
                </div>
            </div>

            {/* Product visual — background changes with color */}
            <div
                className="flex aspect-[4/3] items-center justify-center rounded-xl border border-border/30 transition-colors duration-500"
                style={{ backgroundColor: activeColor.hex + '33' }} // 20% opacity tint
            >
                <div className="flex flex-col items-center gap-3">
                    <Sofa
                        className="h-20 w-20 transition-colors duration-500"
                        style={{ color: activeColor.hex }}
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                        {activeColor.label} — 3-Seater Linen
                    </span>
                </div>
            </div>

            {/* Color picker */}
            <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Color</span>
                    <span className="text-xs font-semibold text-foreground">{activeColor.label}</span>
                </div>
                <div className="flex gap-2">
                    {COLOR_OPTIONS.map((color) => (
                        <button
                            key={color.id}
                            onClick={() => setSelectedColor(color.id)}
                            title={color.label}
                            aria-label={`Select ${color.label}`}
                            aria-pressed={selectedColor === color.id}
                            className={cn(
                                'h-7 w-7 rounded-full border-2 transition-all duration-200',
                                selectedColor === color.id
                                    ? 'border-primary ring-2 ring-primary/30 scale-110'
                                    : 'border-border/50 hover:border-border hover:scale-105',
                            )}
                            style={{ backgroundColor: color.hex }}
                        />
                    ))}
                </div>
            </div>

            {/* Price */}
            <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-4">
                <div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold tabular-nums text-foreground transition-all duration-300">
                            ${total.toLocaleString()}
                        </span>
                        {activeColor.modifier > 0 && (
                            <span className="text-xs text-muted-foreground">
                                +${activeColor.modifier} color
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-muted-foreground">incl. delivery & assembly</span>
                </div>
                <Button asChild size="sm" className="gap-1.5 motion-safe:transition-transform motion-safe:active:scale-[0.98]">
                    <Link href={ROUTES.CONFIGURATOR.ROOT}>
                        Try live
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}

export function HeroVariantC(): React.JSX.Element {
    return (
        <section className="relative flex min-h-[90dvh] flex-col items-center justify-center overflow-hidden px-4 py-24 lg:flex-row lg:items-center lg:gap-16">
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

            {/* Left — text */}
            <div className="flex flex-col items-center text-center lg:flex-1 lg:items-start lg:text-left">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[--border-crisp] bg-[--surface-enamel] px-3.5 py-1.5 shadow-[--shadow-enamel] backdrop-blur-md">
                    <Sparkle className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-foreground">AI-Powered Furniture Design</span>
                </div>

                <h1 className="max-w-xl text-balance text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
                    Design Your Perfect{' '}
                    <span className="text-primary">Furniture</span>{' '}
                    in Minutes
                </h1>

                <p className="mt-6 max-w-md text-balance text-lg leading-relaxed text-muted-foreground">
                    Pick a style, choose your materials and colors, and watch AI bring
                    your custom furniture to life — with real-time pricing.
                </p>

                <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
                    <Button asChild size="lg" className="gap-2 px-8 motion-safe:transition-transform motion-safe:active:scale-[0.98]">
                        <Link href={ROUTES.CONFIGURATOR.ROOT}>
                            Start Designing
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="gap-2">
                        <Link href={ROUTES.REGISTER}>Create Free Account</Link>
                    </Button>
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                    {['No design skills needed', 'Real-time pricing', '8 furniture types', 'Instant preview'].map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[--border-crisp] bg-[--surface-enamel] px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-md"
                        >
                            <Lightning className="h-3 w-3 text-primary" />
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Right — interactive card */}
            <div className="mt-16 flex w-full justify-center lg:mt-0 lg:flex-1">
                <HeroConfiguratorCard />
            </div>
        </section>
    );
}
```

**Step 2: Verify no TypeScript errors**

```bash
cd client && npx tsc --noEmit
```

---

## Task 5: Create `HeroVariantSwitcher.tsx` — Dev-Only Picker

**Files:**
- Create: `src/components/sections/hero/HeroVariantSwitcher.tsx`

**Full component:**

```tsx
'use client';

import { useRouter } from 'next/navigation';

type HeroVariant = 'A' | 'B' | 'C';

interface HeroVariantSwitcherProps {
    current: HeroVariant;
}

export function HeroVariantSwitcher({ current }: HeroVariantSwitcherProps): React.JSX.Element {
    const router = useRouter();

    function handleSelect(variant: HeroVariant): void {
        document.cookie = `heroVariant=${variant}; path=/; max-age=86400`;
        router.refresh();
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1 rounded-full border border-border bg-background/90 p-1 shadow-lg backdrop-blur-md">
            <span className="px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Hero
            </span>
            {(['A', 'B', 'C'] as HeroVariant[]).map((v) => (
                <button
                    key={v}
                    onClick={() => handleSelect(v)}
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        current === v
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    aria-label={`Switch to Hero variant ${v}`}
                    aria-pressed={current === v}
                >
                    {v}
                </button>
            ))}
        </div>
    );
}
```

---

## Task 6: Rewrite `HeroSection.tsx` — Orchestrator

**Files:**
- Rewrite: `src/components/sections/HeroSection.tsx`

**Key:** This is a Server Component. Reads `heroVariant` cookie via Next.js `cookies()` API. Renders the matching variant. Conditionally imports `HeroVariantSwitcher` only in dev.

**Full component:**

```tsx
import { cookies } from 'next/headers';
import { HeroVariantA } from './hero/HeroVariantA';
import { HeroVariantB } from './hero/HeroVariantB';
import { HeroVariantC } from './hero/HeroVariantC';
import { HeroVariantSwitcher } from './hero/HeroVariantSwitcher';

type HeroVariant = 'A' | 'B' | 'C';

function resolveVariant(raw: string | undefined): HeroVariant {
    if (raw === 'A' || raw === 'B' || raw === 'C') return raw;
    return 'C'; // default
}

export async function HeroSection(): Promise<React.JSX.Element> {
    const cookieStore = await cookies();
    const variant = resolveVariant(cookieStore.get('heroVariant')?.value);
    const isDev = process.env.NODE_ENV === 'development';

    return (
        <>
            {variant === 'A' && <HeroVariantA />}
            {variant === 'B' && <HeroVariantB />}
            {variant === 'C' && <HeroVariantC />}
            {isDev && <HeroVariantSwitcher current={variant} />}
        </>
    );
}
```

**IMPORTANT:** `HeroSection` is now `async` (uses `await cookies()`). Next.js 16 App Router supports async Server Components natively. This is correct.

**Step 2: Verify TypeScript**

```bash
cd client && npx tsc --noEmit
```

Expected: no output.

**Step 3: Check `HeroVariantB` icon imports**

`HeroVariantB` uses `@phosphor-icons/react` (client import, not `/dist/ssr`). This is correct because it's a `'use client'` component. `HeroVariantC` is also `'use client'`. `HeroVariantA` is a Server Component and MUST import from `@phosphor-icons/react/dist/ssr`.

Verify `HeroVariantA.tsx` imports:
```
import { ArrowRight, Sparkle, Lightning, Armchair } from '@phosphor-icons/react/dist/ssr';
```

And `HeroVariantC.tsx` + `HeroVariantB.tsx` use:
```
import { ... } from '@phosphor-icons/react';
```

**Step 4: Check `Sofa` icon availability**

The `Sofa` icon may not exist in Phosphor. Use `Armchair` instead if needed:
```tsx
import { Armchair } from '@phosphor-icons/react';
// Replace <Sofa ... /> with <Armchair ... />
```

Run `npx tsc --noEmit` — if error about `Sofa`, replace with `Armchair` in `HeroVariantC.tsx`.

---

## Task 7: Verify full dev flow

**Step 1: Start dev server**

```bash
cd client && npm run dev
```

**Step 2: Open browser at `http://localhost:3000`**

Expected: Variant C renders (mini configurator card on right). Switcher visible bottom-right.

**Step 3: Click A → page refreshes → Variant A shows (floating card)**

**Step 4: Click B → page refreshes → Variant B shows (before/after slider)**

**Step 5: Click C → back to C**

**Step 6: Open incognito (no cookie) → should show C (default)**

**Step 7: TypeScript final check**

```bash
cd client && npx tsc --noEmit
```

Expected: no output.

---

## Notes

- **`Sofa` icon:** Phosphor does not have `Sofa` — use `Armchair` in both Variant A and C.
- **`BeforeAfterSlider` placeholder images:** SVG data URIs are used for now. Replace `BEFORE_SRC` / `AFTER_SRC` in `HeroVariantB.tsx` with real room photo URLs when available.
- **Cookie max-age:** 86400 = 24 hours. Sufficient for dev sessions.
- **Production:** `isDev` check ensures switcher never appears in prod. The default variant `C` is returned when no cookie exists.
- **`animate-float` class:** Added to `globals.css`. Only activates if `prefers-reduced-motion` is not set (via `.motion-reduce:animate-none` on the element).
