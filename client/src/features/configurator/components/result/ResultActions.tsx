'use client';

import { DownloadSimple, LinkSimple, ChatText } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';
import { useConfiguratorContext } from '../../store/configuratorContext';
import { encodeDesignToParams } from '../../lib/share';
import { QuoteModal } from '@/features/quotes/components/QuoteModal';

interface ResultActionsProps {
    imageUrl: string | undefined;
    onRestart: () => void;
}

export function ResultActions({ imageUrl, onRestart }: ResultActionsProps): React.JSX.Element {
    const { state } = useConfiguratorContext();
    const [isQuoteOpen, setIsQuoteOpen] = useState(false);

    const handleShare = useCallback(async () => {
        try {
            const designParams = encodeDesignToParams(state.selections);
            designParams.set('step', '3');
            const shareUrl = `${window.location.origin}${ROUTES.CONFIGURATOR.ROOT}?${designParams.toString()}`;
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Link copied to clipboard');
        } catch {
            toast.error('Could not copy link');
        }
    }, [state.selections]);

    const handleDownload = useCallback(() => {
        if (!imageUrl) return;
        const anchor = document.createElement('a');
        anchor.href = imageUrl;
        anchor.download = 'atlas-furniture-design.png';
        anchor.rel = 'noopener noreferrer';
        anchor.click();
    }, [imageUrl]);

    const handleQuote = useCallback(() => {
        setIsQuoteOpen(true);
    }, []);

    return (
        <>
            <div className="flex flex-col gap-2">
                <Button
                    onClick={handleDownload}
                    disabled={!imageUrl}
                    className="w-full justify-start gap-2"
                >
                    <DownloadSimple className="h-4 w-4" />
                    Download Image
                </Button>

                <Button
                    variant="outline"
                    onClick={handleShare}
                    className="w-full justify-start gap-2"
                >
                    <LinkSimple className="h-4 w-4" />
                    Copy Share Link
                </Button>

                <Button
                    variant="outline"
                    onClick={handleQuote}
                    className="w-full justify-start gap-2"
                >
                    <ChatText className="h-4 w-4" />
                    Request Quote
                </Button>

                <button
                    type="button"
                    onClick={onRestart}
                    className="mt-1 text-center text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline transition-colors duration-150"
                >
                    Start over
                </button>
            </div>

            <QuoteModal
                open={isQuoteOpen}
                onOpenChange={setIsQuoteOpen}
                imageUrl={imageUrl}
            />
        </>
    );
}
