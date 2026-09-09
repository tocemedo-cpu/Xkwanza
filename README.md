# XKWANZA

Ecossistema digital de comércio, formalização e protecção social em Angola.

> Do comércio à formalização — a infraestrutura digital para a evolução económica do cidadão angolano.

O XKWANZA liga **actividade económica → comércio → rendimento → histórico económico → formalização → INSS → protecção social**.

Esta é uma plataforma **privada** de comércio e inclusão económica. Não representa nem substitui o INSS, a AGT ou qualquer entidade pública — apenas orienta e prepara o utilizador para a interacção com essas instituições, através de adaptadores (`Adapter + Mock/Sandbox`) claramente identificados como não-oficiais até existir integração institucional autorizada.

## Arquitectura

Monorepo com dois workspaces:

- **`backend/`** — Node.js + TypeScript + Express + Prisma + PostgreSQL. API REST, autenticação JWT, RBAC, auditoria, segurança.
- **`frontend/`** — React 18 + TypeScript + Vite + Tailwind CSS. Mobile-first, em português, adaptado a Angola (Kwanza, +244, províncias).

Ver `backend/src/modules/` e `frontend/src/modules/` para a organização modular (marketplace, produtos, pedidos, pagamentos, logística, cotações, formalização, INSS, administração, notificações).

## Estado do desenvolvimento (por fases)

- [x] **Fase 1 — Fundação**: arquitectura, base de dados, autenticação, perfis, RBAC, segurança
- [x] **Fase 2 — Marketplace**: categorias, produtos (CRUD, fotos, publicação), pesquisa e filtros, moradas, carrinho, checkout e gestão de pedidos
- [x] **Fase 3 — Logística**: perfil de transportador, pedidos de transporte, propostas e negociação, atribuição, recolha e entrega confirmadas por código OTP (recolha visível apenas ao vendedor, entrega apenas ao comprador)
- [ ] Fase 4 — Pagamentos (XKWANZA Protect, estados, reconciliação)
- [ ] Fase 5 — Histórico económico (vendas, rendimento, indicadores, reputação)
- [ ] Fase 6 — Formalização (diagnóstico, dossiê, documentos, etapas, índice)
- [ ] Fase 7 — INSS (consentimento, sandbox, adapter, consulta, simulação)
- [ ] Fase 8 — Integração institucional oficial (quando autorizada)
- [ ] Fase 9 — Ecossistema (AGT, bancos, fintechs, seguros)

## Regras absolutas do projecto

- Nunca inventar API, NISS ou dados oficiais do INSS/AGT.
- Nunca marcar formalização/documentos como validados sem verificação real.
- Nunca expor credenciais institucionais no frontend.
- Nunca tratar simulação como pagamento nem vendas XKWANZA como base contributiva automática.
- Nunca criar entidades ou funcionalidades empresariais (Company, CompanyMember, etc).

## Desenvolvimento local

```bash
npm install

# Backend
cp backend/.env.example backend/.env   # configurar DATABASE_URL, JWT secrets
npm run prisma:generate
npm run prisma:migrate
npm run dev:backend

# Frontend (noutro terminal)
npm run dev:frontend
```
