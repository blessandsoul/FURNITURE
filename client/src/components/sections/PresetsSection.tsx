'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, Sparkle } from '@phosphor-icons/react';
import { ROUTES } from '@/lib/constants/routes';

export function PresetsSection(): React.JSX.Element {
    const t = useTranslations('Home');

    return (
        <section className="py-20">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="mb-10 text-center">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[--border-crisp] bg-[--surface-enamel] px-3.5 py-1.5 shadow-[--shadow-enamel]">
                        <Sparkle className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-semibold text-foreground">{t('presets.badge')}</span>
                    </div>
                    <h2 className="text-balance text-2xl font-bold text-foreground md:text-3xl">
                        {t('presets.heading')}
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                        {t('presets.subheading')}
                    </p>
                </div>

                {/* TODO: Populate with real catalog presets from the API */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-muted/30 py-16">
                    <Sparkle className="mb-3 h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm font-semibold text-foreground">
                        {t('presets.emptyTitle')}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {t('presets.emptyBody')}
                    </p>
                </div>

                <div className="mt-8 text-center">
                    <Link
                        href={`${ROUTES.CONFIGURATOR.ROOT}?step=1&mode=scratch`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    >
                        {t('presets.startFromScratch')}
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
