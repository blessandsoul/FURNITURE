import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();

        // Log the quote request (replace with email/CRM integration later)
        console.log('[Quote Request]', JSON.stringify(body, null, 2));

        return NextResponse.json(
            {
                success: true,
                message: 'Quote request received. We will contact you shortly.',
            },
            { status: 200 },
        );
    } catch {
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INVALID_REQUEST', message: 'Invalid request body' },
            },
            { status: 400 },
        );
    }
}
