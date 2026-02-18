import { CheckFat } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils';
import type { ConfiguratorStep } from '../../types/configurator.types';

const DEFAULT_STEPS = [
    { number: 1 as ConfiguratorStep, label: 'Choose Style' },
    { number: 2 as ConfiguratorStep, label: 'Customize' },
    { number: 3 as ConfiguratorStep, label: 'Your Design' },
    { number: 4 as ConfiguratorStep, label: 'Video' },
];

interface StepIndicatorProps {
    currentStep: ConfiguratorStep;
    steps?: { number: ConfiguratorStep; label: string }[];
}

export function StepIndicator({ currentStep, steps = DEFAULT_STEPS }: StepIndicatorProps): React.JSX.Element {
    return (
        <nav aria-label="Configuration steps" className="flex items-center justify-center gap-0">
            {steps.map((step, index) => {
                const isCompleted = currentStep > step.number;
                const isCurrent = currentStep === step.number;
                const isUpcoming = currentStep < step.number;

                return (
                    <div key={step.number} className="flex items-center">
                        <div className="flex flex-col items-center gap-1.5">
                            <div
                                className={cn(
                                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300',
                                    isCompleted && 'border-primary bg-primary text-primary-foreground',
                                    isCurrent && 'border-primary bg-primary/10 text-primary',
                                    isUpcoming && 'border-border bg-background text-muted-foreground',
                                )}
                                aria-current={isCurrent ? 'step' : undefined}
                            >
                                {isCompleted ? (
                                    <CheckFat className="h-4 w-4" weight="fill" />
                                ) : (
                                    step.number
                                )}
                            </div>
                            <span
                                className={cn(
                                    'hidden text-xs font-medium sm:block',
                                    isCurrent && 'text-primary',
                                    (isCompleted || isUpcoming) && 'text-muted-foreground',
                                )}
                            >
                                {step.label}
                            </span>
                        </div>

                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    'mx-2 mb-5 h-0.5 w-12 transition-all duration-500 sm:w-20',
                                    currentStep > step.number ? 'bg-primary' : 'bg-border',
                                )}
                                aria-hidden="true"
                            />
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
