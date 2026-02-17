import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';

const STEPS = [
    {
        number: '01',
        title: 'Pick a Furniture Type',
        description: 'Choose from sofa, bed, dining table, desk, wardrobe, and more. Eight categories to start from.',
    },
    {
        number: '02',
        title: 'Customize Every Detail',
        description: 'Select color, material, leg style, and size. Watch the price update live as you make each choice.',
    },
    {
        number: '03',
        title: 'Get Your AI Preview',
        description: 'Hit "Generate Design" and receive a photorealistic rendering of your custom furniture within seconds.',
    },
];

export function HowItWorksSection(): React.JSX.Element {
    return (
        <section className="bg-muted/30 py-20">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <h2 className="text-balance text-2xl font-bold text-foreground md:text-3xl">
                        Three steps to your dream furniture
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                        From idea to photorealistic render — the entire process takes under two minutes.
                    </p>
                </div>

                <div className="relative mx-auto max-w-3xl">
                    {/* Connecting line (desktop) */}
                    <div
                        aria-hidden="true"
                        className="absolute left-[calc(50%-1px)] top-6 hidden h-[calc(100%-3rem)] w-0.5 bg-border lg:block"
                    />

                    <div className="space-y-8">
                        {STEPS.map((step, index) => (
                            <div
                                key={step.number}
                                className={`flex items-start gap-6 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                            >
                                <div className="flex-1 lg:text-right">
                                    {index % 2 === 0 ? (
                                        <>
                                            <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                                            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                                        </>
                                    ) : (
                                        <div className="hidden lg:block" />
                                    )}
                                </div>

                                <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background">
                                    <span className="text-sm font-bold tabular-nums text-primary">{step.number}</span>
                                </div>

                                <div className="flex-1">
                                    {index % 2 !== 0 ? (
                                        <>
                                            <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                                            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                                        </>
                                    ) : (
                                        <div className="hidden lg:block" />
                                    )}
                                    {/* Mobile: always show text beside */}
                                    <div className="lg:hidden">
                                        <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Button asChild size="lg" className="gap-2">
                        <Link href={`${ROUTES.CONFIGURATOR.ROOT}?step=1`}>
                            Try it now — it&apos;s free
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
