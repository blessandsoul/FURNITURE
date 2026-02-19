export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    VERIFY_EMAIL: '/verify-email',
    RESET_PASSWORD: '/reset-password',
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    CONFIGURATOR: {
        ROOT: '/configurator',
        RESULT: '/configurator/result',
    },
    MY_DESIGNS: '/my-designs',
    DESIGN_DETAIL: (id: string) => `/my-designs/${id}`,
    CREDITS: '/credits',
    MY_QUOTES: '/my-quotes',
    QUOTE_DETAIL: (id: string) => `/my-quotes/${id}`,
} as const;
