import { Translations } from "./types";

export const es: Translations = {
  // Common
  loading: "Cargando...",
  appTitle: "Copa del Mundo 2026",
  appSubtitle: "Copa del Mundo 2026",

  // Nav
  navRules: "📋 Reglas",
  navDashboard: "📊 Dashboard",
  navMatches: "⚽ Partidos",
  navPredictions: "🎯 Pronósticos",
  navRanking: "🏆 Ranking",
  navGroups: "🌍 Grupos",

  // Header
  hello: "Hola",
  logout: "Salir",

  // Footer
  footerTitle: " Copa del Mundo 2026",
  footerAuthor: "Hecho por Fernando Oliveira — Senior Software Engineer",

  // Login
  loginTitle: "⚽  Copa 2026",
  loginSubtitle: "Inicia sesión para participar",
  loginEmail: "Correo electrónico",
  loginEmailPlaceholder: "tu@email.com",
  loginSubmit: "Entrar",
  loginLoading: "Entrando...",
  loginNoAccount: "¿No tienes cuenta?",
  loginRegister: "Regístrate",
  loginError: "Error al iniciar sesión",

  // Register
  registerTitle: "⚽  Copa 2026",
  registerSubtitle: "Crea tu cuenta",
  registerName: "Nombre",
  registerNamePlaceholder: "Tu nombre",
  registerEmail: "Correo electrónico",
  registerEmailPlaceholder: "tu@email.com",
  registerSubmit: "Crear Cuenta",
  registerLoading: "Registrando...",
  registerHasAccount: "¿Ya tienes cuenta?",
  registerLogin: "Inicia sesión",
  registerError: "Error al registrarse",

  // Matches
  matchesTitle: "Partidos y Pronósticos",
  matchesLoading: "Cargando partidos...",
  matchesEmpty: "Ningún partido registrado aún.",
  matchesPrevious: "← Anterior",
  matchesNext: "Siguiente →",
  matchesWeek: "Semana",
  matchesOf: "de",
  matchesGame: "partido",
  matchesGames: "partidos",
  matchesFinished: "✓ Finalizado",
  matchesLocked: "🔒 Bloqueado",
  matchesSaving: "Guardando...",
  matchesSaved: "✓ ¡Pronóstico guardado!",
  matchesSaveError: "Error al guardar",
  matchesScoreWarning: "⚠️ El marcador debe estar entre 0 y 99",
  matchesToDefine: "Por definir",

  // Stages
  stageGroup: "🏟️ Fase de Grupos",
  stageRoundOf32: "⚔️ Dieciseisavos de Final",
  stageRoundOf16: "⚔️ Octavos de Final",
  stageQuarterFinal: "🔥 Cuartos de Final",
  stageSemiFinal: "🏆 Semifinal",
  stageThirdPlace: "🥉 Tercer Puesto",
  stageFinal: "🏆 Final",

  // Predictions
  predictionsTitle: "🎯 Pronósticos",
  predictionsLoading: "Cargando...",
  predictionsEmpty: "Ningún pronóstico registrado aún.",
  predictionsPredictions: "pronósticos",
  predictionsMatch: "Partido",
  predictionsPrediction: "Pronóstico",
  predictionsResult: "Resultado",
  predictionsStage: "Fase",
  predictionsPoints: "Pts",
  predictionsWaiting: "Pendiente",
  predictionsUnknown: "Desconocido",

  // Leaderboard
  leaderboardTitle: "🏆 Clasificación General",
  leaderboardLoading: "Cargando clasificación...",
  leaderboardEmpty: "Ningún pronóstico registrado aún.",
  leaderboardParticipant: "Participante",
  leaderboardPoints: "Puntos",
  leaderboardPredictions: "Pronósticos",
  leaderboardExactScores: "Marcadores Exactos",
  leaderboardYou: "tú",
  leaderboardAll: "General",
  leaderboardKnockout: "Eliminatoria",
  poolKnockoutOnly: "Solo Eliminatoria",
  poolKnockoutBadge: "Eliminatoria",

  // Teams
  teamsTitle: "🌍 Grupos — Copa 2026",
  teamsLoading: "Cargando grupos...",
  teamsEmpty: "Ninguna selección registrada.",
  teamsGroup: "Grupo",
  teamsTeam: "Selección",
  teamsPlayed: "PJ",
  teamsWins: "G",
  teamsDraws: "E",
  teamsLosses: "P",
  teamsGoalsFor: "GF",
  teamsGoalsAgainst: "GC",
  teamsGoalDiff: "DG",
  teamsPointsAbbr: "PTS",

  // Dashboard
  dashboardTitle: "📊 Dashboard",
  dashboardGoToMatches: "⚽ Ver Partidos y Pronosticar",
  dashboardDetails: "Detalles",
  dashboardSelectUser:
    "Selecciona un participante arriba para ver sus detalles",
  dashboardPlace: "lugar",
  dashboardPredictions: "Pronósticos",
  dashboardPointsStat: "Puntos",
  dashboardPosition: "Posición",
  dashboardExactScores: "Marcadores Exactos",
  dashboardWinnerAndDiff: "Ganador + Diferencia",
  dashboardCorrectWinner: "Ganador Correcto",
  dashboardMissed: "Errados",
  dashboardMostPredicted: "Marcador Más Apostado",
  dashboardEachPts: "pts c/u",
  dashboardTimesBet: "x apostado",
  dashboardPredictionsHiddenNote:
    "Los pronósticos de otros jugadores solo son visibles después de que comience el partido.",

  // Rules
  rulesTitle: "📋 Reglas de la ",
  rulesGoToMatches: "⚽ Ir a los Partidos",
  rulesHowItWorks: "📋 Cómo funciona",
  rulesHowItWorksItems: [
    "Cada participante pronostica el marcador de todos los partidos de la Copa del Mundo 2026.",
    "Los pronósticos deben hacerse <strong>antes del inicio de cada partido</strong>.",
    "Después de cada partido, los puntos se calculan automáticamente.",
    "Puedes cambiar tu pronóstico cuantas veces quieras antes de que comience el partido.",
  ],
  rulesScoringTitle: "🏆 Sistema de Puntuación",
  rulesScoringExactScore: "Marcador exacto",
  rulesScoringWinnerAndDiff: "Ganador + diferencia correcta",
  rulesScoringCorrectWinner: "Solo ganador correcto",
  rulesScoringMissed: "Falló",
  rulesScoringExampleExact: "Pronóstico: 2×1 — Real: 2×1",
  rulesScoringExampleDiff: "Pronóstico: 3×1 — Real: 2×0 (ambos +2)",
  rulesScoringExampleWinner: "Pronóstico: 1×0 — Real: 3×2 (ambos local)",
  rulesScoringExampleMissed: "Pronóstico: 2×0 — Real: 0×1",
  rulesDetailTitle: "📐 Detalle de las Reglas",
  rulesDetailExact:
    "Marcador exacto (10 pts): Acertaste exactamente el número de goles de ambos equipos.",
  rulesDetailWinnerDiff:
    "Ganador + diferencia correcta (7 pts): Acertaste quién ganó (o empate) Y la diferencia de goles es la misma, pero los marcadores no son idénticos.",
  rulesDetailWinner:
    "Ganador correcto (5 pts): Acertaste quién ganó (o que empataron), pero la diferencia de goles es incorrecta.",
  rulesDetailMissed:
    "Falló (0 pts): Erraste el resultado — indicaste un ganador diferente o pronosticaste empate cuando hubo ganador (y viceversa).",
  rulesPhasesTitle: "📅 Fases de la Copa 2026",
  rulesPhasesItems: [
    "<strong>Fase de Grupos:</strong> 48 selecciones divididas en 12 grupos de 4.",
    "<strong>Dieciseisavos de Final:</strong> Los clasificados avanzan a eliminación directa.",
    "<strong>Octavos, Cuartos, Semifinales, Final.</strong>",
  ],
  rulesPhasesNote:
    "Todos los partidos de todas las fases valen pronóstico. La puntuación es la misma independientemente de la fase.",
  rulesGeneralTitle: "⚠️ Reglas Generales",
  rulesGeneralItems: [
    "El pronóstico debe enviarse <strong>antes de la hora de inicio</strong> del partido.",
    "Después del inicio, el pronóstico se bloquea y no puede ser modificado.",
    "En caso de empate en la clasificación, el criterio de desempate es el número de marcadores exactos.",
    "El resultado considerado es el del tiempo reglamentario (90 min + adiciones). Prórroga y penales no alteran el marcador para fines de puntuación.",
  ],

  // Scoring table headers
  rulesResult: "Resultado",
  rulesPoints: "Puntos",
  rulesExample: "Ejemplo",

  // Bracket / Simulator
  navBracket: "🎯 Simulador",
  bracketTitle: "Simulador de Eliminatorias",
  bracketReset: "Resetar",
  bracketInstruction:
    "Haz clic en el equipo ganador o completa los marcadores para avanzar en los brackets.",
  bracketChampion: "¡Campeón!",
  bracketRound32: "16 avos",
  bracketRound16: "Octavos",
  bracketQuarters: "Cuartos",
  bracketSemis: "Semis",
  bracketFinal: "Final",
  bracketWinner: "Ganador",
  bracketPending: "Pendiente",
  bracketTBD: "Por definir",
  bracketSimInfo:
    "Las eliminatorias se simulan en base a tus pronósticos. Ve a Grupos para ver los resultados reales del Admin.",
  bracketNoPredictions:
    "⚠️ Aún no tienes pronósticos para la fase de grupos. ¡Haz tus pronósticos para ver la simulación!",
  bracketGroupStage: "📊 Clasificación de Grupos (Simulación)",
  bracketQualified: "Clasificado directo (1º/2º)",
  bracketThirdPlace: "Posible 3º clasificado",
  bracketHideGroups: "Ocultar Grupos",
  bracketShowGroups: "Ver Grupos",
  bracketLocked: "Resultado oficial (Admin)",

  // Knockout (real results on TeamsPage)
  teamsKnockoutTitle: "⚔️ Eliminatorias",
  teamsKnockoutEmpty: "No hay partidos de eliminatorias definidos aún.",
  teamsKnockoutShowBracket: "Ver Eliminatorias",
  teamsKnockoutHideBracket: "Ocultar Eliminatorias",

  // Admin - Penalties
  adminPenaltyLabel:
    "Empate en tiempo reglamentario — Ingrese resultado de penales",
  adminPenaltyRequired: "Empate en eliminatoria requiere resultado de penales",
  adminPenaltyNoDraw: "El resultado de penales no puede ser empate",
};
