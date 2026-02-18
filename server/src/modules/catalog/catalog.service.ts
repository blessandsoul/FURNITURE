import { redis } from '../../libs/redis.js';
import { catalogRepo } from './catalog.repo.js';
import { NotFoundError, ConflictError } from '../../shared/errors/errors.js';
import { decimalToNumber } from './catalog.types.js';
import type { PublicCategory, CategoryWithOptions, PublicOptionGroup, PublicOptionValue } from './catalog.types.js';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateOptionGroupInput,
  UpdateOptionGroupInput,
  CreateOptionValueInput,
  UpdateOptionValueInput,
} from './catalog.schemas.js';
import type { FurnitureCategory, OptionGroup, OptionValue } from '@prisma/client';

const CACHE_TTL = 300; // 5 minutes
const CACHE_KEY_CATEGORIES = 'catalog:categories';
const CACHE_KEY_OPTIONS_PREFIX = 'catalog:options:';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

class CatalogService {
  // ─── Public Reads ──────────────────────────────────────────

  async getActiveCategories(): Promise<PublicCategory[]> {
    const cached = await redis.get(CACHE_KEY_CATEGORIES);
    if (cached) {
      return JSON.parse(cached) as PublicCategory[];
    }

    const categories = await catalogRepo.findActiveCategories();
    const result = categories.map((c) => this.toPublicCategory(c));

    await redis.set(CACHE_KEY_CATEGORIES, JSON.stringify(result), 'EX', CACHE_TTL);
    return result;
  }

  async getCategoryBySlug(slug: string): Promise<CategoryWithOptions> {
    const category = await catalogRepo.findCategoryBySlug(slug);
    if (!category || !category.isActive) {
      throw new NotFoundError('Category not found', 'CATEGORY_NOT_FOUND');
    }

    return {
      ...this.toPublicCategory(category),
      optionGroups: category.optionGroups.map((g) => this.toPublicOptionGroup(g)),
    };
  }

