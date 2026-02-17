import { NextResponse } from 'next/server';

// Mock auth — dev only. Replace with real backend when available.
const MOCK_USERS = [
    {
        email: 'admin@admin.com',
        password: 'admin',
        user: {
            id: 'mock-admin-001',
            email: 'admin@atlasfurniture.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN' as const,
            isActive: true,
            emailVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    },
];

export async function POST(request: Request): Promise<NextResponse> {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { success: false, error: { code: 'INVALID_JSON', message: 'Invalid request body' } },
            { status: 400 },
        );
    }

    const { email, password } = body as { email?: string; password?: string };

    const match = MOCK_USERS.find(
        (u) => u.email === email && u.password === password,
    );

    if (!match) {
        return NextResponse.json(
            { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
            { status: 401 },
        );
    }

    return NextResponse.json({
        success: true,
        message: 'Login successful',
        data: {
            user: match.user,
            tokens: {
                accessToken: 'mock-access-token-dev',
                refreshToken: 'mock-refresh-token-dev',
            },
        },
    });
}
