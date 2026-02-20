'use client';

import { useTranslations } from 'next-intl';
import { Robot, Calculator, Palette } from '@phosphor-icons/react';

export function FeaturesSection(): React.JSX.Element {
    const t = useTranslations('Home');

    const FEATURES = [
        {
            icon: Palette,
            titleKey: 'features.customizableTitle' as const,
            descKey: 'features.customizableDescription' as const,
        },
        {
            icon: Robot,
            titleKey: 'features.aiPreviewsTitle' as const,
            descKey: 'features.aiPreviewsDescription' as const,
        },
        {
            icon: Calculator,
            titleKey: 'features.pricingTitle' as const,
            descKey: 'features.pricingDescription' as const,
        },
    ];

    return (
        <section className="container mx-auto px-4 py-20 md:px-6 lg:px-8">
            <div className="mb-12 text-center">
                <h2 className="text-balance text-2xl font-bold text-foreground md:text-3xl">
                    {t('features.heading')}
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                    {t('features.subheading')}
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {FEATURES.map((feature) => {
                    const Icon = feature.icon;
                    return (
                        <div
                            key={feature.titleKey}
                            className="rounded-xl border border-[--border-crisp] bg-[--surface-enamel] p-6 shadow-[--shadow-enamel] motion-safe:transition-all motion-safe:duration-300 motion-safe:hover:shadow-[--shadow-enamel-hover] motion-safe:hover:-translate-y-0.5"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-1">
                                    <h3 className="mb-2 text-base font-semibold text-foreground">{t(feature.titleKey)}</h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">{t(feature.descKey)}</p>
                                </div>
                                <div className="shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                                    <Icon className="h-5 w-5 text-primary" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
