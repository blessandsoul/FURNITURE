import type { Decimal } from '@prisma/client/runtime/library';
import type { DesignStatus } from '@prisma/client';

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

export interface PublicDesign {
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

export interface PublicDesignWithCategory extends PublicDesign {
  categoryName: string;
  categorySlug: string;
}

export interface PriceCalculation {
  basePrice: number;
  currency: string;
  options: ConfigSnapshotOption[];
  totalPrice: number;
}

/** Converts a Prisma Decimal to a plain number for JSON serialization */
export function decimalToNumber(value: Decimal): number {
  return Number(value);
}
