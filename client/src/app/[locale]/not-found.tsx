'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { SealQuestion } from '@phosphor-icons/react';

export default function NotFound(): React.ReactElement {
    const t = useTranslations('Errors');
    const tCommon = useTranslations('Common');

    return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
            <SealQuestion className="h-16 w-16 text-muted-foreground" weight="thin" />
            <h2 className="text-2xl font-bold">{t('pageNotFound')}</h2>
            <p className="text-muted-foreground">
                {t('pageNotFoundBody')}
            </p>
            <Button asChild>
                <Link href="/">{tCommon('goHome')}</Link>
            </Button>
        </div>
    );
}
