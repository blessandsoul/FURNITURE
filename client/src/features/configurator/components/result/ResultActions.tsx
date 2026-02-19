'use client';

import { DownloadSimple, ArrowsClockwise, ChatText, Heart, SpinnerGap } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';
import { QuoteModal } from '@/features/quotes/components/QuoteModal';

interface ResultActionsProps {
    imageUrl: string | undefined;
    designId: string | null;
    isRegenerating: boolean;
    onRestart: () => void;
    onRetry: () => void;
}

export function ResultActions({ imageUrl, designId, isRegenerating, onRestart, onRetry }: ResultActionsProps): React.JSX.Element {
    const t = useTranslations('Configurator');
    const [isQuoteOpen, setIsQuoteOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = useCallback(async () => {
        if (!imageUrl) return;
        setIsDownloading(true);
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = blobUrl;
            anchor.download = 'atlas-furniture-design.png';
            anchor.click();
            URL.revokeObjectURL(blobUrl);
        } catch {
            window.open(imageUrl, '_blank', 'noopener,noreferrer');
        } finally {
            setIsDownloading(false);
        }
    }, [imageUrl]);

    const handleQuote = useCallback(() => {
        setIsQuoteOpen(true);
    }, []);

    return (
        <>
            <div className="flex flex-col gap-2">
                {designId && (
                    <Button
                        variant="outline"
                        onClick={handleQuote}
                        className="w-full justify-start gap-2"
                    >
                        <ChatText className="h-4 w-4" />
                        {t('resultActions.requestQuote')}
                    </Button>
                )}

                <Button
                    onClick={handleDownload}
                    disabled={!imageUrl || isDownloading}
                    variant="outline"
                    className="w-full justify-start gap-2"
                >
                    {isDownloading ? (
                        <SpinnerGap className="h-4 w-4 animate-spin" />
                    ) : (
                        <DownloadSimple className="h-4 w-4" />
                    )}
                    {isDownloading ? t('resultActions.downloading') : t('resultActions.downloadImage')}
                </Button>

                <Button
                    variant="outline"
                    onClick={onRetry}
                    disabled={!designId || isRegenerating}
                    className="w-full justify-start gap-2"
                >
                    {isRegenerating ? (
                        <SpinnerGap className="h-4 w-4 animate-spin" />
                    ) : (
                        <ArrowsClockwise className="h-4 w-4" />
                    )}
                    {isRegenerating ? t('resultActions.regenerating') : t('resultActions.regenerate')}
                </Button>

                {designId && (
                    <Link href={ROUTES.MY_DESIGNS} className="w-full">
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-2"
                        >
                            <Heart className="h-4 w-4" />
                            {t('resultActions.viewMyDesigns')}
                        </Button>
                    </Link>
                )}

                <button
                    type="button"
                    onClick={onRestart}
                    className="mt-1 text-center text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline transition-colors duration-150"
                >
                    {t('resultActions.startOver')}
                </button>
            </div>

            {designId && (
                <QuoteModal
                    open={isQuoteOpen}
                    onOpenChange={setIsQuoteOpen}
                    designId={designId}
                />
            )}
        </>
    );
}
