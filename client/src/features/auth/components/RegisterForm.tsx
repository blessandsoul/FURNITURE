'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '@/lib/utils/error';
import { CircleNotch } from '@phosphor-icons/react';

const registerSchema = z
    .object({
        firstName: z
            .string()
            .min(1, 'First name is required')
            .max(50, 'First name is too long'),
        lastName: z
            .string()
            .min(1, 'Last name is required')
            .max(50, 'Last name is too long'),
        email: z.string().email('Please enter a valid email address'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm(): React.ReactElement {
    const { register: registerUser, isRegistering, registerError } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = (data: RegisterFormData): void => {
        registerUser({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
        });
    };

    return (
        <Card className="border-border/50 shadow-sm">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                <CardDescription>Get started with AtlasFurniture</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {registerError && (
                        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                            {getErrorMessage(registerError)}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First name</Label>
                            <Input
                                id="firstName"
                                placeholder="John"
                                autoComplete="given-name"
                                className={errors.firstName ? 'border-destructive' : ''}
                                {...register('firstName')}
                            />
                            {errors.firstName && (
                                <p className="text-sm text-destructive">
                                    {errors.firstName.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last name</Label>
                            <Input
                                id="lastName"
                                placeholder="Doe"
                                autoComplete="family-name"
                                className={errors.lastName ? 'border-destructive' : ''}
                                {...register('lastName')}
                            />
                            {errors.lastName && (
                                <p className="text-sm text-destructive">
                                    {errors.lastName.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            autoComplete="email"
                            className={errors.email ? 'border-destructive' : ''}
                            {...register('email')}
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className={errors.password ? 'border-destructive' : ''}
                            {...register('password')}
                        />
                        {errors.password && (
                            <p className="text-sm text-destructive">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className={errors.confirmPassword ? 'border-destructive' : ''}
                            {...register('confirmPassword')}
                        />
                        {errors.confirmPassword && (
                            <p className="text-sm text-destructive">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
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

                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="font-medium text-primary transition-colors duration-150 hover:text-primary/80"
                        >
                            Sign in
                        </Link>
                    </p>
                </form>
            </CardContent>
        </Card>
    );
}
