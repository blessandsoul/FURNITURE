'use client';

import { ArrowLeft, ArrowRight, Sparkle } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';
import type { ConfiguratorStep } from '../../types/configurator.types';

interface StepNavigationProps {
    currentStep: ConfiguratorStep;
    canProceed: boolean;
    basePath?: string;
    onGenerate?: () => void;
    isGenerating?: boolean;
    isReimagine?: boolean;
    onNext?: () => void;
    onBack?: () => void;
    maxSteps?: number;
}

export function StepNavigation({
    currentStep,
    canProceed,
    basePath = ROUTES.CONFIGURATOR.ROOT,
    onGenerate,
    isGenerating,
    isReimagine = false,
    onNext,
    onBack,
    maxSteps = 4,
}: StepNavigationProps): React.JSX.Element {
    const router = useRouter();

    const handleNext = useCallback(() => {
        if (onNext) {
            onNext();
            return;
        }
        if (currentStep < maxSteps) {
            router.push(`${basePath}?step=${currentStep + 1}`);
        }
    }, [currentStep, basePath, router, onNext, maxSteps]);

    const handleBack = useCallback(() => {
        if (onBack) {
            onBack();
            return;
        }
        if (currentStep > 1) {
            router.push(`${basePath}?step=${currentStep - 1}`);
        }
    }, [currentStep, basePath, router, onBack]);

    const isLastNavStep = currentStep >= maxSteps - 1;

    return (
        <div className="flex items-center justify-between border-t border-border/50 pt-4">
            <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 && !isReimagine}
                className="gap-2"
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </Button>

            {isLastNavStep ? (
                <Button
                    onClick={onGenerate ?? handleNext}
                    disabled={!canProceed || isGenerating}
                    className="gap-2"
                >
                    {isGenerating ? (
                        <>
                            <Sparkle className="h-4 w-4 motion-safe:animate-pulse" />
                            Generating…
                        </>
                    ) : (
                        <>
                            <Sparkle className="h-4 w-4" />
                            {isReimagine ? 'Reimagine Room' : 'Generate Design'}
                        </>
                    )}
                </Button>
            ) : (
                <Button
                    onClick={handleNext}
                    disabled={!canProceed}
                    className="gap-2"
                >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
