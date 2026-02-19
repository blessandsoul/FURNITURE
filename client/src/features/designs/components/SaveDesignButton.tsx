'use client';

import { useTranslations } from 'next-intl';
import { Heart } from '@phosphor-icons/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';

interface SaveDesignButtonProps {
    designId: string | null;
}

/**
 * Since the design is auto-saved when entering Step 3 (via the server API),
 * this button now simply navigates to "My Designs" to view saved work.
 */
export function SaveDesignButton({ designId }: SaveDesignButtonProps): React.JSX.Element {
    const t = useTranslations('Designs');

    if (!designId) {
        return (
            <Button variant="outline" disabled className="w-full justify-start gap-2">
                <Heart className="h-4 w-4" />
                {t('saveButton.saving')}
            </Button>
        );
    }

    return (
        <Link href={ROUTES.MY_DESIGNS} className="w-full">
            <Button variant="outline" className="w-full justify-start gap-2">
                <Heart className="h-4 w-4" weight="fill" />
                {t('saveButton.viewInMyDesigns')}
            </Button>
        </Link>
    );
}
