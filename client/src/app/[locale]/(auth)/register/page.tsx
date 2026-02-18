import { RegisterForm } from '@/features/auth/components/RegisterForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Create Account',
};

export default function RegisterPage(): React.ReactElement {
    return <RegisterForm />;
}
