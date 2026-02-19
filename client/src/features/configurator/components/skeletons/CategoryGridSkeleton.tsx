'use client';

export function CategoryGridSkeleton(): React.JSX.Element {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="flex animate-pulse flex-col items-center gap-3 rounded-xl border border-border/50 p-5"
                    style={{ animationDelay: `${i * 60}ms` }}
                >
                    <div className="h-12 w-12 rounded-lg bg-muted" />
                    <div className="flex w-full flex-col items-center gap-1.5">
                        <div className="h-4 w-20 rounded bg-muted" />
                        <div className="h-3 w-28 rounded bg-muted" />
                    </div>
                    <div className="h-5 w-16 rounded-full bg-muted" />
                </div>
            ))}
        </div>
    );
}
