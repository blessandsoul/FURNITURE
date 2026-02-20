# Chat Assistant "Atlas Lamp" — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a furniture-themed AI chat assistant widget with an animated lamp character to the bottom-right corner of the site.

**Architecture:** Feature module at `client/src/features/chat-assistant/` following project conventions. Client-only components using `motion/react` for animations, Phosphor Icons, project color tokens. Mock responses in Georgian, prepared for future AI API. Integrated into `(main)/layout.tsx`.

**Tech Stack:** React 19, TypeScript strict, Tailwind 4, motion.dev v12, Phosphor Icons, shadcn/ui (Button, Input)

---

### Task 1: Types & Data Layer

**Files:**
- Create: `client/src/features/chat-assistant/types/index.ts`
- Create: `client/src/features/chat-assistant/data/mock-responses.ts`

**Step 1: Create types**

```typescript
// client/src/features/chat-assistant/types/index.ts
export type MessageRole = 'user' | 'assistant';

export type ChatCategory =
  | 'catalog'
  | 'configurator'
  | 'delivery'
  | 'contact'
  | 'general';

export type CharacterState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'talking'
  | 'happy'
  | 'sleeping';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  category?: ChatCategory;
  showQuickActions?: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: ChatCategory;
}

export interface MockResponse {
  patterns: string[];
  responses: string[];
  followUpActions?: string[];
}

export interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  isTyping: boolean;
  characterState: CharacterState;
}

export interface SendMessageRequest {
  message: string;
  conversationId?: string;
  context?: {
    currentPage?: string;
    sessionId?: string;
    language?: string;
  };
}

export interface SendMessageResponse {
  success: true;
  message: string;
  data: {
    reply: string;
    conversationId: string;
    suggestedActions?: string[];
  };
}
```

**Step 2: Create mock responses in Georgian**

