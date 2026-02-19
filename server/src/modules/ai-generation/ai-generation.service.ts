import fs from 'node:fs/promises';
import { redis } from '../../libs/redis.js';
import { logger } from '../../libs/logger.js';
import { env } from '../../config/env.js';
import { getGeminiClient } from '../../libs/gemini.js';
import { saveGeneratedImage } from '../../libs/image-storage.js';
import { resolveRoomImagePath } from '../../libs/room-image-storage.js';
import { aiGenerationRepo } from './ai-generation.repo.js';
import { creditsService } from '../credits/credits.service.js';
import { buildPrompt, buildReimaginePrompt } from './prompt-builder.js';
import { BadRequestError, NotFoundError, ForbiddenError, InternalError } from '../../shared/errors/errors.js';
import type { PublicAiGeneration, PublicGenerationStatus } from './ai-generation.types.js';
import type { GenerateInput, AdminGenerationsFilter, UserGenerationsFilter } from './ai-generation.schemas.js';
import type { PaginationInput } from '../../shared/schemas/pagination.schema.js';
import type { ServicePaginatedResult } from '../../shared/types/index.js';
import type { AiGeneration } from '@prisma/client';
import type { PromptBuilderInput, PromptBuilderOutput } from './prompt-builder.js';

// ─── Constants ──────────────────────────────────────────────

const FREE_DAILY_LIMIT = 3;
const LOCK_TTL = 120; // seconds
const DAILY_COUNT_TTL = 86400; // seconds (24h)
const GENERATION_TIMEOUT_MS = 60_000; // 60 seconds
const MAX_RETRIES = 1; // retry once on empty image response

// ─── Service ────────────────────────────────────────────────

class AiGenerationService {
  // ─── User: Generate Image ─────────────────────────────────

