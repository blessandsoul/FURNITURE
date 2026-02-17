import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { PresetsSection } from '@/components/sections/PresetsSection';

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
                <FeaturesSection />
                <PresetsSection />
                <HowItWorksSection />
            </main>
            <Footer />
        </div>
    );
}
