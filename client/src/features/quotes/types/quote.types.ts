export type QuoteStatus = 'PENDING' | 'VIEWED' | 'CONTACTED' | 'COMPLETED' | 'CANCELLED';

export interface Quote {
    id: string;
    userId: string;
    designId: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    message: string | null;
    quotedPrice: number | null;
    currency: string;
    status: QuoteStatus;
    adminNotes: string | null;
    respondedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface QuoteWithDesign extends Quote {
    design: {
        name: string;
        totalPrice: number;
        currency: string;
        imageUrl: string | null;
        thumbnailUrl: string | null;
        status: string;
    };
}

export interface CreateQuoteRequest {
    designId: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    message?: string;
}