```typescript
// client/src/features/chat-assistant/data/mock-responses.ts
import type { ChatCategory, MockResponse } from '../types';

export const TYPING_DELAY = { min: 800, max: 1800 };

export const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant' as const,
  content: 'გამარჯობა! 👋 მე ვარ Atlas-ის ვირტუალური ასისტენტი. როგორ შემიძლია დაგეხმაროთ?',
  timestamp: new Date(),
  showQuickActions: true
};

export const MOCK_RESPONSES: Record<ChatCategory, MockResponse[]> = {
  catalog: [
    {
      patterns: ['მოძებნა', 'ძიება', 'ვეძებ', 'სად', 'რომელი', 'find', 'search'],
      responses: [
        'შემიძლია დაგეხმაროთ ავეჯის მოძებნაში! რა ტიპის ავეჯს ეძებთ?',
        'კატალოგში შეგიძლიათ ფილტრით მოძებნოთ — კატეგორია, მასალა, ფასი.',
      ],
      followUpActions: ['catalog', 'configurator']
    },
    {
      patterns: ['დივანი', 'სკამი', 'მაგიდა', 'კარადა', 'საწოლი', 'სავარძელი'],
      responses: [
        'შესანიშნავი არჩევანია! კატალოგში ნახავთ ფართო ასორტიმენტს. გსურთ კატალოგის ნახვა?',
      ],
      followUpActions: ['catalog']
    },
    {
      patterns: ['ფასი', 'ღირს', 'რა ღირს', 'ბიუჯეტი', 'იაფი'],
      responses: [
        'ფასები დამოკიდებულია მასალაზე და ზომაზე. კონფიგურატორით შეგიძლიათ ზუსტი ფასის გამოთვლა.',
        'ჩვენი ფასები იწყება ხელმისაწვდომი ვარიანტებიდან. კატალოგში ნახავთ ყველა ფასს.',
      ],
      followUpActions: ['configurator', 'catalog']
    },
    {
      patterns: ['მასალა', 'ხის', 'ტყავი', 'ქსოვილი', 'მეტალი'],
      responses: [
        'ჩვენ ვიყენებთ მაღალი ხარისხის მასალებს — ნატურალური ხე, ტყავი, პრემიუმ ქსოვილები. კონფიგურატორში აირჩევთ სასურველ მასალას.',
      ],
      followUpActions: ['configurator']
    }
  ],
  configurator: [
    {
      patterns: ['კონფიგურატორ', 'დიზაინ', 'შექმნა', 'customize', 'აირჩიე'],
      responses: [
        'კონფიგურატორით შეგიძლიათ ავეჯის დიზაინი ნულიდან ან თქვენი ოთახის ფოტოს ატვირთვა AI რედიზაინისთვის!',
        'გადით კონფიგურატორზე და 3 ნაბიჯში შექმენით თქვენი იდეალური ავეჯი.',
      ],
      followUpActions: ['configurator']
    },
    {
      patterns: ['AI', 'ხელოვნური', 'გენერაცია', 'ფოტო'],
      responses: [
        'ჩვენი AI ტექნოლოგია გენერირებს ფოტორეალისტურ სურათს თქვენი ავეჯის. ატვირთეთ ოთახის ფოტო და ნახეთ შედეგი!',
      ],
      followUpActions: ['configurator']
    },
    {
      patterns: ['კრედიტ', 'credit', 'ბალანს'],
      responses: [
        'AI დიზაინის გენერაციისთვის საჭიროა კრედიტები. შეგიძლიათ შეიძინოთ კრედიტების გვერდზე.',
      ]
    }
  ],
  delivery: [
    {
      patterns: ['მიტანა', 'მოტანა', 'ტრანსპორტ', 'delivery', 'shipping'],
      responses: [
        'მიტანა ხდება 2-3 კვირაში. თბილისში მიტანა უფასოა, რეგიონებში — დამატებითი საფასური.',
        'თეთრი ხელთათმანებიანი მიტანა + აწყობა შედის ფასში!',
      ],
      followUpActions: ['contact']
    },
    {
      patterns: ['ვადა', 'როდის', 'რამდენ ხანში', 'დრო'],
      responses: [
        'წარმოების ვადა 2-3 კვირაა. მიტანა — წარმოების დასრულებიდან 2-3 სამუშაო დღეში.',
      ],
      followUpActions: ['contact']
    },
    {
      patterns: ['რეგიონ', 'ქალაქ', 'თბილის'],
      responses: [
        'თბილისში მიტანა უფასოა. საქართველოს სხვა ქალაქებში — 50-150₾ მანძილის მიხედვით.',
      ],
      followUpActions: ['contact']
    }
  ],
  contact: [
    {
      patterns: ['ტელეფონ', 'დარეკვა', 'ნომერი', 'phone', 'call'],
      responses: [
        'დაგვირეკეთ: +995 XXX XX XX XX. ასევე შეგიძლიათ WhatsApp-ით!',
      ]
    },
    {
      patterns: ['whatsapp', 'ვატსაპ', 'მესიჯი', 'წერა'],
      responses: [
        'WhatsApp: +995 XXX XX XX XX. მენეჯერი სწრაფად გიპასუხებთ!',
      ]
    },
    {
      patterns: ['მისამართ', 'ოფისი', 'სად', 'შოურუმ'],
      responses: [
        'ჩვენი შოურუმი მდებარეობს თბილისის ცენტრში. ეწვიეთ და ადგილზე ნახეთ ავეჯი!',
      ],
      followUpActions: ['contact']
    },
    {
      patterns: ['კონტაქტ', 'დაკავშირება', 'contact', 'help'],
      responses: [
        'დაგვიკავშირდით ტელეფონით, WhatsApp-ით ან ეწვიეთ შოურუმს. როგორ გირჩევნიათ?',
      ]
    }
  ],
  general: [
    {
      patterns: ['გამარჯობა', 'გამარჯობ', 'hello', 'hi', 'hey', 'სალამი'],
      responses: [
        'გამარჯობა! მე ვარ Atlas-ის ასისტენტი. როგორ შემიძლია დაგეხმაროთ?',
        'მოგესალმებით! რით შემიძლია დახმარება?',
      ],
      followUpActions: ['catalog', 'configurator', 'delivery']
    },
    {
      patterns: ['მადლობ', 'გმადლობ', 'thanks', 'thank'],
      responses: [
        'არაფრის! სხვა რამეში ხომ არ გჭირდებათ დახმარება?',
        'სიამოვნებით! კიდევ თუ გექნებათ შეკითხვა, მომწერეთ.',
      ]
    },
    {
      patterns: ['კარგი', 'ok', 'okay', 'გასაგებია', 'მივხვდი'],
      responses: [
        'შესანიშნავი! კიდევ რამე?',
      ],
      followUpActions: ['catalog', 'contact']
    },
    {
      patterns: ['ვინ ხარ', 'რა ხარ', 'ბოტი', 'robot'],
      responses: [
        'მე ვარ Atlas Furniture-ის ვირტუალური ასისტენტი — ვეხმარები ავეჯის არჩევასა და ნავიგაციაში!',
      ]
    }
  ]
};

export const DEFAULT_RESPONSE = {
  responses: [
    'საინტერესო შეკითხვაა! ჩვენი გუნდი უკეთ დაგეხმარებათ. გინდათ დავუკავშირდე?',
    'ვერ გავიგე, შეგიძლიათ სხვანაირად დასვათ შეკითხვა?',
    'სიამოვნებით დაგეხმარებით! რა ინფორმაცია გჭირდებათ?',
  ],
  followUpActions: ['catalog', 'contact', 'configurator']
};
```

