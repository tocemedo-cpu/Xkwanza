import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProductCard } from './ProductCard';
import { Product } from '../types/marketplace';

const baseProduct: Product = {
  id: 'p1',
  ownerId: 'owner1',
  categoryId: 'cat1',
  listingType: 'PRODUCT',
  name: 'Saco de Batata Doce',
  description: 'Batata doce fresca directa do produtor.',
  price: '2500',
  isEstimatedPrice: false,
  unit: 'saco',
  stock: 10,
  weightKg: null,
  origin: null,
  province: 'Huambo',
  municipality: 'Huambo',
  deliveryOption: 'BUYER_PICKUP',
  serviceArea: null,
  availability: null,
  contact: null,
  status: 'PUBLISHED',
  isVerified: false,
  averageRating: '0',
  photos: [],
  category: { id: 'cat1', name: 'Alimentos', slug: 'alimentos', parentId: null },
  owner: { id: 'owner1', name: 'Produtor Teste', isVerifiedBadge: false, trustLevel: 'LEVEL_1_CONTACT_VALIDATED' },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function renderCard(product: Product, linkTo = '/comprador/produtos/p1') {
  return render(
    <MemoryRouter>
      <ProductCard product={product} linkTo={linkTo} />
    </MemoryRouter>,
  );
}

describe('ProductCard', () => {
  it('mostra o nome, localização e preço formatado do produto', () => {
    renderCard(baseProduct);
    expect(screen.getByText('Saco de Batata Doce')).toBeInTheDocument();
    expect(screen.getByText('Huambo, Huambo')).toBeInTheDocument();
    expect(screen.getByText(/2[\s.]500,00\s*Kz/)).toBeInTheDocument();
    expect(screen.getByText('/saco')).toBeInTheDocument();
  });

  it('mostra "Sem foto" quando o produto não tem fotografias', () => {
    renderCard(baseProduct);
    expect(screen.getByText('Sem foto')).toBeInTheDocument();
  });

  it('mostra a imagem em vez do placeholder quando há uma fotografia', () => {
    renderCard({
      ...baseProduct,
      photos: [{ id: 'photo1', productId: 'p1', url: 'https://example.com/foto.jpg', uploadedComplete: true }],
    });
    expect(screen.queryByText('Sem foto')).not.toBeInTheDocument();
    const img = screen.getByRole('img', { name: 'Saco de Batata Doce' });
    expect(img).toHaveAttribute('src', 'https://example.com/foto.jpg');
  });

  it('liga para a página de detalhe do produto, no prefixo passado', () => {
    renderCard(baseProduct, '/produtor/produtos/p1');
    expect(screen.getByRole('link')).toHaveAttribute('href', '/produtor/produtos/p1');
  });

  it('mostra a área de atendimento em vez da localização para um serviço, sem sufixo de unidade', () => {
    renderCard({
      ...baseProduct,
      listingType: 'SERVICE',
      name: 'Reparação de electrodomésticos',
      unit: null,
      stock: null,
      province: null,
      municipality: null,
      deliveryOption: null,
      serviceArea: 'Luanda, Belas, Viana',
      availability: 'Segunda a sábado',
      contact: '+244923000000',
      isEstimatedPrice: true,
    });
    expect(screen.getByText('Serviço')).toBeInTheDocument();
    expect(screen.getByText('Luanda, Belas, Viana')).toBeInTheDocument();
    expect(screen.getByText('A partir de')).toBeInTheDocument();
    expect(screen.queryByText('/saco')).not.toBeInTheDocument();
  });
});
