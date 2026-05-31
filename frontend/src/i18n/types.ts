export type Locale = "pt-br" | "es" | "en";

export interface Translations {
  // Common
  loading: string;
  appTitle: string;
  appSubtitle: string;

  // Nav
  navRules: string;
  navDashboard: string;
  navMatches: string;
  navPredictions: string;
  navRanking: string;
  navGroups: string;

  // Header
  hello: string;
  logout: string;

  // Footer
  footerTitle: string;
  footerAuthor: string;

  // Login
  loginTitle: string;
  loginSubtitle: string;
  loginEmail: string;
  loginEmailPlaceholder: string;
  loginSubmit: string;
  loginLoading: string;
  loginNoAccount: string;
  loginRegister: string;
  loginError: string;

  // Register
  registerTitle: string;
  registerSubtitle: string;
  registerName: string;
  registerNamePlaceholder: string;
  registerEmail: string;
  registerEmailPlaceholder: string;
  registerSubmit: string;
  registerLoading: string;
  registerHasAccount: string;
  registerLogin: string;
  registerError: string;

  // Matches
  matchesTitle: string;
  matchesLoading: string;
  matchesEmpty: string;
  matchesPrevious: string;
  matchesNext: string;
  matchesWeek: string;
  matchesOf: string;
  matchesGame: string;
  matchesGames: string;
  matchesFinished: string;
  matchesLocked: string;
  matchesSaving: string;
  matchesSaved: string;
  matchesSaveError: string;
  matchesScoreWarning: string;
  matchesToDefine: string;

  // Stages
  stageGroup: string;
  stageRoundOf32: string;
  stageRoundOf16: string;
  stageQuarterFinal: string;
  stageSemiFinal: string;
  stageThirdPlace: string;
  stageFinal: string;

  // Predictions
  predictionsTitle: string;
  predictionsLoading: string;
  predictionsEmpty: string;
  predictionsPredictions: string;
  predictionsMatch: string;
  predictionsPrediction: string;
  predictionsResult: string;
  predictionsStage: string;
  predictionsPoints: string;
  predictionsWaiting: string;
  predictionsUnknown: string;

  // Leaderboard
  leaderboardTitle: string;
  leaderboardLoading: string;
  leaderboardEmpty: string;
  leaderboardParticipant: string;
  leaderboardPoints: string;
  leaderboardPredictions: string;
  leaderboardExactScores: string;
  leaderboardYou: string;

  // Teams
  teamsTitle: string;
  teamsLoading: string;
  teamsEmpty: string;
  teamsGroup: string;
  teamsTeam: string;
  teamsPlayed: string;
  teamsWins: string;
  teamsDraws: string;
  teamsLosses: string;
  teamsGoalsFor: string;
  teamsGoalsAgainst: string;
  teamsGoalDiff: string;
  teamsPointsAbbr: string;

  // Dashboard
  dashboardTitle: string;
  dashboardGoToMatches: string;
  dashboardDetails: string;
  dashboardSelectUser: string;
  dashboardPlace: string;
  dashboardPredictions: string;
  dashboardPointsStat: string;
  dashboardPosition: string;
  dashboardExactScores: string;
  dashboardWinnerAndDiff: string;
  dashboardCorrectWinner: string;
  dashboardMissed: string;
  dashboardMostPredicted: string;
  dashboardEachPts: string;
  dashboardTimesBet: string;
  dashboardPredictionsHiddenNote: string;

  // Rules
  rulesTitle: string;
  rulesGoToMatches: string;
  rulesHowItWorks: string;
  rulesHowItWorksItems: string[];
  rulesScoringTitle: string;
  rulesScoringExactScore: string;
  rulesScoringWinnerAndDiff: string;
  rulesScoringCorrectWinner: string;
  rulesScoringMissed: string;
  rulesScoringExampleExact: string;
  rulesScoringExampleDiff: string;
  rulesScoringExampleWinner: string;
  rulesScoringExampleMissed: string;
  rulesDetailTitle: string;
  rulesDetailExact: string;
  rulesDetailWinnerDiff: string;
  rulesDetailWinner: string;
  rulesDetailMissed: string;
  rulesPhasesTitle: string;
  rulesPhasesItems: string[];
  rulesPhasesNote: string;
  rulesGeneralTitle: string;
  rulesGeneralItems: string[];

  // Scoring table headers
  rulesResult: string;
  rulesPoints: string;
  rulesExample: string;

  // Bracket
  navBracket: string;
  bracketTitle: string;
  bracketReset: string;
  bracketInstruction: string;
  bracketChampion: string;
  bracketRound32: string;
  bracketRound16: string;
  bracketQuarters: string;
  bracketSemis: string;
  bracketFinal: string;
  bracketWinner: string;
  bracketPending: string;
  bracketTBD: string;
}