**Step 3: Commit**

```bash
git add client/src/features/chat-assistant/types/index.ts client/src/features/chat-assistant/data/mock-responses.ts
git commit -m "feat: add chat assistant types and Georgian mock responses"
```

---

### Task 2: Chat Service & Hook

**Files:**
- Create: `client/src/features/chat-assistant/services/chat.service.ts`
- Create: `client/src/features/chat-assistant/hooks/useChatAssistant.ts`
- Create: `client/src/features/chat-assistant/hooks/index.ts`

**Step 1: Create chat service stub**

```typescript
// client/src/features/chat-assistant/services/chat.service.ts
import type { SendMessageRequest, SendMessageResponse } from '../types';

class ChatService {
  async sendMessage(_data: SendMessageRequest): Promise<SendMessageResponse['data']> {
    // FUTURE: Real API integration
    // const response = await fetch('/api/v1/chat/message', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
    // return response.json();

    throw new Error('API not implemented - using local mock');
  }
}

export const chatService = new ChatService();
```

**Step 2: Create useChatAssistant hook**

```typescript
// client/src/features/chat-assistant/hooks/useChatAssistant.ts
'use client';

import * as React from 'react';
import type { ChatMessage, ChatState, ChatCategory, CharacterState } from '../types';
import { MOCK_RESPONSES, DEFAULT_RESPONSE, TYPING_DELAY, WELCOME_MESSAGE } from '../data/mock-responses';

const SLEEP_TIMEOUT = 30000;

export function useChatAssistant() {
  const [state, setState] = React.useState<ChatState>({
    isOpen: false,
    messages: [{ ...WELCOME_MESSAGE, timestamp: new Date() }],
    isTyping: false,
    characterState: 'idle'
  });

  const sleepTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const resetSleepTimer = React.useCallback((): void => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    sleepTimerRef.current = setTimeout(() => {
      setState(prev => {
        if (!prev.isOpen && prev.characterState === 'idle') {
          return { ...prev, characterState: 'sleeping' };
        }
        return prev;
      });
    }, SLEEP_TIMEOUT);
  }, []);

  const wakeUp = React.useCallback((): void => {
    setState(prev => {
      if (prev.characterState === 'sleeping') {
        return { ...prev, characterState: 'idle' };
      }
      return prev;
    });
    resetSleepTimer();
  }, [resetSleepTimer]);

  React.useEffect(() => {
    resetSleepTimer();
    return (): void => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    };
  }, [resetSleepTimer]);

  const toggleChat = React.useCallback((): void => {
    wakeUp();
    setState(prev => ({
      ...prev,
      isOpen: !prev.isOpen,
      characterState: !prev.isOpen ? 'happy' : 'idle'
    }));
  }, [wakeUp]);

  const closeChat = React.useCallback((): void => {
    setState(prev => ({ ...prev, isOpen: false, characterState: 'idle' }));
    resetSleepTimer();
  }, [resetSleepTimer]);

  const setCharacterState = React.useCallback((characterState: CharacterState): void => {
    setState(prev => ({ ...prev, characterState }));
    if (characterState === 'idle') resetSleepTimer();
  }, [resetSleepTimer]);

  const findResponse = React.useCallback((message: string): { content: string; followUpActions?: string[] } => {
    const lowerMessage = message.toLowerCase();

    for (const category of Object.keys(MOCK_RESPONSES) as ChatCategory[]) {
      for (const mockResponse of MOCK_RESPONSES[category]) {
        if (mockResponse.patterns.some(p => lowerMessage.includes(p.toLowerCase()))) {
          const idx = Math.floor(Math.random() * mockResponse.responses.length);
          return { content: mockResponse.responses[idx], followUpActions: mockResponse.followUpActions };
        }
      }
    }

    const idx = Math.floor(Math.random() * DEFAULT_RESPONSE.responses.length);
    return { content: DEFAULT_RESPONSE.responses[idx], followUpActions: DEFAULT_RESPONSE.followUpActions };
  }, []);

  const sendMessage = React.useCallback(async (content: string): Promise<void> => {
    if (!content.trim()) return;
    wakeUp();

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true,
      characterState: 'thinking'
    }));

    const delay = Math.random() * (TYPING_DELAY.max - TYPING_DELAY.min) + TYPING_DELAY.min;
    await new Promise(resolve => setTimeout(resolve, delay));

    const { content: responseContent, followUpActions } = findResponse(content);

    const botMessage: ChatMessage = {
      id: `bot-${Date.now()}`,
      role: 'assistant',
      content: responseContent,
      timestamp: new Date(),
      showQuickActions: !!followUpActions?.length
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, botMessage],
      isTyping: false,
      characterState: 'talking'
    }));

    setTimeout(() => setCharacterState('idle'), 2000);
  }, [findResponse, setCharacterState, wakeUp]);

  const handleQuickAction = React.useCallback((_actionId: string, label: string): void => {
    sendMessage(label);
  }, [sendMessage]);

  const clearChat = React.useCallback((): void => {
    setState(prev => ({
      ...prev,
      messages: [{ ...WELCOME_MESSAGE, timestamp: new Date() }]
    }));
  }, []);

  return {
    ...state,
    toggleChat,
    closeChat,
    sendMessage,
    handleQuickAction,
    clearChat,
    setCharacterState,
    wakeUp
  };
}
```

