# Design Detail Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create the `/my-designs/[id]` detail page that shows a design's full info and all its AI generation history.

**Architecture:** Server component page shell fetches nothing (SSR metadata only). A single `DesignDetailView` client component uses `useDesign(id)` + `useMyGenerations({ designId: id })` to render the design header and generation timeline. Server-side `GET /ai/generations` gets a new `designId` query filter.

**Tech Stack:** Next.js App Router, React Query, Tailwind CSS, shadcn/ui, Phosphor Icons, Fastify + Prisma (server)

---

## Task 1: Server — Add `designId` filter to generations endpoint

**Files:**
- Modify: `server/src/modules/ai-generation/ai-generation.schemas.ts`
- Modify: `server/src/modules/ai-generation/ai-generation.repo.ts:83-100`
- Modify: `server/src/modules/ai-generation/ai-generation.service.ts:166-175`
- Modify: `server/src/modules/ai-generation/ai-generation.controller.ts:18-25`

**Step 1: Add `UserGenerationsFilterSchema` to schemas**

In `ai-generation.schemas.ts`, add after line 13:

```typescript
export const UserGenerationsFilterSchema = z.object({
  designId: z.string().uuid().optional(),
});
export type UserGenerationsFilter = z.infer<typeof UserGenerationsFilterSchema>;
```

**Step 2: Update `findByUserId` in repo to accept filter**

In `ai-generation.repo.ts`, change `findByUserId` (lines 83-100) to:

```typescript
async findByUserId(
  userId: string,
  pagination: PaginationInput,
  filters?: { designId?: string },
): Promise<{ items: AiGeneration[]; totalItems: number }> {
  const skip = (pagination.page - 1) * pagination.limit;
  const where: Prisma.AiGenerationWhereInput = { userId };

  if (filters?.designId) {
    where.designId = filters.designId;
  }

  const [items, totalItems] = await prisma.$transaction([
    prisma.aiGeneration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pagination.limit,
    }),
    prisma.aiGeneration.count({ where }),
  ]);

  return { items, totalItems };
}
```

Also add `UserGenerationsFilter` to the import on line 4:
```typescript
import type { AdminGenerationsFilter, UserGenerationsFilter } from './ai-generation.schemas.js';
```

**Step 3: Thread filter through service**

In `ai-generation.service.ts`, update `getUserGenerations` (lines 166-175):

```typescript
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
```

Also add `UserGenerationsFilter` to the import on line 11:
```typescript
import type { GenerateInput, AdminGenerationsFilter, UserGenerationsFilter } from './ai-generation.schemas.js';
```

**Step 4: Parse filter in controller**

In `ai-generation.controller.ts`, update `listGenerations` (lines 18-25):

```typescript
async listGenerations(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const userId = request.currentUser!.userId;
  const pagination = PaginationSchema.parse(request.query);
  const filters = UserGenerationsFilterSchema.parse(request.query);
  const { items, totalItems } = await aiGenerationService.getUserGenerations(userId, pagination, filters);
  return reply.send(
    paginatedResponse('Generations retrieved successfully', items, pagination.page, pagination.limit, totalItems),
  );
}
```

Also add `UserGenerationsFilterSchema` to the import on line 6:
```typescript
import { GenerateSchema, AdminGenerationsFilterSchema, UserGenerationsFilterSchema } from './ai-generation.schemas.js';
```

**Step 5: Commit**

```bash
git add server/src/modules/ai-generation/ai-generation.schemas.ts server/src/modules/ai-generation/ai-generation.repo.ts server/src/modules/ai-generation/ai-generation.service.ts server/src/modules/ai-generation/ai-generation.controller.ts
git commit -m "feat: add designId filter to user generations endpoint"
```

---

## Task 2: Client — Extend AI generation service & hook to support `designId` filter

**Files:**
- Modify: `client/src/features/ai-generation/types/ai-generation.types.ts`
- Modify: `client/src/features/ai-generation/services/ai-generation.service.ts:24-31`
- Modify: `client/src/features/ai-generation/hooks/useAiGeneration.ts:15-21,51-66`

**Step 1: Add `GenerationsFilter` type**

In `ai-generation.types.ts`, add after line 31:

