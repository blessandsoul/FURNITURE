'use client';

import { useCallback } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useCategoryBySlug } from '@/features/catalog/hooks/useCatalog';
import { getTranslatedField } from '@/features/catalog/utils/getTranslatedField';
import type { PublicOptionGroup } from '@/features/catalog/types/catalog.types';
import { useConfigurator } from '../../hooks/useConfigurator';
import { OptionGroup } from '../options/OptionGroup';
import { PricePanel } from '../pricing/PricePanel';

const MAX_PLACEMENT_CHARS = 500;

export function Step2RoomCustomize(): React.JSX.Element {
    const t = useTranslations('Configurator');
    const locale = useLocale();
    const { state, toggleOptionValue, setPlacementInstructions } = useConfigurator();
    const { selectedCategorySlug, selectedOptionValueIds, roomRedesign } = state;

    const { data: category, isLoading } = useCategoryBySlug(selectedCategorySlug);

    const handleSelect = useCallback(
        (group: PublicOptionGroup, valueId: string) => {
            const groupValueIds = group.optionValues.map((v) => v.id);
            toggleOptionValue(group.id, valueId, group.isRequired, groupValueIds);
        },
        [toggleOptionValue],
    );

    const handlePlacementChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const text = e.target.value;
            if (text.length <= MAX_PLACEMENT_CHARS) {
                setPlacementInstructions(text);
            }
        },
        [setPlacementInstructions],
    );

    if (!selectedCategorySlug) {
        return (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                {t('roomCustomize.uploadFirst')}
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <div className="h-6 w-48 animate-pulse rounded bg-muted" />
                    <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
                </div>
                <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                    <div className="space-y-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                                <div className="flex flex-wrap gap-2">
                                    {Array.from({ length: 4 }).map((_, j) => (
                                        <div key={j} className="h-10 w-20 animate-pulse rounded-lg bg-muted" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="h-48 animate-pulse rounded-xl bg-muted lg:sticky lg:top-6" />
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                {t('customize.categoryNotFound')}
            </div>
        );
    }

    const sortedGroups = [...category.optionGroups].sort((a, b) => a.sortOrder - b.sortOrder);

    return (
        <div className="space-y-6">
            {/* Room preview strip */}
            {roomRedesign.roomThumbnailUrl && (
                <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 px-3 py-2">
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg">
                        <Image
                            src={roomRedesign.roomThumbnailUrl}
                            alt="Your room"
                            fill
                            className="object-cover"
                            sizes="64px"
                            unoptimized
                        />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-foreground">{t('roomCustomize.yourRoom')}</p>
                        <p className="text-[11px] text-muted-foreground">
                            {t('roomCustomize.configureDescription', { name: getTranslatedField(category, 'name', locale).toLowerCase() })}
                        </p>
                    </div>
                </div>
            )}

            <div>
                <h2 className="text-xl font-bold text-foreground">
                    {t('roomCustomize.heading', { name: getTranslatedField(category, 'name', locale) })}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    {t('roomCustomize.subheading')}
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                <div className="space-y-6">
                    {/* Option groups (same as scratch mode) */}
                    {sortedGroups.map((group) => {
                        const selectedValueId = group.optionValues.find(
                            (v) => selectedOptionValueIds.includes(v.id),
                        )?.id ?? null;

                        return (
                            <OptionGroup
                                key={group.id}
                                group={group}
                                selectedValueId={selectedValueId}
                                onSelect={(valueId) => handleSelect(group, valueId)}
                            />
                        );
                    })}

                    {/* Placement instructions */}
                    <div className="space-y-2">
                        <div className="flex items-baseline justify-between">
                            <label
                                htmlFor="placement-instructions"
                                className="text-sm font-semibold text-foreground"
                            >
                                {t('roomCustomize.placementLabel')}
                                <span className="ml-1 text-xs font-normal text-muted-foreground">{t('roomCustomize.optional')}</span>
                            </label>
                            <span className="text-[11px] text-muted-foreground">
                                {roomRedesign.placementInstructions.length}/{MAX_PLACEMENT_CHARS}
                            </span>
                        </div>
                        <textarea
                            id="placement-instructions"
                            value={roomRedesign.placementInstructions}
                            onChange={handlePlacementChange}
                            placeholder={t('roomCustomize.placementPlaceholder')}
                            rows={3}
                            maxLength={MAX_PLACEMENT_CHARS}
                            className="w-full resize-none rounded-xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <p className="text-[11px] text-muted-foreground/60">
                            {t('roomCustomize.placementHint')}
                        </p>
                    </div>
                </div>

                <div className="lg:sticky lg:top-6 lg:self-start">
                    <PricePanel category={category} />
                </div>
            </div>
        </div>
    );
}