**Step 3: Create hooks barrel**

```typescript
// client/src/features/chat-assistant/hooks/index.ts
export { useChatAssistant } from './useChatAssistant';
```

**Step 4: Commit**

```bash
git add client/src/features/chat-assistant/services/ client/src/features/chat-assistant/hooks/
git commit -m "feat: add chat assistant hook and service stub"
```

---

### Task 3: LampCharacter SVG Component

**Files:**
- Create: `client/src/features/chat-assistant/components/LampCharacter.tsx`

**Step 1: Create the animated SVG lamp**

The lamp uses project colors:
- Shade fill: `oklch(0.55 0.12 40)` (terracotta / `--brand-accent`)
- Shade stroke: `oklch(0.45 0.10 40)` (darker terracotta)
- Neck/Base: `oklch(0.28 0.055 48)` (espresso / `--primary`)
- Glow: `oklch(0.55 0.12 40)` with low opacity (terracotta glow)
- Eye whites: white
- Pupils: espresso

```typescript
// client/src/features/chat-assistant/components/LampCharacter.tsx
'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import type { CharacterState } from '../types';
import type { Variants } from 'motion/react';

interface LampCharacterProps {
  state: CharacterState;
  size?: number;
  className?: string;
}

export function LampCharacter({ state, size = 48, className }: LampCharacterProps): React.ReactElement {
  const [isBlinking, setIsBlinking] = React.useState(false);
  const [mouseOffset, setMouseOffset] = React.useState({ x: 0, y: 0 });
  const svgRef = React.useRef<SVGSVGElement>(null);

  // Blinking
  React.useEffect(() => {
    if (state === 'idle' || state === 'listening') {
      const interval = setInterval(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }, 3000 + Math.random() * 2000);
      return (): void => clearInterval(interval);
    }
  }, [state]);

  // Mouse tracking
  React.useEffect(() => {
    if (state === 'sleeping') return;

    const handleMouseMove = (e: MouseEvent): void => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const maxOffset = 2.5;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const normalizedX = distance > 0 ? (deltaX / distance) * Math.min(distance / 80, 1) * maxOffset : 0;
      const normalizedY = distance > 0 ? (deltaY / distance) * Math.min(distance / 80, 1) * maxOffset : 0;
      setMouseOffset({ x: normalizedX, y: normalizedY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return (): void => window.removeEventListener('mousemove', handleMouseMove);
  }, [state]);

  const getEyeScaleY = (): number => {
    if (state === 'sleeping') return 0.05;
    if (isBlinking) return 0.1;
    if (state === 'thinking') return 0.8;
    return 1;
  };

  const getEyeScale = (): number => (state === 'listening' ? 1.15 : 1);

  const getNeckRotation = (): number => {
    switch (state) {
      case 'thinking': return -8;
      case 'listening': return 5;
      case 'talking': return 0;
      case 'sleeping': return 12;
      default: return 0;
    }
  };

  const shadeVariants: Variants = {
    idle: { y: [0, -2, 0], transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' } },
    listening: { y: -3, scale: 1.02, transition: { duration: 0.3 } },
    thinking: { rotate: [-3, 3, -3], transition: { repeat: Infinity, duration: 0.8 } },
    talking: { y: [0, -3, 0], transition: { repeat: Infinity, duration: 0.4 } },
    happy: { y: [-2, -8, -2], scale: 1.05, transition: { repeat: Infinity, duration: 0.5, ease: 'easeInOut' } },
    sleeping: { y: 3, transition: { duration: 1, ease: 'easeInOut' } }
  };

  const isSleeping = state === 'sleeping';

  return (
    <motion.svg
      ref={svgRef}
      viewBox="0 0 100 120"
      width={size}
      height={size * 1.2}
      className={className}
    >
      {/* Glow under shade */}
      <motion.ellipse
        cx="50" cy="55" rx="25" ry="15"
        fill="oklch(0.55 0.12 40)"
        animate={{
          opacity: isSleeping ? 0.05 : state === 'happy' ? 0.35 : state === 'talking' ? [0.15, 0.25, 0.15] : 0.15
        }}
        transition={state === 'talking' ? { repeat: Infinity, duration: 0.6 } : { duration: 0.5 }}
      />

      {/* Base shadow */}
      <ellipse cx="50" cy="112" rx="20" ry="4" fill="oklch(0.20 0.02 50 / 0.15)" />

      {/* Base */}
      <ellipse cx="50" cy="108" rx="16" ry="5" fill="oklch(0.28 0.055 48)" stroke="oklch(0.22 0.045 48)" strokeWidth="1" />

      {/* Neck (flexible stem) */}
      <motion.g animate={{ rotate: getNeckRotation() }} style={{ originX: '50px', originY: '108px' }} transition={{ duration: 0.4 }}>
        <rect x="48" y="60" width="4" height="48" rx="2" fill="oklch(0.35 0.04 50)" />

        {/* Shade group (moves with neck) */}
        <motion.g animate={state} variants={shadeVariants}>
          {/* Shade (trapezoid) */}
          <path
            d="M30 55 L40 30 L60 30 L70 55 Z"
            fill="oklch(0.55 0.12 40)"
            stroke="oklch(0.45 0.10 40)"
            strokeWidth="1.5"
          />
          {/* Shade inner rim */}
          <path d="M32 54 L69 54" stroke="oklch(0.45 0.10 40)" strokeWidth="0.5" opacity="0.5" />
          {/* Shade highlight */}
          <path d="M42 32 L48 32" stroke="oklch(0.65 0.10 40)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

          {/* Left Eye */}
          <ellipse cx="44" cy="42" rx="5" ry="6" fill="white" stroke="oklch(0.28 0.055 48)" strokeWidth="0.8" />
          <motion.ellipse
            cx={45 + (isSleeping ? 0 : mouseOffset.x)}
            cy={42 + (isSleeping ? 0 : mouseOffset.y)}
            rx="2.5"
            ry="3"
            fill="oklch(0.28 0.055 48)"
            animate={{ scaleY: getEyeScaleY(), scale: getEyeScale() }}
            transition={{ duration: 0.1 }}
          />
          {!isSleeping && (
            <circle
              cx={46.5 + mouseOffset.x * 0.5}
              cy={40}
              r="1.2"
              fill="white"
              opacity="0.8"
            />
          )}

          {/* Right Eye */}
          <ellipse cx="56" cy="42" rx="5" ry="6" fill="white" stroke="oklch(0.28 0.055 48)" strokeWidth="0.8" />
          <motion.ellipse
            cx={57 + (isSleeping ? 0 : mouseOffset.x)}
            cy={42 + (isSleeping ? 0 : mouseOffset.y)}
            rx="2.5"
            ry="3"
            fill="oklch(0.28 0.055 48)"
            animate={{ scaleY: getEyeScaleY(), scale: getEyeScale() }}
            transition={{ duration: 0.1 }}
          />
          {!isSleeping && (
            <circle
              cx={58.5 + mouseOffset.x * 0.5}
              cy={40}
              r="1.2"
              fill="white"
              opacity="0.8"
            />
          )}

          {/* Happy mouth */}
          {(state === 'happy' || state === 'talking') && (
            <motion.path
              d="M44 49 Q50 54 56 49"
              fill="none"
              stroke="oklch(0.28 0.055 48)"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: 1, pathLength: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* Thinking dots */}
          {state === 'thinking' && (
            <g>
              <motion.circle cx="72" cy="25" r="2.5" fill="oklch(0.55 0.12 40)" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} />
              <motion.circle cx="78" cy="19" r="2" fill="oklch(0.55 0.12 40)" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} />
              <motion.circle cx="83" cy="14" r="1.5" fill="oklch(0.55 0.12 40)" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} />
            </g>
          )}

          {/* Sleeping ZZZ */}
          {isSleeping && (
            <g>
              <motion.text x="68" y="22" fill="oklch(0.55 0.12 40)" fontSize="9" fontWeight="bold"
                animate={{ opacity: [0, 1, 0], y: [22, 17, 12], x: [68, 71, 74] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0 }}>z</motion.text>
              <motion.text x="76" y="16" fill="oklch(0.55 0.12 40)" fontSize="7" fontWeight="bold"
                animate={{ opacity: [0, 1, 0], y: [16, 11, 6], x: [76, 79, 82] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.3 }}>z</motion.text>
              <motion.text x="83" y="10" fill="oklch(0.55 0.12 40)" fontSize="5" fontWeight="bold"
                animate={{ opacity: [0, 1, 0], y: [10, 5, 0], x: [83, 86, 89] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.6 }}>z</motion.text>
            </g>
          )}
        </motion.g>
      </motion.g>
    </motion.svg>
  );
}
```

