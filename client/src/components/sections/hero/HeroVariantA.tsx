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
