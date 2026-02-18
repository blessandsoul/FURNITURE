'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { ROUTES } from '@/lib/constants/routes';
import { useConfigurator } from '../../hooks/useConfigurator';
import type { ConfiguratorMode, ConfiguratorStep } from '../../types/configurator.types';
import { StepIndicator } from './StepIndicator';
import { StepNavigation } from './StepNavigation';
import { Step1ModeSelect } from './Step1ModeSelect';
import { Step1FurnitureStyle } from './Step1FurnitureStyle';
import { Step1RoomUpload } from './Step1RoomUpload';
import { Step2Customize } from './Step2Customize';
import { Step2RoomTransform } from './Step2RoomTransform';
import { Step3Result } from './Step3Result';
import { Step3RoomResult } from './Step3RoomResult';
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

    const urlMode = searchParams.get('mode') as ConfiguratorMode | null;
    const hasMode = urlMode === 'scratch' || urlMode === 'reimagine';
    const currentStep = parseStep(searchParams.get('step'));

    const {
        state,
        canProceedToStep2,
        canGenerate,
        canProceedFromRoomUpload,
        canGenerateRedesign,
        setMode,
        setRoomImage,
        removeRoomImage,
        setRoomType,
        setTransformationMode,
        setRoomStyle,
    } = useConfigurator();

    const isReimagine = urlMode === 'reimagine';
    const isScratch = urlMode === 'scratch';

    // ─── Mode selection ───────────────────────────────────────────
    const handleModeSelect = useCallback(
        (mode: ConfiguratorMode) => {
            setMode(mode);
            router.push(`${basePath}?step=1&mode=${mode}`);
        },
        [setMode, router, basePath],
    );

    // ─── Can proceed from current step ───────────────────────────
    const canProceedFromCurrentStep = isReimagine
        ? currentStep === 1
            ? canProceedFromRoomUpload
            : currentStep === 2
              ? canGenerateRedesign
              : false
        : currentStep === 1
          ? canProceedToStep2
          : currentStep === 2
            ? canGenerate
            : false;

    // ─── Navigation handlers ──────────────────────────────────────
    const handleGenerate = useCallback(() => {
        router.push(`${basePath}?step=3&mode=${urlMode}`);
    }, [router, basePath, urlMode]);

    const handleNext = useCallback(() => {
        router.push(`${basePath}?step=${currentStep + 1}&mode=${urlMode}`);
    }, [router, basePath, currentStep, urlMode]);

    const handleBack = useCallback(() => {
        if (currentStep === 1) {
            // Back to mode select
            router.push(basePath);
            return;
        }
        router.push(`${basePath}?step=${currentStep - 1}&mode=${urlMode}`);
    }, [router, basePath, currentStep, urlMode]);

    // ─── Step labels ──────────────────────────────────────────────
    const reimagineSteps = [
        { number: 1 as ConfiguratorStep, label: 'Upload Room' },
        { number: 2 as ConfiguratorStep, label: 'Transform' },
        { number: 3 as ConfiguratorStep, label: 'Result' },
    ];

    const scratchSteps = [
        { number: 1 as ConfiguratorStep, label: 'Choose Style' },
        { number: 2 as ConfiguratorStep, label: 'Customize' },
        { number: 3 as ConfiguratorStep, label: 'Your Design' },
        { number: 4 as ConfiguratorStep, label: 'Video' },
    ];

    // ─── Mode selection screen (no mode in URL yet) ───────────────
    if (!hasMode) {
        return (
            <div className="flex h-full min-h-0 flex-col items-center justify-center">
                <Step1ModeSelect
                    selectedMode={null}
                    onSelectMode={handleModeSelect}
                />
            </div>
        );
    }

    // ─── Render step content ──────────────────────────────────────
    function renderStepContent(): React.JSX.Element {
        if (isReimagine) {
            if (currentStep === 1) {
                return (
                    <Step1RoomUpload
                        roomImageUrl={state.roomRedesign.roomImageUrl}
                        selectedRoomType={state.roomRedesign.roomType}
                        onUploadImage={setRoomImage}
                        onRemoveImage={removeRoomImage}
                        onSelectRoomType={setRoomType}
                    />
                );
            }
            if (currentStep === 2) {
                return (
                    <Step2RoomTransform
                        roomImageUrl={state.roomRedesign.roomImageUrl}
                        selectedMode={state.roomRedesign.transformationMode}
                        selectedStyle={state.roomRedesign.roomStyle}
                        onSelectMode={setTransformationMode}
                        onSelectStyle={setRoomStyle}
                        basePath={basePath}
                    />
                );
            }
            if (currentStep === 3) {
                return <Step3RoomResult basePath={basePath} />;
            }
        }

        if (isScratch) {
            if (currentStep === 1) return <Step1FurnitureStyle />;
            if (currentStep === 2) return <Step2Customize />;
            if (currentStep === 3) return <Step3Result basePath={basePath} />;
            if (currentStep === 4) return <Step4Video basePath={basePath} />;
        }

        return <Step1FurnitureStyle />;
    }

    const hideNav =
        (isReimagine && currentStep === 3) ||
        (isScratch && (currentStep === 3 || currentStep === 4));

    const activeSteps = isReimagine ? reimagineSteps : scratchSteps;
    const maxSteps = isReimagine ? 3 : 4;

    return (
        <div className="flex h-full min-h-0 flex-col gap-4">
            <StepIndicator
                currentStep={currentStep}
                steps={activeSteps}
            />

            <div
                key={`${urlMode}-${currentStep}`}
                className={`min-h-0 flex-1 animate-step-in ${currentStep === 3 || currentStep === 4 ? 'overflow-hidden' : 'overflow-y-auto'}`}
            >
                {renderStepContent()}
            </div>

            {!hideNav && (
                <StepNavigation
                    currentStep={currentStep}
                    canProceed={canProceedFromCurrentStep}
                    basePath={basePath}
                    onGenerate={handleGenerate}
                    isGenerating={false}
                    isReimagine={isReimagine}
                    onNext={handleNext}
                    onBack={handleBack}
                    maxSteps={maxSteps}
                />
            )}
        </div>
    );
}
