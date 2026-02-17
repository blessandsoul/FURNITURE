'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from '@phosphor-icons/react';
import { ROUTES } from '@/lib/constants/routes';
import { useConfigurator } from '../../hooks/useConfigurator';
import { useVideoGeneration } from '../../hooks/useVideoGeneration';
import type { VideoMotion } from '../../types/configurator.types';
import { VideoStylePicker, VIDEO_STYLE_PROMPTS } from '../result/VideoStylePicker';
import type { VideoPromptStyle } from '../result/VideoStylePicker';
import { VideoMotionPicker } from '../result/VideoMotionPicker';
import { GeneratedVideoCard } from '../result/GeneratedVideoCard';

interface Step4VideoProps {
    basePath?: string;
}

export function Step4Video({ basePath = ROUTES.CONFIGURATOR.ROOT }: Step4VideoProps): React.JSX.Element {
    const router = useRouter();
    const { selectedStyle, generatedImageUrls } = useConfigurator();
    const {
        generate: generateVideo,
        data: videoData,
        isPending: isVideoGenerating,
        isError: isVideoError,
        reset: resetVideo,
    } = useVideoGeneration();

    const [selectedMotionId, setSelectedMotionId] = useState<string | null>(null);
    const [videoPromptStyle, setVideoPromptStyle] = useState<VideoPromptStyle>('luxury');

    // No auto-trigger — user clicks a motion card to generate.

    const handleBack = useCallback(() => {
        router.push(`${basePath}?step=3`);
    }, [basePath, router]);

    const handleVideoStyleChange = useCallback(
        (style: VideoPromptStyle) => {
            setVideoPromptStyle(style);
            resetVideo();
            setSelectedMotionId(null);
        },
        [resetVideo],
    );

    const handleMotionSelect = useCallback(
        (motion: VideoMotion) => {
            const firstImage = generatedImageUrls[0];
            if (!firstImage || !selectedStyle) return;
            setSelectedMotionId(motion.id);
            resetVideo();
            const scenePrompt = VIDEO_STYLE_PROMPTS[videoPromptStyle];
            generateVideo({
                imageUrl: firstImage,
                videoPrompt: `${scenePrompt} Motion: ${motion.videoPrompt}`,
                styleId: selectedStyle.id,
            });
        },
        [generatedImageUrls, selectedStyle, videoPromptStyle, generateVideo, resetVideo],
    );

    if (!selectedStyle) {
        return (
            <div className="flex h-full min-h-0 flex-col items-center justify-center gap-4">
                <p className="text-sm text-muted-foreground">Please complete the previous steps first.</p>
                <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Go back
                </button>
            </div>
        );
    }

    const firstImage = generatedImageUrls[0];

    return (
        <div className="flex h-full min-h-0 flex-col gap-4 animate-fade-in">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between">
                <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Design
                </button>
                <h2 className="text-base font-bold text-foreground">
                    Generate <span className="text-primary">Video</span>
                </h2>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Beta
                </span>
            </div>

            {/* Main layout: video preview (left) + controls (right) */}
            <div className="flex min-h-0 flex-1 gap-4">
                {/* Left: video player — fills all height */}
                <div className="animate-scale-in min-h-0 flex-1">
                    {firstImage ? (
                        <GeneratedVideoCard
                            videoUrl={videoData?.videoUrl}
                            isPending={isVideoGenerating}
                            isError={isVideoError}
                            onRetry={() => {
                                const motion = selectedStyle.videoMotions.find(
                                    (m) => m.id === selectedMotionId,
                                );
                                if (motion) handleMotionSelect(motion);
                            }}
                            fullHeight
                        />
                    ) : (
                        <div className="flex h-full min-h-0 items-center justify-center rounded-2xl border border-dashed border-[--border-crisp] text-sm text-muted-foreground">
                            Generate your design first on step 3.
                        </div>
                    )}
                </div>

                {/* Right: scene style + motion picker */}
                <div className="animate-fade-up delay-75 flex w-72 shrink-0 flex-col gap-4 overflow-y-auto xl:w-80">
                    <div className="rounded-xl border border-[--border-crisp] bg-[--surface-enamel] p-4 shadow-[--shadow-enamel]">
                        <VideoStylePicker
                            selected={videoPromptStyle}
                            onSelect={handleVideoStyleChange}
                            disabled={isVideoGenerating}
                        />
                    </div>

                    <div className="rounded-xl border border-[--border-crisp] bg-[--surface-enamel] p-4 shadow-[--shadow-enamel]">
                        <VideoMotionPicker
                            motions={selectedStyle.videoMotions}
                            selectedId={selectedMotionId}
                            onSelect={handleMotionSelect}
                            isGenerating={isVideoGenerating}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
