import { CircleNotch } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    size?: number;
    className?: string;
}

export function LoadingSpinner({
    size = 24,
    className,
}: LoadingSpinnerProps): React.ReactElement {
    return (
        <CircleNotch
            className={cn('animate-spin text-muted-foreground', className)}
            style={{ width: size, height: size }}
        />
    );
}
