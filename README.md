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

### Identidade visual

"Do solo ao rio" — a paleta evolui da actividade informal (terra) até ao Kwanza, o rio e a moeda
(confiança, formalidade). Cor de marca principal `xkwanza` (verde-petróleo profundo, tokens em
`frontend/tailwind.config.js`) substitui o verde genérico anterior; acento `gold` (dourado quente,
valor/conquista) substitui o âmbar por omissão do Tailwind; `terra` (terracota) fica reservado para
avisos suaves, nunca para acções primárias. Tipografia única — **Manrope** (carregada via Google
Fonts em `frontend/index.html`) — em vez da fonte de sistema. Cantos mais contidos (`rounded-lg`/
`rounded-xl`) nas acções principais em vez de pills genéricos; pills mantidos só onde fazem sentido
(nav activa, badges de estado, avatares). Monograma novo em `frontend/src/components/Logo.tsx`
(duas barras a cruzar + acento dourado), substitui o antigo "X" preso num quadrado, antes duplicado
em três layouts diferentes. O painel de administração (20+ secções) passou de uma barra horizontal
a transbordar para um menu lateral agrupado por área (Pessoas, Catálogo & pedidos, Confiança,
Finanças, Formalização, Sistema) — ver `frontend/src/layouts/DashboardLayout.tsx`.

## Estado do desenvolvimento (por fases)

- [x] **Fase 1 — Fundação**: arquitectura, base de dados, autenticação, perfis, RBAC, segurança
- [x] **Fase 2 — Marketplace**: categorias, produtos (CRUD, fotos, publicação), pesquisa e filtros, moradas, carrinho, checkout e gestão de pedidos
- [x] **Fase 3 — Logística**: perfil de transportador, pedidos de transporte, propostas e negociação, atribuição, recolha e entrega confirmadas por código OTP (recolha visível apenas ao vendedor, entrega apenas ao comprador)
- [x] **Fase 4 — Pagamentos**: XKWANZA Protect — checkout com transferência bancária/referência/carteira, fundos em custódia até confirmação de recepção, libertação para a carteira do(s) vendedor(es), reembolso ao cancelar, contas bancárias, confirmação manual de depósitos pelo suporte (sem gateway bancário real)
- [x] **Fase 5 — Histórico económico**: avaliações (produto/vendedor/transportador/comprador) após pedidos concluídos, indicadores de rendimento/vendas/reputação para vendedores e transportadores
- [x] **Fase 6 — Formalização**: diagnóstico, dossiê com 6 etapas (1-5 auto-reportadas, a etapa final só confirmada pelo suporte após verificação real dos documentos), índice de progresso, gestão de documentos
- [x] **Fase 7 — INSS**: consentimento explícito e revogável, INSSAdapter em modo SANDBOX apenas (nunca avança sozinho para estados oficiais), NISS sempre auto-declarado pelo utilizador, documentos, simulador de contribuição (taxa sempre indicada por quem simula, nunca fixada pela XKWANZA) claramente marcado "SIMULAÇÃO — NÃO É GUIA DE PAGAMENTO"
- [x] **Fase 8 (parcial) — Administração e suporte**: moderação de produtos, visão geral de pedidos e transportadores, bloqueio/desbloqueio e validação de contas, auditoria (só leitura), tickets de suporte/reclamações com conversa, painel de disputas dedicado, validação formal de perfil (selo Verificado), configurações da plataforma, planeamento manual de rotas do transportador, recuperação de password self-service, notificações por email/push (adapters env-gated) e gateway de pagamento bancário/fintech em modo sandbox — ver secções abaixo. (A parte de integração institucional oficial da Fase 8 continua bloqueada — ver nota.)
- [ ] Fase 8 (restante) — Integração institucional oficial (bloqueada até existir acordo formal com o INSS/AGT — ver nota abaixo)
- [ ] Fase 9 — Ecossistema — AGT, bancos, fintechs, seguros (bloqueada pela mesma razão)

### Nota sobre as Fases 8 e 9

Estas fases dependem, por definição, de integrações reais com instituições externas (INSS, AGT, bancos, fintechs, seguradoras) que exigem acordos institucionais formais, credenciais oficiais e homologação — nada disto existe nem pode ser criado por desenvolvimento de software isoladamente. Implementá-las "a sério" sem esse acordo violaria directamente as regras absolutas do projecto (nunca inventar API/dados oficiais do INSS/AGT, nunca expor credenciais institucionais). As Fases 6 e 7 já preparam o terreno: o padrão `Adapter + Mock/Sandbox` (ver `backend/src/modules/inss/inss.adapter.ts`) está pronto para, no futuro, ser substituído por uma implementação real assim que a integração for autorizada — bastará trocar o adapter, sem alterar o resto do sistema.

