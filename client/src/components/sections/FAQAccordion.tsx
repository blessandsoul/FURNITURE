'use client';

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
    return (
        <Accordion type="single" collapsible className="w-full">
            {items.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:text-primary">
                        {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                        {item.answer}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
