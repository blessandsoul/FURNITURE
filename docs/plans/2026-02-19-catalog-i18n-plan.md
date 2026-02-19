# Catalog i18n Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Georgian/Russian translations to catalog items (categories, option groups, option values) and fix all hardcoded English strings in the configurator.

**Architecture:** JSON `translations` column on 3 catalog tables. English stays in base columns (used by AI prompt builder). API returns translations alongside English. Client picks correct locale at render time via a utility function. Hardcoded UI strings moved to next-intl JSON files.

**Tech Stack:** Prisma (migration), Zod (validation), next-intl (client i18n), TypeScript

---

### Task 1: Prisma Migration — Add translations columns

**Files:**
- Modify: `server/prisma/schema.prisma` (lines 90-147, the 3 catalog models)

**Step 1: Add `translations` field to the three catalog models**

In `schema.prisma`, add to `FurnitureCategory` (after `sortOrder` line 99):
```prisma
  translations Json?     @db.Json
```

Add to `OptionGroup` (after `sortOrder` line 116):
```prisma
  translations Json?     @db.Json
```

Add to `OptionValue` (after `sortOrder` line 138):
```prisma
  translations Json?     @db.Json
```

**Step 2: Run migration**

```bash
cd server && npx prisma migrate dev --name add_catalog_translations
```

Expected: Migration created, `translations` JSON nullable column added to all 3 tables.

**Step 3: Regenerate Prisma client**

```bash
cd server && npx prisma generate
```

**Step 4: Commit**

```bash
git add server/prisma/schema.prisma server/prisma/migrations/
git commit -m "feat: add translations JSON column to catalog tables"
```

---

### Task 2: Server — Update types, schemas, and mappers

**Files:**
- Modify: `server/src/modules/catalog/catalog.types.ts`
- Modify: `server/src/modules/catalog/catalog.schemas.ts`
- Modify: `server/src/modules/catalog/catalog.service.ts`

**Step 1: Update server types to include translations**

In `catalog.types.ts`, add `translations` to all 3 public interfaces:

```typescript
// Add to PublicCategory (after sortOrder):
  translations: Record<string, Record<string, string>> | null;

// Add to PublicOptionGroup (after sortOrder, before optionValues):
  translations: Record<string, Record<string, string>> | null;

// Add to PublicOptionValue (after sortOrder):
  translations: Record<string, Record<string, string>> | null;
```

**Step 2: Update Zod schemas to accept translations on create/update**

In `catalog.schemas.ts`, define a shared translations schema and add it to all 6 schemas:

```typescript
// Add at top of file, after imports:
const TranslationsSchema = z.record(
  z.string(),
  z.record(z.string(), z.string()),
).optional();
```

Add `translations: TranslationsSchema` to:
- `CreateCategorySchema` (after `sortOrder`)
- `UpdateCategorySchema` (after `sortOrder`)
- `CreateOptionGroupSchema` (after `sortOrder`)
- `UpdateOptionGroupSchema` (after `sortOrder`)
- `CreateOptionValueSchema` (after `sortOrder`)
- `UpdateOptionValueSchema` (after `sortOrder`)

**Step 3: Update service mappers to include translations**

In `catalog.service.ts`, update the three mapper methods:

`toPublicCategory`: add `translations: (category.translations as Record<string, Record<string, string>>) ?? null,`

`toPublicOptionGroupBase`: add `translations: (group.translations as Record<string, Record<string, string>>) ?? null,`

`toPublicOptionValue`: add `translations: (value.translations as Record<string, Record<string, string>>) ?? null,`

**Step 4: Update repo create methods to pass translations**

In `catalog.repo.ts`, update:
- `createCategory`: add `translations: data.translations ?? undefined,` to the create data
- `createOptionGroup`: add `translations: data.translations ?? undefined,` to the create data
- `createOptionValue`: add `translations: data.translations ?? undefined,` to the create data

The update methods already use `data` spread, so translations will pass through automatically.

