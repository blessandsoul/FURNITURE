'use client';

import { Link } from '@/i18n/routing';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Moon, Sun, List, X } from '@phosphor-icons/react';
import { useTheme } from 'next-themes';
import { useCallback, useState } from 'react';
import { APP_NAME } from '@/lib/constants/app.constants';
import LanguageSwitcher from '../LanguageSwitcher';
import { useTranslations } from 'next-intl';

export function Header(): React.ReactElement {
    const { isAuthenticated, user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const tAuth = useTranslations('Auth');
    const tNav = useTranslations('Navigation');
    const tCommon = useTranslations('Common');

    // Additional translations needed for Header that might not be in the initial JSON
    // I will use placeholders or key fallbacks if they don't exist, but I will update JSONs next.
    // Assuming keys: 'myDesigns', 'signOut' in Navigation or Auth?
    // Let's stick to what I have or add keys. I'll add 'myDesigns' and 'signOut' to Navigation in next step.

    const toggleTheme = useCallback((): void => {
        const next = theme === 'dark' ? 'light' : 'dark';

        if (!document.startViewTransition) {
            setTheme(next);
            return;
        }

        document.startViewTransition(() => setTheme(next));
    }, [theme, setTheme]);

    return (
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl backdrop-saturate-150">
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
                            href="/dashboard"
                            className="text-sm text-muted-foreground transition-colors duration-150 hover:text-primary"
                        >
                            {tNav('myDesigns')}
                        </Link>
                    )}
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
                                href="/dashboard"
                                className="text-sm text-muted-foreground transition-colors duration-150 hover:text-primary"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {tNav('myDesigns')}
                            </Link>
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
