export type DesignStatus = 'DRAFT' | 'GENERATED' | 'QUOTED';

export interface ConfigSnapshotOption {
    groupName: string;
    groupSlug: string;
    valueLabel: string;
    valueSlug: string;
    priceModifier: number;
}

export interface ConfigSnapshot {
    basePrice: number;
    currency: string;
    options: ConfigSnapshotOption[];
}

export interface Design {
    id: string;
    userId: string;
    categoryId: string;
    name: string;
    totalPrice: number;
    currency: string;
    configSnapshot: ConfigSnapshot;
    imageUrl: string | null;
    thumbnailUrl: string | null;
    roomImageUrl: string | null;
    roomThumbnailUrl: string | null;
    status: DesignStatus;
    createdAt: string;
    updatedAt: string;
}

export interface DesignWithCategory extends Design {
    categoryName: string;
    categorySlug: string;
}

export interface PriceCalculation {
    basePrice: number;
    currency: string;
    options: ConfigSnapshotOption[];
    totalPrice: number;
}

export interface CreateDesignRequest {
    categoryId: string;
    name: string;
    optionValueIds: string[];
    roomImageUrl?: string;
    roomThumbnailUrl?: string;
}

export interface UpdateDesignRequest {
    name?: string;
    optionValueIds?: string[];
}