**Step 2: Commit**

```bash
git add client/src/features/chat-assistant/components/LampCharacter.tsx
git commit -m "feat: add animated SVG lamp character with 6 states"
```

---

### Task 4: UI Components (ChatMessage, ChatInput, QuickActions, TypingIndicator)

**Files:**
- Create: `client/src/features/chat-assistant/components/ChatMessage.tsx`
- Create: `client/src/features/chat-assistant/components/ChatInput.tsx`
- Create: `client/src/features/chat-assistant/components/QuickActions.tsx`
- Create: `client/src/features/chat-assistant/components/TypingIndicator.tsx`

**Step 1: ChatMessage**

```typescript
// client/src/features/chat-assistant/components/ChatMessage.tsx
'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '../types';
import { LampCharacter } from './LampCharacter';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps): React.ReactElement {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex gap-2 max-w-[85%]',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center overflow-hidden">
          <LampCharacter state="idle" size={22} />
        </div>
      )}

      <div
        className={cn(
          'px-3 py-2 rounded-2xl text-sm',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted text-foreground rounded-bl-md'
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <span
          className={cn(
            'text-[10px] mt-1 block',
            isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          {message.timestamp.toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}
```

**Step 2: ChatInput**

```typescript
// client/src/features/chat-assistant/components/ChatInput.tsx
'use client';

import * as React from 'react';
import { PaperPlaneRight } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function ChatInput({ onSend, disabled, onFocus, onBlur }: ChatInputProps): React.ReactElement {
  const [value, setValue] = React.useState('');

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSend(value.trim());
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-border bg-background">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder="დაწერეთ შეტყობინება..."
        disabled={disabled}
        className="flex-1 text-sm"
      />
      <Button type="submit" size="icon" disabled={!value.trim() || disabled} className="shrink-0">
        <PaperPlaneRight className="w-4 h-4" />
      </Button>
    </form>
  );
}
```

