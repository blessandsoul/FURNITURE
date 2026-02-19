import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ConfiguratorSidebar } from '@/components/layout/ConfiguratorSidebar';
import { ConfiguratorWizard } from '@/features/configurator/components/wizard/ConfiguratorWizard';
import { StyleGridSkeleton } from '@/features/configurator/components/skeletons/StyleGridSkeleton';

interface ConfiguratorPageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ConfiguratorPageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Metadata' });
    return {
        title: t('configuratorTitle'),
        description: t('configuratorDescription'),
    };
}

export default async function ConfiguratorPage({ params }: ConfiguratorPageProps): Promise<React.JSX.Element> {
    const t = await getTranslations('Configurator');

    return (
        <div className="flex min-h-0 flex-1 overflow-hidden">
            <div className="container mx-auto flex min-h-0 flex-1 px-4 md:px-6 lg:px-8">

                {/* Dynamic sidebar — content changes per step */}
                <Suspense fallback={<SidebarSkeleton />}>
                    <ConfiguratorSidebar />
                </Suspense>

                {/* Main configurator area */}
                <main className="flex min-h-0 flex-1 flex-col py-4 md:py-5 lg:pl-6">
                    {/* Mobile headline */}
                    <div className="mb-3 shrink-0 lg:hidden">
                        <h1 className="text-lg font-bold tracking-tight text-foreground">
                            {t('page.mobileHeadline')}{' '}
                            <span className="text-primary">{t('page.mobileSubline')}</span>
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            {t('page.mobileDescription')}
                        </p>
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-[--border-crisp] bg-[--surface-enamel] px-5 py-5 backdrop-blur-md shadow-[--shadow-enamel] md:px-8 md:py-6">
                        <Suspense fallback={<StyleGridSkeleton />}>
                            <ConfiguratorWizard />
                        </Suspense>
                    </div>
                </main>

            </div>
        </div>
    );
}

function SidebarSkeleton(): React.JSX.Element {
    return (
        <aside className="hidden w-72 shrink-0 border-r border-[--border-crisp] bg-[--surface-enamel] px-8 py-10 lg:block xl:w-80">
            <div className="animate-pulse space-y-6">
                <div className="h-6 w-28 rounded-full bg-muted" />
                <div className="space-y-2">
                    <div className="h-8 w-3/4 rounded-lg bg-muted" />
                    <div className="h-8 w-1/2 rounded-lg bg-muted" />
                </div>
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-5/6 rounded bg-muted" />
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="h-7 w-7 rounded-lg bg-muted" />
                            <div className="h-4 w-40 rounded bg-muted" />
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}
