interface Translatable {
    translations: Record<string, Record<string, string>> | null;
}

/**
 * Returns the translated value of a field for the given locale,
 * falling back to the English base field value.
 */
export function getTranslatedField<T extends Translatable>(
    item: T,
    field: string,
    locale: string,
): string {
    if (locale !== 'en' && item.translations?.[locale]?.[field]) {
        return item.translations[locale][field];
    }
    return String((item as Record<string, unknown>)[field] ?? '');
}
