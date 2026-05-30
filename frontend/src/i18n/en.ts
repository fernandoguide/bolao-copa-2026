import { Translations } from "./types";

export const en: Translations = {
  // Common
  loading: "Loading...",
  appTitle: "World Cup Pool 2026",
  appSubtitle: "World Cup 2026 Pool",

  // Nav
  navRules: "📋 Rules",
  navDashboard: "📊 Dashboard",
  navMatches: "⚽ Matches",
  navPredictions: "🎯 Predictions",
  navRanking: "🏆 Ranking",
  navGroups: "🌍 Groups",

  // Header
  hello: "Hi",
  logout: "Logout",

  // Footer
  footerTitle: "World Cup 2026 Pool",
  footerAuthor: "Made by Fernando Oliveira — Senior Software Engineer",

  // Login
  loginTitle: "⚽ World Cup Pool 2026",
  loginSubtitle: "Log in to participate",
  loginEmail: "Email",
  loginEmailPlaceholder: "your@email.com",
  loginSubmit: "Log In",
  loginLoading: "Logging in...",
  loginNoAccount: "Don't have an account?",
  loginRegister: "Sign up",
  loginError: "Login failed",

  // Register
  registerTitle: "⚽ World Cup Pool 2026",
  registerSubtitle: "Create your account",
  registerName: "Name",
  registerNamePlaceholder: "Your name",
  registerEmail: "Email",
  registerEmailPlaceholder: "your@email.com",
  registerSubmit: "Create Account",
  registerLoading: "Registering...",
  registerHasAccount: "Already have an account?",
  registerLogin: "Log in",
  registerError: "Registration failed",

  // Matches
  matchesTitle: "Matches & Predictions",
  matchesLoading: "Loading matches...",
  matchesEmpty: "No matches registered yet.",
  matchesPrevious: "← Previous",
  matchesNext: "Next →",
  matchesWeek: "Week",
  matchesOf: "of",
  matchesGame: "match",
  matchesGames: "matches",
  matchesFinished: "✓ Finished",
  matchesLocked: "🔒 Locked",
  matchesSaving: "Saving...",
  matchesSaved: "✓ Prediction saved!",
  matchesSaveError: "Error saving",
  matchesScoreWarning: "⚠️ Score must be between 0 and 99",
  matchesToDefine: "TBD",

  // Stages
  stageGroup: "🏟️ Group Stage",
  stageRoundOf32: "⚔️ Round of 32",
  stageRoundOf16: "⚔️ Round of 16",
  stageQuarterFinal: "🔥 Quarter-finals",
  stageSemiFinal: "🏆 Semi-finals",
  stageThirdPlace: "🥉 Third Place",
  stageFinal: "🏆 Final",

  // Predictions
  predictionsTitle: "🎯 Predictions",
  predictionsLoading: "Loading...",
  predictionsEmpty: "No predictions registered yet.",
  predictionsPredictions: "predictions",
  predictionsMatch: "Match",
  predictionsPrediction: "Prediction",
  predictionsResult: "Result",
  predictionsStage: "Stage",
  predictionsPoints: "Pts",
  predictionsWaiting: "Pending",
  predictionsUnknown: "Unknown",

  // Leaderboard
  leaderboardTitle: "🏆 Leaderboard",
  leaderboardLoading: "Loading leaderboard...",
  leaderboardEmpty: "No predictions registered yet.",
  leaderboardParticipant: "Participant",
  leaderboardPoints: "Points",
  leaderboardPredictions: "Predictions",
  leaderboardExactScores: "Exact Scores",
  leaderboardYou: "you",

  // Teams
  teamsTitle: "🌍 Groups — World Cup 2026",
  teamsLoading: "Loading groups...",
  teamsEmpty: "No teams registered.",
  teamsGroup: "Group",
  teamsTeam: "Team",
  teamsPlayed: "P",
  teamsWins: "W",
  teamsDraws: "D",
  teamsLosses: "L",
  teamsGoalsFor: "GF",
  teamsGoalsAgainst: "GA",
  teamsGoalDiff: "GD",
  teamsPointsAbbr: "PTS",

  // Dashboard
  dashboardTitle: "📊 Dashboard",
  dashboardGoToMatches: "⚽ View Matches & Predict",
  dashboardDetails: "Details",
  dashboardSelectUser: "Select a participant above to view their details",
  dashboardPlace: "place",
  dashboardPredictions: "Predictions",
  dashboardPointsStat: "Points",
  dashboardPosition: "Position",
  dashboardExactScores: "Exact Scores",
  dashboardWinnerAndDiff: "Winner + Goal Diff",
  dashboardCorrectWinner: "Correct Winner",
  dashboardMissed: "Missed",
  dashboardMostPredicted: "Most Predicted Score",
  dashboardEachPts: "pts each",
  dashboardTimesBet: "x predicted",
  dashboardPredictionsHiddenNote:
    "Other players' predictions are only visible after the match starts.",

  // Rules
  rulesTitle: "📋 Pool Rules",
  rulesGoToMatches: "⚽ Go to Matches",
  rulesHowItWorks: "📋 How it works",
  rulesHowItWorksItems: [
    "Each participant predicts the score of every World Cup 2026 match.",
    "Predictions must be made <strong>before each match starts</strong>.",
    "After each match ends, points are calculated automatically.",
    "You can change your prediction as many times as you want before the match starts.",
  ],
  rulesScoringTitle: "🏆 Scoring System",
  rulesScoringExactScore: "Exact score",
  rulesScoringWinnerAndDiff: "Winner + correct goal difference",
  rulesScoringCorrectWinner: "Correct winner only",
  rulesScoringMissed: "Missed",
  rulesScoringExampleExact: "Prediction: 2×1 — Actual: 2×1",
  rulesScoringExampleDiff: "Prediction: 3×1 — Actual: 2×0 (both +2)",
  rulesScoringExampleWinner: "Prediction: 1×0 — Actual: 3×2 (both home team)",
  rulesScoringExampleMissed: "Prediction: 2×0 — Actual: 0×1",
  rulesDetailTitle: "📐 Rule Details",
  rulesDetailExact:
    "Exact score (10 pts): You correctly predicted the exact number of goals for both teams.",
  rulesDetailWinnerDiff:
    "Winner + correct goal difference (7 pts): You predicted the winner (or draw) AND the goal difference is the same, but the scores are not identical.",
  rulesDetailWinner:
    "Correct winner (5 pts): You predicted the winner (or draw), but the goal difference is wrong.",
  rulesDetailMissed:
    "Missed (0 pts): You got the result wrong — you picked a different winner or predicted a draw when there was a winner (and vice versa).",
  rulesPhasesTitle: "📅 World Cup 2026 Stages",
  rulesPhasesItems: [
    "<strong>Group Stage:</strong> 48 teams divided into 12 groups of 4.",
    "<strong>Round of 16 (32 teams):</strong> Qualified teams advance to knockout rounds.",
    "<strong>Round of 16, Quarter-finals, Semi-finals, Final.</strong>",
  ],
  rulesPhasesNote:
    "All matches in all stages count for predictions. Scoring is the same regardless of the stage.",
  rulesGeneralTitle: "⚠️ General Rules",
  rulesGeneralItems: [
    "Predictions must be submitted <strong>before the match start time</strong>.",
    "After kickoff, predictions are locked and cannot be changed.",
    "In case of a tie in the leaderboard, the tiebreaker is the number of exact scores.",
    "The result considered is from regular time (90 min + stoppage time). Extra time and penalties do not change the score for scoring purposes.",
  ],

  // Scoring table headers
  rulesResult: "Result",
  rulesPoints: "Points",
  rulesExample: "Example",
};