## Autenticação e requisitos de registo

### Fluxo de registo

`Criar conta` (`/registar`) → **escolher perfil** (Comprador / Produtor / Comerciante / Transportador, em
cartões) → **formulário específico** do perfil escolhido (`/registar/:role`) → conta criada e sessão iniciada
→ **completar perfil depois**, já dentro da app (ex: o transportador indica os dados do transporte em "Meu
perfil de transportador", o produtor os dados da actividade em "Meu perfil de produtor", o comerciante os
dados do negócio em "Meu perfil de comerciante", o vendedor cria o catálogo em "Meus produtos").

Só **BUYER, PRODUCER, MERCHANT e TRANSPORTER** aparecem no registo público. **ADMIN e SUPPORT nunca
aparecem** — são criados internamente (ver secção "Criar o primeiro administrador" no deploy). Não têm
registo público; a sua autorização vem inteiramente do papel (`role`) atribuído internamente — a lista de
permissões de cada um (gestão de utilizadores/produtos/categorias/pedidos/transportadores/disputas/
verificações/configurações, auditoria e suspensão de contas para o Admin; tickets de suporte para o
Suporte) reflecte o que já está imposto por RBAC (`requireRole`) em cada módulo (utilizadores, produtos,
categorias, pagamentos, formalização, INSS, complaints, settings).

**Telefone, email e NIF passaram a obrigatórios em todos os perfis públicos** (antes bastava telefone OU
email, e o NIF era sempre opcional). O registo e o login continuam a aceitar **telefone ou email** como
identificador para entrar — a conta tem sempre os dois, e a pessoa usa o que preferir no login.

### Recuperação de password self-service

`/recuperar-password` → indicar telefone ou email → `POST /api/auth/request-password-reset` gera um
token de curta duração (30 min, só o hash é guardado) e envia por email quando o adapter SMTP estiver
configurado (ver "Notificações por email/push" abaixo); a resposta é sempre a mesma mensagem genérica,
mesmo que o identificador não exista, para não permitir enumerar contas. Sem SMTP configurado fora de
produção, a resposta inclui `devToken` directamente, e `/recuperar-password` mostra-o com um link
pré-preenchido para `/repor-password?token=...` — só assim o fluxo continua testável sem servidor de
email real. `POST /api/auth/reset-password` troca a password e revoga todas as sessões activas dessa
conta.

### Campos por perfil

Campos comuns aos 4 perfis — todos obrigatórios no registo:

| Campo | Regra |
|---|---|
| Nome completo | mín. 2 caracteres |
| Telefone | formato `+244XXXXXXXXX` |
| Email | formato de email válido |
| Palavra-passe | mín. 8 caracteres, com maiúscula + minúscula + número |
| NIF | alfanumérico, 5-20 caracteres — validado apenas quanto à forma, nunca contra a AGT |
| Província | uma das 18 províncias angolanas |
| Município | mín. 2 caracteres |

Campos extra por perfil — obrigatórios só onde indicado, o resto é sempre opcional para nunca bloquear quem
trabalha informalmente:

| Perfil | Campo extra obrigatório no registo | Campos extra opcionais no registo | Completa-se depois |
|---|---|---|---|
| Comprador | Endereço/localidade | — | Foto de perfil, preferências de compra ("Meu perfil"); endereços de entrega, métodos de pagamento e histórico de compras já existem (Moradas/Checkout/Meus pedidos) |
| Produtor | Localização da produção | Tipo de actividade ("tipo de produtor"), nome do negócio/produção, categoria de produtos, produtos produzidos, capacidade de produção, unidade de medida, preço, disponibilidade | Descrição da actividade, documentação (identificação/formalização, comprovativos da actividade) — "Meu perfil de produtor"; fotos dos produtos em "Meus produtos" |
| Comerciante | — | Tipo de actividade ("tipo de comércio"), nome comercial, localização, categorias de produtos, produtos vendidos | Estado de formalização (Informal / Em formalização / Formalizado) e documentação disponível — "Meu perfil de comerciante"; stock, preços e fotos ficam nos anúncios em "Meus produtos" |
| Transportador | — | Tipo de transportador (individual/empresa), tipo de veículo, matrícula, capacidade de carga, tipo de mercadoria, municípios/províncias atendidos, preço do serviço | Documentação (documentos do veículo, documentação exigida para o serviço) e disponibilidade — "Meu perfil de transportador" |

