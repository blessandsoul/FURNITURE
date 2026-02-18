import type { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';

export default function ConfiguratorLayout({ children }: { children: ReactNode }): React.JSX.Element {
    return (
        <div className="flex h-dvh flex-col overflow-hidden">
            <Header />
            {children}
        </div>
    );
}