**Step 5: Commit**

```bash
git add server/src/modules/catalog/
git commit -m "feat: include translations in catalog API types, schemas, and mappers"
```

---

### Task 3: Seed data — Add Georgian/Russian translations

**Files:**
- Modify: `server/prisma/seed.ts`

**Step 1: Add translations to sofa category**

Update the sofa upsert `create` block to include:
```typescript
translations: {
  ka: { name: 'დივანი', description: 'ინდივიდუალურად დიზაინირებული დივნები თქვენი ზუსტი სპეციფიკაციების მიხედვით. აირჩიეთ სტილი, მასალა, ფერი და კომფორტის ვარიანტები.' },
  ru: { name: 'Диван', description: 'Диваны, разработанные по вашим точным спецификациям. Выберите стиль, материал, цвет и варианты комфорта.' },
},
```

**Step 2: Update seedGroup helper to accept translations**

Add `translations?` parameter to both group and values type signatures:
```typescript
async function seedGroup(
  group: { name: string; slug: string; description: string; isRequired: boolean; sortOrder: number; translations?: Record<string, Record<string, string>> },
  values: { label: string; slug: string; description?: string; priceModifier: number; colorHex?: string; promptHint: string; sortOrder: number; translations?: Record<string, Record<string, string>> }[],
): Promise<void> {
```

In the group upsert `create`, add: `translations: group.translations ?? undefined,`
In the value upsert `create`, add: `translations: v.translations ?? undefined,`

**Step 3: Add translations to all 10 option groups and their values**

For each `seedGroup` call, add `translations` to both the group and each value. Here are the translations for all groups:

**Color group:**
```typescript
{ name: 'Color', slug: 'color', ..., translations: { ka: { name: 'ფერი', description: 'აირჩიეთ თქვენი დივნის ძირითადი ფერი' }, ru: { name: 'Цвет', description: 'Выберите основной цвет обивки дивана' } } }
```
Color values translations:
- Navy Blue: `{ ka: { label: 'მუქი ლურჯი' }, ru: { label: 'Тёмно-синий' } }`
- Charcoal Gray: `{ ka: { label: 'მუქი ნაცრისფერი' }, ru: { label: 'Угольно-серый' } }`
- Forest Green: `{ ka: { label: 'ტყის მწვანე' }, ru: { label: 'Тёмно-зелёный' } }`
- Burgundy: `{ ka: { label: 'ბურგუნდი' }, ru: { label: 'Бордовый' } }`
- Cream: `{ ka: { label: 'კრემი' }, ru: { label: 'Кремовый' } }`
- Cognac: `{ ka: { label: 'კონიაკი' }, ru: { label: 'Коньячный' } }`
- Slate Blue: `{ ka: { label: 'ფიქალის ლურჯი' }, ru: { label: 'Серо-голубой' } }`
- Terracotta: `{ ka: { label: 'ტერაკოტა' }, ru: { label: 'Терракотовый' } }`
- Olive: `{ ka: { label: 'ზეთისხილისფერი' }, ru: { label: 'Оливковый' } }`
- Mustard: `{ ka: { label: 'მდოგვისფერი' }, ru: { label: 'Горчичный' } }`

**Material group:**
```typescript
{ name: 'Material', slug: 'material', ..., translations: { ka: { name: 'მასალა', description: 'აირჩიეთ გარეკანის მასალა' }, ru: { name: 'Материал', description: 'Выберите материал обивки' } } }
```
Material values:
- Italian Leather: `{ ka: { label: 'იტალიური ტყავი' }, ru: { label: 'Итальянская кожа' } }`
- Velvet: `{ ka: { label: 'ხავერდი' }, ru: { label: 'Бархат' } }`
- Linen: `{ ka: { label: 'სელი' }, ru: { label: 'Лён' } }`
- Cotton: `{ ka: { label: 'ბამბა' }, ru: { label: 'Хлопок' } }`
- Microfiber: `{ ka: { label: 'მიკროფიბრა' }, ru: { label: 'Микрофибра' } }`
- Bouclé: `{ ka: { label: 'ბუკლე' }, ru: { label: 'Букле' } }`

