import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { TrustBadgesSection } from '@/components/sections/TrustBadgesSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { PresetsSection } from '@/components/sections/PresetsSection';
import { GallerySection } from '@/components/sections/GallerySection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { ReimagineCTASection } from '@/components/sections/ReimagineCTASection';
import { ProcessSection } from '@/components/sections/ProcessSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Metadata');
    return {
        title: t('homeTitle'),
        description: t('homeDescription'),
    };
}

export default function HomePage(): React.JSX.Element {
    return (
        <div className="flex min-h-dvh flex-col">
            <Header />
            <main className="flex-1">
                <HeroSection />
                <TrustBadgesSection />
                <FeaturesSection />
                <PresetsSection />
                <GallerySection />
                <TestimonialsSection />
                <ReimagineCTASection />
                <ProcessSection />
                <FAQSection />
                <HowItWorksSection />
            </main>
            <Footer />
        </div>
    );
}
