# AI Sofa Designer — Server Implementation Plan

## Context

The furniture business partner currently shows pre-made photos to clients manually. Competitors have expensive, slow custom designers. We're building a web platform where users design their own sofa with AI-generated images, see live pricing, and contact the partner only when they love the design.

**This plan covers server-side only.** The client already has a 4-step configurator wizard (mocked AI). After this server work is done, we'll wire the client to these real APIs.

## Key Decisions

- **AI runs on Fastify** — centralized cost control, rate limiting, design history
- **Google Gemini** — best Georgian language support (`gemini-2.5-flash` for image generation)
- **Login required** to use the designer
- **Server-managed pricing** — partner updates prices via admin panel
- **3 free generations/day** per user, then credit-based
- **Admin panel from the start** — CRUD for catalog, credits, quotes
- **Sofa only first** — schema supports future furniture categories

---

## Phase 1: Schema & Dependencies

### Step 1.1 — Install new dependencies

```bash
npm install @google/genai sharp @fastify/static
npm install -D @types/sharp
```

### Step 1.2 — Add env vars to `server/src/config/env.ts`

```
GEMINI_API_KEY        # Google AI API key
GEMINI_MODEL          # default: "gemini-2.5-flash"
IMAGE_STORAGE_PATH    # default: "./uploads/generations"
IMAGE_BASE_URL        # default: "http://localhost:3000/uploads/generations"
```

### Step 1.3 — Prisma schema additions (`server/prisma/schema.prisma`)

Add **10 new models** + update `User` with new relations:

**Catalog models:**
- `FurnitureCategory` — id, name, slug (unique), description, basePrice (Decimal), currency (default GEL), imageUrl, isActive, sortOrder. Table: `furniture_categories`
- `OptionGroup` — id, categoryId (FK → FurnitureCategory), name, slug, description, isRequired, isActive, sortOrder. Unique: `[categoryId, slug]`. Table: `option_groups`
- `OptionValue` — id, groupId (FK → OptionGroup), label, slug, description, priceModifier (Decimal, default 0), colorHex, imageUrl, **promptHint** (AI prompt fragment), isActive, sortOrder. Unique: `[groupId, slug]`. Table: `option_values`

**Design models:**
- `Design` — id, userId (FK → User), categoryId (FK → FurnitureCategory), name, totalPrice (Decimal), currency, **configSnapshot** (Json — price/option snapshot at creation time), imageUrl, thumbnailUrl, status (enum: DRAFT/GENERATED/QUOTED). Table: `designs`
- `DesignOptionItem` — id, designId (FK → Design), optionValueId (FK → OptionValue). Junction table for relational queries. Unique: `[designId, optionValueId]`. Table: `design_option_items`

**AI models:**
- `AiGeneration` — id, userId (FK → User), designId (FK → Design, optional), prompt (Text), userFreeText (Text, optional), model, status (enum: PENDING/PROCESSING/COMPLETED/FAILED), imageUrl, thumbnailUrl, errorMessage, promptTokens, totalTokens, wasFree (Boolean), creditsUsed (Int), durationMs. Table: `ai_generations`

**Credit models:**
- `CreditBalance` — id, userId (unique FK → User), balance (Int, default 0). Table: `credit_balances`
- `CreditTransaction` — id, userId (FK → User), amount (Int, +/-), type (enum: PURCHASE/GENERATION/REFUND/BONUS/ADJUSTMENT), description, referenceId. Table: `credit_transactions`
- `CreditPackage` — id, name, credits (Int), price (Decimal), currency, description, isActive, sortOrder. Table: `credit_packages`

**Quote model:**
- `Quote` — id, userId (FK → User), designId (FK → Design), contactName, contactEmail, contactPhone, message, quotedPrice (Decimal), currency, status (enum: PENDING/VIEWED/CONTACTED/COMPLETED/CANCELLED), adminNotes, respondedAt. Table: `quotes`

**User model additions** (new relation fields only):
```prisma
designs            Design[]
aiGenerations      AiGeneration[]
creditBalance      CreditBalance?
creditTransactions CreditTransaction[]
quotes             Quote[]
```