NIF é único por conta, tal como o telefone e o email: `POST /api/auth/register` responde `409` se o
telefone, email ou NIF já pertencerem a outra conta, e `400` se faltar algum campo obrigatório (incluindo
"Endereço/localidade" para o Comprador e "Localização da produção" para o Produtor).

Os perfis específicos de cada papel (`Transporter`, `ProducerProfile`, `MerchantProfile`) são criados logo no
registo — vazios ou parcialmente preenchidos consoante o que a pessoa já indicar — e ficam sempre editáveis
depois (`GET`/`PUT /api/transporters/me`, `/api/producers/me`, `/api/merchants/me`). A documentação de cada
perfil reaproveita o endpoint genérico de documentos (`POST /api/formalization/documents`, tipos
`VEHICLE_DOCUMENT`/`SERVICE_REQUIREMENT` para o Transportador, `IDENTITY`/`ACTIVITY_PROOF` para
Produtor/Comerciante).

## Esquema de rotas do frontend

Todas as rotas autenticadas vivem sob um prefixo por perfil — `/produtor/*`, `/comerciante/*`,
`/comprador/*`, `/transportador/*` e `/admin/*` (ADMIN e SUPPORT) — imposto pelo componente
`RoleGuard`: quem tenta aceder a um prefixo que não é o seu é reencaminhado para o seu próprio
`/{prefixo}/dashboard`. `getRolePrefix(role)` (`frontend/src/types/user.ts`) é a única fonte de
verdade para o mapeamento perfil → prefixo, usada tanto no router (`App.tsx`) como em qualquer
página que precise de construir um link consciente do perfil de quem está a ver (ex: `OrderDetail`,
`ProductDetail`). Páginas partilhadas entre perfis (ex: `Support`, `OrderDetail`,
`TransportOrderDetail`) são montadas várias vezes — uma por prefixo — apontando para o mesmo
componente React.

| Perfil | Prefixo | Páginas principais |
|---|---|---|
| Produtor | `/produtor` | `dashboard`, `marketplace`, `stock` (catálogo), `pedidos` (recebidos), `negociacoes`, `entregas`, `disputas`, `avaliacoes`, `documentos` (formalização), `inss`, `carteira`, `historico`, `notificacoes`, `suporte`, `perfil`, `conta` |
| Comerciante | `/comerciante` | Mesmo conjunto do Produtor (perfis MERCHANT e PRODUCER partilham as mesmas páginas de vendedor) |
| Comprador | `/comprador` | `dashboard`, `marketplace`, `carrinho`, `checkout`, `pedidos`, `negociacoes`, `entregas`, `disputas`, `avaliacoes`, `notificacoes`, `suporte`, `conta` |
| Transportador | `/transportador` | `dashboard`, `fretes`, `meus-fretes`, `veiculo`, `rotas` (planeamento manual de paragens — ver nota abaixo), `disputas`, `rendimentos`, `avaliacoes`, `documentos`, `inss`, `carteira`, `notificacoes`, `suporte`, `conta` |
| Administrador | `/admin` | `dashboard`, `utilizadores`, `produtores`, `compradores`, `transportadores`, `categorias`, `produtos`, `pedidos`, `entregas`, `negociacoes`, `avaliacoes`, `pagamentos`, `notificacoes`, `formalizacao`, `inss`, `reclamacoes`, `disputas`, `verificacoes`, `configuracoes`, `auditoria`, `relatorios`, `conta` |

Carrinho/checkout (`/comprador/carrinho`, `/comprador/checkout`) são exclusivos do perfil
Comprador — um Produtor/Comerciante/Transportador que quiser pedir um preço a outro vendedor usa
Negociações (`/{prefixo}/negociacoes`), não o carrinho de compras.

