import { prisma } from '../../libs/prisma.js';
import { designsRepo } from './designs.repo.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../shared/errors/errors.js';
import { decimalToNumber } from './designs.types.js';
import type {
  PublicDesignWithCategory,
  PriceCalculation,
  ConfigSnapshot,
  ConfigSnapshotOption,
} from './designs.types.js';
import type { CreateDesignInput, UpdateDesignInput, CalculatePriceInput } from './designs.schemas.js';
import type { PaginationInput } from '../../shared/schemas/pagination.schema.js';
import type { ServicePaginatedResult } from '../../shared/types/index.js';
import type { Design, OptionValue, OptionGroup, FurnitureCategory } from '@prisma/client';

type OptionValueWithGroup = OptionValue & { group: OptionGroup };

class DesignsService {
  // ─── User: List Designs ─────────────────────────────────────

  async getUserDesigns(
    userId: string,
    pagination: PaginationInput,
  ): Promise<ServicePaginatedResult<PublicDesignWithCategory>> {
    const { items, totalItems } = await designsRepo.findByUserId(userId, pagination);
    return {
      items: items.map((d) => this.toPublicDesignWithCategory(d)),
      totalItems,
    };
  }

  // ─── User: Get Single Design ────────────────────────────────

  async getDesign(designId: string, userId: string): Promise<PublicDesignWithCategory> {
    const design = await designsRepo.findById(designId);
    if (!design) {
      throw new NotFoundError('Design not found', 'DESIGN_NOT_FOUND');
    }
    this.assertOwnership(design, userId);
    return this.toPublicDesignWithCategory(design);
  }

  // ─── User: Create Design ───────────────────────────────────

  async createDesign(userId: string, input: CreateDesignInput): Promise<PublicDesignWithCategory> {
    const priceCalc = await this.validateAndCalculatePrice(input.categoryId, input.optionValueIds);

    const configSnapshot: ConfigSnapshot = {
      basePrice: priceCalc.basePrice,
      currency: priceCalc.currency,
      options: priceCalc.options,
    };

    const design = await designsRepo.executeInTransaction(async (tx) => {
      return designsRepo.createDesign(
        {
          userId,
          categoryId: input.categoryId,
          name: input.name,
          totalPrice: priceCalc.totalPrice,
          currency: priceCalc.currency,
          configSnapshot: configSnapshot as unknown as import('@prisma/client').Prisma.InputJsonValue,
          optionValueIds: input.optionValueIds,
        },
        tx,
      );
    });

    // Re-fetch with relations
    const full = await designsRepo.findById(design.id);
    return this.toPublicDesignWithCategory(full!);
  }

  // ─── User: Update Design ───────────────────────────────────

  async updateDesign(
    designId: string,
    userId: string,
    input: UpdateDesignInput,
  ): Promise<PublicDesignWithCategory> {
    const existing = await designsRepo.findById(designId);
    if (!existing) {
      throw new NotFoundError('Design not found', 'DESIGN_NOT_FOUND');
    }
    this.assertOwnership(existing, userId);

    let priceCalc: PriceCalculation | undefined;
    if (input.optionValueIds) {
      priceCalc = await this.validateAndCalculatePrice(existing.categoryId, input.optionValueIds);
    }

    await designsRepo.executeInTransaction(async (tx) => {
      return designsRepo.updateDesign(
        designId,
        {
          name: input.name,
          totalPrice: priceCalc?.totalPrice,
          configSnapshot: priceCalc
            ? ({
                basePrice: priceCalc.basePrice,
                currency: priceCalc.currency,
                options: priceCalc.options,
              } as unknown as import('@prisma/client').Prisma.InputJsonValue)
            : undefined,
          optionValueIds: input.optionValueIds,
        },
        tx,
      );
    });

    const updated = await designsRepo.findById(designId);
    return this.toPublicDesignWithCategory(updated!);
  }

  // ─── User: Delete Design ───────────────────────────────────

  async deleteDesign(designId: string, userId: string): Promise<void> {
    const design = await designsRepo.findById(designId);
    if (!design) {
      throw new NotFoundError('Design not found', 'DESIGN_NOT_FOUND');
    }
    this.assertOwnership(design, userId);
    await designsRepo.deleteDesign(designId);
  }

  // ─── User: Calculate Price ──────────────────────────────────

  async calculatePrice(input: CalculatePriceInput): Promise<PriceCalculation> {
    return this.validateAndCalculatePrice(input.categoryId, input.optionValueIds);
  }