### Step 1.4 — Run migration

```bash
npm run prisma:migrate:dev -- --name add_sofa_designer_models
```

### Step 1.5 — Create shared libs

- `server/src/libs/gemini.ts` — GoogleGenAI client singleton (uses `env.GEMINI_API_KEY`)
- `server/src/libs/image-storage.ts` — `saveGeneratedImage(userId, generationId, base64Data)` → writes PNG + generates thumbnail via `sharp` → returns `{ imageUrl, thumbnailUrl }`
- Register `@fastify/static` in `app.ts` for the `uploads/` directory

---

## Phase 2: Catalog Module

**Path:** `server/src/modules/catalog/`
**Files:** `catalog.routes.ts`, `catalog.controller.ts`, `catalog.service.ts`, `catalog.repo.ts`, `catalog.schemas.ts`, `catalog.types.ts`
**Route prefix:** `/api/v1/catalog`

### Public routes (no auth)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/categories` | List active categories |
| GET | `/categories/:slug` | Category with all option groups + values |
| GET | `/categories/:categoryId/options` | Option groups + values for a category |

### Admin routes (authenticate + authorize('ADMIN'))
| Method | Path | Description |
|--------|------|-------------|
| POST | `/categories` | Create category |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Soft-delete (isActive=false) |
| POST | `/option-groups` | Create option group |
| PUT | `/option-groups/:id` | Update option group |
| DELETE | `/option-groups/:id` | Soft-delete |
| POST | `/option-values` | Create option value |
| PUT | `/option-values/:id` | Update option value (including price & promptHint) |
| DELETE | `/option-values/:id` | Soft-delete |

### Service details
- Redis cache for public reads: `catalog:categories` (5min TTL), `catalog:options:{categoryId}` (5min TTL)
- Invalidate cache on any admin write operation
- Slug generation from name (lowercase, hyphenated)
- Validate parent exists on create (categoryId for groups, groupId for values)

---

## Phase 3: Credits Module

**Path:** `server/src/modules/credits/`
**Route prefix:** `/api/v1/credits`

### Routes
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/balance` | User | Get credit balance |
| GET | `/transactions` | User | Transaction history (paginated) |
| GET | `/packages` | Public | List credit packages |
| POST | `/purchase` | User | Purchase a package (payment placeholder) |
| POST | `/admin/adjust` | Admin | Manually adjust user credits |
| POST | `/admin/packages` | Admin | Create credit package |
| PUT | `/admin/packages/:id` | Admin | Update credit package |
| DELETE | `/admin/packages/:id` | Admin | Deactivate credit package |

### Service details — Ledger pattern
- `CreditBalance` = materialized current balance (fast reads)
- `CreditTransaction` = immutable audit log (every change)
- `deductCredit(userId, amount, referenceId)` — uses Prisma `$transaction` with `Serializable` isolation to prevent race conditions
- `addCredits(userId, amount, type, referenceId)` — increment + log
- `refundCredit(userId, amount, referenceId)` — called on failed AI generation
- Redis cache: `credit_balance:{userId}` (10min TTL), invalidated on writes
- `purchasePackage` has a clear `// TODO: payment integration` hook for BOG Pay / Stripe

---

## Phase 4: Designs Module

**Path:** `server/src/modules/designs/`
**Route prefix:** `/api/v1/designs`

### Routes
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | User | List user's designs (paginated) |
| GET | `/:id` | User | Get single design (own only) |
| POST | `/` | User | Create design (select category + options) |
| PUT | `/:id` | User | Update design options |
| DELETE | `/:id` | User | Delete design |
| POST | `/calculate-price` | User | Calculate price without saving |
| GET | `/admin/all` | Admin | List all designs (paginated) |