**Step 3: QuickActions**

```typescript
// client/src/features/chat-assistant/components/QuickActions.tsx
'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { Armchair, Palette, Truck, Phone } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import type { QuickAction } from '../types';

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'catalog', label: 'კატალოგი', icon: Armchair, category: 'catalog' },
  { id: 'configurator', label: 'კონფიგურატორი', icon: Palette, category: 'configurator' },
  { id: 'delivery', label: 'მიტანა', icon: Truck, category: 'delivery' },
  { id: 'contact', label: 'კონტაქტი', icon: Phone, category: 'contact' }
];

interface QuickActionsProps {
  onAction: (actionId: string, label: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps): React.ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-wrap gap-2 mt-3"
    >
      {QUICK_ACTIONS.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction(action.id, action.label)}
              className="text-xs gap-1.5 h-8"
            >
              <Icon className="w-3.5 h-3.5" />
              {action.label}
            </Button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
```

**Step 4: TypingIndicator**

```typescript
// client/src/features/chat-assistant/components/TypingIndicator.tsx
'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { LampCharacter } from './LampCharacter';

export function TypingIndicator(): React.ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-2 items-center"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center overflow-hidden">
        <LampCharacter state="thinking" size={22} />
      </div>

      <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-md flex gap-1 items-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-muted-foreground/50 rounded-full"
            animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
```

