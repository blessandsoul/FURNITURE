'use client';

import { useTranslations } from 'next-intl';
import { CheckCircle, Star, MapPin, Timer } from '@phosphor-icons/react';

export function TrustBadgesSection(): React.JSX.Element {
    const t = useTranslations('Home');

    const TRUST_BADGES = [
        { icon: CheckCircle, stat: '1,200+', labelKey: 'trustBadges.ordersCompleted' as const },
        { icon: Star, stat: '4.9★', labelKey: 'trustBadges.fromCustomers' as const },
        { icon: MapPin, stat: '12', labelKey: 'trustBadges.citiesCovered' as const },
        { icon: Timer, stat: '3 wks', labelKey: 'trustBadges.averageDelivery' as const },
    ];

    return (
        <section className="border-y border-border/50 bg-muted/40 py-6">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 md:justify-between">
                    {TRUST_BADGES.map(({ icon: Icon, stat, labelKey }) => (
                        <div key={labelKey} className="flex items-center gap-2.5">
                            <Icon className="h-4 w-4 shrink-0 text-primary" />
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-sm font-bold tabular-nums text-foreground">{stat}</span>
                                <span className="text-xs text-muted-foreground">{t(labelKey)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
