import { NextResponse } from 'next/server';
import { z } from 'zod';

const RequestSchema = z.object({
    prompt: z.string().min(10).max(1000),
    styleId: z.string().optional(),
});

// Mock mode — returns real reference photos from /public/reff/.
// Replace this block with a real provider call (OpenAI DALL-E 3, Imagen, etc.)
// when OPENAI_API_KEY or similar is set in .env.
const REFERENCE_IMAGES = [
    '/reff/632529936_122124046197009202_6151187646267614629_n.jpg',
    '/reff/632694225_122124046191009202_8475620067830154298_n.jpg',
    '/reff/632984332_122124046323009202_7570696712327656579_n.jpg',
    '/reff/633074989_122124046215009202_9078710464073292071_n.jpg',
    '/reff/634128879_122124046245009202_8399459512307012707_n.jpg',
    '/reff/634139780_122124227217009202_2257031063158983096_n.jpg',
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

    const { prompt } = parsed.data;

    // Simulate AI generation delay (2.5s). Remove when using a real provider.
    await new Promise((resolve) => setTimeout(resolve, 2500));

    return NextResponse.json({
        success: true,
        data: {
            imageUrls: REFERENCE_IMAGES,
            revisedPrompt: prompt,
        },
    });
}