```typescript
export interface GenerationsFilter extends PaginationParams {
    designId?: string;
}
```

Also add the import at top:
```typescript
import type { PaginationParams } from '@/lib/api/api.types';
```

**Step 2: Update service to pass `designId`**

In `ai-generation.service.ts`, change `getMyGenerations` (lines 24-31):

```typescript
async getMyGenerations(
    params?: GenerationsFilter
): Promise<PaginatedData<AiGeneration>> {
    const response = await apiClient.get<PaginatedApiResponse<AiGeneration>>(
        API_ENDPOINTS.AI.GENERATIONS,
        { params }
    );
    return response.data.data;
}
```

Update the import to include `GenerationsFilter`:
```typescript
import type {
    AiGeneration,
    GenerationStatusResponse,
    GenerateRequest,
    GenerationsFilter,
} from '../types/ai-generation.types';
```

**Step 3: Update hook query key factory & `useMyGenerations`**

In `useAiGeneration.ts`, update the key factory (lines 15-21):

```typescript
export const aiGenerationKeys = {
    all: ['ai-generation'] as const,
    generations: () => [...aiGenerationKeys.all, 'generations'] as const,
    generationList: (params?: GenerationsFilter) => [...aiGenerationKeys.generations(), params] as const,
    generation: (id: string) => [...aiGenerationKeys.all, 'generation', id] as const,
    status: () => [...aiGenerationKeys.all, 'status'] as const,
};
```

Update `useMyGenerations` (lines 51-66):

```typescript
export function useMyGenerations(params?: GenerationsFilter): {
    data: PaginatedData<AiGeneration> | undefined;
    isLoading: boolean;
    error: Error | null;
} {
    const query = useQuery({
        queryKey: aiGenerationKeys.generationList(params),
        queryFn: () => aiGenerationService.getMyGenerations(params),
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
    };
}
```

Update the imports to include `GenerationsFilter`:
```typescript
import type {
    AiGeneration,
    GenerationStatusResponse,
    GenerateRequest,
    GenerationsFilter,
} from '../types/ai-generation.types';
import type { PaginatedData } from '@/lib/api/api.types';
```

