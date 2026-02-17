import Link from 'next/link';
import { ArrowRight, Sparkle } from '@phosphor-icons/react/dist/ssr';
import { ROUTES } from '@/lib/constants/routes';
import { FURNITURE_PRESETS, getStyleById, getOptionById } from '@/features/configurator/data/furniture-catalog';
import type { FurniturePreset } from '@/features/configurator/types/configurator.types';

function calculatePresetPrice(preset: FurniturePreset): number {
    const style = getStyleById(preset.styleId);
    if (!style) return 0;

    let total = style.basePrice;
    for (const [category, optionId] of Object.entries(preset.options)) {
        if (optionId) {
            const option = getOptionById(preset.styleId, optionId);
            if (option) total += option.priceModifier;
        }
    }
    return total;
}

function buildPresetUrl(preset: FurniturePreset): string {
    const params = new URLSearchParams({ step: '2', style: preset.styleId });
    for (const [category, optionId] of Object.entries(preset.options)) {
        if (optionId) params.set(category, optionId);
    }
    return `${ROUTES.CONFIGURATOR.ROOT}?${params.toString()}`;
}

export function PresetsSection(): React.JSX.Element {
    return (
        <section className="py-20">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="mb-10 text-center">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[--border-crisp] bg-[--surface-enamel] px-3.5 py-1.5 backdrop-blur-md shadow-[--shadow-enamel]">
                        <Sparkle className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-semibold text-foreground">Designer Picks</span>
                    </div>
                    <h2 className="text-balance text-2xl font-bold text-foreground md:text-3xl">
                        Start from a curated design
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                        Skip the choices — pick a designer preset and customize from there.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {FURNITURE_PRESETS.slice(0, 8).map((preset) => {
                        const style = getStyleById(preset.styleId);
                        const price = calculatePresetPrice(preset);

                        return (
                            <Link
                                key={preset.id}
                                href={buildPresetUrl(preset)}
                                className="group rounded-xl border border-[--border-crisp] bg-[--surface-enamel] p-5 backdrop-blur-md shadow-[--shadow-enamel] motion-safe:transition-all motion-safe:duration-300 motion-safe:hover:shadow-[--shadow-enamel-hover] motion-safe:hover:-translate-y-0.5"
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                        {style?.label}
                                    </span>
                                    <span className="text-sm font-bold tabular-nums text-foreground">
                                        ${price.toLocaleString()}
                                    </span>
                                </div>
                                <h3 className="text-base font-semibold text-foreground">
                                    {preset.label}
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {preset.description}
                                </p>
                                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                    Customize this
                                    <ArrowRight className="h-3 w-3" />
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-8 text-center">
                    <Link
                        href={`${ROUTES.CONFIGURATOR.ROOT}?step=1`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    >
                        Or start from scratch
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
