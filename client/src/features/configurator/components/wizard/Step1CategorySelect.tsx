'use client';

import { useTranslations } from 'next-intl';
import { useCategories } from '@/features/catalog/hooks/useCatalog';
import { useConfigurator } from '../../hooks/useConfigurator';
import { CategoryCard } from '../options/CategoryCard';
import { CategoryGridSkeleton } from '../skeletons/CategoryGridSkeleton';

export function Step1CategorySelect(): React.JSX.Element {
    const t = useTranslations('Configurator');
    const { state, setCategory } = useConfigurator();
    const { data: categories, isLoading, error } = useCategories();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-foreground">{t('categorySelect.heading')}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    {t('categorySelect.subheading')}
                </p>
            </div>

            {isLoading && <CategoryGridSkeleton />}

            {error && (
                <div className="flex items-center justify-center py-12 text-sm text-destructive">
                    {t('categorySelect.errorLoad')}
                </div>
            )}

            {categories && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {categories.map((category) => (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            isSelected={state.selectedCategoryId === category.id}
                            onSelect={() => setCategory(category.id, category.slug)}
                        />
                    ))}
                </div>
            )}

            {!state.selectedCategoryId && !isLoading && (
                <p className="text-center text-xs text-muted-foreground">
                    {t('categorySelect.helperText')}
                </p>
            )}
        </div>
    );
}
