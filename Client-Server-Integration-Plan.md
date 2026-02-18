# Client-Server Integration Plan

## Context

The Fastify server has 50 endpoints across 6 modules (Auth, Catalog, Credits, Designs, AI Generation, Quotes) — all fully implemented with Prisma, Redis caching, and Zod validation. The Next.js client currently has a working auth flow but all other features use **hardcoded data** or **mock local API routes**. This plan connects every user-facing feature to the real server API, rewriting the configurator to be dynamic/catalog-driven and building missing pages (dashboard, my-designs, credits, my-quotes).

**Decisions made:**
- Reimagine mode: keep as "Coming Soon" placeholder (no API)
- Video step: keep as "Coming Soon" placeholder (no API)
- Admin pages: **excluded** — separate plan later
- Focus: user-facing journey only

---

## Phase 1: API Foundation Layer

**Goal:** Types, constants, services, and React Query hooks that every other phase depends on.

### 1A. API Endpoints & Route Constants

**File:** `client/src/lib/constants/api-endpoints.ts`
Add endpoint groups for all 5 modules:

```
CATALOG: {
  CATEGORIES: '/catalog/categories',
  CATEGORY_BY_SLUG: (slug: string) => `/catalog/categories/${slug}`,
  OPTIONS_BY_CATEGORY: (categoryId: string) => `/catalog/categories/${categoryId}/options`,
}
CREDITS: {
  PACKAGES: '/credits/packages',
  BALANCE: '/credits/balance',
  TRANSACTIONS: '/credits/transactions',
  PURCHASE: '/credits/purchase',
}
DESIGNS: {
  LIST: '/designs',
  GET: (id: string) => `/designs/${id}`,
  CREATE: '/designs',
  UPDATE: (id: string) => `/designs/${id}`,
  DELETE: (id: string) => `/designs/${id}`,
  CALCULATE_PRICE: '/designs/calculate-price',
}
AI: {
  GENERATE: '/ai/generate',
  GENERATIONS: '/ai/generations',
  GENERATION: (id: string) => `/ai/generations/${id}`,
  STATUS: '/ai/status',
}
QUOTES: {
  LIST: '/quotes',
  GET: (id: string) => `/quotes/${id}`,
  CREATE: '/quotes',
  CANCEL: (id: string) => `/quotes/${id}/cancel`,
}
```

**File:** `client/src/lib/constants/routes.ts`
Add client routes:

```
MY_DESIGNS: '/my-designs',
CREDITS: '/credits',
MY_QUOTES: '/my-quotes',
DESIGN_DETAIL: (id: string) => `/my-designs/${id}`,
```

### 1B. TypeScript Types (mirror server responses)

**Create:** `client/src/features/catalog/types/catalog.types.ts`
- `PublicCategory`, `CategoryWithOptions`, `PublicOptionGroup`, `PublicOptionValue`

**Create:** `client/src/features/credits/types/credits.types.ts`
- `CreditPackage`, `CreditBalance`, `CreditTransaction`, `CreditTransactionType`

**Rewrite:** `client/src/features/designs/types/design.types.ts`
- Replace `SavedDesign` (localStorage-shaped) with `Design` matching `PublicDesignWithCategory` from server:
  `{ id, userId, categoryId, name, totalPrice, currency, configSnapshot, imageUrl, thumbnailUrl, status, createdAt, updatedAt, categoryName, categorySlug }`
- Add `PriceCalculation`, `ConfigSnapshotOption`, `CreateDesignRequest`, `UpdateDesignRequest`

**Create:** `client/src/features/ai-generation/types/ai-generation.types.ts`
- `AiGeneration`, `AiGenerationStatus`, `GenerationStatusResponse`

**Rewrite:** `client/src/features/quotes/types/quote.types.ts`
- Replace current types with `QuoteWithDesign` matching `PublicQuoteWithDesign` from server
- Add `CreateQuoteRequest`, `QuoteStatus`

### 1C. Service Classes

Follow the pattern from `auth.service.ts`: class-based, singleton export, uses `apiClient`, unwraps `response.data.data`.

**Create:** `client/src/features/catalog/services/catalog.service.ts`
- `getCategories(): Promise<PublicCategory[]>`
- `getCategoryBySlug(slug: string): Promise<CategoryWithOptions>`
- `getOptionsByCategory(categoryId: string): Promise<PublicOptionGroup[]>`