**Step 5: Commit**

```bash
git add client/src/features/chat-assistant/components/ChatMessage.tsx client/src/features/chat-assistant/components/ChatInput.tsx client/src/features/chat-assistant/components/QuickActions.tsx client/src/features/chat-assistant/components/TypingIndicator.tsx
git commit -m "feat: add chat message, input, quick actions, and typing indicator"
```

---

### Task 5: ChatButton & ChatWindow

**Files:**
- Create: `client/src/features/chat-assistant/components/ChatButton.tsx`
- Create: `client/src/features/chat-assistant/components/ChatWindow.tsx`

**Step 1: ChatButton (floating lamp button)**

```typescript
// client/src/features/chat-assistant/components/ChatButton.tsx
'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { LampCharacter } from './LampCharacter';
import type { CharacterState } from '../types';

interface ChatButtonProps {
  onClick: () => void;
  characterState: CharacterState;
  onWakeUp?: () => void;
}

export function ChatButton({ onClick, characterState, onWakeUp }: ChatButtonProps): React.ReactElement {
  const [isHovered, setIsHovered] = React.useState(false);
  const isSleeping = characterState === 'sleeping';

  const handleMouseEnter = (): void => {
    setIsHovered(true);
    if (isSleeping && onWakeUp) onWakeUp();
  };

  const displayState: CharacterState = isSleeping ? 'sleeping' : isHovered ? 'listening' : characterState;

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-[oklch(0.55_0.12_40)] shadow-lg hover:shadow-xl transition-shadow cursor-pointer flex items-center justify-center border-2 border-primary-foreground/20"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      aria-label="ჩატ ასისტენტი"
    >
      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-[oklch(0.55_0.12_40)]"
        animate={isSleeping
          ? { scale: [1, 1.05, 1], opacity: [0.15, 0.25, 0.15] }
          : { scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: isSleeping ? 3 : 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      <LampCharacter state={displayState} size={40} />

      {/* Tooltip */}
      <motion.div
        className="absolute -top-12 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg pointer-events-none"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 5 }}
        transition={{ duration: 0.2 }}
      >
        {isSleeping ? 'გამაღვიძე!' : 'გამარჯობა! დახმარება?'}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45" />
      </motion.div>
    </motion.button>
  );
}
```

**Step 2: ChatWindow**

```typescript
// client/src/features/chat-assistant/components/ChatWindow.tsx
'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowCounterClockwise } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { QuickActions } from './QuickActions';
import { TypingIndicator } from './TypingIndicator';
import { LampCharacter } from './LampCharacter';
import type { ChatMessage as ChatMessageType, CharacterState } from '../types';

interface ChatWindowProps {
  messages: ChatMessageType[];
  isTyping: boolean;
  characterState: CharacterState;
  onSendMessage: (message: string) => void;
  onQuickAction: (actionId: string, label: string) => void;
  onClose: () => void;
  onClear: () => void;
  onInputFocus?: () => void;
  onInputBlur?: () => void;
}

export function ChatWindow({
  messages, isTyping, characterState, onSendMessage, onQuickAction, onClose, onClear, onInputFocus, onInputBlur
}: ChatWindowProps): React.ReactElement {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const lastMessage = messages[messages.length - 1];
  const showQuickActions = lastMessage?.showQuickActions && !isTyping;

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="absolute bottom-20 right-0 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[70vh] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-primary to-[oklch(0.55_0.12_40)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center overflow-hidden">
            <LampCharacter state={characterState} size={24} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary-foreground">Atlas ასისტენტი</h3>
            <p className="text-[10px] text-primary-foreground/70">ონლაინ</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClear}
            className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
            title="გასუფთავება"
          >
            <ArrowCounterClockwise className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 scroll-smooth">
        <div className="space-y-4">
          {messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
          <AnimatePresence>{isTyping && <TypingIndicator />}</AnimatePresence>
          {showQuickActions && <QuickActions onAction={onQuickAction} />}
        </div>
      </div>

      {/* Input */}
      <ChatInput onSend={onSendMessage} disabled={isTyping} onFocus={onInputFocus} onBlur={onInputBlur} />
    </motion.div>
  );
}
```

**Step 3: Commit**

```bash
git add client/src/features/chat-assistant/components/ChatButton.tsx client/src/features/chat-assistant/components/ChatWindow.tsx
git commit -m "feat: add chat button and chat window components"
```

---

