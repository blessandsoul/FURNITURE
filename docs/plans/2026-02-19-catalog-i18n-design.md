# Catalog i18n + Configurator Translation Gaps

**Date:** 2026-02-19
**Status:** Approved

## Problem

The configurator shows all catalog options (category names, option group names, option value labels like "Navy Blue", "Linen") in English only. The site supports EN/KA/RU. AI prompts must remain English.

## Decision

JSON translation columns on existing catalog tables. English stays in the base `name`/`label`/`description` columns (backward compatible, always the fallback, used by AI prompt builder). Translations stored in a nullable `translations` JSON column.

## Schema Changes

```prisma
model FurnitureCategory {
  translations Json?  // { "ka": { "name": "...", "description": "..." }, "ru": { ... } }
}

model OptionGroup {
  translations Json?  // { "ka": { "name": "...", "description": "..." }, "ru": { ... } }
}

model OptionValue {
  translations Json?  // { "ka": { "label": "...", "description": "..." }, "ru": { ... } }
}
```

## Server Changes

- Public endpoints return `translations` field as-is (no locale filtering server-side)
- Admin create/update endpoints accept `translations` in request body
- Zod schemas updated to validate translations shape
- Prompt builder unchanged (uses English base columns)

## Client Changes

- Utility: `getTranslatedField(item, field, locale)` returns `item.translations?.[locale]?.[field] ?? item[field]`
- Types updated: `PublicCategory`, `PublicOptionGroup`, `PublicOptionValue` gain `translations?`
- Components updated: `CategoryCard`, `OptionGroup`, `OptionChip`, `ColorSwatch`, `PricePanel`, `Step2Customize`
- Configurator state unchanged (stores IDs only)

## Hardcoded String Fixes

| Component | Fix |
|---|---|
| `Step1RoomUpload.tsx` | Add all strings to Configurator namespace, use `useTranslations` |
| `ConfiguratorWizard.tsx` | Remove hardcoded step arrays, use StepIndicator translated defaults |
| `OptionGroup.tsx` | Replace `(Required)` with translation key |
| `CategoryCard.tsx` | Replace `from` with translation key |
| `Step3Result.tsx` | Replace fallback error string with translation key |
| `page.tsx` metadata | Use `generateMetadata` with translations |

## What Stays English

- AI prompt (`promptHint`, system instructions)
- Slugs (machine-readable)
- Base `name`/`label`/`description` columns
