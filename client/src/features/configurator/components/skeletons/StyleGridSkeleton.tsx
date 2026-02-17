import { Skeleton } from '@/components/ui/skeleton';

export function StyleGridSkeleton(): React.JSX.Element {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="flex flex-col items-center gap-3 rounded-xl border border-[--border-crisp] bg-[--surface-enamel] p-5"
                >
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="w-full space-y-1.5 text-center">
                        <Skeleton className="mx-auto h-4 w-20" />
                        <Skeleton className="mx-auto h-3 w-28" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>
            ))}
        </div>
    );
}
