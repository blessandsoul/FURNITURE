'use client';

import { FURNITURE_STYLES } from '../../data/furniture-catalog';
import { useConfigurator } from '../../hooks/useConfigurator';
import { StyleCard } from '../options/StyleCard';

export function Step1FurnitureStyle(): React.JSX.Element {
    const { state, setStyle } = useConfigurator();
    const { style: selectedStyleId } = state.selections;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-foreground">Choose Your Furniture</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Select the type of furniture you&apos;d like to design
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {FURNITURE_STYLES.map((style) => (
                    <StyleCard
                        key={style.id}
                        style={style}
                        isSelected={selectedStyleId === style.id}
                        onSelect={() => setStyle(style.id)}
                    />
                ))}
            </div>

            {!selectedStyleId && (
                <p className="text-center text-xs text-muted-foreground">
                    Select a style to continue to customization
                </p>
            )}
        </div>
    );
}
