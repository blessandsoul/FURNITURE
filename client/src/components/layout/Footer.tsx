import { getTranslations } from 'next-intl/server';
import { APP_NAME } from '@/lib/constants/app.constants';

export async function Footer(): Promise<React.ReactElement> {
    const tCommon = await getTranslations('Common');

    return (
        <footer className="border-t border-border/50 bg-background py-8">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground md:px-6 lg:px-8">
                <p>
                    &copy; {new Date().getFullYear()} {APP_NAME}. {tCommon('allRightsReserved')}
                </p>
            </div>
        </footer>
    );
}
