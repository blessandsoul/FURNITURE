# Reimagine Your Space — Implementation Plan

## Concept
На Step 1 конфигуратора добавляется **выбор режима**: "Design from Scratch" (текущий флоу) или "Reimagine Your Room" (загрузка фото). Второй путь — отдельный wizard внутри того же конфигуратора с собственными шагами.

## UX Flow

### Step 1: Mode Selection (изменение существующего Step1)
Текущий Step 1 ("Choose Your Furniture") оборачивается в **mode picker**:
- **Верхняя часть** — 2 большие карточки:
  - 🪑 **Design from Scratch** — "Pick a furniture type, customize, and generate"
  - 📷 **Reimagine Your Room** — "Upload a photo of your room and transform it with AI"
- Если выбран "From Scratch" — показывается текущая сетка стилей мебели (без изменений)
- Если выбран "Reimagine" — показывается **upload zone** + room type picker

### Step 1 "Reimagine" sub-content:
1. **Upload zone** — drag & drop / click to browse, preview uploaded image, max 10MB, JPEG/PNG/WebP
2. **Room type picker** — карточки: Kitchen, Living Room, Bedroom, Bathroom, Office (иконки)
3. Кнопка Continue активна когда загружено фото И выбрана комната

### Step 2: Transformation Mode (новый шаг для reimagine пути)
3 карточки-режимов:
- **Complete Redesign** — "Transform everything — walls, floor, furniture, lighting"
- **Furniture Only** — "Keep your room, replace all furniture with new pieces"
- **Style & Colors** — "Same layout, new paint colors, lighting, and decor accents"

Под режимами — **style picker** (визуальный выбор дизайн-стиля):
- Modern Minimalist / Scandinavian / Industrial Loft / Classic Elegant / Japandi / Mid-Century Modern / Bohemian / Coastal

Кнопка Continue активна когда выбран режим И стиль.

### Step 3: Result (Before/After)
- API вызов `/api/room-redesign` с фото + режимом + стилем
- **GeneratingOverlay** (переиспользуем) во время генерации
- Результат: **Before/After Slider** — интерактивный слайдер поверх оригинала и результата
- Под слайдером: кнопки "Try Another Style", "Download Result", "Share", "Start Over"
- Кнопка "Try Another Style" сбрасывает результат и возвращает на Step 2

## Архитектура

### URL Routing
Используем тот же `/configurator` с query params:
- `/configurator?step=1` — mode selection (из scratch или reimagine)
- `/configurator?step=1&mode=reimagine` — upload + room type
- `/configurator?step=2&mode=reimagine` — transformation mode + style
- `/configurator?step=3&mode=reimagine` — before/after result
- Обычный путь (step=1,2,3,4 без mode) не меняется

### State Management
Расширяем `ConfiguratorState` + `ConfiguratorAction`:

```typescript
// Новые типы
type ConfiguratorMode = 'scratch' | 'reimagine';
type RoomType = 'kitchen' | 'living-room' | 'bedroom' | 'bathroom' | 'office';
type TransformationMode = 'complete' | 'furniture-only' | 'style-colors';
type RoomStyle = 'modern-minimalist' | 'scandinavian' | 'industrial' | 'classic' | 'japandi' | 'mid-century' | 'bohemian' | 'coastal';

interface RoomRedesignState {
  roomImageUrl: string | null;      // base64 data URL
  roomType: RoomType | null;
  transformationMode: TransformationMode | null;
  roomStyle: RoomStyle | null;
  resultImageUrl: string | null;
}

// Расширение ConfiguratorState
interface ConfiguratorState {
  mode: ConfiguratorMode;           // NEW — default 'scratch'
  selections: ConfiguratorSelections;
  generatedImageUrls: string[];
  roomRedesign: RoomRedesignState;  // NEW
}

// Новые actions
| { type: 'SET_MODE'; payload: ConfiguratorMode }
| { type: 'SET_ROOM_IMAGE'; payload: string }
| { type: 'SET_ROOM_TYPE'; payload: RoomType }
| { type: 'SET_TRANSFORMATION_MODE'; payload: TransformationMode }
| { type: 'SET_ROOM_STYLE'; payload: RoomStyle }
| { type: 'SET_ROOM_RESULT'; payload: string }
| { type: 'RESET_ROOM_REDESIGN' }
```

