import { NextResponse } from 'next/server';
import { z } from 'zod';

const RequestSchema = z.object({
    roomImage: z.string().min(1),
    roomType: z.enum(['kitchen', 'living-room', 'bedroom', 'bathroom', 'office']),
    transformationMode: z.enum(['complete', 'furniture-only', 'style-colors']),
    roomStyle: z.enum([
        'modern-minimalist', 'scandinavian', 'industrial', 'classic-elegant',
        'japandi', 'mid-century', 'bohemian', 'coastal',
    ]),
});

// Mock mode — returns one of the reference images as the "redesigned" result.
// Replace with a real AI provider (OpenAI image edit, Stability inpainting, etc.)
const MOCK_RESULTS = [
    '/reff/634139780_122124227217009202_2257031063158983096_n.jpg',
    '/reff/635109185_122124227247009202_8162213447485149465_n.jpg',
    '/reff/634200884_122124227223009202_4667183742277906572_n.jpg',
    '/reff/632984332_122124046323009202_7570696712327656579_n.jpg',
];

export async function POST(request: Request): Promise<NextResponse> {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { success: false, error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON' } },
            { status: 400 },
        );
    }

    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: { code: 'VALIDATION_FAILED', message: 'Invalid request parameters' } },
            { status: 422 },
        );
    }

    const { roomStyle } = parsed.data;

    // Simulate AI generation delay (3s)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Pick a "result" based on style hash for variety
    const idx = roomStyle.length % MOCK_RESULTS.length;
    const resultImageUrl = MOCK_RESULTS[idx];

    return NextResponse.json({
        success: true,
        data: {
            resultImageUrl,
            appliedStyle: roomStyle,
        },
    });
}
