'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Truck, Star } from '@phosphor-icons/react';

import { Badge } from '@/components/ui/badge';

interface GalleryItem {
    id: number;
    captionKey: string;
    materialKey: string;
    city: string;
    gridClass: string;
    src: string;
    price: string;
    deliveryDays: number;
    tagKey: string | null;
    customerInitials: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
    {
        id: 1,
        captionKey: 'gallery.item1',
        materialKey: 'gallery.materialOak',
        city: 'Tbilisi',
        gridClass: 'col-span-1 row-span-2',
        src: '/gallery/1.jpg',
        price: '₾1,200',
        deliveryDays: 18,
        tagKey: 'gallery.tagBestseller',
        customerInitials: 'N.B.',
    },
    {
        id: 2,
        captionKey: 'gallery.item2',
        materialKey: 'gallery.materialWalnut',
        city: 'Batumi',
        gridClass: 'col-span-1 row-span-1',
        src: '/gallery/2.jpg',
        price: '₾950',
        deliveryDays: 14,
        tagKey: null,
        customerInitials: 'G.K.',
    },
    {
        id: 3,
        captionKey: 'gallery.item3',
        materialKey: 'gallery.materialLinen',
        city: 'Kutaisi',
        gridClass: 'col-span-1 row-span-1',
        src: '/gallery/3.jpg',
        price: '₾2,400',
        deliveryDays: 21,
        tagKey: 'gallery.tagPopular',
        customerInitials: 'M.T.',
    },
    {
        id: 4,
        captionKey: 'gallery.item4',
        materialKey: 'gallery.materialWalnut',
        city: 'Tbilisi',
        gridClass: 'col-span-2 row-span-1',
        src: '/gallery/4.jpg',
        price: '₾480',
        deliveryDays: 10,
        tagKey: null,
        customerInitials: 'D.G.',
    },
    {
        id: 5,
        captionKey: 'gallery.item5',
        materialKey: 'gallery.materialLacquer',
        city: 'Rustavi',
        gridClass: 'col-span-1 row-span-1',
        src: '/gallery/5.jpg',
        price: '₾1,800',
        deliveryDays: 20,
        tagKey: 'gallery.tagNew',
        customerInitials: 'L.A.',
    },
    {
        id: 6,
        captionKey: 'gallery.item6',
        materialKey: 'gallery.materialVelvet',
        city: 'Tbilisi',
        gridClass: 'col-span-1 row-span-1',
        src: '/gallery/6.jpg',
        price: '₾1,100',
        deliveryDays: 16,
        tagKey: null,
        customerInitials: 'A.S.',
    },
];

export function GallerySection(): React.JSX.Element {
    const t = useTranslations('Home');

    return (
        <section className="py-20">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="mb-10 text-center">
                    <h2 className="text-balance text-2xl font-bold text-foreground md:text-3xl">
                        {t('gallery.heading')}
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                        {t('gallery.subheading')}
                    </p>
                </div>

                <div className="grid auto-rows-[180px] grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                    {GALLERY_ITEMS.map((item) => (
                        <div
                            key={item.id}
                            className={`${item.gridClass} group relative overflow-hidden rounded-xl border border-[--border-crisp] bg-muted/50 motion-safe:transition-all motion-safe:duration-300 motion-safe:hover:scale-[1.02] motion-safe:hover:shadow-[--shadow-enamel-hover]`}
                        >
                            <Image
                                src={item.src}
                                alt={t(item.captionKey)}
                                fill
                                className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
                                sizes="(max-width: 768px) 50vw, 33vw"
                            />

                            {/* Tag badge */}
                            {item.tagKey && (
                                <div className="absolute top-2 left-2 z-10">
                                    <Badge className="bg-white/90 text-foreground shadow-sm backdrop-blur-sm text-[10px] px-1.5 py-0.5">
                                        {t(item.tagKey)}
                                    </Badge>
                                </div>
                            )}

                            {/* Info overlay */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-2.5 pt-8 md:p-3 md:pt-10">
                                <p className="text-xs font-semibold text-white drop-shadow-sm md:text-sm">
                                    {t(item.captionKey)}
                                </p>
                                <p className="mt-0.5 text-[10px] text-white/70 drop-shadow-sm md:text-xs">
                                    {t(item.materialKey)} · {item.city}
                                </p>

                                {/* Price & delivery row */}
                                <div className="mt-1 flex items-center justify-between">
                                    <span className="text-[10px] font-semibold text-white md:text-xs">
                                        {t('gallery.fromPrice')} {item.price}
                                    </span>
                                    <span className="flex items-center gap-0.5 text-[10px] text-white/70 md:text-xs">
                                        <Truck weight="bold" className="h-3 w-3" />
                                        {item.deliveryDays} {t('gallery.daysLabel')}
                                    </span>
                                </div>

                                {/* Customer & rating */}
                                <div className="mt-1 flex items-center gap-1 border-t border-white/15 pt-1">
                                    <span className="text-[10px] text-white/60">
                                        {item.customerInitials}
                                    </span>
                                    <Star weight="fill" className="h-2.5 w-2.5 text-amber-400" />
                                    <Star weight="fill" className="h-2.5 w-2.5 text-amber-400" />
                                    <Star weight="fill" className="h-2.5 w-2.5 text-amber-400" />
                                    <Star weight="fill" className="h-2.5 w-2.5 text-amber-400" />
                                    <Star weight="fill" className="h-2.5 w-2.5 text-amber-400" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