**Size group:**
```typescript
translations: { ka: { name: 'ზომა', description: 'აირჩიეთ დივნის ზომა' }, ru: { name: 'Размер', description: 'Выберите размер дивана' } }
```
Size values:
- 2-Seat: `{ ka: { label: '2-ადგილიანი' }, ru: { label: '2-местный' } }`
- 3-Seat: `{ ka: { label: '3-ადგილიანი' }, ru: { label: '3-местный' } }`
- L-Shaped: `{ ka: { label: 'L-ფორმის' }, ru: { label: 'Угловой (L)' } }`
- U-Shaped: `{ ka: { label: 'U-ფორმის' }, ru: { label: 'П-образный (U)' } }`

**Leg Style group:**
```typescript
translations: { ka: { name: 'ფეხის სტილი', description: 'აირჩიეთ დივნის ფეხების სტილი' }, ru: { name: 'Тип ножек', description: 'Выберите стиль ножек дивана' } }
```
Leg Style values:
- Wooden Tapered: `{ ka: { label: 'ხის კონუსური' }, ru: { label: 'Деревянные конусные' } }`
- Metal Hairpin: `{ ka: { label: 'მეტალის ჰეარპინი' }, ru: { label: 'Металлические шпильки' } }`
- Chrome: `{ ka: { label: 'ქრომი' }, ru: { label: 'Хромированные' } }`
- No Legs / Floor: `{ ka: { label: 'ფეხების გარეშე' }, ru: { label: 'Без ножек' } }`
- Wooden Block: `{ ka: { label: 'ხის ბლოკი' }, ru: { label: 'Деревянные кубические' } }`

**Upholstery Type group:**
```typescript
translations: { ka: { name: 'გარეკანის ტიპი', description: 'როგორ ფარავს ქსოვილი ჩარჩოს' }, ru: { name: 'Тип обивки', description: 'Как ткань покрывает каркас' } }
```
Values:
- Full Upholstery: `{ ka: { label: 'სრული გარეკანი' }, ru: { label: 'Полная обивка' } }`
- Semi-Upholstery: `{ ka: { label: 'ნაწილობრივი გარეკანი' }, ru: { label: 'Частичная обивка' } }`
- Loose Covers: `{ ka: { label: 'მოსახსნელი საფარი' }, ru: { label: 'Съёмные чехлы' } }`
- Fixed: `{ ka: { label: 'ფიქსირებული' }, ru: { label: 'Фиксированная' } }`

**Arm Type group:**
```typescript
translations: { ka: { name: 'სახელურის ტიპი', description: 'აირჩიეთ სახელურის სტილი' }, ru: { name: 'Тип подлокотников', description: 'Выберите стиль подлокотников' } }
```
Values:
- Rolled: `{ ka: { label: 'მოხვეული' }, ru: { label: 'Закруглённые' } }`
- Square: `{ ka: { label: 'კვადრატული' }, ru: { label: 'Прямые' } }`
- Pillow: `{ ka: { label: 'ბალიშური' }, ru: { label: 'Подушечные' } }`
- Track: `{ ka: { label: 'ვიწრო' }, ru: { label: 'Узкие' } }`

**Back Style group:**
```typescript
translations: { ka: { name: 'ზურგის სტილი', description: 'აირჩიეთ ზურგის ბალიშის სტილი' }, ru: { name: 'Стиль спинки', description: 'Выберите стиль подушки спинки' } }
```
Values:
- Tight Back: `{ ka: { label: 'მჭიდრო ზურგი' }, ru: { label: 'Гладкая спинка' } }`
- Loose Cushion: `{ ka: { label: 'თავისუფალი ბალიში' }, ru: { label: 'Съёмные подушки' } }`
- Tufted: `{ ka: { label: 'ტაფტინგი' }, ru: { label: 'Каретная стяжка' } }`
- Pillow Back: `{ ka: { label: 'ბალიშის ზურგი' }, ru: { label: 'Подушечная спинка' } }`

