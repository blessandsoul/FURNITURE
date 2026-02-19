import type { Metadata } from 'next';
import { CreditsPageContent } from '@/features/credits/components/CreditsPageContent';

export const metadata: Metadata = {
    title: 'Credits — Atlas Furniture',
    description: 'Purchase credits and manage your AI generation balance.',
};

export default function CreditsPage(): React.ReactElement {
    return (
        <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Credits
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Purchase credits to generate AI images of your furniture designs.
                </p>
            </div>
            <CreditsPageContent />
        </div>
    );
}