`/{prefixo}/disputas` e `/admin/disputas` usam um modelo de dados dedicado (`Complaint` +
`ComplaintMessage`, módulo `backend/src/modules/complaints/`) — deliberadamente distinto do
`SupportTicket` já existente em `/{prefixo}/suporte` e `/admin/reclamacoes` (mantido por
compatibilidade e sob o nome "Reclamações" na navegação de equipa, para não confundir com este
painel novo, que usa sempre a palavra "Disputas" na interface). Qualquer utilizador pode abrir uma
disputa associada opcionalmente a um pedido/produto/utilizador/frete; ADMIN/SUPPORT respondem,
assumem a disputa (a primeira resposta da equipa atribui-a) e fecham com Resolvida/Rejeitada — um
motivo é obrigatório para fechar.

## Administração e suporte

ADMIN e SUPPORT nunca aparecem no registo público (ver secção acima) — a sua autoridade vem
inteiramente do `role`, imposto por RBAC (`requireRole`) em cada rota abaixo. Ambos os papéis têm
o mesmo acesso a estas ferramentas (não há distinção de permissões entre ADMIN e SUPPORT).

| Área | Onde | O que faz |
|---|---|---|
| Painel | `/admin/dashboard` | Indicadores agregados da plataforma (utilizadores por perfil, pedidos por estado, receita concluída, pagamentos pendentes, tickets/negociações abertas, produtos activos — `GET /api/economics/admin`) e atalhos para as restantes áreas. |
| Utilizadores | `/admin/utilizadores`, `/admin/produtores`, `/admin/compradores` | Listar/pesquisar (as duas últimas pré-filtram por perfil), repor password, **bloquear/desbloquear conta** (`isActive`), **validar perfil** (`isVerifiedBadge`) — `PATCH /api/users/:id/status`. Um admin nunca se pode bloquear a si próprio. Uma conta bloqueada (`isActive: false`) não consegue entrar (login responde 403), mesmo com a password certa. |
| Categorias | `/admin/categorias` | Criar, renomear e remover categorias do catálogo (`POST`/`PATCH`/`DELETE /api/categories`), em duas camadas — categoria principal → subcategoria (`parentId`). Não há seed automático — uma base de dados nova (incluindo produção) começa sem nenhuma categoria, e o selector de categoria no formulário de publicação fica vazio até um ADMIN criar pelo menos uma aqui. O botão "Criar categorias padrão" (`POST /api/categories/seed-defaults`, idempotente e auto-reparador — reatribui a mãe certa a uma categoria já existente em vez de a ignorar) cria de uma vez a árvore completa: 13 categorias principais de produtos com as suas subcategorias, mais 15 categorias de serviços sem subcategoria (directamente seleccionáveis). O nome de uma categoria só precisa de ser único entre irmãos (não globalmente) — por isso "Acessórios" pode existir em Moda e em Electrónica ao mesmo tempo; só o `slug` continua globalmente único. |
| Produtos | `/admin/produtos` | Vê anúncios de qualquer vendedor em qualquer estado (`GET /api/products/admin`) e modera (`PATCH /api/products/:id/moderate`): despublicar ou **remover** (estado `REMOVED`, nunca apagado da base de dados). |
| Pedidos | `/admin/pedidos` | Visão geral de todos os pedidos e transacções da plataforma (`GET /api/orders/admin`), com o mesmo detalhe (`/admin/pedidos/:id`) que compradores/vendedores já têm. |
| Entregas | `/admin/entregas` | Todos os fretes/entregas da plataforma, com transportador atribuído e estado (`GET /api/transport-orders/admin`). |
| Negociações | `/admin/negociacoes` | Todos os pedidos de cotação e propostas entre compradores e vendedores (`GET /api/quotes/admin`). |
| Avaliações | `/admin/avaliacoes` | Modera avaliações de qualquer utilizador — remove conteúdo impróprio e recalcula a classificação média do produto/transportador afectado (`GET`/`DELETE /api/reviews/admin`, `/api/reviews/:id`). |
| Transportadores | `/admin/transportadores` | Lista todos os transportadores registados com contacto e estado da conta (`GET /api/transporters/admin`); bloqueio/desbloqueio usa o mesmo endpoint de utilizadores. |
| Notificações | `/admin/notificacoes` | Consulta só de leitura a todas as notificações enviadas a utilizadores (`GET /api/notifications/admin`) — não compõe nem dispara notificações novas. |
| Relatórios | `/admin/relatorios` | Mesmos indicadores do painel, em formato de relatório mais detalhado. |
| Auditoria | `/admin/auditoria` | Consulta só de leitura ao `AuditLog` (`GET /api/audit-logs`, filtros por entidade/acção/utilizador/resultado) — a tabela nunca é actualizada nem apagada pela aplicação. |
| Suporte | `/admin/reclamacoes` (staff) e `/{prefixo}/suporte` (qualquer utilizador) | Tickets com conversa (`SupportTicket` + `SupportTicketMessage`): qualquer utilizador cria um ticket e responde ao seu; ADMIN/SUPPORT vêem todos, respondem (a primeira resposta atribui-lhes o ticket) e mudam o estado (Aberto → Em curso → Aguarda o utilizador → Resolvido/Fechado). |
| Disputas | `/admin/disputas` (staff) e `/{prefixo}/disputas` (qualquer utilizador) | Painel dedicado (`Complaint` + `ComplaintMessage`, distinto do Suporte acima), opcionalmente associado a um pedido/produto/utilizador/frete concreto. Mesmo fluxo de conversa e atribuição do Suporte, mas fecho (Resolvida/Rejeitada) exige sempre um motivo (`resolutionNote`). |
| Verificações | `/admin/verificacoes` | Fila de pedidos de validação formal de perfil (selo XKWANZA Verificado) — qualquer utilizador pede em `Conta` (`POST /api/users/me/request-verification`); ADMIN/SUPPORT aprovam (activa `isVerifiedBadge`) ou rejeitam com motivo obrigatório (`PATCH /api/users/:id/verification`), notificando o utilizador. Distinto do dossiê de formalização fiscal/INSS. |
| Configurações | `/admin/configuracoes` | Pares chave/valor geridos pela administração (`PlatformSetting`, `GET`/`PUT`/`DELETE /api/settings/:key`) — infra-estrutura para configuração futura de módulos, sem uso rico ainda além do CRUD em si. |
| Banners | `/admin/banners` | Gere as imagens/textos do carrossel de destaque da homepage pública (`Banner`, `GET /api/banners/active` pública + `GET`/`POST`/`PATCH`/`DELETE /api/banners` para ADMIN/SUPPORT), incluindo upload de imagem (`POST /api/banners/upload`, reutiliza o Supabase Storage das fotos de produto) ou URL colado directamente, ordenação (`position`) e activar/desactivar sem apagar. Sem nenhum banner activo, a homepage mostra o conteúdo ilustrativo por omissão do `HeroCarousel`. |

