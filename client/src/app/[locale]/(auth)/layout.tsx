'use client';

import Link from 'next/link';
import { Armchair } from '@phosphor-icons/react';
import { motion, MotionConfig } from 'motion/react';
import { APP_NAME } from '@/lib/constants/app.constants';
import { useTranslations } from 'next-intl';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}): React.ReactElement {
    const t = useTranslations('Auth');
    return (
        <MotionConfig reducedMotion="user">
            <div className="flex min-h-dvh">
                {/* ── Branding panel (desktop only) ────────────────── */}
                <motion.div
                    initial={{ x: -60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground md:flex md:w-[42%] lg:w-[38%]"
                >
                    {/* Decorative gradients */}
                    <motion.div
                        aria-hidden="true"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 1.2 }}
                        className="pointer-events-none absolute inset-0"
                        style={{
                            backgroundImage: `
                                radial-gradient(ellipse 70% 50% at 20% 90%, oklch(0.546 0.245 262.881 / 0.10) 0%, transparent 70%),
                                radial-gradient(ellipse 50% 40% at 80% 10%, oklch(0.705 0.213 47.604 / 0.07) 0%, transparent 60%)
                            `,
                        }}
                    />

                    {/* Large faded furniture icon — decorative */}
                    <motion.div
                        aria-hidden="true"
                        initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ delay: 0.8, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="pointer-events-none absolute -bottom-6 -right-6"
                    >
                        <Armchair
                            weight="thin"
                            className="h-56 w-56 text-primary-foreground/[0.04]"
                        />
                    </motion.div>

                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <Link
                            href="/"
                            className="relative z-10 flex items-center gap-2.5 transition-opacity duration-150 hover:opacity-80"
                        >
                            <Armchair className="h-6 w-6" weight="duotone" />
                            <span className="text-lg font-bold tracking-tight">
                                {APP_NAME}
                            </span>
                        </Link>
                    </motion.div>

                    {/* Tagline */}
                    <div className="relative z-10 space-y-4">
                        <motion.h2
                            initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            className="max-w-xs text-balance text-2xl font-bold leading-tight lg:text-3xl"
                        >
                            {t('layout.tagline')}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.6, ease: 'easeOut' as const }}
                            className="max-w-xs text-sm leading-relaxed text-primary-foreground/60"
                        >
                            {t('layout.body')}
                        </motion.p>
                    </div>

                    {/* Copyright */}
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9, duration: 0.5 }}
                        className="relative z-10 text-xs text-primary-foreground/40"
                    >
                        &copy; {new Date().getFullYear()} {APP_NAME}
                    </motion.p>
                </motion.div>

                {/* ── Form panel ───────────────────────────────────── */}
                <div className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-10 sm:px-8">
                    {/* Mobile logo */}
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="md:hidden"
                    >
                        <Link href="/" className="mb-10 flex items-center gap-2">
                            <Armchair
                                className="h-6 w-6 text-primary"
                                weight="duotone"
                            />
                            <span className="text-lg font-bold tracking-tight text-foreground">
                                {APP_NAME}
                            </span>
                        </Link>
                    </motion.div>

                    <div className="w-full max-w-md">{children}</div>
                </div>
            </div>
        </MotionConfig>
    );
}
