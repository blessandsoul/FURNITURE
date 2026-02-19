'use client';

import { useTranslations } from 'next-intl';
import { ChatCircle, Wrench, MagnifyingGlass, Truck } from '@phosphor-icons/react';

export function ProcessSection(): React.JSX.Element {
    const t = useTranslations('Home');

    const PROCESS_STEPS = [
        {
            number: '01',
            icon: ChatCircle,
            titleKey: 'process.step1Title' as const,
            descKey: 'process.step1Description' as const,
        },
        {
            number: '02',
            icon: Wrench,
            titleKey: 'process.step2Title' as const,
            descKey: 'process.step2Description' as const,
        },
        {
            number: '03',
            icon: MagnifyingGlass,
            titleKey: 'process.step3Title' as const,
            descKey: 'process.step3Description' as const,
        },
        {
            number: '04',
            icon: Truck,
            titleKey: 'process.step4Title' as const,
            descKey: 'process.step4Description' as const,
        },
    ];

    return (
        <section className="py-20">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <h2 className="text-balance text-2xl font-bold text-foreground md:text-3xl">
                        {t('process.heading')}
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                        {t('process.subheading')}
                    </p>
                </div>

                <div className="relative mx-auto max-w-2xl">
                    {/* Vertical connector line (desktop) */}
                    <div
                        aria-hidden="true"
                        className="absolute left-6 top-8 hidden h-[calc(100%-4rem)] w-0.5 bg-border md:block"
                    />

                    <div className="space-y-10">
                        {PROCESS_STEPS.map(({ number, icon: Icon, titleKey, descKey }) => (
                            <div key={number} className="relative flex gap-6">
                                {/* Step node */}
                                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background">
                                    <Icon className="h-5 w-5 text-primary" />
                                </div>

                                {/* Content */}
                                <div className="pt-2">
                                    <div className="mb-0.5 text-xs font-bold tabular-nums text-muted-foreground">
                                        {number}
                                    </div>
                                    <h3 className="text-base font-semibold text-foreground">{t(titleKey)}</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t(descKey)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
