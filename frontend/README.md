# ⚽ Bolão Copa 2026 — Frontend

Interface web do Bolão da Copa do Mundo 2026, construída com React + TypeScript + Vite + Tailwind CSS.

## Pré-requisitos

- **Node.js** 20+
- **npm** 9+

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do frontend (ou defina via CI/CD):

| Variável       | Descrição               | Padrão (dev)               |
| -------------- | ----------------------- | -------------------------- |
| `VITE_API_URL` | URL base da API backend | `/api` (usa proxy do Vite) |

**Exemplo para produção:**

```env
VITE_API_URL=https://api.seudominio.com/api
```

Em desenvolvimento, o Vite já faz proxy de `/api` para `http://localhost:3001`, então não é necessário definir esta variável.

## Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar com hot-reload (porta 5173)
npm run dev
```

Acesse: **http://localhost:5173**

> O backend precisa estar rodando em `http://localhost:3001` (ou altere `vite.config.ts`).

## Build de Produção

```bash
# Gerar build otimizado
npm run build

# Preview local do build
npm run preview
```

Os arquivos ficam em `dist/` — prontos para servir via Nginx, CDN ou qualquer servidor de arquivos estáticos.

## Docker

O projeto inclui um `Dockerfile` multi-stage que gera a imagem de produção com Nginx:

```bash
# Build da imagem
docker build -t bolao-frontend .

# Rodar o container
docker run -p 5173:80 bolao-frontend
```

Ou use o `docker-compose.yml` na raiz do projeto para subir tudo junto.

## Estrutura do Projeto

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Definição de rotas
├── index.css                   # Tailwind base
├── vite-env.d.ts               # Tipos Vite/ImportMeta
├── components/
│   ├── Header.tsx              # Navbar com navegação
│   ├── LanguageSwitcher.tsx    # Seletor de idioma
│   └── Layout.tsx              # Shell (header + content + footer)
├── contexts/
│   └── AuthContext.tsx         # Estado global de autenticação
├── i18n/
│   ├── index.tsx               # Provider e hook useTranslation
│   ├── pt-br.ts                # Traduções português
│   ├── en.ts                   # Traduções inglês
│   ├── es.ts                   # Traduções espanhol
│   └── types.ts                # Interface de tradução
├── pages/
│   ├── LoginPage.tsx           # Login com rate limiter
│   ├── RegisterPage.tsx        # Cadastro com sanitização
│   ├── MatchesPage.tsx         # Jogos + palpites com validação
│   ├── MyPredictionsPage.tsx   # Meus palpites com pontuação
│   ├── LeaderboardPage.tsx     # Ranking dos participantes
│   ├── PoolsPage.tsx           # Gerenciamento de bolões
│   ├── AdminPage.tsx           # Painel admin com validação
│   ├── TeamsPage.tsx           # Seleções divididas por grupo
│   └── RulesPage.tsx           # Regras e pontuação
├── services/
│   └── api.ts                  # HTTP client (fetch + JWT + segurança)
├── test/
│   ├── security.test.ts        # Testes de segurança (42 testes)
│   ├── api.security.test.ts    # Testes do serviço API (6 testes)
│   ├── translations.test.ts    # Testes de i18n
│   ├── LanguageSwitcher.test.tsx
│   ├── i18n.test.tsx
│   └── setup.ts                # Configuração Vitest
├── types/
│   └── index.ts                # Interfaces TypeScript
└── utils/
    ├── security.ts             # Sanitização, validação, rate limiter
    └── flags.ts                # Bandeiras das seleções
```

## Páginas

| Rota             | Descrição                                       |
| ---------------- | ----------------------------------------------- |
| `/login`         | Tela de login                                   |
| `/registro`      | Tela de cadastro                                |
| `/jogos`         | Lista de jogos com campo para palpitar o placar |
| `/meus-palpites` | Tabela de palpites feitos e pontos obtidos      |
| `/classificacao` | Ranking geral dos participantes                 |
| `/selecoes`      | Cards de seleções organizadas por grupo         |
| `/regras`        | Regras do bolão com exemplos de pontuação       |

## Scripts

| Comando           | Ação                                      |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Inicia dev server com hot-reload (5173)   |
| `npm run build`   | Compila TypeScript + gera bundle produção |
| `npm run preview` | Preview local do build em `dist/`         |

## 🔐 Segurança

O frontend implementa validação e proteção em múltiplas camadas:

| Proteção            | Descrição                                                         |
| ------------------- | ----------------------------------------------------------------- |
| Sanitização XSS     | Remove `<>`, `javascript:`, event handlers (`on*=`)               |
| Validação de inputs | Email, nome, scores, pool name, invite code                       |
| Rate Limiter client | Bloqueio de submissões excessivas (auth: 5/60s, palpites: 30/60s) |
| JWT validation      | Formato verificado antes de enviar no Authorization header        |
| Auto-logout (401)   | Remove token e redireciona para `/login`                          |
| Tratamento 429      | Mensagem amigável para rate limiting do servidor                  |

**Arquivo principal:** `src/utils/security.ts`

## 🧪 Testes

```bash
# Rodar todos os testes (66 testes)
npx vitest run

# Watch mode
npx vitest

# Com cobertura
npx vitest run --coverage
```

**Suítes de teste:**

| Arquivo                     | Testes | Descrição                            |
| --------------------------- | ------ | ------------------------------------ |
| `security.test.ts`          | 42     | Sanitização, validação, rate limiter |
| `api.security.test.ts`      | 6      | JWT, 429, 401, headers HTTP          |
| `translations.test.ts`      | 6      | Completude de traduções i18n         |
| `LanguageSwitcher.test.tsx` | 4      | Componente de troca de idioma        |
| `i18n.test.tsx`             | 8      | Integração do sistema i18n           |

## Tecnologias

- **React 18** — UI declarativa com hooks
- **TypeScript** — Tipagem estática
- **Vite** — Build tool ultra-rápida
- **Tailwind CSS** — Estilização utility-first
- **React Router v6** — Roteamento SPA
- **Vitest** — Framework de testes
- **Nginx** — Servidor HTTP em produção (Docker)
