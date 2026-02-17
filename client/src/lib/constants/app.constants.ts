export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'AtlasFurniture';

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
} as const;

export const USER_ROLES = {
    USER: 'USER',
    COMPANY: 'COMPANY',
    ADMIN: 'ADMIN',
    GUIDE: 'GUIDE',
    DRIVER: 'DRIVER',
} as const;

export const CONFIGURATOR = {
    DEFAULT_CURRENCY: 'USD',
    DEFAULT_BASE_PRICE: 500,
    MAX_PROMPT_LENGTH: 1000,
} as const;
