import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CreditsPageContent } from '@/features/credits/components/CreditsPageContent';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Metadata');
    return {
        title: t('creditsTitle'),
        description: t('creditsDescription'),
    };
}

export default async function CreditsPage(): Promise<React.ReactElement> {
    const t = await getTranslations('Credits');

    return (
        <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {t('pageTitle')}
                </h1>
                <p className="mt-2 text-muted-foreground">
                    {t('pageSubtitle')}
                </p>
            </div>
            <CreditsPageContent />
        </div>
    );
}
