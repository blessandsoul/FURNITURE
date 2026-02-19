'use client';

import { useTranslations } from 'next-intl';
import { Couch, Camera, ArrowRight } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { ConfiguratorMode } from '../../types/configurator.types';

interface Step1ModeSelectProps {
    selectedMode: ConfiguratorMode | null;
    onSelectMode: (mode: ConfiguratorMode) => void;
}

export function Step1ModeSelect({ selectedMode, onSelectMode }: Step1ModeSelectProps): React.JSX.Element {
    const t = useTranslations('Configurator');
    const tCommon = useTranslations('Common');

    const MODES: {
        id: ConfiguratorMode;
        icon: typeof Couch;
        title: string;
        description: string;
        badge?: string;
    }[] = [
        {
            id: 'scratch',
            icon: Couch,
            title: t('modeSelect.scratchTitle'),
            description: t('modeSelect.scratchDescription'),
        },
        {
            id: 'reimagine',
            icon: Camera,
            title: t('modeSelect.reimagineTitle'),
            description: t('modeSelect.reimagineDescription'),
            badge: t('modeSelect.newBadge'),
        },
    ];
    return (
        <div className="flex flex-col items-center gap-6">
            <div className="animate-fade-up text-center">
                <h2 className="text-xl font-bold text-foreground">{t('modeSelect.heading')}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    {t('modeSelect.subheading')}
                </p>
            </div>

            <div className="animate-fade-up delay-75 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
                {MODES.map((mode) => {
                    const isSelected = selectedMode === mode.id;
                    const Icon = mode.icon;

                    return (
                        <button
                            key={mode.id}
                            type="button"
                            onClick={() => onSelectMode(mode.id)}
                            aria-pressed={isSelected}
                            className={cn(
                                'group relative flex flex-col items-center gap-4 rounded-2xl p-8',
                                'border backdrop-blur-md transition-all duration-300',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                                'motion-safe:active:scale-[0.98]',
                                isSelected
                                    ? [
                                          'border-primary bg-primary/5',
                                          'shadow-[0_0_0_2px_oklch(0.28_0.055_48)]',
                                      ]
                                    : [
                                          'border-[--border-crisp] bg-[--surface-enamel]',
                                          'shadow-[--shadow-enamel]',
                                          'hover:border-primary/40',
                                          'hover:shadow-[--shadow-enamel-hover]',
                                          'motion-safe:hover:-translate-y-1',
                                      ],
                            )}
                        >
                            {/* Badge */}
                            {mode.badge && (
                                <span className="absolute right-3 top-3 rounded-full bg-brand-accent/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand-accent">
                                    {mode.badge}
                                </span>
                            )}

                            {/* Icon container */}
                            <div
                                className={cn(
                                    'flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-300',
                                    isSelected
                                        ? 'bg-primary/10'
                                        : 'bg-muted group-hover:bg-primary/5',
                                )}
                            >
                                <Icon
                                    className={cn(
                                        'h-7 w-7 transition-colors duration-300',
                                        isSelected
                                            ? 'text-primary'
                                            : 'text-muted-foreground group-hover:text-primary/70',
                                    )}
                                    weight={isSelected ? 'fill' : 'regular'}
                                />
                            </div>

                            {/* Text */}
                            <div className="text-center">
                                <p
                                    className={cn(
                                        'text-base font-bold leading-tight',
                                        isSelected ? 'text-primary' : 'text-foreground',
                                    )}
                                >
                                    {mode.title}
                                </p>
                                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                                    {mode.description}
                                </p>
                            </div>

                            {/* Arrow hint */}
                            <div
                                className={cn(
                                    'flex items-center gap-1 text-xs font-medium transition-all duration-300',
                                    isSelected
                                        ? 'text-primary'
                                        : 'text-muted-foreground/0 group-hover:text-muted-foreground',
                                )}
                            >
                                {isSelected ? tCommon('selected') : tCommon('select')}
                                <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" weight="bold" />
                            </div>

                            {/* Selected checkmark */}
                            {isSelected && (
                                <div className="absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                                    <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 12 12">
                                        <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
