import type { FurnitureStyleId, OptionCategory } from '@/features/configurator/types/configurator.types';

export interface SavedDesign {
    id: string;
    name: string;
    styleId: FurnitureStyleId;
    styleLabel: string;
    options: Record<OptionCategory, string | null>;
    optionLabels: Record<OptionCategory, string | null>;
    totalPrice: number;
    imageUrl?: string;
    createdAt: string;
}
