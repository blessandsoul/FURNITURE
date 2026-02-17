import type { ConfiguratorSelections, FurnitureStyleId, OptionCategory } from '../types/configurator.types';
import { getStyleById, getOptionById } from '../data/furniture-catalog';

const OPTION_CATEGORIES: OptionCategory[] = ['color', 'material', 'leg_style', 'size', 'upholstery'];

/**
 * Encodes configurator selections into URL search params.
 * Only includes non-null values to keep the URL short.
 */
export function encodeDesignToParams(selections: ConfiguratorSelections): URLSearchParams {
    const params = new URLSearchParams();

    if (selections.style) {
        params.set('style', selections.style);
    }

    for (const category of OPTION_CATEGORIES) {
        const optionId = selections.options[category];
        if (optionId) {
            params.set(category, optionId);
        }
    }

    return params;
}

/**
 * Decodes URL search params into configurator selections.
 * Validates every ID against the catalog — returns null if style is invalid.
 */
export function decodeDesignFromParams(params: URLSearchParams): ConfiguratorSelections | null {
    const styleParam = params.get('style');
    if (!styleParam) return null;

    const styleId = styleParam as FurnitureStyleId;
    const style = getStyleById(styleId);
    if (!style) return null;

    const options: Record<OptionCategory, string | null> = {
        color: null,
        material: null,
        leg_style: null,
        size: null,
        upholstery: null,
    };

    for (const category of OPTION_CATEGORIES) {
        const optionId = params.get(category);
        if (optionId) {
            // Validate that this option actually exists for this style
            const option = getOptionById(styleId, optionId);
            if (option) {
                options[category] = optionId;
            }
        }
    }

    return { style: styleId, options };
}

/**
 * Checks whether URL params contain design data (has a valid `style` param).
 */
export function hasDesignInParams(params: URLSearchParams): boolean {
    const styleParam = params.get('style');
    if (!styleParam) return false;
    return getStyleById(styleParam as FurnitureStyleId) !== undefined;
}
