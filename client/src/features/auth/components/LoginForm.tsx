'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from '@/i18n/routing';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '@/lib/utils/error';
import { CircleNotch, Eye, EyeSlash, WarningCircle } from '@phosphor-icons/react';
import { ROUTES } from '@/lib/constants/routes';
import { useTranslations } from 'next-intl';

const card = {
    hidden: { opacity: 0, y: 24 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: 'easeOut' as const, staggerChildren: 0.07 },
    },
};

const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export function LoginForm(): React.ReactElement {
    const { login, isLoggingIn, loginError } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const t = useTranslations('Auth');
    const tCommon = useTranslations('Common');

    const loginSchema = z.object({
        email: z.string().email(t('validation.emailInvalid')),
        password: z.string().min(1, t('validation.required')),
    });

    type LoginFormData = z.infer<typeof loginSchema>;

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: 'onTouched',
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = (data: LoginFormData): void => {
        login(data);
    };

    return (
        <motion.div
            variants={card}
            initial="hidden"
            animate="show"
            className="rounded-2xl border border-[--border-crisp] bg-[--surface-enamel] p-8 shadow-[--shadow-enamel] backdrop-blur-md"
        >
            {/* Header */}
            <motion.div variants={item} className="mb-8 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {t('loginTitle')}
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                    Sign in to your account to continue
                </p>
            </motion.div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-2">
                    {/* Error banner */}
                    <AnimatePresence>
                        {loginError && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                    <WarningCircle className="mt-0.5 h-4 w-4 shrink-0" weight="fill" />
                                    <span>{getErrorMessage(loginError)}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Email */}
                    <motion.div variants={item}>
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">
                                        {t('emailLabel')}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="you@example.com"
                                            autoComplete="email"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </motion.div>

                    {/* Password */}
                    <motion.div variants={item}>
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel className="text-sm font-medium">
                                            {t('passwordLabel')}
                                        </FormLabel>
                                        <Link
                                            href={ROUTES.RESET_PASSWORD}
                                            className="text-xs font-medium text-muted-foreground transition-colors duration-150 hover:text-primary"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Enter your password"
                                                autoComplete="current-password"
                                                className="pr-10"
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors duration-150 hover:text-foreground"
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                tabIndex={-1}
                                            >
                                                {showPassword ? (
                                                    <EyeSlash className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </motion.div>

                    {/* Submit */}
                    <motion.div variants={item}>
                        <Button
                            type="submit"
                            className="w-full motion-safe:transition-all motion-safe:duration-200 motion-safe:active:scale-[0.98]"
                            disabled={isLoggingIn}
                        >
                            {isLoggingIn ? (
                                <>
                                    <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                                    {tCommon('loading')}
                                </>
                            ) : (
                                t('submitLogin')
                            )}
                        </Button>
                    </motion.div>
                </form>
            </Form>

            {/* Footer */}
            <motion.p
                variants={item}
                className="mt-6 text-center text-sm text-muted-foreground"
            >
                {t('noAccount')}{' '}
                <Link
                    href={ROUTES.REGISTER}
                    className="font-semibold text-primary transition-colors duration-150 hover:text-primary/80"
                >
                    {t('registerLink')}
                </Link>
            </motion.p>
        </motion.div>
    );
}
