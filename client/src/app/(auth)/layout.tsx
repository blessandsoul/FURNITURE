export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}): React.ReactElement {
    return (
        <div className="flex min-h-dvh items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">{children}</div>
        </div>
    );
}
