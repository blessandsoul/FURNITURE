'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';

export function HowItWorksSection(): React.JSX.Element {
    const t = useTranslations('Home');

    const STEPS = [
        {
            number: '01',
            titleKey: 'howItWorks.step1Title' as const,
            descKey: 'howItWorks.step1Description' as const,
        },
        {
            number: '02',
            titleKey: 'howItWorks.step2Title' as const,
            descKey: 'howItWorks.step2Description' as const,
        },
        {
            number: '03',
            titleKey: 'howItWorks.step3Title' as const,
            descKey: 'howItWorks.step3Description' as const,
        },
    ];

    return (
        <section className="bg-muted/30 py-20">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <h2 className="text-balance text-2xl font-bold text-foreground md:text-3xl">
                        {t('howItWorks.heading')}
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                        {t('howItWorks.subheading')}
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
                                            <h3 className="text-base font-semibold text-foreground">{t(step.titleKey)}</h3>
                                            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{t(step.descKey)}</p>
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
                                            <h3 className="text-base font-semibold text-foreground">{t(step.titleKey)}</h3>
                                            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{t(step.descKey)}</p>
                                        </>
                                    ) : (
                                        <div className="hidden lg:block" />
                                    )}
                                    {/* Mobile: always show text beside */}
                                    <div className="lg:hidden">
                                        <h3 className="text-base font-semibold text-foreground">{t(step.titleKey)}</h3>
                                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{t(step.descKey)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Button asChild size="lg" className="gap-2">
                        <Link href={ROUTES.CONFIGURATOR.ROOT}>
                            {t('howItWorks.cta')}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
