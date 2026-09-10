import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProductCard } from './ProductCard';
import { Product } from '../types/marketplace';

const baseProduct: Product = {
  id: 'p1',
  ownerId: 'owner1',
  categoryId: 'cat1',
  name: 'Saco de Batata Doce',
  description: 'Batata doce fresca directa do produtor.',
  price: '2500',
  unit: 'saco',
  stock: 10,
  weightKg: null,
  origin: null,
  province: 'Huambo',
  municipality: 'Huambo',
  status: 'PUBLISHED',
  isVerified: false,
  averageRating: '0',
  photos: [],
  category: { id: 'cat1', name: 'Alimentos', slug: 'alimentos', parentId: null },
  owner: { id: 'owner1', name: 'Produtor Teste', isVerifiedBadge: false, trustLevel: 'LEVEL_1_CONTACT_VALIDATED' },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function renderCard(product: Product) {
  return render(
    <MemoryRouter>
      <ProductCard product={product} />
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

  it('liga para a página de detalhe do produto', () => {
    renderCard(baseProduct);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/produtos/p1');
  });
});
