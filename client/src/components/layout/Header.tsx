'use client';

import { Link } from '@/i18n/routing';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Moon, Sun, List, X, CurrencyCircleDollar } from '@phosphor-icons/react';
import { useTheme } from 'next-themes';
import { useCallback, useState } from 'react';
import { APP_NAME } from '@/lib/constants/app.constants';
import { ROUTES } from '@/lib/constants/routes';
import LanguageSwitcher from '../LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { useCreditBalance } from '@/features/credits/hooks/useCredits';

function HeaderCreditsBadge(): React.ReactElement {
    const { data: balance, isLoading } = useCreditBalance();

    if (isLoading) {
        return <span className="h-6 w-12 animate-pulse rounded-full bg-muted" />;
    }

    return (
        <Link
            href={ROUTES.CREDITS}
            className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors duration-150 hover:bg-primary/15"
        >
            <CurrencyCircleDollar className="h-3.5 w-3.5" weight="fill" />
            <span className="tabular-nums">{balance?.balance ?? 0}</span>
        </Link>
    );
}

export function Header(): React.ReactElement {
    const { isAuthenticated, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const tAuth = useTranslations('Auth');
    const tNav = useTranslations('Navigation');

    const toggleTheme = useCallback((): void => {
        const next = theme === 'dark' ? 'light' : 'dark';

        if (!document.startViewTransition) {
            setTheme(next);
            return;
        }

        document.startViewTransition(() => setTheme(next));
    }, [theme, setTheme]);

    return (
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
                {/* Logo */}
                <Link
                    href="/"
                    className="text-xl font-bold tracking-tight transition-colors duration-150 hover:text-primary"
                >
                    {APP_NAME}
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-4 md:flex">
                    <LanguageSwitcher />
                    {isAuthenticated && (
                        <Link
                            href={ROUTES.MY_DESIGNS}
                            className="text-sm text-muted-foreground transition-colors duration-150 hover:text-primary"
                        >
                            {tNav('myDesigns')}
                        </Link>
                    )}
                    {isAuthenticated && <HeaderCreditsBadge />}
                    {isAuthenticated ? (
                        <>
                            <div onClick={logout}>
                                <Button variant="outline" size="sm">
                                    {tAuth('signOut')}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/login">{tAuth('loginLink')}</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/register">{tAuth('registerLink')}</Link>
                            </Button>
                        </>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        className="transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                    >
                        <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
                    </Button>
                </nav>

                {/* Mobile Menu Toggle */}
                <div className="flex items-center gap-2 md:hidden">
                    <LanguageSwitcher />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <List className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="border-t border-border/50 bg-background px-4 py-4 md:hidden">
                    <nav className="flex flex-col gap-3">
                        {isAuthenticated && (
                            <Link
                                href={ROUTES.MY_DESIGNS}
                                className="text-sm text-muted-foreground transition-colors duration-150 hover:text-primary"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {tNav('myDesigns')}
                            </Link>
                        )}
                        {isAuthenticated && (
                            <div onClick={() => setIsMobileMenuOpen(false)}>
                                <HeaderCreditsBadge />
                            </div>
                        )}
                        {isAuthenticated ? (
                            <>
                                <div onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    logout();
                                }}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                    >
                                        {tAuth('signOut')}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link
                                        href="/login"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {tAuth('loginLink')}
                                    </Link>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link
                                        href="/register"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {tAuth('registerLink')}
                                    </Link>
                                </Button>
                            </>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