**Cushion Type group:**
```typescript
translations: { ka: { name: 'ბალიშის ტიპი', description: 'აირჩიეთ სავარძლის ბალიშის შემავსებელი' }, ru: { name: 'Тип наполнителя', description: 'Выберите наполнитель сидения' } }
```
Values:
- High-Density Foam: `{ ka: { label: 'მაღალი სიმკვრივის ქაფი' }, ru: { label: 'Пенополиуретан' } }`
- Feather-Down: `{ ka: { label: 'ბუმბული' }, ru: { label: 'Перо-пух' } }`
- Pocket Spring: `{ ka: { label: 'ჯიბის ზამბარა' }, ru: { label: 'Пружинный блок' } }`

**Seat Depth group:**
```typescript
translations: { ka: { name: 'სავარძლის სიღრმე', description: 'სტანდარტული ან ღრმა სავარძელი' }, ru: { name: 'Глубина сидения', description: 'Стандартная или глубокая посадка' } }
```
Values:
- Standard: `{ ka: { label: 'სტანდარტული' }, ru: { label: 'Стандартная' } }`
- Deep: `{ ka: { label: 'ღრმა' }, ru: { label: 'Глубокая' } }`

**Firmness group:**
```typescript
translations: { ka: { name: 'სიმაგრე', description: 'აირჩიეთ სიმაგრის დონე' }, ru: { name: 'Жёсткость', description: 'Выберите уровень жёсткости' } }
```
Values:
- Firm: `{ ka: { label: 'მაგარი' }, ru: { label: 'Жёсткий' } }`
- Medium: `{ ka: { label: 'საშუალო' }, ru: { label: 'Средний' } }`
- Soft: `{ ka: { label: 'რბილი' }, ru: { label: 'Мягкий' } }`

**Step 4: Commit**

```bash
git add server/prisma/seed.ts
git commit -m "feat: add KA/RU translations to catalog seed data"
```

---

### Task 4: Client — Update types and create translation utility

**Files:**
- Modify: `client/src/features/catalog/types/catalog.types.ts`
- Create: `client/src/features/catalog/utils/getTranslatedField.ts`

**Step 1: Add translations to client types**

In `catalog.types.ts`, add to all 3 interfaces:

```typescript
// After sortOrder in PublicCategory:
    translations: Record<string, Record<string, string>> | null;

// After sortOrder in PublicOptionGroup (before optionValues):
    translations: Record<string, Record<string, string>> | null;

// After sortOrder in PublicOptionValue:
    translations: Record<string, Record<string, string>> | null;
```

**Step 2: Create the translation utility**

Create `client/src/features/catalog/utils/getTranslatedField.ts`:

```typescript
interface Translatable {
    translations: Record<string, Record<string, string>> | null;
    [key: string]: unknown;
}

/**
 * Returns the translated value of a field for the given locale,
 * falling back to the English base field value.
 */
export function getTranslatedField<T extends Translatable>(
    item: T,
    field: string,
    locale: string,
): string {
    if (locale !== 'en' && item.translations?.[locale]?.[field]) {
        return item.translations[locale][field];
    }
    return String(item[field] ?? '');
}
```

**Step 3: Commit**

```bash
git add client/src/features/catalog/
git commit -m "feat: add translations type and getTranslatedField utility"
```

---

### Task 5: Client — Update catalog display components to use translations

**Files:**
- Modify: `client/src/features/configurator/components/options/CategoryCard.tsx`
- Modify: `client/src/features/configurator/components/options/OptionGroup.tsx`
- Modify: `client/src/features/configurator/components/options/OptionChip.tsx`
- Modify: `client/src/features/configurator/components/options/ColorSwatch.tsx`
- Modify: `client/src/features/configurator/components/pricing/PricePanel.tsx`
- Modify: `client/src/features/configurator/components/wizard/Step2Customize.tsx`