**Create:** `client/src/features/credits/services/credits.service.ts`
- `getPackages(): Promise<CreditPackage[]>`
- `getBalance(): Promise<CreditBalance>`
- `getTransactions(params: PaginationParams): Promise<PaginatedData<CreditTransaction>>`
- `purchasePackage(packageId: string): Promise<CreditTransaction>`

**Rewrite:** `client/src/features/designs/services/design-storage.service.ts` → rename to `designs.service.ts`
- `getMyDesigns(params: PaginationParams): Promise<PaginatedData<Design>>`
- `getDesign(id: string): Promise<Design>`
- `createDesign(data: CreateDesignRequest): Promise<Design>`
- `updateDesign(id: string, data: UpdateDesignRequest): Promise<Design>`
- `deleteDesign(id: string): Promise<void>`
- `calculatePrice(data: { categoryId: string; optionValueIds: string[] }): Promise<PriceCalculation>`

**Create:** `client/src/features/ai-generation/services/ai-generation.service.ts`
- `generate(data: { designId: string; freeText?: string }): Promise<AiGeneration>`
- `getMyGenerations(params: PaginationParams): Promise<PaginatedData<AiGeneration>>`
- `getGeneration(id: string): Promise<AiGeneration>`
- `getStatus(): Promise<GenerationStatusResponse>`

**Rewrite:** `client/src/features/quotes/services/quote.service.ts`
- `submitQuote(data: CreateQuoteRequest): Promise<QuoteWithDesign>`
- `getMyQuotes(params: PaginationParams): Promise<PaginatedData<QuoteWithDesign>>`
- `getQuote(id: string): Promise<QuoteWithDesign>`
- `cancelQuote(id: string): Promise<QuoteWithDesign>`

### 1D. React Query Hooks

**Create:** `client/src/features/catalog/hooks/useCatalog.ts`
- Query key factory: `catalogKeys = { all, categories, categoryBySlug(slug), optionsByCategory(id) }`
- `useCategories()` — query, staleTime: 5min
- `useCategoryBySlug(slug)` — query
- `useCategoryOptions(categoryId)` — query, enabled: !!categoryId

**Create:** `client/src/features/credits/hooks/useCredits.ts`
- `useCreditPackages()`, `useCreditBalance()`, `useCreditTransactions(params)`, `usePurchasePackage()` (mutation)

**Create:** `client/src/features/designs/hooks/useDesigns.ts`
- `useMyDesigns(params)`, `useDesign(id)`, `useCreateDesign()`, `useUpdateDesign()`, `useDeleteDesign()`, `useCalculatePrice()`

**Create:** `client/src/features/ai-generation/hooks/useAiGeneration.ts`
- `useGenerateImage()`, `useMyGenerations(params)`, `useGeneration(id)`, `useGenerationStatus()`

**Create:** `client/src/features/quotes/hooks/useQuotes.ts`
- `useSubmitQuote()`, `useMyQuotes(params)`, `useQuote(id)`, `useCancelQuote()`

---

## Phase 2: Configurator Rewrite (Core User Flow)

**Goal:** Transform the hardcoded wizard into a dynamic, catalog-driven flow.

### 2A. New Configurator Types

**Rewrite:** `client/src/features/configurator/types/configurator.types.ts`

The fundamental change: instead of `FurnitureStyleId` union and `OptionCategory` union (hardcoded), the configurator now works with:
- `selectedCategoryId: string | null` (from API)
- `selectedOptionValueIds: string[]` (from API)
- Step numbers are dynamic (1 = pick category, 2 = customize all option groups for that category, 3 = result)

Keep Room Redesign types as-is (placeholder). Remove `FurnitureStyleId` union, `OptionCategory` union, `FurnitureStyle`, `FurnitureOption`, `ConfiguratorSelections`, `FurniturePreset` — these are replaced by API-driven data.

New state shape:
```typescript
interface ConfiguratorState {
  mode: ConfiguratorMode;
  selectedCategoryId: string | null;
  selectedCategorySlug: string | null;
  selectedOptionValueIds: string[];
  generatedImageUrl: string | null;
  savedDesignId: string | null;
  roomRedesign: RoomRedesignState; // keep as-is
}
```

