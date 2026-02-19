import { Robot, Calculator, Palette } from '@phosphor-icons/react/dist/ssr';

const FEATURES = [
    {
        icon: Palette,
        title: 'Fully Customizable',
        description:
            'Choose from 8 furniture types with dozens of color, material, size, and finish combinations. Every detail is yours to control.',
    },
    {
        icon: Robot,
        title: 'AI-Generated Previews',
        description:
            'Your selections are turned into a photorealistic prompt and rendered by AI — see your furniture before you buy it.',
    },
    {
        icon: Calculator,
        title: 'Live Pricing',
        description:
            'Every option you choose updates the price instantly. Red velvet? +$80. Leather? +$200. No hidden costs, ever.',
    },
];

export function FeaturesSection(): React.JSX.Element {
    return (
        <section className="container mx-auto px-4 py-20 md:px-6 lg:px-8">
            <div className="mb-12 text-center">
                <h2 className="text-balance text-2xl font-bold text-foreground md:text-3xl">
                    Everything you need to design with confidence
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                    No design background required. Our system guides you from blank canvas to finished design.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {FEATURES.map((feature) => {
                    const Icon = feature.icon;
                    return (
                        <div
                            key={feature.title}
                            className="rounded-xl border border-[--border-crisp] bg-[--surface-enamel] p-6 shadow-[--shadow-enamel] motion-safe:transition-all motion-safe:duration-300 motion-safe:hover:shadow-[--shadow-enamel-hover] motion-safe:hover:-translate-y-0.5"
                        >
                            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                                <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="mb-2 text-base font-semibold text-foreground">{feature.title}</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
