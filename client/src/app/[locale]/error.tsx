'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { WarningCircle } from '@phosphor-icons/react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}): React.ReactElement {
    const t = useTranslations('Errors');
    const tCommon = useTranslations('Common');

    useEffect(() => {
        // Log to error reporting service in production
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
            <WarningCircle className="mb-4 h-12 w-12 text-destructive" />
            <h2 className="mb-2 text-2xl font-bold">{t('somethingWentWrong')}</h2>
            <p className="mb-4 text-muted-foreground">{error.message}</p>
            <Button onClick={reset}>{tCommon('tryAgain')}</Button>
        </div>
    );
}
