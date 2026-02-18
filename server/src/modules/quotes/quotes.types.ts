import type { QuoteStatus } from '@prisma/client';

export interface PublicQuote {
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

export interface PublicQuoteWithDesign extends PublicQuote {
  design: {
    name: string;
    totalPrice: number;
    currency: string;
    imageUrl: string | null;
    thumbnailUrl: string | null;
    status: string;
  };
}

export interface AdminQuoteWithUser extends PublicQuoteWithDesign {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}
