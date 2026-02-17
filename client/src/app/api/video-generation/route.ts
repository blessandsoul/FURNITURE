import { NextResponse } from 'next/server';
import { z } from 'zod';

const RequestSchema = z.object({
    imageUrl: z.string().min(1),
    videoPrompt: z.string().min(10).max(2000),
    styleId: z.string(),
});

// Mock mode — returns a deterministic placeholder video.
// Replace the inner logic with a real video AI API (Runway, Kling, Sora) later.
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

    const { styleId, videoPrompt } = parsed.data;

    // Simulate generation delay (real API would take 10-30s)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock: return one of the two local demo videos, alternating by styleId hash.
    // In production replace with API response URL (Runway, Kling, Sora, etc.)
    const DEMO_VIDEOS = ['/videos/furniture-demo-1.mp4', '/videos/furniture-demo-2.mp4'];
    const videoIndex = styleId.charCodeAt(0) % DEMO_VIDEOS.length;
    const mockVideoUrl = DEMO_VIDEOS[videoIndex]!;

    // Extract motion label from prompt (first 40 chars for display)
    const motionLabel = videoPrompt.slice(0, 40).replace(/[^a-zA-Z0-9 ]/g, '') + '…';

    return NextResponse.json({
        success: true,
        data: {
            videoUrl: mockVideoUrl,
            motionLabel,
        },
    });
}
