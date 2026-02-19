'use client';

import { useTranslations } from 'next-intl';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import type { FaqItem } from './FAQSection';

interface FAQAccordionProps {
    items: readonly FaqItem[];
}

export function FAQAccordion({ items }: FAQAccordionProps): React.JSX.Element {
    const t = useTranslations('Home');

    return (
        <Accordion type="single" collapsible className="w-full">
            {items.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:text-primary">
                        {t(item.questionKey)}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                        {t(item.answerKey)}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