**Step 1: Update CategoryCard**

Add imports:
```typescript
import { useLocale } from 'next-intl';
import { getTranslatedField } from '@/features/catalog/utils/getTranslatedField';
```

Inside the component, add: `const locale = useLocale();`

Replace `{category.name}` with `{getTranslatedField(category, 'name', locale)}`
Replace `{category.description}` usage with `{getTranslatedField(category, 'description', locale)}`

Also fix the `alt` prop: `alt={getTranslatedField(category, 'name', locale)}`

**Step 2: Update OptionGroup**

Add imports:
```typescript
import { useLocale } from 'next-intl';
import { getTranslatedField } from '@/features/catalog/utils/getTranslatedField';
```

Inside the component, add: `const locale = useLocale();`

Replace `{group.name}` with `{getTranslatedField(group, 'name', locale)}`
Replace the `selectedLabel` computation:
```typescript
const selectedValue = group.optionValues.find((v) => v.id === selectedValueId);
const selectedLabel = selectedValue ? getTranslatedField(selectedValue, 'label', locale) : undefined;
```

**Step 3: Update OptionChip**

Add imports:
```typescript
import { useLocale } from 'next-intl';
import { getTranslatedField } from '@/features/catalog/utils/getTranslatedField';
```

Inside the component, add: `const locale = useLocale();`

Replace `{value.label}` with `{getTranslatedField(value, 'label', locale)}`

**Step 4: Update ColorSwatch**

Add imports:
```typescript
import { useLocale } from 'next-intl';
import { getTranslatedField } from '@/features/catalog/utils/getTranslatedField';
```

Inside the component, add: `const locale = useLocale();`

Replace `aria-label={value.label}` with `aria-label={getTranslatedField(value, 'label', locale)}`
Replace `title={value.label}` with `title={getTranslatedField(value, 'label', locale)}`

**Step 5: Update PricePanel (usePriceBreakdown)**

This is the `usePriceBreakdown` hook. Since it's a hook, it can use `useLocale()`.

Add imports at top:
```typescript
import { useLocale } from 'next-intl';
import { getTranslatedField } from '@/features/catalog/utils/getTranslatedField';
```

Inside `usePriceBreakdown`, add `const locale = useLocale();` and add `locale` to the `useMemo` deps.

Replace the line items construction:
```typescript
const lineItems: PriceBreakdown['lineItems'] = [
    { label: getTranslatedField(category, 'name', locale), amount: category.basePrice, isBase: true },
];
```

Replace the modifier label:
```typescript
lineItems.push({
    label: `${getTranslatedField(group, 'name', locale)}: ${getTranslatedField(value, 'label', locale)}`,
    amount: value.priceModifier,
    isBase: false,
});
```

**Step 6: Update Step2Customize heading**

The heading uses `t('customize.heading', { name: category.name })`. Update to:
```typescript
t('customize.heading', { name: getTranslatedField(category, 'name', locale) })
```

Add imports and `const locale = useLocale();` to the component.

**Step 7: Commit**

```bash
git add client/src/features/configurator/components/ client/src/features/catalog/
git commit -m "feat: use translated catalog labels in all configurator components"
```

---

### Task 6: Fix hardcoded strings — Step1RoomUpload

**Files:**
- Modify: `client/src/features/configurator/components/wizard/Step1RoomUpload.tsx`
- Modify: `client/src/messages/en.json`
- Modify: `client/src/messages/ka.json`
- Modify: `client/src/messages/ru.json`

**Step 1: Add translation keys to all 3 JSON files**

Add under `Configurator` → new `roomUpload` key:

**en.json:**
```json
"roomUpload": {
    "heading": "Upload Your Room",
    "subheading": "Upload a photo of your room and we'll place your configured furniture in it",
    "removeAria": "Remove room image",
    "photoUploaded": "Room photo uploaded",
    "dragDrop": "Drag & drop your room photo",
    "orBrowse": "or click to browse",
    "fileTypes": "JPEG, PNG, or WebP \u00b7 Max 5MB",
    "uploading": "Uploading...",
    "helperText": "Upload a room photo to continue to customization",
    "invalidType": "Please upload a JPEG, PNG, or WebP image.",
    "tooLarge": "Image must be under 5MB.",
    "uploadAria": "Upload room photo"
}
```

**ka.json:**
```json
"roomUpload": {
    "heading": "ატვირთეთ თქვენი ოთახი",
    "subheading": "ატვირთეთ თქვენი ოთახის ფოტო და ჩვენ მასში თქვენ მიერ კონფიგურირებულ ავეჯს განვათავსებთ",
    "removeAria": "ოთახის სურათის წაშლა",
    "photoUploaded": "ოთახის ფოტო ატვირთულია",
    "dragDrop": "გადმოათრიეთ თქვენი ოთახის ფოტო",
    "orBrowse": "ან დააჭირეთ ასარჩევად",
    "fileTypes": "JPEG, PNG ან WebP \u00b7 მაქს. 5MB",
    "uploading": "იტვირთება...",
    "helperText": "ატვირთეთ ოთახის ფოტო მორგების გასაგრძელებლად",
    "invalidType": "გთხოვთ, ატვირთეთ JPEG, PNG ან WebP სურათი.",
    "tooLarge": "სურათი უნდა იყოს 5MB-ზე ნაკლები.",
    "uploadAria": "ოთახის ფოტოს ატვირთვა"
}
```

**ru.json:**
```json
"roomUpload": {
    "heading": "Загрузите вашу комнату",
    "subheading": "Загрузите фото комнаты, и мы разместим в ней настроенную мебель",
    "removeAria": "Удалить фото комнаты",
    "photoUploaded": "Фото комнаты загружено",
    "dragDrop": "Перетащите фото комнаты сюда",
    "orBrowse": "или нажмите для выбора",
    "fileTypes": "JPEG, PNG или WebP \u00b7 Макс. 5 МБ",
    "uploading": "Загрузка...",
    "helperText": "Загрузите фото комнаты, чтобы перейти к настройке",
    "invalidType": "Пожалуйста, загрузите изображение JPEG, PNG или WebP.",
    "tooLarge": "Размер изображения должен быть менее 5 МБ.",
    "uploadAria": "Загрузить фото комнаты"
}
```

**Step 2: Update Step1RoomUpload component**

Add `useTranslations` import and usage:
```typescript
import { useTranslations } from 'next-intl';
// Inside component:
const t = useTranslations('Configurator');
```

Replace all hardcoded strings:
- `"Upload Your Room"` → `{t('roomUpload.heading')}`
- `"Upload a photo..."` → `{t('roomUpload.subheading')}`
- `aria-label="Remove room image"` → `aria-label={t('roomUpload.removeAria')}`
- `"Room photo uploaded"` → `{t('roomUpload.photoUploaded')}`
- `"Drag & drop your room photo"` → `{t('roomUpload.dragDrop')}`
- `"or click to browse"` → `{t('roomUpload.orBrowse')}`
- `"JPEG, PNG, or WebP..."` → `{t('roomUpload.fileTypes')}`
- `"Uploading..."` → `{t('roomUpload.uploading')}`
- `aria-label="Upload room photo"` → `aria-label={t('roomUpload.uploadAria')}`
- `"Upload a room photo to continue..."` → `{t('roomUpload.helperText')}`

Update `validateFile` — since it needs translations but is outside the component, move the error strings into the component by returning error codes from `validateFile` and mapping to translations:

```typescript
function validateFile(file: File): 'invalidType' | 'tooLarge' | null {
    if (!ALLOWED_TYPES.includes(file.type)) return 'invalidType';
    if (file.size > MAX_SIZE) return 'tooLarge';
    return null;
}
```