New actions:
```typescript
type ConfiguratorAction =
  | { type: 'SET_MODE'; payload: ConfiguratorMode }
  | { type: 'SET_CATEGORY'; payload: { id: string; slug: string } }
  | { type: 'TOGGLE_OPTION_VALUE'; payload: { groupId: string; valueId: string; isRequired: boolean } }
  | { type: 'SET_GENERATED_IMAGE'; payload: string }
  | { type: 'SET_SAVED_DESIGN'; payload: string }
  | { type: 'HYDRATE_SESSION'; payload: ConfiguratorState }
  | { type: 'RESET' }
  | ... room redesign actions (keep as-is)
```

### 2B. Configurator Context

**Rewrite:** `client/src/features/configurator/store/configuratorContext.tsx`
- New reducer with updated state shape
- `TOGGLE_OPTION_VALUE`: For required groups (isRequired=true), selecting a value replaces any previous selection for that group. For optional groups, it toggles. (Server enforces one selection per group, so UI should too.)
- `SET_CATEGORY`: resets selectedOptionValueIds
- Session persistence still useful for resuming configurator

### 2C. useConfigurator Hook

**Rewrite:** `client/src/features/configurator/hooks/useConfigurator.ts`
- Remove all imports from `data/furniture-catalog.ts`
- `selectedCategoryId`, `selectedOptionValueIds` from state
- `canProceedToStep2`: `selectedCategoryId !== null`
- `canGenerate`: `selectedCategoryId !== null && selectedOptionValueIds.length > 0` (and all required groups have a selection — validated against fetched category data)
- `setCategory(id, slug)`, `toggleOptionValue(groupId, valueId, isRequired)`, `reset()`

### 2D. Step 1 — Category Selection

**Rewrite:** `client/src/features/configurator/components/wizard/Step1FurnitureStyle.tsx`
- Rename to `Step1CategorySelect.tsx`
- Fetch categories via `useCategories()` hook
- Show skeleton grid while loading (reuse `StyleGridSkeleton`)
- Render a card for each category (name, description, basePrice, imageUrl)
- On select → dispatch `SET_CATEGORY`

**Reuse:** `StyleCard.tsx` — adapt props to accept `PublicCategory` instead of `FurnitureStyle`. The card structure (image, label, price, selected state) is the same.

### 2E. Step 2 — Dynamic Option Customization

**Rewrite:** `client/src/features/configurator/components/wizard/Step2Customize.tsx`
- Fetch category with options via `useCategoryBySlug(selectedCategorySlug)` or `useCategoryOptions(selectedCategoryId)`
- Iterate `categoryWithOptions.optionGroups` (sorted by sortOrder)
- Render one `OptionGroup` per group with its `optionValues`
- Required groups show a "(Required)" label
- PricePanel calls `useCalculatePrice()` mutation on option changes (debounced) or computes locally from basePrice + sum of selected priceModifiers

**Reuse:** `OptionGroup.tsx` — adapt props from `(category: OptionCategory, options: FurnitureOption[])` to `(group: PublicOptionGroup, selectedValueId: string | null, onSelect: (valueId: string) => void)`

**Reuse:** `ColorSwatch.tsx` — for option values that have `colorHex`

**Reuse:** `OptionChip.tsx` — for option values without colorHex

**Reuse:** `PricePanel.tsx` — adapt to use new price calculation (basePrice + modifiers from selected options)

### 2F. Step 3 — AI Image Generation & Result

**Rewrite:** `client/src/features/configurator/components/wizard/Step3Result.tsx`

The flow changes significantly:
1. User arrives at Step 3 → first **save the design** via `useCreateDesign()` mutation (POST /designs with categoryId, name, optionValueIds)
2. Once design is saved → **trigger AI generation** via `useGenerateImage()` mutation (POST /ai/generate with designId)
3. Show `GeneratingOverlay` while generation is processing
4. Poll `useGeneration(id)` until status === 'COMPLETED' or 'FAILED'
5. On COMPLETED → display the single generated image (not 6 — server returns 1 image)
6. Show price breakdown from the saved design's `configSnapshot`
7. Show actions: "Request Quote" button, "Save" (already saved), "Regenerate"

**Key differences from current:**
- Current: generates 6 mock images client-side, no save-to-server
- New: saves design first, then generates 1 real AI image server-side, polls for result
- The `ImageGallery` component needs adaptation for a single image (or keep grid layout if we want to support regeneration/multiple attempts)

