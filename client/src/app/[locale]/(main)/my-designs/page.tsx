import Link from 'next/link';
import type { Metadata } from 'next';
import { SavedDesignsList } from '@/features/designs/components/SavedDesignsList';
import { ROUTES } from '@/lib/constants/routes';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'My Designs — Atlas Furniture',
    description: 'View and manage your saved furniture designs.',
};

export default function MyDesignsPage(): React.ReactElement {
    return (
        <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">My Designs</h1>
                <Button asChild size="sm" className="gap-1.5">
                    <Link href={ROUTES.CONFIGURATOR.ROOT}>
                        New Design
                    </Link>
                </Button>
            </div>
            <SavedDesignsList />
        </div>
    );
}
