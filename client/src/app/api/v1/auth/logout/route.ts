import { NextResponse } from 'next/server';

// Mock logout — dev only.
export async function POST(): Promise<NextResponse> {
    return NextResponse.json({ success: true, message: 'Logged out successfully', data: null });
}
