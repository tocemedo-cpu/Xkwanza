export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

export interface ProductPhoto {
  id: string;
  productId: string;
  url: string;
  uploadedComplete: boolean;
}

export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED' | 'OUT_OF_STOCK' | 'REMOVED';

export type ListingType = 'PRODUCT' | 'SERVICE';

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  PRODUCT: 'Produto',
  SERVICE: 'Serviço',
};

export type DeliveryOption = 'SELLER_DELIVERS' | 'BUYER_PICKUP' | 'XKWANZA_TRANSPORT';

export const DELIVERY_OPTION_LABELS: Record<DeliveryOption, string> = {
  SELLER_DELIVERS: 'O vendedor entrega',
  BUYER_PICKUP: 'O comprador levanta',
  XKWANZA_TRANSPORT: 'Usa um transportador XKWANZA',
};

export interface ProductOwner {
  id: string;
  name: string;
  isVerifiedBadge: boolean;
  trustLevel: string;
}

export interface Product {
  id: string;
  ownerId: string;
  categoryId: string;
  listingType: ListingType;
  name: string;
  description: string;
  price: string;
  isEstimatedPrice: boolean;
  // Produto
  unit: string | null;
  stock: number | null;
  weightKg: string | null;
  origin: string | null;
  province: string | null;
  municipality: string | null;
  deliveryOption: DeliveryOption | null;
  // Serviço
  serviceArea: string | null;
  availability: string | null;
  contact: string | null;
  status: ProductStatus;
  isVerified: boolean;
  averageRating: string;
  photos: ProductPhoto[];
  category: Category;
  owner: ProductOwner;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  listingType?: ListingType;
  province?: string;
  municipality?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
}

interface CreateListingBaseFields {
  categoryId: string;
  name: string;
  description: string;
  price: number;
  isEstimatedPrice?: boolean;
}

export interface CreateProductListingPayload extends CreateListingBaseFields {
  listingType: 'PRODUCT';
  unit: string;
  stock: number;
  weightKg?: number;
  origin?: string;
  province: string;
  municipality: string;
  deliveryOption: DeliveryOption;
}

export interface CreateServiceListingPayload extends CreateListingBaseFields {
  listingType: 'SERVICE';
  serviceArea: string;
  availability: string;
  contact: string;
}

export type CreateProductPayload = CreateProductListingPayload | CreateServiceListingPayload;

export type UpdateProductPayload = Partial<
  CreateListingBaseFields & {
    unit: string;
    stock: number;
    weightKg: number;
    origin: string;
    province: string;
    municipality: string;
    deliveryOption: DeliveryOption;
    serviceArea: string;
    availability: string;
    contact: string;
  }
>;

export interface Address {
  id: string;
  userId: string;
  label: string | null;
  province: string;
  municipality: string;
  locality: string | null;
  reference: string | null;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateAddressPayload {
  label?: string;
  province: string;
  municipality: string;
  locality?: string;
  reference?: string;
  isDefault?: boolean;
}

export type OrderStatus =
  | 'CREATED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  CREATED: 'Criado',
  CONFIRMED: 'Confirmado',
  PREPARING: 'Em preparação',
  READY_FOR_PICKUP: 'Pronto para recolha',
  PICKED_UP: 'Recolhido',
  IN_TRANSIT: 'Em trânsito',
  DELIVERED: 'Entregue',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  product: Product;
}

export interface OrderStatusEvent {
  id: string;
  orderId: string;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyer?: { id: string; name: string; phone: string | null; email: string | null };
  shippingAddressId: string;
  status: OrderStatus;
  subtotal: string;
  transportCost: string;
  total: string;
  items: OrderItem[];
  shippingAddress: Address;
  statusHistory: OrderStatusEvent[];
  transportOrder: { id: string; status: string } | null;
  payment: import('./payments').Payment | null;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutPayload {
  shippingAddressId: string;
  paymentMethod: import('./payments').PaymentMethod;
  items: { productId: string; quantity: number }[];
}
