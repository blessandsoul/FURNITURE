import { CheckCircle, Star, MapPin, Timer } from '@phosphor-icons/react/dist/ssr';

const TRUST_BADGES = [
    { icon: CheckCircle, stat: '1,200+', label: 'Orders Completed' },
    { icon: Star, stat: '4.9★', label: 'from 340 customers' },
    { icon: MapPin, stat: '12', label: 'Cities Covered' },
    { icon: Timer, stat: '3 wks', label: 'Average Delivery' },
] as const;

export function TrustBadgesSection(): React.JSX.Element {
    return (
        <section className="border-y border-border/50 bg-muted/40 py-6">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 md:justify-between">
                    {TRUST_BADGES.map(({ icon: Icon, stat, label }) => (
                        <div key={label} className="flex items-center gap-2.5">
                            <Icon className="h-4 w-4 shrink-0 text-primary" />
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-sm font-bold tabular-nums text-foreground">{stat}</span>
                                <span className="text-xs text-muted-foreground">{label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