**Reuse:** `GeneratingOverlay.tsx` — as-is
**Reuse:** `PriceBreakdownCard.tsx` — adapt to use `configSnapshot` data
**Reuse:** `ResultActions.tsx` — adapt to include "Request Quote" and "View My Designs"

### 2G. Generation Status & Credits Integration

Before generating, show the user their generation status:
- **Free remaining** (from GET /ai/status → `freeRemaining`)
- **Credit balance** (from GET /ai/status → `creditBalance`)
- If freeRemaining === 0 and creditBalance === 0, show "Buy credits" CTA instead of "Generate"

Create a small `GenerationStatusBadge` component to show in Step 3 header.

### 2H. Delete Old Files

- **Delete:** `client/src/features/configurator/data/furniture-catalog.ts` (all hardcoded data)
- **Delete:** `client/src/features/configurator/lib/prompt.builder.ts` (prompt is now server-side)
- **Delete:** `client/src/features/configurator/hooks/useImageGeneration.ts` (replaced by useAiGeneration hook)
- **Delete:** `client/src/features/configurator/hooks/usePriceCalculator.ts` (replaced by API-driven price)
- **Delete:** `client/src/features/configurator/hooks/useVideoGeneration.ts` (keep video step as placeholder, but this hook talks to mock API)
- **Delete:** `client/src/app/api/image-generation/route.ts` (mock API route)
- **Delete:** `client/src/app/api/quotes/route.ts` (mock API route)
- **Delete:** `client/src/app/api/video-generation/route.ts` (mock API route)
- **Delete:** `client/src/app/api/room-redesign/route.ts` (mock API route)

### 2I. Configurator Wizard Flow Update

**Modify:** `client/src/features/configurator/components/wizard/ConfiguratorWizard.tsx`
- Scratch mode steps: 1 = Category Select, 2 = Customize, 3 = Result (+ Video placeholder at step 4)
- When mode is 'reimagine': show a "Coming Soon" state instead of the current room upload flow
- Video Step 4: show "Coming Soon" badge/overlay

### 2J. Quote Modal Update

**Rewrite:** `client/src/features/quotes/components/QuoteModal.tsx`
- Now requires a `designId` prop (design must be saved first)
- Form fields match server schema: `contactName`, `contactEmail` (required), `contactPhone`, `message`
- Uses `useSubmitQuote()` mutation → POST /api/v1/quotes
- On success: toast, close modal, invalidate quotes query
- Design summary shows data from the saved design (not from configurator context)

### 2K. Save Design Button Update

**Rewrite:** `client/src/features/designs/components/SaveDesignButton.tsx`
- Instead of saving to localStorage, it now calls `useCreateDesign()` mutation
- Or, since design is auto-saved when entering Step 3, this button becomes "View in My Designs" linking to `/my-designs`

---

## Phase 3: User Pages

**Goal:** Dashboard, My Designs, Credits, My Quotes pages.

### 3A. My Designs Page

**Create:** `client/src/app/(main)/my-designs/page.tsx`
- Server component shell
- Protected route (add `/my-designs` to middleware `protectedPaths`)

**Rewrite:** `client/src/features/designs/components/SavedDesignsList.tsx`
- Use `useMyDesigns()` hook instead of localStorage
- Paginated with `Pagination` component (reuse from `components/common/Pagination.tsx`)
- Skeleton loading state

**Rewrite:** `client/src/features/designs/components/SavedDesignCard.tsx`
- Display: thumbnail, name, category, status badge (DRAFT/GENERATED/QUOTED), price, date
- Actions: View/Edit in configurator, Delete (with ConfirmDialog), Request Quote (if GENERATED)

### 3B. Design Detail Page

**Create:** `client/src/app/(main)/my-designs/[id]/page.tsx`
- Shows full design detail: large image, config breakdown, price, status
- Actions: Regenerate AI image, Request Quote, Edit, Delete

### 3C. Credits Page

**Create:** `client/src/app/(main)/credits/page.tsx`
- Protected route

**Create:** `client/src/features/credits/components/CreditBalance.tsx`
- Shows current balance prominently

**Create:** `client/src/features/credits/components/CreditPackageCard.tsx`
- Card for each package: name, credits, price, "Purchase" button

**Create:** `client/src/features/credits/components/CreditPackagesList.tsx`
- Grid of CreditPackageCard using `useCreditPackages()`