In `handleUpload`, change:
```typescript
const errorKey = validateFile(file);
if (errorKey) {
    toast.error(t(`roomUpload.${errorKey}`));
    return;
}
```

**Step 3: Commit**

```bash
git add client/src/features/configurator/components/wizard/Step1RoomUpload.tsx client/src/messages/
git commit -m "feat: translate Step1RoomUpload component to KA/RU"
```

---

### Task 7: Fix hardcoded strings — ConfiguratorWizard step labels + video placeholder

**Files:**
- Modify: `client/src/features/configurator/components/wizard/ConfiguratorWizard.tsx`
- Modify: `client/src/messages/en.json`
- Modify: `client/src/messages/ka.json`
- Modify: `client/src/messages/ru.json`

**Step 1: Add translation keys for reimagine steps and video placeholder**

Add under `Configurator` → `stepIndicator`:

**en.json** (add alongside existing keys):
```json
"uploadRoom": "Upload Room",
"configurePlace": "Configure & Place",
"result": "Result",
"comingSoon": "Coming Soon",
"videoGeneration": "Video Generation",
"videoDescription": "Generate a video of your furniture design with realistic motion and lighting. This feature is currently under development."
```

**ka.json:**
```json
"uploadRoom": "ოთახის ატვირთვა",
"configurePlace": "კონფიგურაცია და განთავსება",
"result": "შედეგი",
"comingSoon": "მალე",
"videoGeneration": "ვიდეოს გენერაცია",
"videoDescription": "თქვენი ავეჯის დიზაინის ვიდეოს გენერაცია რეალისტური მოძრაობით და განათებით. ეს ფუნქცია ამჟამად მუშავდება."
```

**ru.json:**
```json
"uploadRoom": "Загрузка комнаты",
"configurePlace": "Настройка и размещение",
"result": "Результат",
"comingSoon": "Скоро",
"videoGeneration": "Генерация видео",
"videoDescription": "Создайте видео вашего дизайна мебели с реалистичным движением и освещением. Эта функция в разработке."
```

**Step 2: Update ConfiguratorWizard**

Add `useTranslations`:
```typescript
import { useTranslations } from 'next-intl';
// Inside component:
const t = useTranslations('Configurator');
```

Replace hardcoded step arrays with translated versions:
```typescript
const reimagineSteps = [
    { number: 1 as ConfiguratorStep, label: t('stepIndicator.uploadRoom') },
    { number: 2 as ConfiguratorStep, label: t('stepIndicator.configurePlace') },
    { number: 3 as ConfiguratorStep, label: t('stepIndicator.result') },
];

const scratchSteps = [
    { number: 1 as ConfiguratorStep, label: t('stepIndicator.chooseStyle') },
    { number: 2 as ConfiguratorStep, label: t('stepIndicator.customize') },
    { number: 3 as ConfiguratorStep, label: t('stepIndicator.yourDesign') },
    { number: 4 as ConfiguratorStep, label: t('stepIndicator.video') },
];
```

Replace video placeholder strings:
```typescript
<div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
    {t('stepIndicator.comingSoon')}
</div>
<h3 className="text-lg font-bold text-foreground">{t('stepIndicator.videoGeneration')}</h3>
<p className="max-w-sm text-center text-sm text-muted-foreground">
    {t('stepIndicator.videoDescription')}
</p>
```

**Step 3: Commit**

```bash
git add client/src/features/configurator/components/wizard/ConfiguratorWizard.tsx client/src/messages/
git commit -m "feat: translate wizard step labels and video placeholder"
```

---

### Task 8: Fix remaining hardcoded strings

**Files:**
- Modify: `client/src/features/configurator/components/options/OptionGroup.tsx`
- Modify: `client/src/features/configurator/components/options/CategoryCard.tsx`
- Modify: `client/src/features/configurator/components/wizard/Step3Result.tsx`
- Modify: `client/src/app/[locale]/(configurator)/configurator/page.tsx`
- Modify: `client/src/messages/en.json`
- Modify: `client/src/messages/ka.json`
- Modify: `client/src/messages/ru.json`

