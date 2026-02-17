'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { ROUTES } from '@/lib/constants/routes';
import { useConfigurator } from '../../hooks/useConfigurator';
import type { ConfiguratorStep } from '../../types/configurator.types';
import { StepIndicator } from './StepIndicator';
import { StepNavigation } from './StepNavigation';
import { Step1FurnitureStyle } from './Step1FurnitureStyle';
import { Step2Customize } from './Step2Customize';
import { Step3Result } from './Step3Result';
import { Step4Video } from './Step4Video';

interface ConfiguratorWizardProps {
    basePath?: string;
}

function parseStep(raw: string | null): ConfiguratorStep {
    const n = Number(raw);
    if (n === 2 || n === 3 || n === 4) return n;
    return 1;
}

export function ConfiguratorWizard({
    basePath = ROUTES.CONFIGURATOR.ROOT,
}: ConfiguratorWizardProps): React.JSX.Element {
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentStep = parseStep(searchParams.get('step'));
    const { canProceedToStep2, canGenerate } = useConfigurator();

    const canProceedFromCurrentStep =
        currentStep === 1 ? canProceedToStep2 : currentStep === 2 ? canGenerate : false;

    const handleGenerate = useCallback(() => {
        router.push(`${basePath}?step=3`);
    }, [router, basePath]);

    return (
        <div className="flex h-full min-h-0 flex-col gap-4">
            <StepIndicator currentStep={currentStep} />

            <div
                key={currentStep}
                className={`min-h-0 flex-1 animate-step-in ${currentStep === 3 || currentStep === 4 ? 'overflow-hidden' : 'overflow-y-auto'}`}
            >
                {currentStep === 1 && <Step1FurnitureStyle />}
                {currentStep === 2 && <Step2Customize />}
                {currentStep === 3 && <Step3Result basePath={basePath} />}
                {currentStep === 4 && <Step4Video basePath={basePath} />}
            </div>

            {currentStep !== 3 && currentStep !== 4 && (
                <StepNavigation
                    currentStep={currentStep}
                    canProceed={canProceedFromCurrentStep}
                    basePath={basePath}
                    onGenerate={handleGenerate}
                    isGenerating={false}
                />
            )}
        </div>
    );
}
