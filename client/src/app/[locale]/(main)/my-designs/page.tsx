import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SavedDesignsList } from '@/features/designs/components/SavedDesignsList';
import { ROUTES } from '@/lib/constants/routes';
import { Button } from '@/components/ui/button';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Metadata');
    return {
        title: t('myDesignsTitle'),
        description: t('myDesignsDescription'),
    };
}

export default async function MyDesignsPage(): Promise<React.ReactElement> {
    const t = await getTranslations('Designs');

    return (
        <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('pageTitle')}</h1>
                <Button asChild size="sm" className="gap-1.5">
                    <Link href={ROUTES.CONFIGURATOR.ROOT}>
                        {t('newDesign')}
                    </Link>
                </Button>
            </div>
            <SavedDesignsList />
        </div>
    );
}
