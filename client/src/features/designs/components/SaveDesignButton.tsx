'use client';

import { Heart } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useConfigurator } from '@/features/configurator/hooks/useConfigurator';
import { usePriceCalculator } from '@/features/configurator/hooks/usePriceCalculator';
import { saveDesign } from '../services/design-storage.service';
import type { SavedDesign } from '../types/design.types';

interface SaveDesignButtonProps {
    imageUrl: string | undefined;
}

export function SaveDesignButton({ imageUrl }: SaveDesignButtonProps): React.JSX.Element {
    const { selectedStyle, selectedOptions, state } = useConfigurator();
    const breakdown = usePriceCalculator();
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = useCallback(() => {
        if (!selectedStyle) return;

        const optionLabels: Record<string, string | null> = {
            color: null,
            material: null,
            leg_style: null,
            size: null,
            upholstery: null,
        };

        for (const opt of selectedOptions) {
            optionLabels[opt.category] = opt.label;
        }

        const design: SavedDesign = {
            id: crypto.randomUUID(),
            name: `${selectedOptions.find((o) => o.category === 'color')?.label ?? ''} ${selectedOptions.find((o) => o.category === 'material')?.label ?? ''} ${selectedStyle.label}`.trim(),
            styleId: selectedStyle.id,
            styleLabel: selectedStyle.label,
            options: { ...state.selections.options },
            optionLabels: optionLabels as SavedDesign['optionLabels'],
            totalPrice: breakdown.total,
            imageUrl,
            createdAt: new Date().toISOString(),
        };

        saveDesign(design);
        setIsSaved(true);
        toast.success('Design saved! View it in your dashboard.');
    }, [selectedStyle, selectedOptions, state.selections.options, breakdown.total, imageUrl]);

    return (
        <Button
            variant="outline"
            onClick={handleSave}
            disabled={!selectedStyle || isSaved}
            className="w-full justify-start gap-2"
        >
            <Heart
                className="h-4 w-4"
                weight={isSaved ? 'fill' : 'regular'}
            />
            {isSaved ? 'Design Saved' : 'Save Design'}
        </Button>
    );
}
