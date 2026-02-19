'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/lib/constants/routes';
import { useCategoryBySlug } from '@/features/catalog/hooks/useCatalog';
import { useConfigurator } from '../../hooks/useConfigurator';
import type { ConfiguratorMode, ConfiguratorStep } from '../../types/configurator.types';
import { StepIndicator } from './StepIndicator';
import { StepNavigation } from './StepNavigation';
import { Step1ModeSelect } from './Step1ModeSelect';
import { Step1CategorySelect } from './Step1CategorySelect';
import { Step1RoomUpload } from './Step1RoomUpload';
import { Step2Customize } from './Step2Customize';
import { Step2RoomCustomize } from './Step2RoomCustomize';
import { Step3Result } from './Step3Result';

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
    const t = useTranslations('Configurator');
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
    } = useConfigurator();

    const { data: category } = useCategoryBySlug(state.selectedCategorySlug);

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
            ? canGenerate(category)
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
        { number: 1 as ConfiguratorStep, label: t('stepIndicator.uploadRoom') },
        { number: 2 as ConfiguratorStep, label: t('stepIndicator.configurePlace') },
        { number: 3 as ConfiguratorStep, label: t('stepIndicator.result') },
    ];

    const scratchSteps = [
        { number: 1 as ConfiguratorStep, label: t('stepIndicator.chooseStyle') },
        { number: 2 as ConfiguratorStep, label: t('stepIndicator.customize') },
        { number: 3 as ConfiguratorStep, label: t('stepIndicator.yourDesign') },
        { number: 4 as ConfiguratorStep, label: t('stepIndicator.video') },
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
            if (currentStep === 1) return <Step1RoomUpload />;
            if (currentStep === 2) return <Step2RoomCustomize />;
            if (currentStep === 3) return <Step3Result basePath={basePath} />;
        }

        if (isScratch) {
            if (currentStep === 1) return <Step1CategorySelect />;
            if (currentStep === 2) return <Step2Customize />;
            if (currentStep === 3) return <Step3Result basePath={basePath} />;
            if (currentStep === 4) {
                // Video step: "Coming Soon" placeholder
                return (
                    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-4">
                        <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                            {t('stepIndicator.comingSoon')}
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{t('stepIndicator.videoGeneration')}</h3>
                        <p className="max-w-sm text-center text-sm text-muted-foreground">
                            {t('stepIndicator.videoDescription')}
                        </p>
                    </div>
                );
            }
        }

        return <Step1CategorySelect />;
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
