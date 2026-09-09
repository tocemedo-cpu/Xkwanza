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
- [x] **Fase 4 — Pagamentos**: XKWANZA Protect — checkout com transferência bancária/referência/carteira, fundos em custódia até confirmação de recepção, libertação para a carteira do(s) vendedor(es), reembolso ao cancelar, contas bancárias, confirmação manual de depósitos pelo suporte (sem gateway bancário real)
- [x] **Fase 5 — Histórico económico**: avaliações (produto/vendedor/transportador/comprador) após pedidos concluídos, indicadores de rendimento/vendas/reputação para vendedores e transportadores
- [x] **Fase 6 — Formalização**: diagnóstico, dossiê com 6 etapas (1-5 auto-reportadas, a etapa final só confirmada pelo suporte após verificação real dos documentos), índice de progresso, gestão de documentos
- [x] **Fase 7 — INSS**: consentimento explícito e revogável, INSSAdapter em modo SANDBOX apenas (nunca avança sozinho para estados oficiais), NISS sempre auto-declarado pelo utilizador, documentos, simulador de contribuição (taxa sempre indicada por quem simula, nunca fixada pela XKWANZA) claramente marcado "SIMULAÇÃO — NÃO É GUIA DE PAGAMENTO"
- [ ] Fase 8 — Integração institucional oficial (bloqueada até existir acordo formal com o INSS/AGT — ver nota abaixo)
- [ ] Fase 9 — Ecossistema — AGT, bancos, fintechs, seguros (bloqueada pela mesma razão)

### Nota sobre as Fases 8 e 9

Estas fases dependem, por definição, de integrações reais com instituições externas (INSS, AGT, bancos, fintechs, seguradoras) que exigem acordos institucionais formais, credenciais oficiais e homologação — nada disto existe nem pode ser criado por desenvolvimento de software isoladamente. Implementá-las "a sério" sem esse acordo violaria directamente as regras absolutas do projecto (nunca inventar API/dados oficiais do INSS/AGT, nunca expor credenciais institucionais). As Fases 6 e 7 já preparam o terreno: o padrão `Adapter + Mock/Sandbox` (ver `backend/src/modules/inss/inss.adapter.ts`) está pronto para, no futuro, ser substituído por uma implementação real assim que a integração for autorizada — bastará trocar o adapter, sem alterar o resto do sistema.

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
