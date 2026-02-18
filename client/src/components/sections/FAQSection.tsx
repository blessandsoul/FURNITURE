import { FAQAccordion } from './FAQAccordion';

const FAQ_ITEMS = [
    {
        id: 'faq-1',
        question: 'How long does delivery take?',
        answer: 'Standard delivery takes 3 weeks from order confirmation. Complex custom pieces may take up to 4 weeks. We send you a precise timeline within 2 hours of your order.',
    },
    {
        id: 'faq-2',
        question: 'Can I modify my design after ordering?',
        answer: 'Minor modifications (color, finish) are possible within the first 24 hours at no extra cost. Structural changes after production begins may incur additional fees and time.',
    },
    {
        id: 'faq-3',
        question: 'What materials do you use?',
        answer: 'We work with solid oak, walnut, birch, and MDF for painted pieces. Upholstery options include linen, velvet, boucle, and full-grain leather. All wood is responsibly sourced.',
    },
    {
        id: 'faq-4',
        question: 'Do you deliver outside the capital?',
        answer: 'Yes. We deliver to 12 cities across Georgia including Tbilisi, Batumi, Kutaisi, Rustavi, Gori, and Zugdidi. White-glove assembly is included for all cities at no additional cost.',
    },
    {
        id: 'faq-5',
        question: 'What if I am not satisfied with the result?',
        answer: 'We stand behind every piece. If the delivered furniture does not match the confirmed design specifications, we will repair or replace it at no cost. Customer satisfaction is our guarantee.',
    },
    {
        id: 'faq-6',
        question: 'Is the AI preview exactly what I will receive?',
        answer: 'The AI preview is a photorealistic representation of your design choices — not a photograph of the final piece. Slight variations in wood grain and fabric texture are natural. The dimensions, colors, and materials are guaranteed to match your confirmed order.',
    },
] as const;

export type FaqItem = (typeof FAQ_ITEMS)[number];

export function FAQSection(): React.JSX.Element {
    return (
        <section className="bg-muted/30 py-20">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl">
                    <div className="mb-10 text-center">
                        <h2 className="text-balance text-2xl font-bold text-foreground md:text-3xl">
                            Frequently asked questions
                        </h2>
                        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                            Everything you need to know before placing your order.
                        </p>
                    </div>

                    <FAQAccordion items={FAQ_ITEMS} />
                </div>
            </div>
        </section>
    );
}
