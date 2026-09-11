export interface Banner {
  id: string;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaTo: string | null;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; name: string } | null;
}

export interface CreateBannerInput {
  imageUrl: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaTo?: string;
  position?: number;
  isActive?: boolean;
}

export type UpdateBannerInput = Partial<CreateBannerInput>;
