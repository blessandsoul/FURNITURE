export interface PublicCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    basePrice: number;
    currency: string;
    imageUrl: string | null;
    sortOrder: number;
}

export interface CategoryWithOptions extends PublicCategory {
    optionGroups: PublicOptionGroup[];
}

export interface PublicOptionGroup {
    id: string;
    categoryId: string;
    name: string;
    slug: string;
    description: string | null;
    isRequired: boolean;
    sortOrder: number;
    optionValues: PublicOptionValue[];
}

export interface PublicOptionValue {
    id: string;
    groupId: string;
    label: string;
    slug: string;
    description: string | null;
    priceModifier: number;
    colorHex: string | null;
    imageUrl: string | null;
    promptHint: string | null;
    sortOrder: number;
}