### Task 6: ChatAssistant Container & Barrel Exports

**Files:**
- Create: `client/src/features/chat-assistant/components/ChatAssistant.tsx`
- Create: `client/src/features/chat-assistant/components/index.ts`
- Create: `client/src/features/chat-assistant/index.ts`

**Step 1: ChatAssistant container**

```typescript
// client/src/features/chat-assistant/components/ChatAssistant.tsx
'use client';

import * as React from 'react';
import { AnimatePresence } from 'motion/react';
import { ChatButton } from './ChatButton';
import { ChatWindow } from './ChatWindow';
import { useChatAssistant } from '../hooks';

export function ChatAssistant(): React.ReactElement {
  const {
    isOpen, messages, isTyping, characterState,
    toggleChat, closeChat, sendMessage, handleQuickAction, clearChat, setCharacterState, wakeUp
  } = useChatAssistant();

  const handleInputFocus = React.useCallback((): void => setCharacterState('listening'), [setCharacterState]);
  const handleInputBlur = React.useCallback((): void => { if (!isTyping) setCharacterState('idle'); }, [isTyping, setCharacterState]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence mode="wait">
        {isOpen && (
          <ChatWindow
            messages={messages} isTyping={isTyping} characterState={characterState}
            onSendMessage={sendMessage} onQuickAction={handleQuickAction}
            onClose={closeChat} onClear={clearChat}
            onInputFocus={handleInputFocus} onInputBlur={handleInputBlur}
          />
        )}
      </AnimatePresence>
      <ChatButton onClick={toggleChat} characterState={isOpen ? 'happy' : characterState} onWakeUp={wakeUp} />
    </div>
  );
}
```

**Step 2: Components barrel**

```typescript
// client/src/features/chat-assistant/components/index.ts
export { ChatAssistant } from './ChatAssistant';
export { ChatButton } from './ChatButton';
export { ChatWindow } from './ChatWindow';
export { ChatMessage } from './ChatMessage';
export { ChatInput } from './ChatInput';
export { QuickActions } from './QuickActions';
export { TypingIndicator } from './TypingIndicator';
export { LampCharacter } from './LampCharacter';
```

**Step 3: Main barrel**

```typescript
// client/src/features/chat-assistant/index.ts
export { ChatAssistant } from './components';
export * from './types';
export * from './hooks';
```

**Step 4: Commit**

```bash
git add client/src/features/chat-assistant/components/ChatAssistant.tsx client/src/features/chat-assistant/components/index.ts client/src/features/chat-assistant/index.ts
git commit -m "feat: add chat assistant container and barrel exports"
```

---

### Task 7: Integration into Layout

**Files:**
- Modify: `client/src/app/[locale]/(main)/layout.tsx`

**Step 1: Add ChatAssistant to main layout**

```typescript
// client/src/app/[locale]/(main)/layout.tsx
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ChatAssistant } from '@/features/chat-assistant';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}): React.ReactElement {
    return (
        <div className="flex min-h-dvh flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <ChatAssistant />
        </div>
    );
}
```

**Step 2: Verify the dev server runs without errors**

Run: `cd client && npm run dev`
Expected: No build errors, chat button visible in bottom-right on any (main) page

**Step 3: Commit**

```bash
git add client/src/app/[locale]/(main)/layout.tsx
git commit -m "feat: integrate chat assistant into main layout"
```

---

### Task 8: Manual Testing & Polish

**Step 1: Test all 6 character states visually**
- Open any (main) page
- Observe: lamp idle animation (gentle sway)
- Hover button: lamp eyes widen (listening)
- Click to open: lamp bounces (happy)
- Type in input: lamp eyes follow cursor
- Send message: lamp thinks, then talks
- Wait 30s: lamp sleeps (zzz)
- Hover sleeping lamp: wakes up

**Step 2: Test chat flow**
- Click button → window opens
- Welcome message in Georgian with quick actions visible
- Click "კატალოგი" quick action → gets catalog response
- Type "გამარჯობა" → gets greeting response
- Type gibberish → gets fallback response
- Clear button resets to welcome

**Step 3: Test responsive**
- Resize to mobile width → window should max at `calc(100vw - 2rem)`
- Button stays visible
- Input, send button work on mobile

**Step 4: Test dark mode**
- Toggle dark mode → all tokens adapt correctly
- Chat window, messages, header gradient all look correct

**Step 5: Final commit if any polish needed**

```bash
git add -A
git commit -m "chore: polish chat assistant UI and animations"
```
