import type { FurnitureStyleId } from '@/features/configurator/types/configurator.types';

export interface QuoteDesignSummary {
    styleId: FurnitureStyleId;
    styleLabel: string;
    options: { category: string; label: string; priceModifier: number }[];
    totalPrice: number;
    imageUrl?: string;
}

export interface QuoteRequest {
    name: string;
    phone: string;
    email?: string;
    city?: string;
    message?: string;
    design: QuoteDesignSummary;
}

export interface QuoteFormData {
    name: string;
    phone: string;
    email: string;
    city: string;
    message: string;
}