(Remove `PaginationParams` from the `@/lib/api/api.types` import since it's no longer directly used.)

**Step 4: Commit**

```bash
git add client/src/features/ai-generation/types/ai-generation.types.ts client/src/features/ai-generation/services/ai-generation.service.ts client/src/features/ai-generation/hooks/useAiGeneration.ts
git commit -m "feat: extend AI generation client to support designId filter"
```

---

## Task 3: Client — Create `GenerationCard` component

**Files:**
- Create: `client/src/features/designs/components/GenerationCard.tsx`

**Step 1: Create the component**

```tsx
'use client';

import Image from 'next/image';
import {
    CheckCircle,
    XCircle,
    SpinnerGap,
    Clock,
    Lightning,
    Coins,
    Star,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { AiGeneration, AiGenerationStatus } from '@/features/ai-generation/types/ai-generation.types';

const STATUS_CONFIG: Record<AiGenerationStatus, { label: string; className: string; icon: React.ElementType }> = {
    COMPLETED: { label: 'Completed', className: 'bg-success/10 text-success', icon: CheckCircle },
    FAILED: { label: 'Failed', className: 'bg-destructive/10 text-destructive', icon: XCircle },
    PROCESSING: { label: 'Processing', className: 'bg-warning/10 text-warning', icon: SpinnerGap },
    PENDING: { label: 'Pending', className: 'bg-muted text-muted-foreground', icon: Clock },
};

function formatRelativeTime(dateStr: string): string {
    const now = Date.now();
    const date = new Date(dateStr).getTime();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60_000);
    const diffHr = Math.floor(diffMs / 3_600_000);
    const diffDays = Math.floor(diffMs / 86_400_000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
    }).format(new Date(dateStr));
}

interface GenerationCardProps {
    generation: AiGeneration;
    isCurrent: boolean;
}

export function GenerationCard({ generation, isCurrent }: GenerationCardProps): React.JSX.Element {
    const config = STATUS_CONFIG[generation.status];
    const StatusIcon = config.icon;

    return (
        <div className={cn(
            'group relative rounded-xl border overflow-hidden motion-safe:transition-all motion-safe:duration-300',
            isCurrent
                ? 'border-primary/30 bg-primary/[0.02] shadow-sm'
                : 'border-border/50 bg-card shadow-sm motion-safe:hover:shadow-md motion-safe:hover:-translate-y-0.5',
        )}>
            {/* Current badge */}
            {isCurrent && (
                <div className="absolute right-2 top-2 z-10">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                        <Star className="h-3 w-3" weight="fill" />
                        Current
                    </span>
                </div>
            )}

            {/* Image */}
            <div className="relative aspect-[4/3] bg-muted/30">
                {generation.status === 'COMPLETED' && generation.thumbnailUrl ? (
                    <Image
                        src={generation.thumbnailUrl}
                        alt="Generated design"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        unoptimized={generation.thumbnailUrl.startsWith('http')}
                    />
                ) : generation.status === 'PROCESSING' || generation.status === 'PENDING' ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <SpinnerGap className="h-8 w-8 animate-spin" />
                        <span className="text-xs">Generating...</span>
                    </div>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <XCircle className="h-8 w-8" />
                        <span className="text-xs">Generation failed</span>
                    </div>
                )}

                {/* Status badge */}
                <div className="absolute left-2 top-2">
                    <span className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                        config.className,
                    )}>
                        <StatusIcon className={cn('h-3 w-3', generation.status === 'PROCESSING' && 'animate-spin')} />
                        {config.label}
                    </span>
                </div>
            </div>

            {/* Meta */}
            <div className="p-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(generation.createdAt)}
                    </span>
                    <div className="flex items-center gap-2">
                        {generation.durationMs != null && generation.status === 'COMPLETED' && (
                            <span className="inline-flex items-center gap-0.5 text-xs tabular-nums text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {(generation.durationMs / 1000).toFixed(1)}s
                            </span>
                        )}
                        <span className={cn(
                            'inline-flex items-center gap-0.5 text-xs font-medium',
                            generation.wasFree ? 'text-success' : 'text-primary',
                        )}>
                            {generation.wasFree ? (
                                <>
                                    <Lightning className="h-3 w-3" weight="fill" />
                                    Free
                                </>
                            ) : (
                                <>
                                    <Coins className="h-3 w-3" weight="fill" />
                                    {generation.creditsUsed} credit{generation.creditsUsed !== 1 ? 's' : ''}
                                </>
                            )}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
```

**Step 2: Commit**

```bash
git add client/src/features/designs/components/GenerationCard.tsx
git commit -m "feat: add GenerationCard component"
```

---

## Task 4: Client — Create `GenerationTimeline` component

**Files:**
- Create: `client/src/features/designs/components/GenerationTimeline.tsx`

**Step 1: Create the component**

```tsx
'use client';

import { Images } from '@phosphor-icons/react';
import { useMyGenerations } from '@/features/ai-generation/hooks/useAiGeneration';
import { GenerationCard } from './GenerationCard';
import type { Design } from '../types/design.types';

interface GenerationTimelineProps {
    design: Design;
}

export function GenerationTimeline({ design }: GenerationTimelineProps): React.JSX.Element {
    const { data, isLoading } = useMyGenerations({ designId: design.id, limit: 50 });
    const generations = data?.items ?? [];
    const totalCount = data?.pagination.totalItems ?? 0;

    // Loading skeleton
    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-7 w-48 animate-pulse rounded-lg bg-muted" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-xl border border-border/50 overflow-hidden">
                            <div className="aspect-[4/3] animate-pulse bg-muted/30" />
                            <div className="p-3">
                                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Empty state
    if (generations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-muted/10 px-6 py-16 text-center">
                <Images className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <h3 className="text-sm font-medium text-foreground">No generations yet</h3>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                    This design hasn&apos;t been generated yet. Open it in the configurator to create your first AI visualization.
                </p>
            </div>
        );
    }

    // Find the latest COMPLETED generation (first in list since sorted by createdAt desc)
    const latestCompletedId = generations.find((g) => g.status === 'COMPLETED')?.id ?? null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">Generation History</h2>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                    {totalCount}
                </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {generations.map((gen) => (
                    <GenerationCard
                        key={gen.id}
                        generation={gen}
                        isCurrent={gen.id === latestCompletedId}
                    />
                ))}
            </div>
        </div>
    );
}
```

**Step 2: Commit**

```bash
git add client/src/features/designs/components/GenerationTimeline.tsx
git commit -m "feat: add GenerationTimeline component"
```

---

## Task 5: Client — Create `DesignDetailView` component (main orchestrator)

**Files:**
- Create: `client/src/features/designs/components/DesignDetailView.tsx`

**Step 1: Create the component**

This is the main client component that fetches data and orchestrates the page layout.

```tsx
'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    ChatText,
    Trash,
    PencilSimple,
    SpinnerGap,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants/routes';
import { useDesign, useDeleteDesign } from '../hooks/useDesigns';
import { GenerationTimeline } from './GenerationTimeline';
import { QuoteModal } from '@/features/quotes/components/QuoteModal';

const STATUS_STYLES: Record<string, string> = {
    DRAFT: 'bg-muted text-muted-foreground',
    GENERATED: 'bg-success/10 text-success',
    QUOTED: 'bg-primary/10 text-primary',
};

interface DesignDetailViewProps {
    designId: string;
}

export function DesignDetailView({ designId }: DesignDetailViewProps): React.JSX.Element {
    const router = useRouter();
    const { data: design, isLoading, error } = useDesign(designId);
    const deleteDesign = useDeleteDesign();
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [isQuoteOpen, setIsQuoteOpen] = useState(false);

    const handleDelete = useCallback(() => {
        if (!isConfirmingDelete) {
            setIsConfirmingDelete(true);
            return;
        }
        deleteDesign.mutateAsync(designId)
            .then(() => {
                router.push(ROUTES.MY_DESIGNS);
            })
            .catch(() => {
                toast.error('Failed to delete design');
                setIsConfirmingDelete(false);
            });
    }, [designId, deleteDesign, isConfirmingDelete, router]);

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-8">
                {/* Back link skeleton */}
                <div className="h-5 w-28 animate-pulse rounded bg-muted" />

                {/* Header skeleton */}
                <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
                    <div className="w-full lg:w-1/2">
                        <div className="aspect-[4/3] animate-pulse rounded-xl bg-muted/30" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="h-8 w-3/4 animate-pulse rounded-lg bg-muted" />
                        <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
                        <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
                        <div className="flex gap-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Timeline skeleton */}
                <div className="h-7 w-48 animate-pulse rounded-lg bg-muted" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-xl border border-border/50 overflow-hidden">
                            <div className="aspect-[4/3] animate-pulse bg-muted/30" />
                            <div className="p-3">
                                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (error || !design) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <h2 className="text-lg font-semibold text-foreground">Design not found</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    This design may have been deleted or you don&apos;t have access to it.
                </p>
                <Button asChild variant="outline" className="mt-4">
                    <Link href={ROUTES.MY_DESIGNS}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to My Designs
                    </Link>
                </Button>
            </div>
        );
    }

    const formattedDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(design.createdAt));

    const options = design.configSnapshot?.options ?? [];

    return (
        <div className="space-y-10">
            {/* Back link */}
            <Link
                href={ROUTES.MY_DESIGNS}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" />
                My Designs
            </Link>

            {/* Design Header */}
            <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
                {/* Hero Image */}
                <div className="w-full lg:w-1/2">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border/50 bg-muted/30">
                        {design.imageUrl ? (
                            <Image
                                src={design.imageUrl}
                                alt={design.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                priority
                                unoptimized={design.imageUrl.startsWith('http')}
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                No preview available
                            </div>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col">
                    {/* Title + badges */}
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={cn(
                                'rounded-full px-2.5 py-0.5 text-xs font-medium',
                                STATUS_STYLES[design.status] ?? STATUS_STYLES.DRAFT,
                            )}>
                                {design.status}
                            </span>
                            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                                {design.categoryName}
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-foreground text-wrap-balance lg:text-3xl">
                            {design.name}
                        </h1>

                        <p className="text-sm text-muted-foreground">{formattedDate}</p>
                    </div>

                    {/* Price */}
                    <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-4">
                        <div className="flex items-baseline justify-between">
                            <span className="text-sm text-muted-foreground">Total Price</span>
                            <span className="text-2xl font-bold tabular-nums text-foreground">
                                ${design.totalPrice.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Config options */}
                    {options.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Configuration</span>
                            <div className="flex flex-wrap gap-1.5">
                                {options.map((opt) => (
                                    <span
                                        key={`${opt.groupSlug}-${opt.valueSlug}`}
                                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                                    >
                                        <span className="text-primary/60">{opt.groupName}:</span>
                                        {opt.valueLabel}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex flex-wrap gap-2">
                        {design.status === 'GENERATED' && (
                            <Button onClick={() => setIsQuoteOpen(true)} className="gap-2">
                                <ChatText className="h-4 w-4" />
                                Request Quote
                            </Button>
                        )}

                        <Button variant="outline" asChild className="gap-2">
                            <Link href={ROUTES.CONFIGURATOR.ROOT}>
                                <PencilSimple className="h-4 w-4" />
                                Open in Configurator
                            </Link>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={handleDelete}
                            disabled={deleteDesign.isPending}
                            className={cn(
                                'gap-2',
                                isConfirmingDelete
                                    ? 'border-destructive bg-destructive/10 text-destructive'
                                    : 'text-destructive hover:bg-destructive/10 hover:text-destructive',
                            )}
                        >
                            {deleteDesign.isPending ? (
                                <SpinnerGap className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash className="h-4 w-4" />
                            )}
                            {isConfirmingDelete ? 'Confirm Delete' : 'Delete'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Generation Timeline */}
            <GenerationTimeline design={design} />

            {/* Quote Modal */}
            <QuoteModal
                open={isQuoteOpen}
                onOpenChange={setIsQuoteOpen}
                designId={designId}
            />
        </div>
    );
}
```

**Step 2: Commit**

```bash
git add client/src/features/designs/components/DesignDetailView.tsx
git commit -m "feat: add DesignDetailView orchestrator component"
```

---

## Task 6: Client — Create the page route

**Files:**
- Create: `client/src/app/[locale]/(main)/my-designs/[id]/page.tsx`

**Step 1: Create the page**

```tsx
import type { Metadata } from 'next';
import { DesignDetailView } from '@/features/designs/components/DesignDetailView';

interface DesignDetailPageProps {
    params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
    title: 'Design Details — Atlas Furniture',
    description: 'View your furniture design details and generation history.',
};

export default async function DesignDetailPage({ params }: DesignDetailPageProps): Promise<React.ReactElement> {
    const { id } = await params;

    return (
        <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
            <DesignDetailView designId={id} />
        </div>
    );
}
```

**Step 2: Commit**

```bash
git add client/src/app/[locale]/(main)/my-designs/[id]/page.tsx
git commit -m "feat: add design detail page route"
```

---

## Task 7: Update Postman collection

**Files:**
- Modify: `server/postman/furniture-api.postman_collection.json`

**Step 1: Update the "List Generations" request**

Find the "List My Generations" request in the AI Generation folder and add an optional `designId` query parameter:

```json
{
    "key": "designId",
    "value": "",
    "description": "Filter by design ID (UUID, optional)",
    "disabled": true
}
```

Add it to the existing query params array alongside `page` and `limit`.

**Step 2: Commit**

```bash
git add server/postman/furniture-api.postman_collection.json
git commit -m "docs: add designId filter to generations Postman request"
```

---

## Summary of all files

**Server (modify):**
- `server/src/modules/ai-generation/ai-generation.schemas.ts`
- `server/src/modules/ai-generation/ai-generation.repo.ts`
- `server/src/modules/ai-generation/ai-generation.service.ts`
- `server/src/modules/ai-generation/ai-generation.controller.ts`

**Client (modify):**
- `client/src/features/ai-generation/types/ai-generation.types.ts`
- `client/src/features/ai-generation/services/ai-generation.service.ts`
- `client/src/features/ai-generation/hooks/useAiGeneration.ts`

**Client (create):**
- `client/src/features/designs/components/GenerationCard.tsx`
- `client/src/features/designs/components/GenerationTimeline.tsx`
- `client/src/features/designs/components/DesignDetailView.tsx`
- `client/src/app/[locale]/(main)/my-designs/[id]/page.tsx`

**Docs (modify):**
- `server/postman/furniture-api.postman_collection.json`