**Step 1: Add translation keys**

Add under `Configurator`:

**en.json:**
```json
"options": {
    "required": "(Required)",
    "fromPrice": "from {price}"
},
"result": {
    ...existing keys...,
    "generationFailedFallback": "Generation failed. Please try again."
}
```

**ka.json:**
```json
"options": {
    "required": "(სავალდებულო)",
    "fromPrice": "{price}-დან"
},
"result": {
    ...existing keys...,
    "generationFailedFallback": "გენერაცია ვერ მოხერხდა. გთხოვთ, სცადოთ ხელახლა."
}
```

**ru.json:**
```json
"options": {
    "required": "(Обязательно)",
    "fromPrice": "от {price}"
},
"result": {
    ...existing keys...,
    "generationFailedFallback": "Генерация не удалась. Попробуйте снова."
}
```

**Step 2: Update OptionGroup — `(Required)` string**

Add `useTranslations`:
```typescript
import { useTranslations } from 'next-intl';
const t = useTranslations('Configurator');
```

Replace `(Required)` with `{t('options.required')}`.

**Step 3: Update CategoryCard — `from $` string**

Add `useTranslations`:
```typescript
import { useTranslations } from 'next-intl';
const t = useTranslations('Configurator');
```

Replace:
```tsx
from ${category.basePrice}
```
with:
```tsx
{t('options.fromPrice', { price: `${category.currency} ${category.basePrice}` })}
```

**Step 4: Update Step3Result — fallback error string**

Replace line 72:
```typescript
setError(generation.errorMessage ?? 'Generation failed. Please try again.');
```
with:
```typescript
setError(generation.errorMessage ?? t('result.generationFailedFallback'));
```

**Step 5: Update configurator page.tsx — metadata**

Replace the static `metadata` export with `generateMetadata`:

```typescript
import type { Metadata } from 'next';

interface ConfiguratorPageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ConfiguratorPageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Metadata' });
    return {
        title: t('configuratorTitle'),
        description: t('configuratorDescription'),
    };
}

export default async function ConfiguratorPage({ params }: ConfiguratorPageProps): Promise<React.JSX.Element> {
```

**Step 6: Commit**

```bash
git add client/src/features/configurator/ client/src/app/ client/src/messages/
git commit -m "feat: fix all remaining hardcoded English strings in configurator"
```

---

### Task 9: Also update Step2RoomCustomize heading with translated category name

**Files:**
- Modify: `client/src/features/configurator/components/wizard/Step2RoomCustomize.tsx`

**Step 1: Read and update the component**

This component also uses `category.name` in translation interpolation. Update to use `getTranslatedField`:

Add imports:
```typescript
import { useLocale } from 'next-intl';
import { getTranslatedField } from '@/features/catalog/utils/getTranslatedField';
```

Add `const locale = useLocale();` inside component.

Replace instances of `category.name` used in `t()` calls:
```typescript
t('roomCustomize.heading', { name: getTranslatedField(category, 'name', locale) })
t('roomCustomize.configureDescription', { name: getTranslatedField(category, 'name', locale) })
```

**Step 2: Commit**

```bash
git add client/src/features/configurator/components/wizard/Step2RoomCustomize.tsx
git commit -m "feat: use translated category name in room customize heading"
```

---

### Task 10: Verify — Run builds

**Step 1: Run server TypeScript check**

```bash
cd server && npx tsc --noEmit
```
Expected: No errors.

**Step 2: Run client build**

```bash
cd client && npm run build
```
Expected: Build succeeds with no errors.

**Step 3: If there are errors, fix them**

**Step 4: Final commit if any fixes were needed**

```bash
git add -A && git commit -m "fix: resolve build errors from catalog i18n changes"
```
