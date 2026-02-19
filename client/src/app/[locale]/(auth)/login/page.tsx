import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LoginForm } from '@/features/auth/components/LoginForm';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Metadata');
    return {
        title: t('loginTitle'),
    };
}

export default function LoginPage(): React.ReactElement {
    return <LoginForm />;
}
