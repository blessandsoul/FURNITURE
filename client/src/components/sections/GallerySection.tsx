const GALLERY_ITEMS = [
    { id: 1, caption: 'Custom oak dining table', city: 'Tbilisi', gridClass: 'col-span-1 row-span-2' },
    { id: 2, caption: 'Walnut bookshelf unit', city: 'Batumi', gridClass: 'col-span-1 row-span-1' },
    { id: 3, caption: 'Linen sofa, dove white', city: 'Kutaisi', gridClass: 'col-span-1 row-span-1' },
    { id: 4, caption: 'Espresso side table', city: 'Tbilisi', gridClass: 'col-span-2 row-span-1' },
    { id: 5, caption: 'White lacquer wardrobe', city: 'Rustavi', gridClass: 'col-span-1 row-span-1' },
    { id: 6, caption: 'Sage velvet armchair', city: 'Tbilisi', gridClass: 'col-span-1 row-span-1' },
] as const;

export function GallerySection(): React.JSX.Element {
    return (
        <section className="py-20">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="mb-10 text-center">
                    <h2 className="text-balance text-2xl font-bold text-foreground md:text-3xl">
                        Delivered to real homes
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                        Every piece you see was designed through Atlas and delivered to a customer in Georgia.
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
                                <p className="text-xs font-semibold text-foreground drop-shadow-sm">{item.caption}</p>
                                <p className="text-xs text-foreground/70 drop-shadow-sm">{item.city}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
