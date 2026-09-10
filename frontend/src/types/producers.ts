export interface ProducerProfile {
  id: string;
  userId: string;
  productionLocation: string | null;
  businessName: string | null;
  productCategories: string[];
  productsProduced: string[];
  productionCapacity: string | null;
  productionUnit: string | null;
  referencePrice: string | null;
  availability: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertProducerPayload {
  productionLocation?: string;
  businessName?: string;
  productCategories?: string[];
  productsProduced?: string[];
  productionCapacity?: string;
  productionUnit?: string;
  referencePrice?: string;
  availability?: string;
  description?: string;
}
