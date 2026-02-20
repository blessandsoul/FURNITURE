'use client';

import { useTranslations } from 'next-intl';
import { Star } from '@phosphor-icons/react';

const TESTIMONIALS = [
    { id: 1, quoteKey: 'testimonials.quote1', nameKey: 'testimonials.name1', city: 'Tbilisi', itemKey: 'testimonials.item1', rating: 5 },
    { id: 2, quoteKey: 'testimonials.quote2', nameKey: 'testimonials.name2', city: 'Batumi', itemKey: 'testimonials.item2', rating: 5 },
    { id: 3, quoteKey: 'testimonials.quote3', nameKey: 'testimonials.name3', city: 'Kutaisi', itemKey: 'testimonials.item3', rating: 5 },
] as const;

export function TestimonialsSection(): React.JSX.Element {
    const t = useTranslations('Home');

    return (
        <section className="bg-muted/30 py-20">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="mb-10 text-center">
                    <h2 className="text-balance text-2xl font-bold text-foreground md:text-3xl">
                        {t('testimonials.heading')}
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                        {t('testimonials.subheading')}
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {TESTIMONIALS.map((testimonial) => (
                        <article
                            key={testimonial.id}
                            className="flex flex-col gap-4 rounded-xl border border-[--border-crisp] bg-[--surface-enamel] p-6 shadow-[--shadow-enamel]"
                        >
                            {/* Quote */}
                            <blockquote className="flex-1 text-sm leading-relaxed text-muted-foreground">
                                &ldquo;{t(testimonial.quoteKey)}&rdquo;
                            </blockquote>

                            {/* Attribution + Stars */}
                            <footer className="flex items-end justify-between border-t border-border/50 pt-4">
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{t(testimonial.nameKey)}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {testimonial.city} &mdash; {t(testimonial.itemKey)}
                                    </p>
                                </div>
                                <div
                                    className="flex gap-0.5"
                                    aria-label={`${testimonial.rating} out of 5 stars`}
                                    role="img"
                                >
                                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                                        <Star key={i} className="h-3.5 w-3.5 text-warning" weight="fill" />
                                    ))}
                                </div>
                            </footer>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
