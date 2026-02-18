'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
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
import { CircleNotch, Eye, EyeSlash, WarningCircle, Check, X, Phone } from '@phosphor-icons/react';
import { ROUTES } from '@/lib/constants/routes';

const registerSchema = z
    .object({
        firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
        lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
        email: z.string().email('Please enter a valid email address'),
        phone: z
            .string()
            .min(1, 'Phone number is required')
            .regex(/^\+?[0-9]{7,15}$/, 'Please enter a valid phone number'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Must contain at least one number'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

type RegisterFormData = z.infer<typeof registerSchema>;

const card = {
    hidden: { opacity: 0, y: 24 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: 'easeOut' as const, staggerChildren: 0.06 },
    },
};

const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

interface PasswordRequirement {
    met: boolean;
    label: string;
}

function PasswordRequirements({ password }: { password: string }): React.ReactElement | null {
    const requirements: PasswordRequirement[] = useMemo(() => [
        { met: password.length >= 8, label: '8+ characters' },
        { met: /[A-Z]/.test(password), label: 'Uppercase letter' },
        { met: /[a-z]/.test(password), label: 'Lowercase letter' },
        { met: /[0-9]/.test(password), label: 'Number' },
    ], [password]);

    const score = requirements.filter((r) => r.met).length;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'] as const;

    if (password.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2.5 overflow-hidden"
        >
            {/* Strength bar */}
            <div className="space-y-1.5">
                <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                                i <= score
                                    ? score <= 1
                                        ? 'bg-destructive'
                                        : score <= 2
                                          ? 'bg-warning'
                                          : 'bg-success'
                                    : 'bg-border'
                            }`}
                        />
                    ))}
                </div>
                <p className="text-xs text-muted-foreground">
                    Password strength:{' '}
                    <span
                        className={`font-medium ${
                            score <= 1
                                ? 'text-destructive'
                                : score <= 2
                                  ? 'text-warning'
                                  : 'text-success'
                        }`}
                    >
                        {labels[score]}
                    </span>
                </p>
            </div>

            {/* Requirement checklist */}
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
                {requirements.map((req) => (
                    <li key={req.label} className="flex items-center gap-1.5 text-xs">
                        {req.met ? (
                            <Check className="h-3.5 w-3.5 text-success" weight="bold" />
                        ) : (
                            <X className="h-3.5 w-3.5 text-muted-foreground/50" weight="bold" />
                        )}
                        <span
                            className={
                                req.met ? 'text-success' : 'text-muted-foreground'
                            }
                        >
                            {req.label}
                        </span>
                    </li>
                ))}
            </ul>
        </motion.div>
    );
}

export function RegisterForm(): React.ReactElement {
    const { register: registerUser, isRegistering, registerError } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        mode: 'onTouched',
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
        },
    });

    const password = form.watch('password') ?? '';

    const onSubmit = (data: RegisterFormData): void => {
        registerUser({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            password: data.password,
        });
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
                    Create your account
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                    Get started with AtlasFurniture for free
                </p>
            </motion.div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-2">
                    {/* Error banner */}
                    <AnimatePresence>
                        {registerError && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                    <WarningCircle className="mt-0.5 h-4 w-4 shrink-0" weight="fill" />
                                    <span>{getErrorMessage(registerError)}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Name fields */}
                    <motion.div variants={item} className="grid grid-cols-2 gap-3">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">
                                        First name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="John"
                                            autoComplete="given-name"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">
                                        Last name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Doe"
                                            autoComplete="family-name"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </motion.div>

                    {/* Email */}
                    <motion.div variants={item}>
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">
                                        Email address
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

                    {/* Phone */}
                    <motion.div variants={item}>
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">
                                        Phone number
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                type="tel"
                                                placeholder="+995 555 123 456"
                                                autoComplete="tel"
                                                className="pl-9"
                                                {...field}
                                            />
                                        </div>
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
                                <FormItem className="pb-0">
                                    <FormLabel className="text-sm font-medium">
                                        Password
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Create a strong password"
                                                autoComplete="new-password"
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
                                    <AnimatePresence>
                                        <PasswordRequirements password={password} />
                                    </AnimatePresence>
                                </FormItem>
                            )}
                        />
                    </motion.div>

                    {/* Confirm password */}
                    <motion.div variants={item}>
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">
                                        Confirm password
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showConfirm ? 'text' : 'password'}
                                                placeholder="Re-enter your password"
                                                autoComplete="new-password"
                                                className="pr-10"
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm(!showConfirm)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors duration-150 hover:text-foreground"
                                                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                                tabIndex={-1}
                                            >
                                                {showConfirm ? (
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
                            disabled={isRegistering}
                        >
                            {isRegistering ? (
                                <>
                                    <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Create account'
                            )}
                        </Button>
                    </motion.div>
                </form>
            </Form>

            {/* Footer */}
            <motion.p variants={item} className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                    href={ROUTES.LOGIN}
                    className="font-semibold text-primary transition-colors duration-150 hover:text-primary/80"
                >
                    Sign in
                </Link>
            </motion.p>
        </motion.div>
    );
}
