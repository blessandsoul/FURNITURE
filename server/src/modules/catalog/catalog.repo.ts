import { prisma } from '../../libs/prisma.js';
import type { FurnitureCategory, OptionGroup, OptionValue } from '@prisma/client';
import type { CreateCategoryInput, UpdateCategoryInput, CreateOptionGroupInput, UpdateOptionGroupInput, CreateOptionValueInput, UpdateOptionValueInput } from './catalog.schemas.js';

type CategoryWithRelations = FurnitureCategory & {
  optionGroups: (OptionGroup & {
    optionValues: OptionValue[];
  })[];
};

class CatalogRepository {
  // ─── Categories ──────────────────────────────────────────

  async findActiveCategories(): Promise<FurnitureCategory[]> {
    return prisma.furnitureCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findCategoryBySlug(slug: string): Promise<CategoryWithRelations | null> {
    return prisma.furnitureCategory.findUnique({
      where: { slug },
      include: {
        optionGroups: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            optionValues: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });
  }

  async findCategoryById(id: string): Promise<FurnitureCategory | null> {
    return prisma.furnitureCategory.findUnique({
      where: { id },
    });
  }

  async findCategoryBySlugExcluding(slug: string, excludeId: string): Promise<FurnitureCategory | null> {
    return prisma.furnitureCategory.findFirst({
      where: { slug, id: { not: excludeId } },
    });
  }

  async createCategory(data: CreateCategoryInput & { slug: string }): Promise<FurnitureCategory> {
    return prisma.furnitureCategory.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        basePrice: data.basePrice,
        currency: data.currency,
        imageUrl: data.imageUrl ?? null,
        sortOrder: data.sortOrder,
        translations: data.translations ?? undefined,
      },
    });
  }

  async updateCategory(id: string, data: UpdateCategoryInput & { slug?: string }): Promise<FurnitureCategory> {
    return prisma.furnitureCategory.update({
      where: { id },
      data,
    });
  }

  async softDeleteCategory(id: string): Promise<FurnitureCategory> {
    return prisma.furnitureCategory.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ─── Option Groups ────────────────────────────────────────

  async findOptionGroupsByCategory(categoryId: string): Promise<(OptionGroup & { optionValues: OptionValue[] })[]> {
    return prisma.optionGroup.findMany({
      where: { categoryId, isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        optionValues: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async findOptionGroupById(id: string): Promise<OptionGroup | null> {
    return prisma.optionGroup.findUnique({
      where: { id },
    });
  }

  async findOptionGroupBySlug(categoryId: string, slug: string): Promise<OptionGroup | null> {
    return prisma.optionGroup.findUnique({
      where: { categoryId_slug: { categoryId, slug } },
    });
  }

  async findOptionGroupBySlugExcluding(categoryId: string, slug: string, excludeId: string): Promise<OptionGroup | null> {
    return prisma.optionGroup.findFirst({
      where: { categoryId, slug, id: { not: excludeId } },
    });
  }

  async createOptionGroup(data: CreateOptionGroupInput & { slug: string }): Promise<OptionGroup> {
    return prisma.optionGroup.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        isRequired: data.isRequired,
        sortOrder: data.sortOrder,
        translations: data.translations ?? undefined,
      },
    });
  }

  async updateOptionGroup(id: string, data: UpdateOptionGroupInput & { slug?: string }): Promise<OptionGroup> {
    return prisma.optionGroup.update({
      where: { id },
      data,
    });
  }

  async softDeleteOptionGroup(id: string): Promise<OptionGroup> {
    return prisma.optionGroup.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ─── Option Values ────────────────────────────────────────

  async findOptionValueById(id: string): Promise<OptionValue | null> {
    return prisma.optionValue.findUnique({
      where: { id },
    });
  }

  async findOptionValueBySlug(groupId: string, slug: string): Promise<OptionValue | null> {
    return prisma.optionValue.findUnique({
      where: { groupId_slug: { groupId, slug } },
    });
  }

  async findOptionValueBySlugExcluding(groupId: string, slug: string, excludeId: string): Promise<OptionValue | null> {
    return prisma.optionValue.findFirst({
      where: { groupId, slug, id: { not: excludeId } },
    });
  }

  async createOptionValue(data: CreateOptionValueInput & { slug: string }): Promise<OptionValue> {
    return prisma.optionValue.create({
      data: {
        groupId: data.groupId,
        label: data.label,
        slug: data.slug,
        description: data.description ?? null,
        priceModifier: data.priceModifier,
        colorHex: data.colorHex ?? null,
        imageUrl: data.imageUrl ?? null,
        promptHint: data.promptHint ?? null,
        sortOrder: data.sortOrder,
        translations: data.translations ?? undefined,
      },
    });
  }

  async updateOptionValue(id: string, data: UpdateOptionValueInput & { slug?: string }): Promise<OptionValue> {
    return prisma.optionValue.update({
      where: { id },
      data,
    });
  }

  async softDeleteOptionValue(id: string): Promise<OptionValue> {
    return prisma.optionValue.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const catalogRepo = new CatalogRepository();