**Create:** `client/src/features/credits/components/TransactionHistory.tsx`
- Paginated table of credit transactions using `useCreditTransactions()`
- Columns: date, type (badge), amount (+/-), description

### 3D. Credit Balance in Header

**Modify:** `client/src/components/layout/Header.tsx`
- When authenticated, show a small credit balance indicator (coin icon + number)
- Uses `useCreditBalance()` hook
- Clicking navigates to `/credits`

### 3E. My Quotes Page

**Create:** `client/src/app/(main)/my-quotes/page.tsx`
- Protected route

**Create:** `client/src/features/quotes/components/QuotesList.tsx`
- Paginated list using `useMyQuotes()`
- Each quote: design thumbnail, design name, status badge, date, price

**Create:** `client/src/features/quotes/components/QuoteCard.tsx`
- Card showing quote details
- Cancel button (only for PENDING quotes, with ConfirmDialog)

### 3F. Quote Detail Page

**Create:** `client/src/app/(main)/my-quotes/[id]/page.tsx`
- Full quote detail: design info, contact info submitted, status timeline, admin notes (if any)

### 3G. Dashboard Page

**Create:** `client/src/app/(main)/dashboard/page.tsx`
- Protected route (already in middleware protectedPaths)
- Overview cards: Credit balance, recent designs (last 3), recent quotes (last 3), generation status (free remaining)
- Quick action CTAs: "Start Designing", "Buy Credits", "View All Designs"

### 3H. Middleware Update

**Modify:** `client/src/middleware.ts`
- Add to `protectedPaths`: `/my-designs`, `/credits`, `/my-quotes`

### 3I. Header Navigation Update

**Modify:** `client/src/components/layout/Header.tsx`
- Add nav links when authenticated: My Designs, Credits (with balance), My Quotes
- Consider a dropdown menu for authenticated users: Dashboard, My Designs, Credits, My Quotes, Sign Out

---

## Phase 4: Polish & Edge Cases

### 4A. Authentication Guards in Configurator

The configurator is currently public. The "Save Design" and "Generate" actions require authentication.
- Steps 1-2 (browse + customize) remain public
- Step 3 (generate + save): check auth state. If not authenticated, show a login prompt/redirect with return URL

### 4B. Error Handling

All React Query mutations need:
- `onError: (error) => toast.error(getErrorMessage(error))`
- Specific handling for `INSUFFICIENT_CREDITS` error → redirect to credits page
- Specific handling for `GENERATION_IN_PROGRESS` → show "please wait" message

**Reuse:** `client/src/lib/utils/error.ts` — `getErrorMessage()` already handles axios errors

### 4C. Loading States

Every page/component that fetches data needs skeleton states:
- Category grid skeleton (already have `StyleGridSkeleton`)
- Design card skeleton
- Quote card skeleton
- Credit balance skeleton
- Transaction table skeleton

**Reuse:** `client/src/components/ui/skeleton.tsx` — shadcn skeleton component

### 4D. Empty States

**Reuse:** `client/src/components/common/EmptyState.tsx` for:
- No designs yet → "Start designing" CTA
- No quotes yet → "Create a design first" CTA
- No transactions yet → "Purchase credits" CTA

### 4E. Coming Soon States

- Reimagine mode: Replace `Step1ModeSelect` to show "Coming Soon" badge on reimagine option
- Video step: Show overlay/badge on Step 4

---

## Files Summary

### New files to create (~25)
```
client/src/features/catalog/types/catalog.types.ts
client/src/features/catalog/services/catalog.service.ts
client/src/features/catalog/hooks/useCatalog.ts
client/src/features/credits/types/credits.types.ts
client/src/features/credits/services/credits.service.ts
client/src/features/credits/hooks/useCredits.ts
client/src/features/credits/components/CreditBalance.tsx
client/src/features/credits/components/CreditPackageCard.tsx
client/src/features/credits/components/CreditPackagesList.tsx
client/src/features/credits/components/TransactionHistory.tsx
client/src/features/ai-generation/types/ai-generation.types.ts
client/src/features/ai-generation/services/ai-generation.service.ts
client/src/features/ai-generation/hooks/useAiGeneration.ts
client/src/features/designs/services/designs.service.ts
client/src/features/designs/hooks/useDesigns.ts
client/src/features/quotes/hooks/useQuotes.ts
client/src/features/quotes/components/QuotesList.tsx
client/src/features/quotes/components/QuoteCard.tsx
client/src/features/configurator/components/wizard/Step1CategorySelect.tsx
client/src/features/configurator/components/result/GenerationStatusBadge.tsx
client/src/app/(main)/dashboard/page.tsx
client/src/app/(main)/my-designs/page.tsx
client/src/app/(main)/my-designs/[id]/page.tsx
client/src/app/(main)/credits/page.tsx
client/src/app/(main)/my-quotes/page.tsx
client/src/app/(main)/my-quotes/[id]/page.tsx
```

