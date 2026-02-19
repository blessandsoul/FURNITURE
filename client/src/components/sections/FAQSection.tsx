'use client';

import { useTranslations } from 'next-intl';
import { FAQAccordion } from './FAQAccordion';

const FAQ_ITEMS = [
    { id: 'faq-1', questionKey: 'faq.q1', answerKey: 'faq.a1' },
    { id: 'faq-2', questionKey: 'faq.q2', answerKey: 'faq.a2' },
    { id: 'faq-3', questionKey: 'faq.q3', answerKey: 'faq.a3' },
    { id: 'faq-4', questionKey: 'faq.q4', answerKey: 'faq.a4' },
    { id: 'faq-5', questionKey: 'faq.q5', answerKey: 'faq.a5' },
    { id: 'faq-6', questionKey: 'faq.q6', answerKey: 'faq.a6' },
] as const;

export type FaqItem = (typeof FAQ_ITEMS)[number];

export function FAQSection(): React.JSX.Element {
    const t = useTranslations('Home');

    return (
        <section className="bg-muted/30 py-20">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl">
                    <div className="mb-10 text-center">
                        <h2 className="text-balance text-2xl font-bold text-foreground md:text-3xl">
                            {t('faq.heading')}
                        </h2>
                        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                            {t('faq.subheading')}
                        </p>
                    </div>

                    <FAQAccordion items={FAQ_ITEMS} />
                </div>
            </div>
        </section>
    );
}
