'use client';

import { useRouter } from 'next/navigation';

type HeroVariant = 'A' | 'B' | 'C';

interface HeroVariantSwitcherProps {
    current: HeroVariant;
}

export function HeroVariantSwitcher({ current }: HeroVariantSwitcherProps): React.JSX.Element {
    const router = useRouter();

    function handleSelect(variant: HeroVariant): void {
        document.cookie = `heroVariant=${variant}; path=/; max-age=86400`;
        router.refresh();
    }

    return (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-1 rounded-full border border-border bg-background/90 p-1 shadow-lg backdrop-blur-md">
            <span className="px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Hero
            </span>
            {(['A', 'B', 'C'] as HeroVariant[]).map((v) => (
                <button
                    key={v}
                    onClick={() => handleSelect(v)}
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        current === v
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    aria-label={`Switch to Hero variant ${v}`}
                    aria-pressed={current === v}
                >
                    {v}
                </button>
            ))}
        </div>
    );
}