  // ─── Admin: List All Designs ────────────────────────────────

  async getAllDesigns(
    pagination: PaginationInput,
  ): Promise<ServicePaginatedResult<PublicDesignWithCategory>> {
    const { items, totalItems } = await designsRepo.findAll(pagination);
    return {
      items: items.map((d) => this.toPublicDesignWithCategory(d)),
      totalItems,
    };
  }

  // ─── Price Calculation & Validation ─────────────────────────

  private async validateAndCalculatePrice(
    categoryId: string,
    optionValueIds: string[],
  ): Promise<PriceCalculation> {
    // 1. Validate category exists & is active
    const category = await prisma.furnitureCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category || !category.isActive) {
      throw new NotFoundError('Category not found', 'CATEGORY_NOT_FOUND');
    }

    // 2. Load all option groups for this category
    const optionGroups = await prisma.optionGroup.findMany({
      where: { categoryId, isActive: true },
      include: {
        optionValues: { where: { isActive: true } },
      },
    });

    // 3. Load selected option values with their groups
    const selectedValues = await prisma.optionValue.findMany({
      where: { id: { in: optionValueIds }, isActive: true },
      include: { group: true },
    });

    // 4. Validate every optionValueId was found and belongs to this category
    if (selectedValues.length !== optionValueIds.length) {
      const foundIds = new Set(selectedValues.map((v) => v.id));
      const missing = optionValueIds.filter((id) => !foundIds.has(id));
      throw new BadRequestError(
        `Invalid option value IDs: ${missing.join(', ')}`,
        'INVALID_OPTION_VALUES',
      );
    }

    for (const value of selectedValues) {
      if (value.group.categoryId !== categoryId) {
        throw new BadRequestError(
          `Option value "${value.label}" does not belong to the selected category`,
          'OPTION_VALUE_WRONG_CATEGORY',
        );
      }
    }

    // 5. Validate required option groups have exactly one selection
    const selectionsByGroup = new Map<string, OptionValueWithGroup[]>();
    for (const value of selectedValues) {
      const group = selectionsByGroup.get(value.groupId) ?? [];
      group.push(value);
      selectionsByGroup.set(value.groupId, group);
    }

    for (const group of optionGroups) {
      const selections = selectionsByGroup.get(group.id);
      if (group.isRequired && (!selections || selections.length === 0)) {
        throw new BadRequestError(
          `Required option group "${group.name}" must have a selection`,
          'MISSING_REQUIRED_OPTION',
        );
      }
      if (selections && selections.length > 1) {
        throw new BadRequestError(
          `Option group "${group.name}" allows only one selection`,
          'MULTIPLE_SELECTIONS_NOT_ALLOWED',
        );
      }
    }

    // 6. Calculate price
    const basePrice = decimalToNumber(category.basePrice);
    const options: ConfigSnapshotOption[] = selectedValues.map((v) => ({
      groupName: v.group.name,
      groupSlug: v.group.slug,
      valueLabel: v.label,
      valueSlug: v.slug,
      priceModifier: decimalToNumber(v.priceModifier),
    }));

    const totalModifiers = options.reduce((sum, opt) => sum + opt.priceModifier, 0);
    const totalPrice = basePrice + totalModifiers;

    return {
      basePrice,
      currency: category.currency,
      options,
      totalPrice,
    };
  }

  // ─── Ownership Check ───────────────────────────────────────

  private assertOwnership(design: Design, userId: string): void {
    if (design.userId !== userId) {
      throw new ForbiddenError('You do not have access to this design', 'DESIGN_ACCESS_DENIED');
    }
  }

  // ─── Mappers ────────────────────────────────────────────────

  private toPublicDesignWithCategory(
    design: Design & { category: { name: string; slug: string } },
  ): PublicDesignWithCategory {
    return {
      id: design.id,
      userId: design.userId,
      categoryId: design.categoryId,
      name: design.name,
      totalPrice: decimalToNumber(design.totalPrice),
      currency: design.currency,
      configSnapshot: design.configSnapshot as unknown as ConfigSnapshot,
      imageUrl: design.imageUrl,
      thumbnailUrl: design.thumbnailUrl,
      status: design.status,
      createdAt: design.createdAt.toISOString(),
      updatedAt: design.updatedAt.toISOString(),
      categoryName: design.category.name,
      categorySlug: design.category.slug,
    };
  }
}

export const designsService = new DesignsService();
