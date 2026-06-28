import { Translations } from "./types";

export const ptBR: Translations = {
  // Common
  loading: "Carregando...",
  appTitle: "Bolão Copa 2026",
  appSubtitle: "Bolão Copa do Mundo 2026",

  // Nav
  navRules: "📋 Regras",
  navDashboard: "📊 Dashboard",
  navMatches: "⚽ Jogos",
  navPredictions: "🎯 Palpites",
  navRanking: "🏆 Ranking",
  navGroups: "🌍 Grupos",

  // Header
  hello: "Olá",
  logout: "Sair",

  // Footer
  footerTitle: "Bolão Copa do Mundo 2026",
  footerAuthor: "Feito por Fernando Oliveira — Senior Software Engineer",

  // Login
  loginTitle: "⚽ Bolão Copa 2026",
  loginSubtitle: "Faça login para participar",
  loginEmail: "Email",
  loginEmailPlaceholder: "seu@email.com",
  loginSubmit: "Entrar",
  loginLoading: "Entrando...",
  loginNoAccount: "Não tem conta?",
  loginRegister: "Cadastre-se",
  loginError: "Erro ao fazer login",

  // Register
  registerTitle: "⚽ Bolão Copa 2026",
  registerSubtitle: "Crie sua conta",
  registerName: "Nome",
  registerNamePlaceholder: "Seu nome",
  registerEmail: "Email",
  registerEmailPlaceholder: "seu@email.com",
  registerSubmit: "Criar Conta",
  registerLoading: "Cadastrando...",
  registerHasAccount: "Já tem conta?",
  registerLogin: "Faça login",
  registerError: "Erro ao cadastrar",

  // Matches
  matchesTitle: "Jogos & Palpites",
  matchesLoading: "Carregando jogos...",
  matchesEmpty: "Nenhum jogo cadastrado ainda.",
  matchesPrevious: "← Anterior",
  matchesNext: "Próxima →",
  matchesWeek: "Semana",
  matchesOf: "de",
  matchesGame: "jogo",
  matchesGames: "jogos",
  matchesFinished: "✓ Encerrado",
  matchesLocked: "🔒 Bloqueado",
  matchesSaving: "Salvando...",
  matchesSaved: "✓ Palpite salvo!",
  matchesSaveError: "Erro ao salvar",
  matchesScoreWarning: "⚠️ Placar deve ser entre 0 e 99",
  matchesToDefine: "A definir",

  // Stages
  stageGroup: "🏟️ Fase de Grupos",
  stageRoundOf32: "⚔️ 16 avos de Final",
  stageRoundOf16: "⚔️ Oitavas de Final",
  stageQuarterFinal: "🔥 Quartas de Final",
  stageSemiFinal: "🏆 Semifinal",
  stageThirdPlace: "🥉 Disputa 3º Lugar",
  stageFinal: "🏆 Final",

  // Predictions
  predictionsTitle: "🎯 Palpites",
  predictionsLoading: "Carregando...",
  predictionsEmpty: "Nenhum palpite registrado ainda.",
  predictionsPredictions: "palpites",
  predictionsMatch: "Partida",
  predictionsPrediction: "Palpite",
  predictionsResult: "Resultado",
  predictionsStage: "Fase",
  predictionsPoints: "Pts",
  predictionsWaiting: "Aguardando",
  predictionsUnknown: "Desconhecido",

  // Leaderboard
  leaderboardTitle: "🏆 Classificação Geral",
  leaderboardLoading: "Carregando classificação...",
  leaderboardEmpty: "Nenhum palpite registrado ainda.",
  leaderboardParticipant: "Participante",
  leaderboardPoints: "Pontos",
  leaderboardPredictions: "Palpites",
  leaderboardExactScores: "Placares Exatos",
  leaderboardYou: "você",

  // Teams
  teamsTitle: "🌍 Grupos — Copa 2026",
  teamsLoading: "Carregando grupos...",
  teamsEmpty: "Nenhuma seleção cadastrada.",
  teamsGroup: "Grupo",
  teamsTeam: "Seleção",
  teamsPlayed: "J",
  teamsWins: "V",
  teamsDraws: "E",
  teamsLosses: "D",
  teamsGoalsFor: "GP",
  teamsGoalsAgainst: "GC",
  teamsGoalDiff: "SG",
  teamsPointsAbbr: "PTS",

  // Dashboard
  dashboardTitle: "📊 Dashboard",
  dashboardGoToMatches: "⚽ Ver Jogos e Palpitar",
  dashboardDetails: "Detalhes",
  dashboardSelectUser: "Selecione um participante acima para ver seus detalhes",
  dashboardPlace: "lugar",
  dashboardPredictions: "Palpites",
  dashboardPointsStat: "Pontos",
  dashboardPosition: "Posição",
  dashboardExactScores: "Placares Exatos",
  dashboardWinnerAndDiff: "Vencedor + Saldo",
  dashboardCorrectWinner: "Vencedor Correto",
  dashboardMissed: "Errados",
  dashboardMostPredicted: "Placar Mais Apostado",
  dashboardEachPts: "pts cada",
  dashboardTimesBet: "x apostado",
  dashboardPredictionsHiddenNote:
    "Os palpites dos outros jogadores só ficam visíveis após o jogo começar.",

  // Rules
  rulesTitle: "📋 Regras do Bolão",
  rulesGoToMatches: "⚽ Ir para os Jogos",
  rulesHowItWorks: "📋 Como funciona",
  rulesHowItWorksItems: [
    "Cada participante palpita o placar de todas as partidas da Copa do Mundo 2026.",
    "Os palpites devem ser feitos <strong>antes do início de cada partida</strong>.",
    "Após o fim de cada jogo, os pontos são calculados automaticamente.",
    "Você pode alterar seu palpite quantas vezes quiser antes do jogo começar.",
  ],
  rulesScoringTitle: "🏆 Sistema de Pontuação",
  rulesScoringExactScore: "Placar exato",
  rulesScoringWinnerAndDiff: "Vencedor + saldo correto",
  rulesScoringCorrectWinner: "Apenas vencedor correto",
  rulesScoringMissed: "Errou",
  rulesScoringExampleExact: "Palpite: 2×1 — Real: 2×1",
  rulesScoringExampleDiff: "Palpite: 3×1 — Real: 2×0 (ambos +2)",
  rulesScoringExampleWinner: "Palpite: 1×0 — Real: 3×2 (ambos mandante)",
  rulesScoringExampleMissed: "Palpite: 2×0 — Real: 0×1",
  rulesDetailTitle: "📐 Detalhamento das Regras",
  rulesDetailExact:
    "Placar exato (10 pts): Você acertou exatamente o número de gols de ambas as equipes.",
  rulesDetailWinnerDiff:
    "Vencedor + saldo correto (7 pts): Você acertou quem venceu (ou empate) E a diferença de gols é a mesma, mas os placares não são idênticos.",
  rulesDetailWinner:
    "Vencedor correto (5 pts): Você acertou quem venceu (ou que empatou), mas a diferença de gols está errada.",
  rulesDetailMissed:
    "Errou (0 pts): Você errou o resultado — apontou vencedor diferente ou palpitou empate quando houve vencedor (e vice-versa).",
  rulesPhasesTitle: "📅 Fases da Copa 2026",
  rulesPhasesItems: [
    "<strong>Fase de Grupos:</strong> 48 seleções divididas em 12 grupos de 4.",
    "<strong>16 avos de Final:</strong> Classificados avançam para o mata-mata.",
    "<strong>Oitavas, Quartas, Semifinais, Final.</strong>",
  ],
  rulesPhasesNote:
    "Todos os jogos de todas as fases valem palpite. A pontuação é a mesma independente da fase.",
  rulesGeneralTitle: "⚠️ Regras Gerais",
  rulesGeneralItems: [
    "O palpite deve ser enviado <strong>antes do horário de início</strong> da partida.",
    "Após o início, o palpite é bloqueado e não pode mais ser alterado.",
    "Em caso de empate na classificação, o critério de desempate é o número de placares exatos.",
    "O resultado considerado é o do tempo regulamentar (90 min + acréscimos). Prorrogação e pênaltis não alteram o placar para fins de pontuação.",
  ],

  // Scoring table headers
  rulesResult: "Resultado",
  rulesPoints: "Pontos",
  rulesExample: "Exemplo",

  // Bracket / Simulator
  navBracket: "🎯 Simulador",
  bracketTitle: "Simulador de Mata-mata",
  bracketReset: "Resetar",
  bracketInstruction:
    "Clique no time vencedor ou preencha os placares para avançar nas brackets.",
  bracketChampion: "Campeão!",
  bracketRound32: "16 avos",
  bracketRound16: "Oitavas",
  bracketQuarters: "Quartas",
  bracketSemis: "Semis",
  bracketFinal: "Final",
  bracketWinner: "Vencedor",
  bracketPending: "Pendente",
  bracketTBD: "A definir",
  bracketSimInfo:
    "O mata-mata é simulado com base nos seus palpites. Vá em Grupos para ver os resultados reais do Admin.",
  bracketNoPredictions:
    "⚠️ Você ainda não tem palpites na fase de grupos. Faça seus palpites para ver a simulação!",
  bracketGroupStage: "📊 Classificação dos Grupos (Simulação)",
  bracketQualified: "Classificado direto (1º/2º)",
  bracketThirdPlace: "Possível 3º classificado",
  bracketHideGroups: "Esconder Grupos",
  bracketShowGroups: "Ver Grupos",
  bracketLocked: "Resultado oficial (Admin)",

  // Knockout (real results on TeamsPage)
  teamsKnockoutTitle: "⚔️ Mata-mata",
  teamsKnockoutEmpty: "Nenhum jogo do mata-mata definido ainda.",
  teamsKnockoutShowBracket: "Ver Mata-mata",
  teamsKnockoutHideBracket: "Esconder Mata-mata",

  // Admin - Penalties
  adminPenaltyLabel:
    "Empate no tempo regulamentar — Informe o resultado dos pênaltis",
  adminPenaltyRequired:
    "Jogo empatado no mata-mata requer resultado dos pênaltis",
  adminPenaltyNoDraw: "Resultado dos pênaltis não pode ser empate",
};