### Service details — Price calculation
1. Validate category exists & is active
2. Validate every `optionValueId` belongs to an option group under this category
3. Validate all required option groups have exactly one selection
4. Calculate: `category.basePrice + SUM(selectedValues.priceModifier)`
5. Build `configSnapshot` JSON: `{ basePrice, currency, options: [{ groupName, groupSlug, valueLabel, valueSlug, priceModifier }] }`
6. Create `Design` + `DesignOptionItem` records in a transaction
7. Ownership check on all reads/updates/deletes (`design.userId === currentUser.userId`)

---

## Phase 5: AI Generation Module

**Path:** `server/src/modules/ai-generation/`
**Route prefix:** `/api/v1/ai`

### Routes
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/generate` | User | Generate AI image for a design |
| GET | `/generations` | User | User's generation history (paginated) |
| GET | `/generations/:id` | User | Single generation detail |
| GET | `/status` | User | Free generations remaining today + credit balance |
| GET | `/admin/generations` | Admin | All generations (paginated, filterable) |

### Core `generate()` flow
```
1. Acquire Redis lock: SET gen_lock:{userId} 1 NX EX 120
   → If locked, throw "Generation already in progress"

2. Check daily free limit:
   → Redis key: gen_count:{userId}:{YYYY-MM-DD}
   → If count < 3: isFree=true
   → If count >= 3: check credit balance → deduct 1 credit (or throw INSUFFICIENT_CREDITS)

3. Load design with all options (verify ownership)

4. Build prompt from design:
   → System instruction (professional furniture photographer)
   → Furniture type from category
   → Each option's promptHint (admin-configured per option value)
   → Optional user freeText (max 500 chars, sanitized)
   → Style instructions (3/4 angle, clean background, studio lighting)

5. Create AiGeneration record (status=PROCESSING)

6. Call Gemini API:
   → Use @google/genai SDK
   → Model: env.GEMINI_MODEL (default: gemini-2.5-flash)
   → Extract inline image data from response

7. Save image:
   → Write PNG to uploads/generations/{userId}/{generationId}.png
   → Generate thumbnail via sharp (400px width)

8. Update records:
   → AiGeneration: status=COMPLETED, imageUrl, tokens, durationMs
   → Design: imageUrl, thumbnailUrl, status=GENERATED
   → Increment Redis gen_count:{userId}:{today}

9. Release lock, return result

