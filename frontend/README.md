# ⚽ Bolão Copa 2026 — Frontend

Interface web do Bolão da Copa do Mundo 2026, construída com React + TypeScript + Vite + Tailwind CSS.

## Pré-requisitos

- **Node.js** 20+
- **npm** 9+

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do frontend (ou defina via CI/CD):

| Variável        | Descrição                | Padrão (dev)               |
|-----------------|--------------------------|----------------------------|
| `VITE_API_URL`  | URL base da API backend  | `/api` (usa proxy do Vite) |

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
│   └── Layout.tsx              # Shell (header + content + footer)
├── contexts/
│   └── AuthContext.tsx         # Estado global de autenticação
├── pages/
│   ├── LoginPage.tsx           # Login
│   ├── RegisterPage.tsx        # Cadastro
│   ├── MatchesPage.tsx         # Lista de jogos + form de palpite
│   ├── MyPredictionsPage.tsx   # Meus palpites com pontuação
│   ├── LeaderboardPage.tsx     # Ranking dos participantes
│   ├── TeamsPage.tsx           # Seleções divididas por grupo
│   └── RulesPage.tsx           # Regras e pontuação
├── services/
│   └── api.ts                  # HTTP client (fetch + JWT)
└── types/
    └── index.ts                # Interfaces TypeScript
```

## Páginas

| Rota               | Descrição                                       |
|--------------------|-------------------------------------------------|
| `/login`           | Tela de login                                   |
| `/registro`        | Tela de cadastro                                |
| `/jogos`           | Lista de jogos com campo para palpitar o placar |
| `/meus-palpites`   | Tabela de palpites feitos e pontos obtidos      |
| `/classificacao`   | Ranking geral dos participantes                 |
| `/selecoes`        | Cards de seleções organizadas por grupo         |
| `/regras`          | Regras do bolão com exemplos de pontuação       |

## Scripts

| Comando          | Ação                                       |
|------------------|--------------------------------------------|
| `npm run dev`    | Inicia dev server com hot-reload (5173)    |
| `npm run build`  | Compila TypeScript + gera bundle produção  |
| `npm run preview`| Preview local do build em `dist/`          |

## Tecnologias

- **React 18** — UI declarativa com hooks
- **TypeScript** — Tipagem estática
- **Vite** — Build tool ultra-rápida
- **Tailwind CSS** — Estilização utility-first
- **React Router v6** — Roteamento SPA
- **Nginx** — Servidor HTTP em produção (Docker)
