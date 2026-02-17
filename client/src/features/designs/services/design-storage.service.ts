import type { SavedDesign } from '../types/design.types';

const STORAGE_KEY = 'atlas_saved_designs';
const MAX_DESIGNS = 20;

function isClient(): boolean {
    return typeof window !== 'undefined';
}

export function getSavedDesigns(): SavedDesign[] {
    if (!isClient()) return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as SavedDesign[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function saveDesign(design: SavedDesign): void {
    if (!isClient()) return;
    const designs = getSavedDesigns();

    // Prevent duplicates by ID
    const existing = designs.findIndex((d) => d.id === design.id);
    if (existing !== -1) {
        designs[existing] = design;
    } else {
        designs.unshift(design);
    }

    // Enforce max limit
    const trimmed = designs.slice(0, MAX_DESIGNS);

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
        // localStorage might be full
    }
}

export function deleteDesign(id: string): void {
    if (!isClient()) return;
    const designs = getSavedDesigns().filter((d) => d.id !== id);
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
    } catch {
        // localStorage might be full
    }
}

export function getDesignById(id: string): SavedDesign | undefined {
    return getSavedDesigns().find((d) => d.id === id);
}