ON ERROR: Mark generation FAILED, refund credits if charged, release lock
```

### Redis keys
| Key | Value | TTL | Purpose |
|-----|-------|-----|---------|
| `gen_count:{userId}:{YYYY-MM-DD}` | Int | 86400s | Daily free generation counter |
| `gen_lock:{userId}` | "1" | 120s | Prevent concurrent generations |

### Error handling
- No image in response → retry once, then FAILED + refund
- 429 (rate limited) → FAILED + refund + "AI service busy"
- Safety block → FAILED + refund + "Try adjusting your description"
- Timeout (>60s) → abort + FAILED + refund
- Storage failure → FAILED + refund + log error

---

## Phase 6: Quotes Module

**Path:** `server/src/modules/quotes/`
**Route prefix:** `/api/v1/quotes`

### Routes
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | User | Submit quote request |
| GET | `/` | User | List user's quotes (paginated) |
| GET | `/:id` | User | Get quote detail (own only) |
| PUT | `/:id/cancel` | User | Cancel pending quote |
| GET | `/admin/all` | Admin | List all quotes (paginated, filter by status) |
| GET | `/admin/:id` | Admin | Quote detail with user info |
| PUT | `/admin/:id/status` | Admin | Update quote status |
| PUT | `/admin/:id/notes` | Admin | Add admin notes |

### Service details
- Validate design exists, belongs to user, has status=GENERATED (has an AI image)
- Snapshot contact info + price from user profile and design
- Update design status to QUOTED
- Set `respondedAt` on first status change from PENDING
- Return partner contact info (from env or a settings constant) alongside the saved quote

---

## Phase 7: Seed Data

Update `prisma/seed.ts` to create:

1. **Admin user** — admin@atlas.ge / secure password (Password123!)
2. **"Sofa" category** — base price ~500 GEL
3. **10 option groups** with realistic values:
   - Color (8-10 values: Navy Blue, Charcoal Gray, Forest Green, Burgundy, Cream, Cognac, Slate Blue, Terracotta...)
   - Material (6 values: Italian Leather, Velvet, Linen, Cotton, Microfiber, Bouclé)
   - Size (4 values: 2-Seat, 3-Seat, L-Shaped, U-Shaped)
   - Leg Style (5 values: Wooden Tapered, Metal Hairpin, Chrome, No Legs/Floor, Wooden Block)
   - Upholstery Type (4 values: Full Upholstery, Semi-Upholstery, Loose Covers, Fixed)
   - Arm Type (4 values: Rolled, Square, Pillow, Track)
   - Back Style (4 values: Tight Back, Loose Cushion, Tufted, Pillow Back)
   - Cushion Type (3 values: High-Density Foam, Feather-Down, Pocket Spring)
   - Seat Depth (2 values: Standard, Deep)
   - Firmness (3 values: Firm, Medium, Soft)
4. Each value has a realistic `priceModifier` and descriptive `promptHint`
5. **3 credit packages**: Starter (5 credits / 10 GEL), Pro (20 credits / 35 GEL), Business (50 credits / 75 GEL)

---

## Phase 8: Postman Collection

Update `server/postman/furniture-api.postman_collection.json` with folders:
- **Catalog** — all public + admin endpoints
- **Credits** — balance, transactions, packages, purchase, admin adjust
- **Designs** — CRUD + calculate-price + admin list
- **AI Generation** — generate, history, status, admin list
- **Quotes** — submit, list, cancel, admin endpoints

---

## Final Route Registration in `app.ts`

```typescript
await app.register(authRoutes, { prefix: '/api/v1/auth' });
await app.register(catalogRoutes, { prefix: '/api/v1/catalog' });
await app.register(creditRoutes, { prefix: '/api/v1/credits' });
await app.register(designRoutes, { prefix: '/api/v1/designs' });
await app.register(aiGenerationRoutes, { prefix: '/api/v1/ai' });
await app.register(quoteRoutes, { prefix: '/api/v1/quotes' });
```

## New File Tree

```
server/src/
├── libs/
│   ├── gemini.ts              # NEW — GoogleGenAI singleton
│   └── image-storage.ts       # NEW — save PNG + thumbnail via sharp
├── modules/
│   ├── auth/                  # existing, unchanged
│   ├── catalog/               # NEW — 6 files
│   ├── credits/               # NEW — 6 files
│   ├── designs/               # NEW — 6 files
│   ├── ai-generation/         # NEW — 6 files
│   └── quotes/                # NEW — 6 files
└── (everything else unchanged)
```

## New Dependencies

| Package | Purpose |
|---------|---------|
| `@google/genai` | Google Gemini SDK |
| `sharp` | Image thumbnail generation |
| `@fastify/static` | Serve uploaded images |

## Implementation Order & Dependencies

```
Phase 1 (Schema + Dependencies) — foundation, no module deps
  ↓
Phase 2 (Catalog) — no deps on other new modules
  ↓
Phase 3 (Credits) — no deps on catalog, needed by AI generation
  ↓
Phase 4 (Designs) — depends on Catalog (references categories + options)
  ↓
Phase 5 (AI Generation) — depends on Designs + Credits
  ↓
Phase 6 (Quotes) — depends on Designs
  ↓
Phase 7 (Seed Data) — depends on all schemas existing
  ↓
Phase 8 (Postman) — depends on all routes being defined
```

## Verification Plan

After each module, test via Postman:
1. **Catalog**: Create category → create option groups → create values → fetch public endpoints → verify Redis caching
2. **Credits**: Check initial balance (0) → admin create packages → purchase package → verify ledger
3. **Designs**: Create design with option selections → verify price calculation → update → delete
4. **AI Generation**: Check status (3 free) → generate image → verify image saved → generate 3 more → verify credit deduction → verify insufficient credits error
5. **Quotes**: Submit quote for generated design → verify status tracking → admin update status
6. **Full flow**: Register → login → browse catalog → create design → generate image → submit quote → admin views quote
