export type ReviewTargetType = 'SELLER' | 'PRODUCT' | 'TRANSPORTER' | 'BUYER';

export interface Review {
  id: string;
  authorId: string;
  targetType: ReviewTargetType;
  targetUserId: string | null;
  productId: string | null;
  orderId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  author?: { id: string; name: string };
  product?: { id: string; name: string } | null;
}

export interface CreateReviewPayload {
  orderId: string;
  targetType: ReviewTargetType;
  productId?: string;
  targetUserId?: string;
  rating: number;
  comment?: string;
}

export interface SellerStats {
  totalRevenue: number;
  totalItemsSold: number;
  totalOrders: number;
  publishedProducts: number;
  averageRating: number | null;
  ratingCount: number;
  monthlyRevenue: { month: string; revenue: number }[];
}

export interface TransporterStats {
  totalEarnings: number;
  totalDeliveries: number;
  averageRating: number | null;
  ratingCount: number;
  monthlyEarnings: { month: string; earnings: number }[];
}
