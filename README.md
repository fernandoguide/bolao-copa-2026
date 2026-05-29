# ⚽ Bolão Copa do Mundo 2026

Aplicação fullstack para bolão de palpites da Copa do Mundo FIFA 2026 (EUA, México e Canadá).

- **48 seleções** distribuídas em 12 grupos (A–L)
- **104 jogos** — 72 na fase de grupos + 32 no mata-mata (32avos, oitavas, quartas, semi, 3° lugar e final)
- Horários convertidos para **GMT-3 (América/São_Paulo)**
- Dados reais do calendário oficial (fonte: [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json/blob/master/2026/worldcup.json))

---

## Arquitetura

```
bolao-copa-2026/
├── backend/           # API NestJS 10 + TypeORM 0.3 + PostgreSQL 16
├── frontend/          # SPA React 18 + Vite 5 + Tailwind CSS 3
├── docker-compose.yml # Orquestração de 3 serviços
└── README.md
```

### Stack

| Camada    | Tecnologia                                |
|-----------|-------------------------------------------|
| Backend   | NestJS 10, TypeORM 0.3, Passport JWT, bcrypt |
| Frontend  | React 18, Vite 5, TypeScript 5, Tailwind CSS 3, React Router 6 |
| Banco     | PostgreSQL 16                              |
| Infra     | Docker multi-stage, Docker Compose, Nginx  |
| Testes    | Jest 29, ts-jest, @nestjs/testing (50 testes) |

---

## Pré-requisitos

- **Node.js** 20+
- **npm** 9+
- **PostgreSQL** 16+ (ou Docker)
- **Docker** e **Docker Compose** (para rodar via containers)

---

## 🚀 Rodar com Docker (recomendado)

Sobe banco, backend e frontend com um único comando:

```bash
docker compose up --build
```

| Serviço  | URL                         |
|----------|-----------------------------|
| Frontend | http://localhost:5173        |
| API      | http://localhost:3001/api    |
| Postgres | localhost:5432               |

Para rodar em background:

```bash
docker compose up -d --build
```

Para parar:

```bash
docker compose down
```

Para apagar os dados do banco:

```bash
docker compose down -v
```

---

## 🛠️ Rodar Localmente (sem Docker)

### 1. Banco de Dados

Crie um banco PostgreSQL:

```sql
CREATE USER bolao WITH PASSWORD 'bolao123';
CREATE DATABASE bolao_copa2026 OWNER bolao;
```

Ou use Docker apenas para o banco:

```bash
docker compose up db -d
```

### 2. Backend

```bash
cd backend

# Copiar variáveis de ambiente
cp .env.example .env

# Instalar dependências
npm install

# Gerar e rodar migrations
npm run migration:generate -- src/migrations/Initial
npm run migration:run

# Popular 48 seleções + 104 jogos
npm run seed

# Iniciar em modo desenvolvimento
npm run start:dev
```

A API estará disponível em **http://localhost:3001/api**

