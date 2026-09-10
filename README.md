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

## Autenticação e requisitos de registo

O registo e o login aceitam **telefone ou email** como identificador da conta — a pessoa escolhe um dos dois
no formulário (`Registar com telefone` / `Registar com email`); a conta guarda o que for escolhido e usa isso
para entrar depois. Uma conta pode ter só telefone, só email, ou os dois (se adicionar o outro mais tarde),
mas nunca nenhum dos dois.

Os requisitos de registo são **iguais para os 4 perfis com auto-registo** — não há campos extra por perfil
nesta fase; a diferenciação acontece depois de criar a conta (ex: o transportador completa o veículo em
"Meu veículo", o vendedor cria produtos em "Meus produtos"):

| Campo | Regra |
|---|---|
| Nome completo | mín. 2 caracteres |
| Telefone **ou** Email | pelo menos um dos dois — telefone no formato `+244XXXXXXXXX`, email num formato válido |
| Palavra-passe | mín. 8 caracteres, com maiúscula + minúscula + número |
| Província | uma das 18 províncias angolanas |
| Município | mín. 2 caracteres |
| Perfil (Sou...) | Comprador / Produtor / Comerciante / Transportador — ADMIN/SUPPORT nunca por auto-registo |

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

Cada deploy do backend corre automaticamente `prisma migrate deploy` antes de arrancar o servidor — qualquer migração nova criada localmente (`npx prisma migrate dev`) é aplicada sozinha no próximo deploy. Se `prisma migrate deploy` falhar (ex: baseline por fazer), o servidor arranca mesmo assim — para não ficar preso num ciclo em que nunca fica acessível para corrigir o problema (ex: via `/internal/tasks/db-baseline`, secção 1 acima). Um `migrate deploy` a falhar aparece nos logs do Render; corrige a causa e o próximo deploy resolve-se sozinho.

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
