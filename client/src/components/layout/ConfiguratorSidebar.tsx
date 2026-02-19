'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Couch, Sliders, Images, CheckCircle, FilmStrip, Camera, Sparkle, MagicWand, type Icon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { ConfiguratorStep } from '@/features/configurator/types/configurator.types';

function parseStep(raw: string | null): ConfiguratorStep {
    const n = Number(raw);
    if (n === 2 || n === 3 || n === 4) return n;
    return 1;
}

interface StepContent {
    badge: string;
    title: string;
    subtitle: string;
    tips: { icon: Icon; text: string }[];
    hint: string;
}

export function ConfiguratorSidebar(): React.JSX.Element {
    const t = useTranslations('Configurator');
    const searchParams = useSearchParams();
    const step = parseStep(searchParams.get('step'));
    const urlMode = searchParams.get('mode');
    const isReimagine = urlMode === 'reimagine';
    const isModeSelect = urlMode !== 'scratch' && urlMode !== 'reimagine';

    const MODE_SELECT_CONTENT: StepContent = {
        badge: t('sidebar.modeSelect.badge'),
        title: t('sidebar.modeSelect.title'),
        subtitle: t('sidebar.modeSelect.subtitle'),
        tips: [
            { icon: Couch, text: t('sidebar.modeSelect.tip1') },
            { icon: Camera, text: t('sidebar.modeSelect.tip2') },
            { icon: MagicWand, text: t('sidebar.modeSelect.tip3') },
        ],
        hint: t('sidebar.modeSelect.hint'),
    };

    const SCRATCH_CONTENT: Record<ConfiguratorStep, StepContent> = {
        1: {
            badge: t('sidebar.scratch.step1.badge'),
            title: t('sidebar.scratch.step1.title'),
            subtitle: t('sidebar.scratch.step1.subtitle'),
            tips: [
                { icon: Couch, text: t('sidebar.scratch.step1.tip1') },
                { icon: Sliders, text: t('sidebar.scratch.step1.tip2') },
                { icon: Images, text: t('sidebar.scratch.step1.tip3') },
            ],
            hint: t('sidebar.scratch.step1.hint'),
        },
        2: {
            badge: t('sidebar.scratch.step2.badge'),
            title: t('sidebar.scratch.step2.title'),
            subtitle: t('sidebar.scratch.step2.subtitle'),
            tips: [
                { icon: Sliders, text: t('sidebar.scratch.step2.tip1') },
                { icon: CheckCircle, text: t('sidebar.scratch.step2.tip2') },
                { icon: Images, text: t('sidebar.scratch.step2.tip3') },
            ],
            hint: t('sidebar.scratch.step2.hint'),
        },
        3: {
            badge: t('sidebar.scratch.step3.badge'),
            title: t('sidebar.scratch.step3.title'),
            subtitle: t('sidebar.scratch.step3.subtitle'),
            tips: [
                { icon: Images, text: t('sidebar.scratch.step3.tip1') },
                { icon: CheckCircle, text: t('sidebar.scratch.step3.tip2') },
                { icon: FilmStrip, text: t('sidebar.scratch.step3.tip3') },
            ],
            hint: t('sidebar.scratch.step3.hint'),
        },
        4: {
            badge: t('sidebar.scratch.step4.badge'),
            title: t('sidebar.scratch.step4.title'),
            subtitle: t('sidebar.scratch.step4.subtitle'),
            tips: [
                { icon: FilmStrip, text: t('sidebar.scratch.step4.tip1') },
                { icon: Sliders, text: t('sidebar.scratch.step4.tip2') },
                { icon: CheckCircle, text: t('sidebar.scratch.step4.tip3') },
            ],
            hint: t('sidebar.scratch.step4.hint'),
        },
    };

    const REIMAGINE_CONTENT: Record<1 | 2 | 3, StepContent> = {
        1: {
            badge: t('sidebar.reimagine.step1.badge'),
            title: t('sidebar.reimagine.step1.title'),
            subtitle: t('sidebar.reimagine.step1.subtitle'),
            tips: [
                { icon: Camera, text: t('sidebar.reimagine.step1.tip1') },
                { icon: Couch, text: t('sidebar.reimagine.step1.tip2') },
                { icon: Sparkle, text: t('sidebar.reimagine.step1.tip3') },
            ],
            hint: t('sidebar.reimagine.step1.hint'),
        },
        2: {
            badge: t('sidebar.reimagine.step2.badge'),
            title: t('sidebar.reimagine.step2.title'),
            subtitle: t('sidebar.reimagine.step2.subtitle'),
            tips: [
                { icon: Sparkle, text: t('sidebar.reimagine.step2.tip1') },
                { icon: Sliders, text: t('sidebar.reimagine.step2.tip2') },
                { icon: Images, text: t('sidebar.reimagine.step2.tip3') },
            ],
            hint: t('sidebar.reimagine.step2.hint'),
        },
        3: {
            badge: t('sidebar.reimagine.step3.badge'),
            title: t('sidebar.reimagine.step3.title'),
            subtitle: t('sidebar.reimagine.step3.subtitle'),
            tips: [
                { icon: Images, text: t('sidebar.reimagine.step3.tip1') },
                { icon: CheckCircle, text: t('sidebar.reimagine.step3.tip2') },
                { icon: Sliders, text: t('sidebar.reimagine.step3.tip3') },
            ],
            hint: t('sidebar.reimagine.step3.hint'),
        },
    };

    const content = isModeSelect
        ? MODE_SELECT_CONTENT
        : isReimagine
          ? REIMAGINE_CONTENT[step as 1 | 2 | 3] ?? REIMAGINE_CONTENT[1]
          : SCRATCH_CONTENT[step];

    const stepNumbers = isReimagine ? [1, 2, 3] : [1, 2, 3, 4];

    return (
        <aside className="hidden w-72 shrink-0 flex-col justify-between border-r border-[--border-crisp] bg-[--surface-enamel] px-8 py-10 backdrop-blur-md lg:flex xl:w-80">
            <div className="space-y-7">
                {/* Badge */}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[--border-crisp] bg-background/60 px-3 py-1 text-xs font-semibold text-foreground shadow-[--shadow-enamel]">
                    {isModeSelect ? '✦' : isReimagine ? '📷' : '✦'} {content.badge}
                </span>

                {/* Headline — animates on step/mode change */}
                <div key={`${urlMode ?? 'select'}-${step}`} className="animate-step-in space-y-2">
                    <h2 className="text-2xl font-bold leading-tight tracking-tight text-foreground xl:text-3xl">
                        {content.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        {content.subtitle}
                    </p>
                </div>

                {/* Tips */}
                <ul key={`tips-${urlMode ?? 'select'}-${step}`} className="animate-step-in space-y-3">
                    {content.tips.map(({ icon: TipIcon, text }, i) => (
                        <li
                            key={i}
                            className="flex items-center gap-3 text-sm text-muted-foreground"
                        >
                            <span
                                className={cn(
                                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10',
                                )}
                            >
                                <TipIcon className="h-4 w-4 text-primary" />
                            </span>
                            {text}
                        </li>
                    ))}
                </ul>

                {/* Hint box */}
                <div
                    key={`hint-${urlMode ?? 'select'}-${step}`}
                    className="animate-step-in rounded-xl border border-[--border-crisp] bg-background/50 px-4 py-3"
                >
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        {content.hint}
                    </p>
                </div>
            </div>

            {/* Step progress dots — hidden on mode select screen */}
            {!isModeSelect && (
                <div className="flex items-center gap-2">
                    {stepNumbers.map((s) => (
                        <div
                            key={s}
                            className={cn(
                                'h-1.5 rounded-full transition-all duration-500',
                                s === step
                                    ? 'w-6 bg-primary'
                                    : s < step
                                      ? 'w-3 bg-primary/40'
                                      : 'w-3 bg-border',
                            )}
                        />
                    ))}
                    <span className="ml-2 text-xs text-muted-foreground/60">
                        {isReimagine ? t('sidebar.progressReimagine') : t('sidebar.progressScratch')}
                    </span>
                </div>
            )}
        </aside>
    );
}