### 3. Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm run dev
```

O app estará disponível em **http://localhost:5173**

---

## 🌱 Seed (Dados da Copa 2026)

O comando `npm run seed` (no backend) popula o banco com:

- **48 seleções** nos 12 grupos oficiais
- **104 partidas** com datas e horários reais em GMT-3

Jogos do mata-mata são criados sem times definidos (nullable) e identificados por `matchLabel` (ex: "Jogo 73", "Final"). Times são preenchidos conforme os resultados avançam.

```bash
cd backend
npm run seed
```

---

## 📱 Páginas do Frontend

| Página             | Rota              | Descrição                                 |
|--------------------|-------------------|-------------------------------------------|
| Login              | `/login`          | Autenticação com e-mail e senha           |
| Cadastro           | `/register`       | Criar nova conta                          |
| Jogos              | `/matches`        | Lista de partidas com placares            |
| Meus Palpites      | `/predictions`    | Registrar/editar palpites por jogo        |
| Ranking            | `/leaderboard`    | Tabela de classificação dos participantes |
| Seleções           | `/teams`          | Seleções organizadas por grupo            |
| Regras             | `/rules`          | Explicação do sistema de pontuação        |

---

## 📡 Endpoints da API

### Auth (público)
| Método | Rota                  | Descrição           |
|--------|-----------------------|---------------------|
| POST   | `/api/auth/register`  | Criar conta         |
| POST   | `/api/auth/login`     | Login (retorna JWT) |

### Users (autenticado)
| Método | Rota             | Descrição            |
|--------|------------------|----------------------|
| GET    | `/api/users/me`  | Perfil do usuário    |
| GET    | `/api/users`     | Listar participantes |

### Teams (autenticado)
| Método | Rota                      | Descrição              |
|--------|---------------------------|------------------------|
| GET    | `/api/teams`              | Todas as seleções      |
| GET    | `/api/teams/group/:group` | Seleções por grupo     |
| GET    | `/api/teams/:id`          | Detalhe de uma seleção |

### Matches (autenticado)
| Método | Rota                        | Descrição             |
|--------|-----------------------------|-----------------------|
| GET    | `/api/matches`              | Todas as partidas     |
| GET    | `/api/matches/upcoming`     | Próximas partidas     |
| GET    | `/api/matches/stage/:stage` | Partidas por fase     |
| GET    | `/api/matches/:id`          | Detalhe da partida    |
| PATCH  | `/api/matches/:id/result`   | Registrar resultado   |

**Fases disponíveis:** `group`, `round_of_32`, `round_of_16`, `quarter_final`, `semi_final`, `third_place`, `final`

### Predictions (autenticado)
| Método | Rota                                  | Descrição               |
|--------|---------------------------------------|-------------------------|
| POST   | `/api/predictions`                    | Criar/atualizar palpite |
| GET    | `/api/predictions/my`                 | Meus palpites           |
| GET    | `/api/predictions/match/:matchId`     | Palpites de uma partida |

### Leaderboard (autenticado)
| Método | Rota               | Descrição     |
|--------|---------------------|--------------|
| GET    | `/api/leaderboard`  | Ranking geral |

---

## 🏆 Sistema de Pontuação

| Resultado do palpite                    | Pontos |
|-----------------------------------------|--------|
| Placar exato                            | **10** |
| Vencedor correto + saldo de gols certo  | **7**  |
| Apenas vencedor correto                 | **5**  |
| Errou                                   | **0**  |

**Exemplo:**
- Resultado real: Brasil 2×1 Marrocos
- Palpite 2×1 → 10 pontos (exato)
- Palpite 3×2 → 7 pontos (vencedor + saldo)
- Palpite 1×0 → 5 pontos (só vencedor)
- Palpite 0×1 → 0 pontos

---

## 🏟️ Seleções e Grupos

| Grupo | Seleções                                        |
|-------|-------------------------------------------------|
| A     | México, África do Sul, Coreia do Sul, Rep. Tcheca |
| B     | Canadá, Bósnia e Herzegovina, Catar, Suíça       |
| C     | Brasil, Marrocos, Haiti, Escócia                  |
| D     | Estados Unidos, Paraguai, Austrália, Turquia      |
| E     | Alemanha, Curaçao, Costa do Marfim, Equador       |
| F     | Holanda, Japão, Suécia, Tunísia                   |
| G     | Bélgica, Egito, Irã, Nova Zelândia               |
| H     | Espanha, Cabo Verde, Arábia Saudita, Uruguai      |
| I     | França, Senegal, Iraque, Noruega                  |
| J     | Argentina, Argélia, Áustria, Jordânia             |
| K     | Portugal, RD Congo, Uzbequistão, Colômbia         |
| L     | Inglaterra, Croácia, Gana, Panamá                 |

---

## 📅 Calendário

| Fase               | Datas                    | Jogos |
|--------------------|--------------------------|-------|
| Fase de Grupos     | 11/06 – 27/06/2026      | 72    |
| 32avos de final    | 28/06 – 03/07/2026      | 16    |
| Oitavas de final   | 04/07 – 07/07/2026      | 8     |
| Quartas de final   | 09/07 – 11/07/2026      | 4     |
| Semifinais         | 14/07 – 15/07/2026      | 2     |
| Disputa 3° lugar   | 18/07/2026              | 1     |
| Final              | 19/07/2026              | 1     |

Todos os horários exibidos em **GMT-3 (América/São_Paulo)**.

---

## ⚙️ Variáveis de Ambiente

### Backend (`backend/.env`)

| Variável       | Descrição                     | Padrão                                                    |
|----------------|-------------------------------|-----------------------------------------------------------|
| DATABASE_URL   | Connection string do Postgres | `postgres://bolao:bolao123@localhost:5432/bolao_copa2026`  |
| JWT_SECRET     | Chave para assinar tokens     | — (obrigatório)                                           |
| JWT_EXPIRES_IN | Validade do token             | `7d`                                                      |
| PORT           | Porta da API                  | `3001`                                                    |
| NODE_ENV       | Ambiente                      | `development`                                             |
| FRONTEND_URL   | URL do frontend (CORS)        | `http://localhost:5173`                                   |

