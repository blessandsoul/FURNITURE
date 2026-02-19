import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Metadata');
    return {
        title: t('registerTitle'),
    };
}

export default function RegisterPage(): React.ReactElement {
    return <RegisterForm />;
}