### Files to rewrite/heavily modify (~15)
```
client/src/lib/constants/api-endpoints.ts          (add 5 module groups)
client/src/lib/constants/routes.ts                 (add new routes)
client/src/features/configurator/types/configurator.types.ts  (new state shape)
client/src/features/configurator/store/configuratorContext.tsx (new reducer)
client/src/features/configurator/hooks/useConfigurator.ts     (remove hardcoded data)
client/src/features/configurator/components/wizard/ConfiguratorWizard.tsx
client/src/features/configurator/components/wizard/Step2Customize.tsx
client/src/features/configurator/components/wizard/Step3Result.tsx
client/src/features/configurator/components/options/StyleCard.tsx
client/src/features/configurator/components/options/OptionGroup.tsx
client/src/features/configurator/components/pricing/PricePanel.tsx
client/src/features/configurator/components/result/PriceBreakdownCard.tsx
client/src/features/designs/types/design.types.ts
client/src/features/designs/components/SavedDesignsList.tsx
client/src/features/designs/components/SavedDesignCard.tsx
client/src/features/designs/components/SaveDesignButton.tsx
client/src/features/quotes/types/quote.types.ts
client/src/features/quotes/services/quote.service.ts
client/src/features/quotes/components/QuoteModal.tsx
client/src/components/layout/Header.tsx
client/src/middleware.ts
```

### Files to delete (~10)
```
client/src/features/configurator/data/furniture-catalog.ts
client/src/features/configurator/lib/prompt.builder.ts
client/src/features/configurator/hooks/useImageGeneration.ts
client/src/features/configurator/hooks/usePriceCalculator.ts
client/src/features/configurator/hooks/useVideoGeneration.ts
client/src/features/designs/services/design-storage.service.ts
client/src/app/api/image-generation/route.ts
client/src/app/api/quotes/route.ts
client/src/app/api/video-generation/route.ts
client/src/app/api/room-redesign/route.ts
```

---

## Execution Order

**The phases MUST be done sequentially in this order:**

1. **Phase 1** (foundation) — everything else imports from here
2. **Phase 2A-2C** (configurator types, context, hook) — state management foundation
3. **Phase 2D-2E** (Step 1 + Step 2) — the browsing/customization flow
4. **Phase 2F-2G** (Step 3 + generation) — save design + AI generation
5. **Phase 2H-2K** (cleanup + quote modal) — remove old code, update quote flow
6. **Phase 3A-3B** (My Designs pages) — view saved designs
7. **Phase 3C-3D** (Credits pages + header) — credit system UI
8. **Phase 3E-3F** (My Quotes pages) — quote history
9. **Phase 3G** (Dashboard) — ties everything together
10. **Phase 3H-3I** (middleware + nav) — route protection + navigation
11. **Phase 4** (polish) — edge cases, error handling, loading/empty states

---

## Verification Plan

After each phase, verify:

1. **Phase 1:** `npm run build` passes (no type errors). Services instantiate without error.
2. **Phase 2:** Start server (`cd server && npm run dev`) + client (`cd client && npm run dev`):
   - Navigate to `/configurator` → categories load from API
   - Select a category → option groups load dynamically
   - Customize options → price updates
   - Click "Generate" → design saves to DB, AI generation triggers
   - Generation completes → image displays
   - "Request Quote" → modal submits to server
3. **Phase 3:** Navigate authenticated:
   - `/my-designs` → shows saved designs from DB
   - `/credits` → shows packages, balance, history
   - `/my-quotes` → shows submitted quotes
   - `/dashboard` → overview with recent data
4. **Phase 4:** Test edge cases:
   - Unauthenticated user on Step 3 → login redirect
   - 0 credits + 0 free remaining → shows "buy credits" message
   - Empty states on all list pages
   - Error handling on failed API calls

**Browser testing:** Use Playwright MCP tools to verify the full flow end-to-end.
