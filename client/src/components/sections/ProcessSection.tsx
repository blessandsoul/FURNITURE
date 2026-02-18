import { ChatCircle, Wrench, MagnifyingGlass, Truck } from '@phosphor-icons/react/dist/ssr';

const PROCESS_STEPS = [
    {
        number: '01',
        icon: ChatCircle,
        title: 'Request a Quote',
        description: 'Submit your design and contact details. We confirm your order and production timeline within 2 hours.',
    },
    {
        number: '02',
        icon: Wrench,
        title: 'Production Begins',
        description: 'Expert craftsmen build your piece to exact specifications. Production takes 2–3 weeks depending on complexity.',
    },
    {
        number: '03',
        icon: MagnifyingGlass,
        title: 'Quality Check',
        description: 'Every piece is inspected against your confirmed design before leaving the workshop. No exceptions.',
    },
    {
        number: '04',
        icon: Truck,
        title: 'Delivery & Setup',
        description: 'White-glove delivery to any city in Georgia. Our team assembles and positions your furniture — you just enjoy it.',
    },
] as const;

export function ProcessSection(): React.JSX.Element {
    return (
        <section className="py-20">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <h2 className="text-balance text-2xl font-bold text-foreground md:text-3xl">
                        What happens after you order
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                        You always know exactly where your furniture is in the process — from quote to delivery.
                    </p>
                </div>

                <div className="relative mx-auto max-w-2xl">
                    {/* Vertical connector line (desktop) */}
                    <div
                        aria-hidden="true"
                        className="absolute left-6 top-8 hidden h-[calc(100%-4rem)] w-0.5 bg-border md:block"
                    />

                    <div className="space-y-10">
                        {PROCESS_STEPS.map(({ number, icon: Icon, title, description }) => (
                            <div key={number} className="relative flex gap-6">
                                {/* Step node */}
                                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background">
                                    <Icon className="h-5 w-5 text-primary" />
                                </div>

                                {/* Content */}
                                <div className="pt-2">
                                    <div className="mb-0.5 text-xs font-bold tabular-nums text-muted-foreground">
                                        {number}
                                    </div>
                                    <h3 className="text-base font-semibold text-foreground">{title}</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