  async generate(userId: string, input: GenerateInput): Promise<PublicAiGeneration> {
    const startTime = Date.now();
    let generationId: string | null = null;
    let wasFree = false;
    let creditsUsed = 0;

    // 1. Acquire Redis lock — prevent concurrent generations per user
    const lockKey = `gen_lock:${userId}`;
    const locked = await redis.set(lockKey, '1', 'EX', LOCK_TTL, 'NX');
    if (!locked) {
      throw new BadRequestError(
        'A generation is already in progress. Please wait for it to complete.',
        'GENERATION_IN_PROGRESS',
      );
    }

    try {
      // 2. Check daily free limit
      const today = new Date().toISOString().slice(0, 10);
      const countKey = `gen_count:${userId}:${today}`;
      const dailyCount = parseInt((await redis.get(countKey)) ?? '0', 10);

      if (dailyCount < FREE_DAILY_LIMIT) {
        wasFree = true;
      } else {
        // Deduct 1 credit — throws INSUFFICIENT_CREDITS if balance is too low
        await creditsService.deductCredits(userId, 1, input.designId);
        creditsUsed = 1;
      }

      // 3. Load design with full relations for prompt building
      const design = await aiGenerationRepo.findDesignForGeneration(input.designId);
      if (!design) {
        throw new NotFoundError('Design not found', 'DESIGN_NOT_FOUND');
      }
      if (design.userId !== userId) {
        throw new ForbiddenError('You do not have access to this design', 'DESIGN_ACCESS_DENIED');
      }

      // 4. Build prompt — data-driven, no hardcoded furniture types
      const isReimagine = !!input.roomImageUrl;

      const sortedOptions = [...design.optionItems]
        .sort((a, b) => a.optionValue.group.sortOrder - b.optionValue.group.sortOrder);

      const basePromptInput: PromptBuilderInput = {
        categoryName: design.category.name,
        categoryDescription: design.category.description,
        options: sortedOptions.map((item) => ({
          groupName: item.optionValue.group.name,
          groupSlug: item.optionValue.group.slug,
          valueLabel: item.optionValue.label,
          promptHint: item.optionValue.promptHint,
        })),
        freeText: input.freeText ?? null,
      };

      let promptOutput: PromptBuilderOutput;
      let roomImageBase64: string | undefined;

      if (isReimagine) {
        promptOutput = buildReimaginePrompt({
          ...basePromptInput,
          placementInstructions: input.placementInstructions ?? null,
        });

        // Read room image from disk and convert to base64 for Gemini
        const roomImagePath = resolveRoomImagePath(input.roomImageUrl!);
        const roomImageBuffer = await fs.readFile(roomImagePath);
        roomImageBase64 = roomImageBuffer.toString('base64');
      } else {
        promptOutput = buildPrompt(basePromptInput);
      }

      // 5. Create AiGeneration record (status=PROCESSING)
      const generation = await aiGenerationRepo.create({
        userId,
        designId: input.designId,
        prompt: promptOutput.fullPromptForLog,
        userFreeText: input.freeText ?? null,
        model: env.GEMINI_MODEL,
        status: 'PROCESSING',
        wasFree,
        creditsUsed,
        generationType: isReimagine ? 'REIMAGINE' : 'SCRATCH',
        roomImageUrl: input.roomImageUrl ?? null,
        placementInstructions: input.placementInstructions ?? null,
      });
      generationId = generation.id;

      // 6. Call Gemini API (multimodal if reimagine, text-only if scratch)
      const geminiResult = await this.callGemini(promptOutput, roomImageBase64);

      // 7. Save image to disk + generate thumbnail
      const { imageUrl, thumbnailUrl } = await saveGeneratedImage(
        userId,
        generationId,
        geminiResult.base64Data,
      );

      // 8. Update records
      const durationMs = Date.now() - startTime;

      await aiGenerationRepo.markCompleted(generationId, {
        imageUrl,
        thumbnailUrl,
        promptTokens: geminiResult.promptTokens,
        totalTokens: geminiResult.totalTokens,
        durationMs,
      });

      await aiGenerationRepo.updateDesignImage(input.designId, {
        imageUrl,
        thumbnailUrl,
        status: 'GENERATED',
      });

      // Increment daily counter
      await redis.incr(countKey);
      await redis.expire(countKey, DAILY_COUNT_TTL);

      // 9. Fetch and return the completed generation
      const completed = await aiGenerationRepo.findById(generationId);
      return this.toPublicGeneration(completed!);

    } catch (error) {
      // ON ERROR: mark generation failed, refund credits if charged
      const durationMs = Date.now() - startTime;

      if (generationId) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        try {
          await aiGenerationRepo.markFailed(generationId, errorMessage, durationMs);
        } catch (markError) {
          logger.error({ err: markError }, 'Failed to mark generation as failed');
        }
      }

      if (creditsUsed > 0) {
        try {
          await creditsService.refundCredits(userId, creditsUsed, generationId ?? undefined);
          logger.info(`Refunded ${creditsUsed} credit(s) for failed generation ${generationId}`);
        } catch (refundError) {
          logger.error({ err: refundError, generationId }, 'Failed to refund credits for failed generation');
        }
      }

      throw error;
    } finally {
      // Always release lock
      await redis.del(lockKey);
    }
  }

  // ─── User: Generation History ─────────────────────────────

  async getUserGenerations(
    userId: string,
    pagination: PaginationInput,
    filters?: UserGenerationsFilter,
  ): Promise<ServicePaginatedResult<PublicAiGeneration>> {
    const { items, totalItems } = await aiGenerationRepo.findByUserId(userId, pagination, filters);
    return {
      items: items.map((g) => this.toPublicGeneration(g)),
      totalItems,
    };
  }

  // ─── User: Single Generation ──────────────────────────────

  async getGeneration(id: string, userId: string): Promise<PublicAiGeneration> {
    const generation = await aiGenerationRepo.findById(id);
    if (!generation) {
      throw new NotFoundError('Generation not found', 'GENERATION_NOT_FOUND');
    }
    if (generation.userId !== userId) {
      throw new ForbiddenError('You do not have access to this generation', 'GENERATION_ACCESS_DENIED');
    }
    return this.toPublicGeneration(generation);
  }

  // ─── User: Status (free remaining + credit balance) ───────

  async getStatus(userId: string): Promise<PublicGenerationStatus> {
    const today = new Date().toISOString().slice(0, 10);
    const countKey = `gen_count:${userId}:${today}`;
    const dailyCount = parseInt((await redis.get(countKey)) ?? '0', 10);
    const freeRemaining = Math.max(0, FREE_DAILY_LIMIT - dailyCount);

    const balance = await creditsService.getBalance(userId);

    return {
      freeRemaining,
      creditBalance: balance.balance,
    };
  }

  // ─── Admin: All Generations ───────────────────────────────

  async adminGetGenerations(
    pagination: PaginationInput,
    filters?: AdminGenerationsFilter,
  ): Promise<ServicePaginatedResult<PublicAiGeneration>> {
    const { items, totalItems } = await aiGenerationRepo.findAll(pagination, filters);
    return {
      items: items.map((g) => this.toPublicGeneration(g)),
      totalItems,
    };
  }

  // ─── Gemini API Call ──────────────────────────────────────

  private async callGemini(
    promptOutput: { systemInstruction: string; generationPrompt: string },
    roomImageBase64?: string,
  ): Promise<{
    base64Data: string;
    promptTokens: number | null;
    totalTokens: number | null;
  }> {
    const ai = getGeminiClient();
    const model = env.GEMINI_MODEL;
    let lastError: unknown = null;

    // Build contents: multimodal if room image provided, text-only otherwise
    const contents: string | Array<{ inlineData?: { data: string; mimeType: string }; text?: string }> =
      roomImageBase64
        ? [
            { inlineData: { data: roomImageBase64, mimeType: 'image/png' } },
            { text: promptOutput.generationPrompt },
          ]
        : promptOutput.generationPrompt;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        logger.warn(`Retrying Gemini image generation (attempt ${attempt + 1})`);
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);

        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: promptOutput.systemInstruction,
            responseModalities: ['IMAGE'],
            temperature: 0.4,
            abortSignal: controller.signal,
          },
        });

        clearTimeout(timeoutId);

        // Check for prompt-level safety block
        if (response.promptFeedback?.blockReason) {
          logger.warn({ blockReason: response.promptFeedback.blockReason }, 'Gemini blocked the prompt');
          throw new BadRequestError(
            'The AI could not generate this image. Try adjusting your description.',
            'AI_PROMPT_BLOCKED',
          );
        }

        // Check for candidate-level safety block
        const candidate = response.candidates?.[0];
        if (candidate?.finishReason === 'SAFETY') {
          logger.warn('Gemini generation finished due to SAFETY filter');
          throw new BadRequestError(
            'The AI could not generate this image due to content restrictions. Try adjusting your description.',
            'AI_SAFETY_BLOCKED',
          );
        }

        // Extract image data from response parts
        const parts = candidate?.content?.parts;
        if (!parts || parts.length === 0) {
          lastError = new Error('No parts in Gemini response');
          continue; // retry
        }

        const imagePart = parts.find(
          (part) => part.inlineData?.data && part.inlineData?.mimeType?.startsWith('image/'),
        );

        if (!imagePart?.inlineData?.data) {
          lastError = new Error('No image data in Gemini response parts');
          continue; // retry
        }

        const usage = response.usageMetadata;

        return {
          base64Data: imagePart.inlineData.data,
          promptTokens: usage?.promptTokenCount ?? null,
          totalTokens: usage?.totalTokenCount ?? null,
        };
      } catch (error) {
        // Don't retry on intentional throws (safety blocks, bad requests)
        if (error instanceof BadRequestError) {
          throw error;
        }

        // Handle timeout (AbortError)
        if (error instanceof Error && error.name === 'AbortError') {
          logger.error('Gemini image generation timed out');
          throw new InternalError(
            'AI image generation timed out. Please try again.',
            'AI_TIMEOUT',
          );
        }

        // Handle rate limiting (429)
        if (error instanceof Error && error.message?.includes('429')) {
          logger.warn('Gemini rate limited (429)');
          throw new InternalError(
            'The AI service is currently busy. Please try again in a few moments.',
            'AI_RATE_LIMITED',
          );
        }

        lastError = error;
        logger.error({ err: error, attempt }, 'Gemini generateContent failed');
      }
    }

    // All retries exhausted
    logger.error({ err: lastError }, 'Gemini image generation failed after all retries');
    throw new InternalError(
      'Failed to generate image. Please try again.',
      'AI_GENERATION_FAILED',
    );
  }

  // ─── Mapper ───────────────────────────────────────────────

  private toPublicGeneration(generation: AiGeneration): PublicAiGeneration {
    return {
      id: generation.id,
      userId: generation.userId,
      designId: generation.designId,
      prompt: generation.prompt,
      userFreeText: generation.userFreeText,
      model: generation.model,
      status: generation.status,
      generationType: generation.generationType,
      roomImageUrl: generation.roomImageUrl,
      placementInstructions: generation.placementInstructions,
      imageUrl: generation.imageUrl,
      thumbnailUrl: generation.thumbnailUrl,
      errorMessage: generation.errorMessage,
      promptTokens: generation.promptTokens,
      totalTokens: generation.totalTokens,
      wasFree: generation.wasFree,
      creditsUsed: generation.creditsUsed,
      durationMs: generation.durationMs,
      createdAt: generation.createdAt.toISOString(),
      updatedAt: generation.updatedAt.toISOString(),
    };
  }
}

export const aiGenerationService = new AiGenerationService();
