import type { ReactNode } from 'react';
import { ConfiguratorProvider } from '@/features/configurator/store/configuratorContext';

export default function ConfiguratorInnerLayout({ children }: { children: ReactNode }): React.JSX.Element {
    return <ConfiguratorProvider>{children}</ConfiguratorProvider>;
}
