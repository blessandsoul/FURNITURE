# Chat Assistant "Atlas Lamp" — Design Document

**Date**: 2026-02-20
**Status**: Approved

## Overview

AI chat assistant widget in bottom-right corner of the website. Features an animated lamp character (Pixar Luxo Jr. inspired) themed for a premium furniture brand. Mock responses in Georgian, prepared for future AI API integration.

## Character: Lamp (LampCharacter.tsx)

SVG lamp with expressive animations:
- **Shade**: trapezoid with eyes inside, eyes track mouse
- **Neck**: flexible stem that bends per state
- **Base**: round base with shadow
- **Glow**: warm terracotta light from shade

### 6 States

| State | Animation |
|-------|-----------|
| `idle` | Shade gently sways, soft glow |
| `listening` | Leans toward user, wider eyes, brighter glow |
| `thinking` | Tilts sideways, three dots above shade |
| `talking` | Shade nods, light pulses |
| `happy` | Bounces, max brightness |
| `sleeping` | Dim light, shade drooped, zzz |

## Colors

Uses project design tokens (OKLch):
- Button/Header gradient: espresso → terracotta
- Shade: terracotta / warm-linen
- Neck/Base: espresso
- Glow: terracotta with opacity
- Bot messages: `bg-muted`
- User messages: `bg-primary text-primary-foreground`

## Quick Actions (4 buttons)

1. **კატალოგი** (Catalog) — browse products
2. **კონფიგურატორი** (Configurator) — design furniture
3. **მიტანა** (Delivery) — delivery info
4. **კონტაქტი** (Contact) — contact info

## Mock Response Categories

- `catalog`: furniture search, categories, materials, prices
- `configurator`: how to use configurator, AI design, credits
- `delivery`: delivery times, costs, regions
- `contact`: phone, WhatsApp, office address
- `general`: greetings, thanks, fallback

All responses in Georgian.

## File Structure

```
src/features/chat-assistant/
├── components/
│   ├── index.ts
│   ├── ChatAssistant.tsx
│   ├── ChatButton.tsx
│   ├── ChatWindow.tsx
│   ├── ChatMessage.tsx
│   ├── ChatInput.tsx
│   ├── QuickActions.tsx
│   ├── TypingIndicator.tsx
│   └── LampCharacter.tsx
├── hooks/
│   ├── index.ts
│   └── useChatAssistant.ts
├── services/
│   └── chat.service.ts
├── types/
│   └── index.ts
├── data/
│   └── mock-responses.ts
└── index.ts
```

## Integration

Add `<ChatAssistant />` to `(main)/layout.tsx` after `<Footer />`.

## Tech Adaptations from Template

| Template | This Project |
|----------|-------------|
| `framer-motion` | `motion/react` (motion.dev v12) |
| Lucide icons | Phosphor Icons |
| `ScrollArea` (shadcn) | `overflow-y-auto` custom scroll |
| English | Georgian |
| Blue theme | Espresso/Terracotta |
| Circle character | SVG lamp |

## Future AI Integration

```typescript
// Route Handler: /api/chat
// Proxies to OpenAI/Anthropic with system prompt for furniture consultant
// Fallback to mock responses on error
```
