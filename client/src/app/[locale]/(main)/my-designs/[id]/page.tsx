import type { Metadata } from 'next';
import { DesignDetailView } from '@/features/designs/components/DesignDetailView';

interface DesignDetailPageProps {
    params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
    title: 'Design Details — Atlas Furniture',
    description: 'View your furniture design details and generation history.',
};

export default async function DesignDetailPage({ params }: DesignDetailPageProps): Promise<React.ReactElement> {
    const { id } = await params;

    return (
        <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
            <DesignDetailView designId={id} />
        </div>
    );
}
