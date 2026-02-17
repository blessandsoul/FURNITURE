'use client';

import { useSearchParams } from 'next/navigation';
import { Couch, Sliders, Images, CheckCircle, FilmStrip, type Icon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { ConfiguratorStep } from '@/features/configurator/types/configurator.types';

function parseStep(raw: string | null): ConfiguratorStep {
    const n = Number(raw);
    if (n === 2 || n === 3 || n === 4) return n;
    return 1;
}

const STEP_CONTENT: Record<
    ConfiguratorStep,
    {
        badge: string;
        title: string;
        subtitle: string;
        tips: { icon: Icon; text: string }[];
        hint: string;
    }
> = {
    1: {
        badge: 'Step 1 of 4',
        title: 'Choose your furniture type.',
        subtitle: 'Pick what you want to design — sofa, bed, desk, and more.',
        tips: [
            { icon: Couch, text: '8 furniture types available' },
            { icon: Sliders, text: 'Each has unique customization options' },
            { icon: Images, text: 'AI render generated at the end' },
        ],
        hint: 'Tap any card to select it, then hit Continue.',
    },
    2: {
        badge: 'Step 2 of 4',
        title: 'Customize the details.',
        subtitle: 'Choose colors, materials, and finishes. Price updates instantly.',
        tips: [
            { icon: Sliders, text: 'Mix and match any options' },
            { icon: CheckCircle, text: 'Price adjusts in real time' },
            { icon: Images, text: 'Each option shapes the AI prompt' },
        ],
        hint: 'Select at least one option to unlock Generate.',
    },
    3: {
        badge: 'Step 3 of 4',
        title: 'Your AI render is ready.',
        subtitle: 'Review your design, save it, or bring it to life with a video.',
        tips: [
            { icon: Images, text: 'Photorealistic product render' },
            { icon: CheckCircle, text: 'Final price breakdown' },
            { icon: FilmStrip, text: 'Generate a video on the next step' },
        ],
        hint: 'Love it? Save the image or hit Generate Video.',
    },
    4: {
        badge: 'Step 4 of 4',
        title: 'Bring your design to life.',
        subtitle: "Pick a scene style and animation — we'll render a cinematic video.",
        tips: [
            { icon: FilmStrip, text: '3 scene styles: Luxury, Lifestyle, Commercial' },
            { icon: Sliders, text: 'Pick any motion animation' },
            { icon: CheckCircle, text: 'Download your video when done' },
        ],
        hint: 'Select a scene style, then pick a motion to generate.',
    },
};

export function ConfiguratorSidebar(): React.JSX.Element {
    const searchParams = useSearchParams();
    const step = parseStep(searchParams.get('step'));
    const content = STEP_CONTENT[step];

    return (
        <aside className="hidden w-72 shrink-0 flex-col justify-between border-r border-[--border-crisp] bg-[--surface-enamel] px-8 py-10 backdrop-blur-md lg:flex xl:w-80">
            <div className="space-y-7">
                {/* Badge */}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[--border-crisp] bg-background/60 px-3 py-1 text-xs font-semibold text-foreground shadow-[--shadow-enamel]">
                    ✦ {content.badge}
                </span>

                {/* Headline — animates on step change */}
                <div key={step} className="animate-step-in space-y-2">
                    <h2 className="text-2xl font-bold leading-tight tracking-tight text-foreground xl:text-3xl">
                        {content.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        {content.subtitle}
                    </p>
                </div>

                {/* Tips */}
                <ul key={`tips-${step}`} className="animate-step-in space-y-3">
                    {content.tips.map(({ icon: TipIcon, text }, i) => (
                        <li
                            key={i}
                            className="flex items-center gap-3 text-sm text-muted-foreground"
                        >
                            <span
                                className={cn(
                                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10',
                                )}
                            >
                                <TipIcon className="h-4 w-4 text-primary" />
                            </span>
                            {text}
                        </li>
                    ))}
                </ul>

                {/* Hint box */}
                <div
                    key={`hint-${step}`}
                    className="animate-step-in rounded-xl border border-[--border-crisp] bg-background/50 px-4 py-3"
                >
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        💡 {content.hint}
                    </p>
                </div>
            </div>

            {/* Step progress dots */}
            <div className="flex items-center gap-2">
                {([1, 2, 3, 4] as ConfiguratorStep[]).map((s) => (
                    <div
                        key={s}
                        className={cn(
                            'h-1.5 rounded-full transition-all duration-500',
                            s === step
                                ? 'w-6 bg-primary'
                                : s < step
                                  ? 'w-3 bg-primary/40'
                                  : 'w-3 bg-border',
                        )}
                    />
                ))}
                <span className="ml-2 text-xs text-muted-foreground/60">
                    No design skills needed
                </span>
            </div>
        </aside>
    );
}