### Frontend (`frontend/.env`)

| Variável       | Descrição              | Padrão (dev)              |
|----------------|------------------------|---------------------------|
| VITE_API_URL   | URL base da API        | `/api` (proxy do Vite)    |

---

## 📂 Scripts disponíveis

### Backend

| Script                | Descrição                          |
|-----------------------|------------------------------------|
| `npm run start:dev`   | Inicia com hot-reload              |
| `npm run build`       | Compila para produção              |
| `npm run start:prod`  | Executa build de produção          |
| `npm run test`        | Roda todos os testes (50 testes)   |
| `npm run test:cov`    | Testes com cobertura               |
| `npm run migration:generate -- src/migrations/Nome` | Gera migration |
| `npm run migration:run`    | Aplica migrations pendentes   |
| `npm run migration:revert` | Reverte última migration      |
| `npm run seed`        | Popula seleções e jogos no banco   |
| `npm run lint`        | Lint + autofix                     |

### Frontend

| Script              | Descrição                     |
|---------------------|-------------------------------|
| `npm run dev`       | Dev server com HMR            |
| `npm run build`     | Build de produção             |
| `npm run preview`   | Preview do build local        |

---

## 🐳 Docker

### Serviços (`docker-compose.yml`)

| Serviço  | Imagem / Build     | Porta  | Descrição               |
|----------|--------------------|--------|-------------------------|
| db       | postgres:16-alpine | 5432   | Banco de dados          |
| backend  | ./backend          | 3001   | API NestJS              |
| frontend | ./frontend         | 5173→80| SPA via Nginx           |

### Build de Produção

Ambos backend e frontend usam **Dockerfile multi-stage**:

1. **Estágio build** — instala deps e compila
2. **Estágio runtime** — imagem mínima apenas com artefatos

---

## 🧪 Testes

```bash
cd backend

# Rodar todos os 50 testes
npm test

# Com cobertura
npm run test:cov

# Watch mode
npm run test:watch
```

**Suítes de teste:**
- `auth.service.spec.ts` / `auth.controller.spec.ts`
- `users.service.spec.ts`
- `teams.service.spec.ts` / `teams.controller.spec.ts`
- `matches.service.spec.ts` / `matches.controller.spec.ts`
- `predictions.service.spec.ts` / `predictions.controller.spec.ts`
- `leaderboard.service.spec.ts` / `leaderboard.controller.spec.ts`

---

## 📋 Fluxo de uso

1. Usuário se cadastra / faz login
2. Consulta as partidas por fase ou data
3. Registra palpites (placar) para cada jogo antes do início
4. Admin registra resultados reais após cada partida (`PATCH /api/matches/:id/result`)
5. Sistema calcula automaticamente os pontos de cada palpite
6. Ranking atualizado em tempo real na página de Leaderboard

---

## 📄 Licença

Projeto pessoal — uso livre.

