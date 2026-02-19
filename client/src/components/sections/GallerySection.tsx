'use client';

import { useTranslations } from 'next-intl';

const GALLERY_ITEMS = [
    { id: 1, captionKey: 'gallery.item1', city: 'Tbilisi', gridClass: 'col-span-1 row-span-2' },
    { id: 2, captionKey: 'gallery.item2', city: 'Batumi', gridClass: 'col-span-1 row-span-1' },
    { id: 3, captionKey: 'gallery.item3', city: 'Kutaisi', gridClass: 'col-span-1 row-span-1' },
    { id: 4, captionKey: 'gallery.item4', city: 'Tbilisi', gridClass: 'col-span-2 row-span-1' },
    { id: 5, captionKey: 'gallery.item5', city: 'Rustavi', gridClass: 'col-span-1 row-span-1' },
    { id: 6, captionKey: 'gallery.item6', city: 'Tbilisi', gridClass: 'col-span-1 row-span-1' },
] as const;

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
                            className={`${item.gridClass} group relative overflow-hidden rounded-xl border border-[--border-crisp] bg-muted/50 motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:scale-[1.02]`}
                        >
                            {/* TODO: Replace with <Image> when real photos are available. Recommended size: ~800x600px. */}

                            {/* Caption overlay */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/20 to-transparent p-3">
                                <p className="text-xs font-semibold text-foreground drop-shadow-sm">{t(item.captionKey)}</p>
                                <p className="text-xs text-foreground/70 drop-shadow-sm">{item.city}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
