'use client';

import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Moon, Sun, List, X } from '@phosphor-icons/react';
import { useTheme } from 'next-themes';
import { useCallback, useState } from 'react';
import { APP_NAME } from '@/lib/constants/app.constants';

export function Header(): React.ReactElement {
    const { isAuthenticated, user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                    {isAuthenticated && (
                        <Link
                            href="/dashboard"
                            className="text-sm text-muted-foreground transition-colors duration-150 hover:text-primary"
                        >
                            My Designs
                        </Link>
                    )}
                    {isAuthenticated ? (
                        <>
                            <Button variant="outline" size="sm" onClick={logout}>
                                Sign Out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/login">Sign In</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/register">Create Account</Link>
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
                                My Designs
                            </Link>
                        )}
                        {isAuthenticated ? (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        logout();
                                    }}
                                >
                                    Sign Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link
                                        href="/login"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link
                                        href="/register"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Create Account
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
