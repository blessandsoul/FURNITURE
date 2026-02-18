'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useTransition, useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LocaleOption {
    code: string;
    label: string;
    shortLabel: string;
    fontClass: string;
    flag: React.ReactNode;
}

/* ──────────────── SVG flag icons ──────────────── */

function GeoFlag() {
    return (
        <svg viewBox="0 0 30 20" className="h-4 w-6 shrink-0 rounded-[3px] shadow-sm" aria-hidden>
            {/* White field */}
            <rect width="30" height="20" fill="#fff" />
            {/* Red cross */}
            <rect x="12" y="0" width="6" height="20" fill="#E8112D" />
            <rect x="0" y="7" width="30" height="6" fill="#E8112D" />
            {/* Four small crosses (bolnur-katskhuri) */}
            {/* Top-left */}
            <rect x="4.5" y="2" width="2" height="4" fill="#E8112D" />
            <rect x="3.5" y="3" width="4" height="2" fill="#E8112D" />
            {/* Top-right */}
            <rect x="23.5" y="2" width="2" height="4" fill="#E8112D" />
            <rect x="22.5" y="3" width="4" height="2" fill="#E8112D" />
            {/* Bottom-left */}
            <rect x="4.5" y="14" width="2" height="4" fill="#E8112D" />
            <rect x="3.5" y="15" width="4" height="2" fill="#E8112D" />
            {/* Bottom-right */}
            <rect x="23.5" y="14" width="2" height="4" fill="#E8112D" />
            <rect x="22.5" y="15" width="4" height="2" fill="#E8112D" />
        </svg>
    );
}

function UkFlag() {
    return (
        <svg viewBox="0 0 30 20" className="h-4 w-6 shrink-0 rounded-[3px] shadow-sm" aria-hidden>
            <rect width="30" height="20" fill="#012169" />
            {/* Diagonals */}
            <path d="M0,0 L30,20 M30,0 L0,20" stroke="#fff" strokeWidth="3" />
            <path d="M0,0 L30,20" stroke="#C8102E" strokeWidth="1.5" />
            <path d="M30,0 L0,20" stroke="#C8102E" strokeWidth="1.5" />
            {/* Cross */}
            <rect x="12" y="0" width="6" height="20" fill="#fff" />
            <rect x="0" y="7" width="30" height="6" fill="#fff" />
            <rect x="13" y="0" width="4" height="20" fill="#C8102E" />
            <rect x="0" y="8" width="30" height="4" fill="#C8102E" />
        </svg>
    );
}

function RuFlag() {
    return (
        <svg viewBox="0 0 30 20" className="h-4 w-6 shrink-0 rounded-[3px] shadow-sm" aria-hidden>
            <rect x="0" y="0" width="30" height="6.67" fill="#fff" />
            <rect x="0" y="6.67" width="30" height="6.67" fill="#0039A6" />
            <rect x="0" y="13.33" width="30" height="6.67" fill="#D52B1E" />
        </svg>
    );
}

/* ──────────────── chevron icon ──────────────── */
function ChevronDown({ open }: { open: boolean }) {
    return (
        <svg
            viewBox="0 0 16 16"
            className={`h-3.5 w-3.5 text-muted-foreground/70 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        >
            <path d="M4 6 l4 4 l4 -4" />
        </svg>
    );
}

/* ──────────────── globe icon ──────────────── */
function GlobeIcon() {
    return (
        <svg viewBox="0 0 20 20" className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="10" cy="10" r="8" />
            <ellipse cx="10" cy="10" rx="4" ry="8" />
            <path d="M2.5 7h15M2.5 13h15" />
        </svg>
    );
}

/* ──────────────── main component ──────────────── */

const locales: LocaleOption[] = [
    {
        code: 'ka',
        label: 'ქართული',
        shortLabel: 'ქარ',
        fontClass: 'font-georgian',
        flag: <GeoFlag />,
    },
    {
        code: 'en',
        label: 'English',
        shortLabel: 'EN',
        fontClass: 'font-display',
        flag: <UkFlag />,
    },
    {
        code: 'ru',
        label: 'Русский',
        shortLabel: 'RU',
        fontClass: 'font-display',
        flag: <RuFlag />,
    },
];

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const current = locales.find((l) => l.code === locale) ?? locales[0];

    const switchLocale = useCallback(
        (code: string) => {
            setOpen(false);
            startTransition(() => {
                router.replace(pathname, { locale: code });
            });
        },
        [pathname, router, startTransition],
    );

    /* close on outside click */
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            {/* Trigger button */}
            <button
                type="button"
                disabled={isPending}
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-2.5 py-1.5 text-sm backdrop-blur-sm transition-all duration-200 hover:bg-accent/50 hover:border-border active:scale-[0.97] disabled:opacity-50"
            >
                <GlobeIcon />
                {current.flag}
                <span className={`hidden text-[13px] font-medium tracking-tight sm:inline ${current.fontClass}`}>
                    {current.shortLabel}
                </span>
                <ChevronDown open={open} />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 top-full z-50 mt-1.5 min-w-[160px] origin-top-right overflow-hidden rounded-xl border border-border/60 bg-background/95 p-1 shadow-lg shadow-black/10 backdrop-blur-xl"
                    >
                        {locales.map((l) => {
                            const isActive = l.code === locale;
                            return (
                                <button
                                    key={l.code}
                                    type="button"
                                    onClick={() => switchLocale(l.code)}
                                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-foreground hover:bg-accent/60'
                                        }`}
                                >
                                    {l.flag}
                                    <span className={`font-medium tracking-tight ${l.fontClass}`}>
                                        {l.label}
                                    </span>
                                    {isActive && (
                                        <svg viewBox="0 0 16 16" className="ml-auto h-4 w-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3.5 8.5 L6.5 11.5 L12.5 4.5" />
                                        </svg>
                                    )}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