Planeamento de rotas do transportador (`/transportador/rotas`) organiza manualmente os fretes já
atribuídos numa sequência de paragens (`Route` + `RouteStop`) — sem fornecedor de mapas
configurado (Google Maps/Mapbox), não há cálculo de trajecto/distância/ETA: o próprio
transportador decide e reordena a sequência.

## Negociações, notificações e avaliações

- **Negociações** (`QuoteRequest`/`QuoteProposal`) — um comprador pede uma cotação (descrição,
  quantidade, prazo opcional); produtores/comerciantes respondem com uma proposta de preço; o
  comprador aceita a que preferir. Acessível em `/{prefixo}/negociacoes` para produtor, comerciante
  e comprador (`POST /api/quotes`, `GET /api/quotes` ou `/mine`, `POST /api/quotes/:id/proposals`,
  `POST /api/quotes/:id/proposals/:proposalId/accept`).
- **Notificações** (`Notification`) — geradas automaticamente por outros módulos (pedidos, suporte,
  negociações) via `recordNotification()`; só o canal `IN_APP` é real — não há envio de
  email/push configurado, por isso não é simulado. Consultadas em `/{prefixo}/notificacoes`
  (`GET /api/notifications/mine`, `PATCH .../read`, `PATCH .../read-all`).
- **Avaliações** — além da avaliação já existente por pedido, agora também "Minhas avaliações"
  (tudo o que o próprio utilizador escreveu — `GET /api/reviews/mine`) e "Avaliações recebidas"
  (o que disseram sobre um vendedor/transportador — `GET /api/reviews/received`), em
  `/{prefixo}/avaliacoes`.

## Publicar um anúncio — Produto vs Serviço

`Product` (mapeado para a tabela `products`) representa tanto um Produto físico como um Serviço,
distinguidos pelo campo `listingType` (`PRODUCT` | `SERVICE`, imutável depois de criado). A validação
de criação usa um discriminated union no Zod (`createProductSchema`) — cada tipo exige o seu próprio
conjunto de campos, e os campos do outro tipo ficam a `null`:

| Passo | Produto (`/{prefixo}/stock/novo`) | Serviço (`/{prefixo}/stock/novo?tipo=servico`) |
|---|---|---|
| 1 | Título | Nome |
| 2 | Categoria | Categoria |
| 3 | Descrição | Descrição |
| 4 | Foto (depois de guardar o 1º passo, tal como hoje — precisa do ID do anúncio) | Foto (idem) |
| 5 | Preço | Preço/Orçamento (opção "é um orçamento" mostra "A partir de" em vez de preço fixo) |
| 6 | Unidade | Área de atendimento |
| 7 | Stock | Disponibilidade |
| 8 | Localização (província/município) | Contacto |
| 9 | Entrega (`SELLER_DELIVERS` / `BUYER_PICKUP` / `XKWANZA_TRANSPORT`) | — |
| 10 | Publicar (`/stock`, exige pelo menos 1 foto + stock > 0) | Publicar (idem, exige área/disponibilidade/contacto preenchidos) |

Quem publica: Produtor e Comerciante, para ambos os tipos (o formulário mostra um selector
Produto/Serviço só na criação). No Marketplace (`/{prefixo}/marketplace`) os separadores
"Produtos"/"Serviços"/"Tudo" filtram por `listingType`. Um Serviço nunca entra no carrinho —
`ProductDetail` mostra sempre "Pedir orçamento" (via Negociações) em vez de "Adicionar ao
carrinho", e o backend rejeita no checkout qualquer item cujo `listingType` não seja `PRODUCT`
(defesa em profundidade, mesmo que o frontend já não ofereça essa opção).

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

## Testes e CI

```bash
npm run test --workspace=backend    # unitários + integração (precisa de DATABASE_URL/DIRECT_URL)
npm run test --workspace=frontend   # unitários + componentes (vitest + Testing Library)
```

Os testes de integração do backend (`backend/src/app.integration.test.ts`) correm contra uma base de dados
Postgres real (a mesma usada em desenvolvimento local) — sem mocks, exercitam o fluxo HTTP completo:
validação, Prisma, hashing de password e RBAC.

O GitHub Actions (`.github/workflows/ci.yml`) corre em cada `push`/PR: typecheck, testes e build para os dois
workspaces, com um serviço Postgres efémero para os testes do backend.

## Deploy (Render + Supabase)

Base de dados em Supabase (PostgreSQL), backend e frontend alojados no Render como dois serviços definidos em `render.yaml`.

### 1. Supabase — base de dados

1. Cria o projecto em [supabase.com](https://supabase.com) e guarda a password da base de dados.
2. **Se ainda não colaste `supabase_schema.sql` no SQL Editor do Supabase**, faz isso agora (cria todas as tabelas, enums, índices e triggers).
3. **Se já colaste esse ficheiro**, o Prisma não sabe que essas migrações já foram aplicadas. Antes do primeiro deploy, marca-as como aplicadas (isto não altera dados — só regista no Prisma que já existem, para que `prisma migrate deploy`, que corre automaticamente a cada deploy no Render, não tente recriá-las).

   **Importante:** se este passo não for feito, `prisma migrate deploy` falha em todos os deploys com `Error: P3005` (a base já não está vazia), o `startCommand` do Render nunca chega a `npm start`, e por isso a Render nunca vê uma porta aberta ("No open ports detected") mesmo com o build a passar.

   Duas formas de fazer o baseline:

   **A) Via endpoint interno do backend (não precisas de Node/Prisma localmente)** — depois do backend estar deployado no Render com `ADMIN_TASK_SECRET` definido (ver secção 2):

   ```bash
   curl -X POST https://xkwanza-backend.onrender.com/internal/tasks/db-baseline \
     -H "x-admin-secret: <o valor que definiste em ADMIN_TASK_SECRET>"
   ```

   Corre uma vez só. Devolve o resultado de cada migração (`ok`, `already-applied` ou `error`). Sem o cabeçalho correcto, a rota responde 404 como se não existisse.

   **B) A partir da tua máquina**, usando sempre a ligação **directa** (porta 5432), nunca o pooler:

   ```bash
   cd backend
   DATABASE_URL="postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres" \
     npx prisma migrate resolve --applied 20260909194410_init
   DATABASE_URL="postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres" \
     npx prisma migrate resolve --applied 20260909200500_formalization_stage_unique
   ```

