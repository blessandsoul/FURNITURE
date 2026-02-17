import Link from 'next/link';
import { ArrowRight, Sparkle, Lightning } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';

export function HeroSection(): React.JSX.Element {
    return (
        <section className="relative flex min-h-[90dvh] flex-col items-center justify-center overflow-hidden px-4 py-24">
            {/* Subtle geometric background */}
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
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[--border-crisp] bg-[--surface-enamel] px-3.5 py-1.5 backdrop-blur-md shadow-[--shadow-enamel]">
                <Sparkle className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">AI-Powered Furniture Design</span>
            </div>

            {/* Headline */}
            <h1 className="mx-auto max-w-3xl text-balance text-center text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Design Your Perfect
                <br />
                <span className="text-primary">Furniture</span>
                {' '}in Minutes
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-balance text-center text-lg text-muted-foreground leading-relaxed">
                Pick a style, choose your materials and colors, and watch AI bring
                your custom furniture to life — with real-time pricing.
            </p>

            {/* CTA */}
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="gap-2 px-8 motion-safe:transition-transform motion-safe:active:scale-[0.98]">
                    <Link href={`${ROUTES.CONFIGURATOR.ROOT}?step=1`}>
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

            {/* Social proof tags */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
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
        </section>
    );
}
