'use client';

import { ArrowLeft, ArrowRight, Sparkle } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';
import type { ConfiguratorStep } from '../../types/configurator.types';

interface StepNavigationProps {
    currentStep: ConfiguratorStep;
    canProceed: boolean;
    basePath?: string;
    onGenerate?: () => void;
    isGenerating?: boolean;
}

export function StepNavigation({
    currentStep,
    canProceed,
    basePath = ROUTES.CONFIGURATOR.ROOT,
    onGenerate,
    isGenerating,
}: StepNavigationProps): React.JSX.Element {
    const router = useRouter();

    const handleNext = useCallback(() => {
        if (currentStep < 3) {
            router.push(`${basePath}?step=${currentStep + 1}`);
        }
    }, [currentStep, basePath, router]);

    const handleBack = useCallback(() => {
        if (currentStep > 1) {
            router.push(`${basePath}?step=${currentStep - 1}`);
        }
    }, [currentStep, basePath, router]);

    return (
        <div className="flex items-center justify-between border-t border-border/50 pt-4">
            <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="gap-2"
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </Button>

            {currentStep < 3 ? (
                <Button
                    onClick={handleNext}
                    disabled={!canProceed}
                    className="gap-2"
                >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                </Button>
            ) : (
                <Button
                    onClick={onGenerate}
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
                            Generate Design
                        </>
                    )}
                </Button>
            )}
        </div>
    );
}
