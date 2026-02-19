'use client';

import { Link } from '@/i18n/routing';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
    Moon,
    Sun,
    List,
    X,
    CurrencyCircleDollar,
    PencilLine,
    SignOut,
    UserCircle,
} from '@phosphor-icons/react';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { APP_NAME } from '@/lib/constants/app.constants';
import { ROUTES } from '@/lib/constants/routes';
import LanguageSwitcher from '../LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { useCreditBalance } from '@/features/credits/hooks/useCredits';

/* ─── User menu dropdown (authenticated desktop) ─── */

function UserMenu({
    onLogout,
    onToggleTheme,
}: {
    onLogout: () => void;
    onToggleTheme: () => void;
}): React.ReactElement {
    const { data: balance, isLoading: creditsLoading } = useCreditBalance();
    const tAuth = useTranslations('Auth');
    const tNav = useTranslations('Navigation');
    const tCommon = useTranslations('Common');
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent): void => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label="User menu"
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
            >
                <UserCircle className="h-5 w-5" weight={open ? 'fill' : 'regular'} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 top-full z-50 mt-2 w-52 origin-top-right overflow-hidden rounded-xl border border-border/60 bg-background/95 p-1 shadow-lg shadow-black/8 backdrop-blur-xl"
                    >
                        {/* Credits */}
                        <Link
                            href={ROUTES.CREDITS}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors duration-150 hover:bg-accent"
                        >
                            <span className="flex items-center gap-2 text-foreground">
                                <CurrencyCircleDollar className="h-4 w-4 text-primary" weight="fill" />
                                {tNav('credits')}
                            </span>
                            <span className="tabular-nums text-xs font-medium text-muted-foreground">
                                {creditsLoading ? '...' : (balance?.balance ?? 0)}
                            </span>
                        </Link>

                        {/* Language */}
                        <div className="flex items-center justify-between rounded-lg px-3 py-2">
                            <span className="text-sm text-foreground">{tCommon('language')}</span>
                            <LanguageSwitcher />
                        </div>

                        {/* Theme toggle */}
                        <button
                            type="button"
                            onClick={() => {
                                onToggleTheme();
                                setOpen(false);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors duration-150 hover:bg-accent"
                        >
                            <Sun className="h-4 w-4 dark:hidden" />
                            <Moon className="hidden h-4 w-4 dark:block" />
                            {tCommon('toggleTheme')}
                        </button>

                        {/* Divider */}
                        <div className="my-1 h-px bg-border/50" />

                        {/* Sign out */}
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                onLogout();
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
                        >
                            <SignOut className="h-4 w-4" />
                            {tAuth('signOut')}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─── Header ─── */

export function Header(): React.ReactElement {
    const { isAuthenticated, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const tAuth = useTranslations('Auth');
    const tNav = useTranslations('Navigation');
    const tCommon = useTranslations('Common');

    const toggleTheme = useCallback((): void => {
        const next = theme === 'dark' ? 'light' : 'dark';

        if (!document.startViewTransition) {
            setTheme(next);
            return;
        }

        document.startViewTransition(() => setTheme(next));
    }, [theme, setTheme]);

    const closeMobileMenu = useCallback((): void => {
        setIsMobileMenuOpen(false);
    }, []);

    const handleLogout = useCallback((): void => {
        closeMobileMenu();
        logout();
    }, [closeMobileMenu, logout]);

    return (
        <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-14 items-center gap-4 px-4 md:px-6 lg:px-8">
                {/* ── Logo ── */}
                <Link
                    href="/"
                    className="mr-auto text-lg font-semibold tracking-tight transition-colors duration-150 hover:text-primary md:mr-0"
                >
                    {APP_NAME}
                </Link>

                {/* ── Desktop nav ── */}
                <nav className="ml-auto hidden items-center gap-1.5 md:flex">
                    {isAuthenticated && (
                        <Link
                            href={ROUTES.MY_DESIGNS}
                            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
                        >
                            {tNav('myDesigns')}
                        </Link>
                    )}

                    {isAuthenticated && (
                        <Button size="sm" asChild className="gap-1.5 rounded-lg">
                            <Link href={ROUTES.CONFIGURATOR.ROOT}>
                                <PencilLine className="h-3.5 w-3.5" weight="bold" />
                                {tNav('startDesigning')}
                            </Link>
                        </Button>
                    )}

                    {isAuthenticated ? (
                        <UserMenu onLogout={logout} onToggleTheme={toggleTheme} />
                    ) : (
                        <div className="flex items-center gap-1">
                            <LanguageSwitcher />
                            <button
                                type="button"
                                onClick={toggleTheme}
                                aria-label={tCommon('toggleTheme')}
                                className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
                            >
                                <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
                            </button>
                            <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
                                <Link href="/login">{tAuth('loginLink')}</Link>
                            </Button>
                            <Button size="sm" asChild className="rounded-lg">
                                <Link href="/register">{tAuth('registerLink')}</Link>
                            </Button>
                        </div>
                    )}
                </nav>

                {/* ── Mobile controls ── */}
                <div className="flex items-center gap-0.5 md:hidden">
                    <LanguageSwitcher />
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label={tCommon('toggleTheme')}
                        className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-accent"
                    >
                        <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label={tCommon('toggleMenu')}
                        className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-accent"
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <List className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </div>

            {/* ── Mobile menu ── */}
            {isMobileMenuOpen && (
                <div className="border-t border-border/40 bg-background px-4 pb-4 pt-3 md:hidden">
                    <nav className="flex flex-col gap-1">
                        {isAuthenticated && (
                            <Button size="sm" asChild className="mb-2 w-full gap-1.5 rounded-lg">
                                <Link
                                    href={ROUTES.CONFIGURATOR.ROOT}
                                    onClick={closeMobileMenu}
                                >
                                    <PencilLine className="h-3.5 w-3.5" weight="bold" />
                                    {tNav('startDesigning')}
                                </Link>
                            </Button>
                        )}

                        {isAuthenticated && (
                            <Link
                                href={ROUTES.MY_DESIGNS}
                                className="rounded-lg px-3 py-2 text-sm text-foreground transition-colors duration-150 hover:bg-accent"
                                onClick={closeMobileMenu}
                            >
                                {tNav('myDesigns')}
                            </Link>
                        )}

                        {isAuthenticated && (
                            <Link
                                href={ROUTES.CREDITS}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors duration-150 hover:bg-accent"
                                onClick={closeMobileMenu}
                            >
                                <CurrencyCircleDollar className="h-4 w-4 text-primary" weight="fill" />
                                {tNav('credits')}
                            </Link>
                        )}

                        <div className="my-1 h-px bg-border/50" />

                        {isAuthenticated ? (
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
                            >
                                <SignOut className="h-4 w-4" />
                                {tAuth('signOut')}
                            </button>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Button variant="outline" size="sm" asChild className="w-full">
                                    <Link href="/login" onClick={closeMobileMenu}>
                                        {tAuth('loginLink')}
                                    </Link>
                                </Button>
                                <Button size="sm" asChild className="w-full rounded-lg">
                                    <Link href="/register" onClick={closeMobileMenu}>
                                        {tAuth('registerLink')}
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
