import { Star } from '@phosphor-icons/react/dist/ssr';

const TESTIMONIALS = [
    {
        id: 1,
        quote: 'We ordered a custom walnut dining table for our Tbilisi apartment. It arrived in exactly 3 weeks, assembled and ready. The quality is outstanding — far better than anything we found in stores.',
        name: 'Nino Beridze',
        city: 'Tbilisi',
        item: 'Walnut dining table',
        rating: 5,
    },
    {
        id: 2,
        quote: 'The AI preview matched the final product almost exactly. I was skeptical at first, but the linen sofa we received was perfect for our Batumi holiday home. Delivery and setup were seamless.',
        name: 'Giorgi Kvaratskhelia',
        city: 'Batumi',
        item: 'Linen sofa',
        rating: 5,
    },
    {
        id: 3,
        quote: 'I customized a wardrobe with specific dimensions and materials. The team confirmed everything within 2 hours and delivered on schedule. Exceptional white-glove service from start to finish.',
        name: 'Mariam Tsereteli',
        city: 'Kutaisi',
        item: 'Built-in wardrobe',
        rating: 5,
    },
] as const;

export function TestimonialsSection(): React.JSX.Element {
    return (
        <section className="bg-muted/30 py-20">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="mb-10 text-center">
                    <h2 className="text-balance text-2xl font-bold text-foreground md:text-3xl">
                        What our customers say
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                        Real stories from real homes across Georgia.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {TESTIMONIALS.map((testimonial) => (
                        <article
                            key={testimonial.id}
                            className="flex flex-col gap-4 rounded-xl border border-[--border-crisp] bg-[--surface-enamel] p-6 shadow-[--shadow-enamel] backdrop-blur-md"
                        >
                            {/* Stars */}
                            <div
                                className="flex gap-0.5"
                                aria-label={`${testimonial.rating} out of 5 stars`}
                                role="img"
                            >
                                {Array.from({ length: testimonial.rating }).map((_, i) => (
                                    <Star key={i} className="h-3.5 w-3.5 text-warning" weight="fill" />
                                ))}
                            </div>

                            {/* Quote */}
                            <blockquote className="flex-1 text-sm leading-relaxed text-muted-foreground">
                                &ldquo;{testimonial.quote}&rdquo;
                            </blockquote>

                            {/* Attribution */}
                            <footer className="border-t border-border/50 pt-4">
                                <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {testimonial.city} &mdash; {testimonial.item}
                                </p>
                            </footer>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