  async getOptionsByCategory(categoryId: string): Promise<PublicOptionGroup[]> {
    const cacheKey = `${CACHE_KEY_OPTIONS_PREFIX}${categoryId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as PublicOptionGroup[];
    }

    const category = await catalogRepo.findCategoryById(categoryId);
    if (!category || !category.isActive) {
      throw new NotFoundError('Category not found', 'CATEGORY_NOT_FOUND');
    }

    const groups = await catalogRepo.findOptionGroupsByCategory(categoryId);
    const result = groups.map((g) => this.toPublicOptionGroup(g));

    await redis.set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL);
    return result;
  }

  // ─── Admin: Categories ─────────────────────────────────────

  async createCategory(input: CreateCategoryInput): Promise<PublicCategory> {
    const slug = slugify(input.name);

    const existing = await catalogRepo.findCategoryBySlug(slug);
    if (existing) {
      throw new ConflictError('A category with this name already exists', 'CATEGORY_SLUG_EXISTS');
    }

    const category = await catalogRepo.createCategory({ ...input, slug });
    await this.invalidateCategoryCache();
    return this.toPublicCategory(category);
  }

  async updateCategory(id: string, input: UpdateCategoryInput): Promise<PublicCategory> {
    const category = await catalogRepo.findCategoryById(id);
    if (!category) {
      throw new NotFoundError('Category not found', 'CATEGORY_NOT_FOUND');
    }

    const updateData: UpdateCategoryInput & { slug?: string } = { ...input };

    if (input.name) {
      const slug = slugify(input.name);
      const conflict = await catalogRepo.findCategoryBySlugExcluding(slug, id);
      if (conflict) {
        throw new ConflictError('A category with this name already exists', 'CATEGORY_SLUG_EXISTS');
      }
      updateData.slug = slug;
    }

    const updated = await catalogRepo.updateCategory(id, updateData);
    await this.invalidateCategoryCache();
    return this.toPublicCategory(updated);
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await catalogRepo.findCategoryById(id);
    if (!category) {
      throw new NotFoundError('Category not found', 'CATEGORY_NOT_FOUND');
    }

    await catalogRepo.softDeleteCategory(id);
    await this.invalidateCategoryCache();
  }

  // ─── Admin: Option Groups ─────────────────────────────────

  async createOptionGroup(input: CreateOptionGroupInput): Promise<PublicOptionGroup> {
    const category = await catalogRepo.findCategoryById(input.categoryId);
    if (!category) {
      throw new NotFoundError('Category not found', 'CATEGORY_NOT_FOUND');
    }

    const slug = slugify(input.name);

    const existing = await catalogRepo.findOptionGroupBySlug(input.categoryId, slug);
    if (existing) {
      throw new ConflictError('An option group with this name already exists in this category', 'OPTION_GROUP_SLUG_EXISTS');
    }

    const group = await catalogRepo.createOptionGroup({ ...input, slug });
    await this.invalidateOptionsCache(input.categoryId);
    return { ...this.toPublicOptionGroupBase(group), optionValues: [] };
  }

  async updateOptionGroup(id: string, input: UpdateOptionGroupInput): Promise<PublicOptionGroup> {
    const group = await catalogRepo.findOptionGroupById(id);
    if (!group) {
      throw new NotFoundError('Option group not found', 'OPTION_GROUP_NOT_FOUND');
    }

    const updateData: UpdateOptionGroupInput & { slug?: string } = { ...input };

    if (input.name) {
      const slug = slugify(input.name);
      const conflict = await catalogRepo.findOptionGroupBySlugExcluding(group.categoryId, slug, id);
      if (conflict) {
        throw new ConflictError('An option group with this name already exists in this category', 'OPTION_GROUP_SLUG_EXISTS');
      }
      updateData.slug = slug;
    }

    const updated = await catalogRepo.updateOptionGroup(id, updateData);
    await this.invalidateOptionsCache(group.categoryId);

    const groups = await catalogRepo.findOptionGroupsByCategory(group.categoryId);
    const fullGroup = groups.find((g) => g.id === id);
    return fullGroup
      ? this.toPublicOptionGroup(fullGroup)
      : { ...this.toPublicOptionGroupBase(updated), optionValues: [] };
  }

  async deleteOptionGroup(id: string): Promise<void> {
    const group = await catalogRepo.findOptionGroupById(id);
    if (!group) {
      throw new NotFoundError('Option group not found', 'OPTION_GROUP_NOT_FOUND');
    }

    await catalogRepo.softDeleteOptionGroup(id);
    await this.invalidateOptionsCache(group.categoryId);
  }

  // ─── Admin: Option Values ─────────────────────────────────

  async createOptionValue(input: CreateOptionValueInput): Promise<PublicOptionValue> {
    const group = await catalogRepo.findOptionGroupById(input.groupId);
    if (!group) {
      throw new NotFoundError('Option group not found', 'OPTION_GROUP_NOT_FOUND');
    }

    const slug = slugify(input.label);

    const existing = await catalogRepo.findOptionValueBySlug(input.groupId, slug);
    if (existing) {
      throw new ConflictError('An option value with this label already exists in this group', 'OPTION_VALUE_SLUG_EXISTS');
    }

    const value = await catalogRepo.createOptionValue({ ...input, slug });
    await this.invalidateOptionsCache(group.categoryId);
    return this.toPublicOptionValue(value);
  }

  async updateOptionValue(id: string, input: UpdateOptionValueInput): Promise<PublicOptionValue> {
    const value = await catalogRepo.findOptionValueById(id);
    if (!value) {
      throw new NotFoundError('Option value not found', 'OPTION_VALUE_NOT_FOUND');
    }

    const updateData: UpdateOptionValueInput & { slug?: string } = { ...input };

    if (input.label) {
      const slug = slugify(input.label);
      const conflict = await catalogRepo.findOptionValueBySlugExcluding(value.groupId, slug, id);
      if (conflict) {
        throw new ConflictError('An option value with this label already exists in this group', 'OPTION_VALUE_SLUG_EXISTS');
      }
      updateData.slug = slug;
    }

    const updated = await catalogRepo.updateOptionValue(id, updateData);

    // Need the group to get categoryId for cache invalidation
    const group = await catalogRepo.findOptionGroupById(value.groupId);
    if (group) {
      await this.invalidateOptionsCache(group.categoryId);
    }

    return this.toPublicOptionValue(updated);
  }

  async deleteOptionValue(id: string): Promise<void> {
    const value = await catalogRepo.findOptionValueById(id);
    if (!value) {
      throw new NotFoundError('Option value not found', 'OPTION_VALUE_NOT_FOUND');
    }

    await catalogRepo.softDeleteOptionValue(id);

    const group = await catalogRepo.findOptionGroupById(value.groupId);
    if (group) {
      await this.invalidateOptionsCache(group.categoryId);
    }
  }

  // ─── Cache Invalidation ────────────────────────────────────

  private async invalidateCategoryCache(): Promise<void> {
    await redis.del(CACHE_KEY_CATEGORIES);
  }

  private async invalidateOptionsCache(categoryId: string): Promise<void> {
    await redis.del(`${CACHE_KEY_OPTIONS_PREFIX}${categoryId}`);
    // Also invalidate categories list since it's a related change
    await redis.del(CACHE_KEY_CATEGORIES);
  }

  // ─── Mappers ───────────────────────────────────────────────

  private toPublicCategory(category: FurnitureCategory): PublicCategory {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      basePrice: decimalToNumber(category.basePrice),
      currency: category.currency,
      imageUrl: category.imageUrl,
      sortOrder: category.sortOrder,
    };
  }

  private toPublicOptionGroupBase(group: OptionGroup): Omit<PublicOptionGroup, 'optionValues'> {
    return {
      id: group.id,
      categoryId: group.categoryId,
      name: group.name,
      slug: group.slug,
      description: group.description,
      isRequired: group.isRequired,
      sortOrder: group.sortOrder,
    };
  }

  private toPublicOptionGroup(group: OptionGroup & { optionValues: OptionValue[] }): PublicOptionGroup {
    return {
      ...this.toPublicOptionGroupBase(group),
      optionValues: group.optionValues.map((v) => this.toPublicOptionValue(v)),
    };
  }

  private toPublicOptionValue(value: OptionValue): PublicOptionValue {
    return {
      id: value.id,
      groupId: value.groupId,
      label: value.label,
      slug: value.slug,
      description: value.description,
      priceModifier: decimalToNumber(value.priceModifier),
      colorHex: value.colorHex,
      imageUrl: value.imageUrl,
      promptHint: value.promptHint,
      sortOrder: value.sortOrder,
    };
  }
}

export const catalogService = new CatalogService();