### Новые файлы

```
src/features/configurator/
├── types/configurator.types.ts          ← EXTEND (add room types)
├── store/configuratorContext.tsx         ← EXTEND (add reducer cases, initial state)
├── hooks/useConfigurator.ts             ← EXTEND (add room redesign helpers)
├── hooks/useRoomRedesign.ts             ← NEW (useMutation for room-redesign API)
├── data/room-catalog.ts                 ← NEW (room types, styles, transformation modes data)
├── lib/room-prompt.builder.ts           ← NEW (build prompts for room redesign)
├── services/room-redesign.service.ts    ← NEW (fetch wrapper for /api/room-redesign)
├── components/wizard/
│   ├── ConfiguratorWizard.tsx           ← MODIFY (route reimagine steps)
│   ├── Step1FurnitureStyle.tsx          ← MODIFY (wrap in mode picker)
│   ├── Step1ModeSelect.tsx              ← NEW (mode selection cards)
│   ├── Step1RoomUpload.tsx              ← NEW (upload + room type picker)
│   ├── Step2RoomTransform.tsx           ← NEW (transformation mode + style)
│   ├── Step3RoomResult.tsx              ← NEW (before/after + actions)
│   └── StepIndicator.tsx               ← MODIFY (dynamic steps for reimagine)
├── components/result/
│   └── BeforeAfterSlider.tsx            ← NEW (draggable comparison slider)

src/app/api/room-redesign/route.ts       ← NEW (mock API route)
src/components/layout/ConfiguratorSidebar.tsx ← MODIFY (add reimagine step content)
```

### API Route (`/api/room-redesign`)
Mock mode — принимает base64 image + параметры, после задержки возвращает одну из reference images как "redesigned" результат.

```typescript
POST /api/room-redesign
Request:  { roomImage: string (base64), roomType, transformationMode, roomStyle }
Response: { success: true, data: { resultImageUrl: string, appliedStyle: string } }
```

### Before/After Slider Component
- Два `<img>` наложенных друг на друга (position absolute)
- Правое изображение обрезается через `clip-path: inset(0 0 0 ${sliderPos}%)`
- Центральная ручка (drag handle) — вертикальная линия + круг с иконкой стрелок
- Mouse drag + touch drag + keyboard (arrow keys) для a11y
- Labels "Before" / "After" сверху

### Важные решения
- **Фото хранится как base64 в state** (не загружаем на сервер для MVP)
- **sessionStorage**: room image НЕ сохраняется (слишком большой), только metadata (roomType, style, mode)
- **Максимум 10MB** для фото — валидируем на клиенте
- **StepIndicator** становится динамическим: для scratch — 4 шага, для reimagine — 3 шага
- **ConfiguratorSidebar** — добавляем контент для reimagine шагов

### Порядок реализации
1. Types + data catalog (room types, styles, transformations)
2. State management (reducer actions, initial state extension)
3. API route (mock `/api/room-redesign`)
4. Service + hook (`room-redesign.service.ts`, `useRoomRedesign.ts`)
5. Mode selection UI (Step1ModeSelect + modify Step1FurnitureStyle)
6. Room upload UI (Step1RoomUpload with drag & drop)
7. Transformation + style step (Step2RoomTransform)
8. Before/After Slider component
9. Result step (Step3RoomResult)
10. Wire into ConfiguratorWizard + StepIndicator + Sidebar
11. Landing page — add CTA for "Reimagine Your Room"
