import type { Metadata } from 'next';
import { SavedDesignsList } from '@/features/designs/components/SavedDesignsList';

export const metadata: Metadata = {
    title: 'My Designs — Atlas Furniture',
    description: 'View and manage your saved furniture designs.',
};

export default function DashboardPage(): React.ReactElement {
    return (
        <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">My Designs</h1>
                <p className="mt-2 text-muted-foreground">
                    Your saved furniture configurations. Load any design to continue customizing or request a quote.
                </p>
            </div>
            <SavedDesignsList />
        </div>
    );
}