4. Vais precisar de **duas** connection strings do Supabase (Project Settings → Database → Connection string):
   - **Connection pooling** (porta `6543`, modo *Transaction*) → variável `DATABASE_URL`, usada pela app em runtime. Acrescenta `?pgbouncer=true` no fim.
   - **Direct connection** (porta `5432`) → variável `DIRECT_URL`, usada só pelo `prisma migrate deploy` no arranque de cada deploy. O pgbouncer do pooler não suporta os locks que o Prisma precisa para migrações — sem isto, `prisma migrate deploy` falha ou fica pendurado indefinidamente.

   Depois do baseline acima feito uma vez, migrações novas (como `20260910153110_optional_phone_login`, que
   torna o telefone opcional para suportar registo/login por email) aplicam-se sozinhas em cada deploy — não
   precisas de repetir o processo manual. Se mesmo assim vires `P3005` nos logs do Render outra vez, corre o
   SQL correspondente directamente no SQL Editor do Supabase:
   ```sql
   ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL;
   ```
   e depois marca-a como aplicada com o endpoint `/internal/tasks/db-baseline` (secção acima) ou
   `npx prisma migrate resolve --applied 20260910153110_optional_phone_login`.

### 2. Render — backend + frontend

1. No [dashboard do Render](https://dashboard.render.com), **New → Blueprint**, liga este repositório. O Render lê `render.yaml` e propõe criar dois serviços: `xkwanza-backend` (Web Service) e `xkwanza-frontend` (Static Site).
2. Durante a criação, preenche as variáveis marcadas como manuais:
   - **`xkwanza-backend`** → `DATABASE_URL` (connection pooling, porta 6543, com `?pgbouncer=true`), `DIRECT_URL` (direct connection, porta 5432), `CORS_ORIGIN` (deixa em branco por agora, ajusta-se no passo 4) e `ADMIN_TASK_SECRET` (inventa um valor forte — só é preciso se fores usar a opção A do baseline acima; deixa em branco para desactivar essa rota)
   - **`xkwanza-frontend`** → `VITE_API_URL` (deixa em branco por agora, ajusta-se no passo 3)
   - `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` são gerados automaticamente pelo Render — não precisas de nada aqui.
3. Depois do backend ficar online, copia o seu URL (ex: `https://xkwanza-backend.onrender.com`) e define no `xkwanza-frontend`: `VITE_API_URL=https://xkwanza-backend.onrender.com/api`. Isto obriga a um novo build do frontend (o Vite embebe esta variável em tempo de build).
4. Depois do frontend ficar online, copia o seu URL (ex: `https://xkwanza-frontend.onrender.com`) e define no `xkwanza-backend`: `CORS_ORIGIN=https://xkwanza-frontend.onrender.com`. Isto reinicia o backend com o CORS correcto.

Cada deploy do backend corre automaticamente `prisma migrate deploy` antes de arrancar o servidor —
qualquer migração nova criada localmente (`npx prisma migrate dev`) é aplicada sozinha no próximo
deploy. **Se `prisma migrate deploy` falhar, o deploy falha também** (o servidor não arranca) — isto
é deliberado: um incidente em 2026-09 mostrou que deixar o servidor arrancar mesmo com a migração
falhada faz a app correr contra um schema desactualizado, com qualquer operação que use as colunas/
tabelas em falta a responder `500` sem aviso nenhum no deploy (que aparecia "verde"). Se isto
acontecer:

1. Confirma no dashboard do Supabase (SQL Editor) se a tabela `_prisma_migrations` existe e que
   migrações já lá estão registadas — `select migration_name, finished_at from _prisma_migrations
   order by started_at desc;`.
2. Se a base de dados foi criada de outra forma (ex: `prisma db push`, ou SQL colado manualmente) e
   por isso não tem histórico de migrações, usa `/internal/tasks/db-baseline` (secção acima) para
   marcar como aplicadas as migrações que já correspondem ao schema real, sem as voltar a correr.
3. Corrige a causa e volta a fazer deploy — só quando `prisma migrate deploy` terminar com sucesso é
   que o servidor arranca.

### 3. Criar o primeiro administrador

O registo público bloqueia de propósito a criação de contas ADMIN/SUPPORT (só perfis BUYER, PRODUCER, MERCHANT, TRANSPORTER podem auto-registar-se). Para criares a tua própria conta de administrador:

1. Regista-te normalmente na app (`/registar`), com qualquer perfil (ex: Comprador).
2. Com `ADMIN_TASK_SECRET` definido no `xkwanza-backend` (ver secção 2), promove essa conta a ADMIN:

   ```bash
   curl -X POST https://xkwanza-backend.onrender.com/internal/tasks/promote-admin \
     -H "Content-Type: application/json" \
     -H "x-admin-secret: <o valor que definiste em ADMIN_TASK_SECRET>" \
     -d '{"phone":"+244900000000"}'
   ```

   (`role` é opcional — por omissão promove a `ADMIN`; passa `"role":"SUPPORT"` para criar suporte em vez de admin.) Podes correr o mesmo pedido a partir da consola do browser (F12 → Console) com `fetch(...)` em vez de `curl`, se não tiveres terminal à mão.
3. Termina sessão e volta a entrar — a conta já tem acesso aos painéis `/admin/utilizadores`, `/admin/pagamentos`, `/admin/formalizacao` e `/admin/inss`.

### 4. Upload de fotos de produto (Supabase Storage)

Por omissão, os vendedores só conseguem colar o URL de uma imagem já alojada noutro sítio. Para activar o
upload real a partir do dispositivo:

1. No [dashboard do Supabase](https://supabase.com/dashboard), abre o teu projecto → **Storage** → **New
   bucket**. Nome sugerido: `product-photos`. Marca-o como **Public bucket** (as fotos de produto são
   públicas por natureza — aparecem no marketplace).
2. Em **Project Settings → API**, copia o **Project URL** e a **service_role key** (não a `anon` key — esta
   precisa de permissão de escrita no bucket, e nunca deve ser usada no frontend).
3. No Render, define no `xkwanza-backend`:
   - `SUPABASE_URL` — o Project URL do passo 2
   - `SUPABASE_SERVICE_ROLE_KEY` — a service_role key do passo 2
   - `SUPABASE_STORAGE_BUCKET` — `product-photos` (ou o nome que escolheste; já vem pré-definido no
     `render.yaml`)
4. Sem estas variáveis, a app continua a funcionar normalmente — o botão de upload mostra um erro claro e o
   vendedor pode sempre usar o campo de URL.

### 5. Gateway de pagamento bancário/fintech (sandbox)

Os métodos `BANK_INTEGRATION`/`FINTECH_INTEGRATION` no checkout passam por um adapter
(`backend/src/modules/payments/payment.adapter.ts`) com o mesmo padrão `Adapter + Mock/Sandbox` do
INSS (`backend/src/modules/inss/inss.adapter.ts`): em modo sandbox (`PAYMENT_ADAPTER_MODE=sandbox`,
valor por omissão), a cobrança é sempre simulada — nunca liga a um banco/fintech real — e o
pagamento fica `PROCESSING` até o suporte/administração o confirmar manualmente
(`POST /api/payments/:orderId/confirm`) ou, quando existir uma integração real, o webhook do
provedor resolver (`POST /api/payments/gateway/webhook`, com verificação de assinatura HMAC via
`PAYMENT_GATEWAY_WEBHOOK_SECRET`). Não implementar o modo `production` sem um acordo institucional
real com um banco/fintech angolana — tentar usá-lo sem `PAYMENT_GATEWAY_PROVIDER`/
`PAYMENT_GATEWAY_API_KEY` configurados falha de forma explícita.

### 6. Notificações por email/push

- **Email** — `backend/src/modules/notifications/email.adapter.ts` usa SMTP via `nodemailer`.
  Define no Render (`xkwanza-backend`): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
  (e `SMTP_SECURE=true` se o provedor exigir TLS implícito). Sem estas variáveis, o envio fica
  desactivado — a notificação continua sempre a existir dentro da app (`IN_APP`), só o email extra
  não sai.
- **Push** — `backend/src/modules/notifications/push.adapter.ts` é uma ponte genérica por webhook:
  define `PUSH_WEBHOOK_URL` para reencaminhar cada notificação para um relay externo (ex:
  OneSignal/FCM) que configures separadamente — não há SDK de push nem registo de dispositivo
  implementado nesta versão.
- Cada utilizador controla em `Conta` se quer receber por email/push (`notifyByEmail`/
  `notifyByPush`, `PATCH /api/users/me`) — a notificação `IN_APP` é sempre gravada, independentemente
  destas preferências.
