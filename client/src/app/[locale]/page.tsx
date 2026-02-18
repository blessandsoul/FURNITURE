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

export const metadata = {
    title: 'Atlas Furniture — Design Your Furniture with AI',
    description:
        'Pick a style, customize colors and materials, and get a photorealistic AI preview with instant pricing. Design your dream furniture in minutes.',
};

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
