'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import {
    Armchair,
    Bed,
    BookOpen,
    Coffee,
    Couch,
    ForkKnife,
    Monitor,
    Package,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { PublicCategory } from '@/features/catalog/types/catalog.types';
import { getTranslatedField } from '@/features/catalog/utils/getTranslatedField';

/**
 * Maps category slugs to Phosphor icons. Falls back to Package for unknown categories.
 */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    sofa: Couch,
    armchair: Armchair,
    bed: Bed,
    'dining-table': ForkKnife,
    'coffee-table': Coffee,
    wardrobe: Package,
    bookshelf: BookOpen,
    desk: Monitor,
};

interface CategoryCardProps {
    category: PublicCategory;
    isSelected: boolean;
    onSelect: () => void;
}

export function CategoryCard({ category, isSelected, onSelect }: CategoryCardProps): React.JSX.Element {
    const locale = useLocale();
    const t = useTranslations('Configurator');
    const Icon = ICON_MAP[category.slug] ?? Package;

    return (
        <button
            type="button"
            onClick={onSelect}
            aria-pressed={isSelected}
            className={cn(
                'group relative flex flex-col items-center gap-3 rounded-xl p-5',
                'border transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                'motion-safe:active:scale-[0.98]',
                isSelected
                    ? [
                          'border-primary',
                          'bg-[--surface-enamel] backdrop-blur-md',
                          'shadow-[0_0_0_2px_hsl(var(--primary))]',
                      ]
                    : [
                          'border-[--border-crisp] bg-[--surface-enamel] backdrop-blur-md',
                          'hover:border-primary/40',
                          'hover:shadow-[--shadow-enamel-hover] hover:-translate-y-0.5',
                          'shadow-[--shadow-enamel]',
                      ],
            )}
        >
            {category.imageUrl ? (
                <div className={cn(
                    'relative h-12 w-12 overflow-hidden rounded-lg transition-colors duration-200',
                    isSelected ? 'ring-2 ring-primary/20' : '',
                )}>
                    <Image
                        src={category.imageUrl}
                        alt={getTranslatedField(category, 'name', locale)}
                        fill
                        className="object-cover"
                        sizes="48px"
                    />
                </div>
            ) : (
                <div
                    className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-lg transition-colors duration-200',
                        isSelected ? 'bg-primary/10' : 'bg-muted group-hover:bg-primary/5',
                    )}
                >
                    <Icon
                        className={cn(
                            'h-6 w-6 transition-colors duration-200',
                            isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/70',
                        )}
                    />
                </div>
            )}

            <div className="text-center">
                <p
                    className={cn(
                        'text-sm font-semibold leading-tight',
                        isSelected ? 'text-primary' : 'text-foreground',
                    )}
                >
                    {getTranslatedField(category, 'name', locale)}
                </p>
                {category.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                        {getTranslatedField(category, 'description', locale)}
                    </p>
                )}
            </div>

            <div
                className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums',
                    isSelected
                        ? 'bg-primary/10 text-primary'
                        : 'bg-secondary text-secondary-foreground',
                )}
            >
                {t('options.fromPrice', { price: `${category.currency} ${category.basePrice}` })}
            </div>

            {isSelected && (
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <svg className="h-3 w-3 text-primary-foreground" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                </div>
            )}
        </button>
    );
}
