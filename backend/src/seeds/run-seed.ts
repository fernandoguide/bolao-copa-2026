import { DataSource } from "typeorm";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const dataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [path.join(__dirname, "..", "**", "*.entity.{ts,js}")],
  migrations: [path.join(__dirname, "..", "migrations", "*.{ts,js}")],
  migrationsRun: true,
  synchronize: false,
});

/**
 * 48 seleções da Copa do Mundo 2026
 * Fonte: https://github.com/openfootball/worldcup.json
 */
const teams = [
  // Grupo A
  { name: "México", code: "MEX", group: "A" },
  { name: "África do Sul", code: "RSA", group: "A" },
  { name: "Coreia do Sul", code: "KOR", group: "A" },
  { name: "República Tcheca", code: "CZE", group: "A" },
  // Grupo B
  { name: "Canadá", code: "CAN", group: "B" },
  { name: "Bósnia e Herzegovina", code: "BIH", group: "B" },
  { name: "Catar", code: "QAT", group: "B" },
  { name: "Suíça", code: "SUI", group: "B" },
  // Grupo C
  { name: "Brasil", code: "BRA", group: "C" },
  { name: "Marrocos", code: "MAR", group: "C" },
  { name: "Haiti", code: "HAI", group: "C" },
  { name: "Escócia", code: "SCO", group: "C" },
  // Grupo D
  { name: "Estados Unidos", code: "USA", group: "D" },
  { name: "Paraguai", code: "PAR", group: "D" },
  { name: "Austrália", code: "AUS", group: "D" },
  { name: "Turquia", code: "TUR", group: "D" },
  // Grupo E
  { name: "Alemanha", code: "GER", group: "E" },
  { name: "Curaçao", code: "CUW", group: "E" },
  { name: "Costa do Marfim", code: "CIV", group: "E" },
  { name: "Equador", code: "ECU", group: "E" },
  // Grupo F
  { name: "Holanda", code: "NED", group: "F" },
  { name: "Japão", code: "JPN", group: "F" },
  { name: "Suécia", code: "SWE", group: "F" },
  { name: "Tunísia", code: "TUN", group: "F" },
  // Grupo G
  { name: "Bélgica", code: "BEL", group: "G" },
  { name: "Egito", code: "EGY", group: "G" },
  { name: "Irã", code: "IRN", group: "G" },
  { name: "Nova Zelândia", code: "NZL", group: "G" },
  // Grupo H
  { name: "Espanha", code: "ESP", group: "H" },
  { name: "Cabo Verde", code: "CPV", group: "H" },
  { name: "Arábia Saudita", code: "KSA", group: "H" },
  { name: "Uruguai", code: "URU", group: "H" },
  // Grupo I
  { name: "França", code: "FRA", group: "I" },
  { name: "Senegal", code: "SEN", group: "I" },
  { name: "Iraque", code: "IRQ", group: "I" },
  { name: "Noruega", code: "NOR", group: "I" },
  // Grupo J
  { name: "Argentina", code: "ARG", group: "J" },
  { name: "Argélia", code: "ALG", group: "J" },
  { name: "Áustria", code: "AUT", group: "J" },
  { name: "Jordânia", code: "JOR", group: "J" },
  // Grupo K
  { name: "Portugal", code: "POR", group: "K" },
  { name: "RD Congo", code: "COD", group: "K" },
  { name: "Uzbequistão", code: "UZB", group: "K" },
  { name: "Colômbia", code: "COL", group: "K" },
  // Grupo L
  { name: "Inglaterra", code: "ENG", group: "L" },
  { name: "Croácia", code: "CRO", group: "L" },
  { name: "Gana", code: "GHA", group: "L" },
  { name: "Panamá", code: "PAN", group: "L" },
];

/** Mapa nome (JSON) → código */
const nameToCode: Record<string, string> = {
  Mexico: "MEX",
  "South Africa": "RSA",
  "South Korea": "KOR",
  "Czech Republic": "CZE",
  Canada: "CAN",
  "Bosnia & Herzegovina": "BIH",
  Qatar: "QAT",
  Switzerland: "SUI",
  Brazil: "BRA",
  Morocco: "MAR",
  Haiti: "HAI",
  Scotland: "SCO",
  USA: "USA",
  Paraguay: "PAR",
  Australia: "AUS",
  Turkey: "TUR",
  Germany: "GER",
  Curaçao: "CUW",
  "Ivory Coast": "CIV",
  Ecuador: "ECU",
  Netherlands: "NED",
  Japan: "JPN",
  Sweden: "SWE",
  Tunisia: "TUN",
  Belgium: "BEL",
  Egypt: "EGY",
  Iran: "IRN",
  "New Zealand": "NZL",
  Spain: "ESP",
  "Cape Verde": "CPV",
  "Saudi Arabia": "KSA",
  Uruguay: "URU",
  France: "FRA",
  Senegal: "SEN",
  Iraq: "IRQ",
  Norway: "NOR",
  Argentina: "ARG",
  Algeria: "ALG",
  Austria: "AUT",
  Jordan: "JOR",
  Portugal: "POR",
  "DR Congo": "COD",
  Uzbekistan: "UZB",
  Colombia: "COL",
  England: "ENG",
  Croatia: "CRO",
  Ghana: "GHA",
  Panama: "PAN",
};

/**
 * Converte "HH:MM UTC±N" + data → timestamp em horário de São Paulo (UTC-3)
 */
function parseMatchDate(dateStr: string, timeStr: string): Date {
  const m = timeStr.match(/^(\d{2}):(\d{2})\s+UTC([+-]\d+)$/);
  if (!m) throw new Error(`Formato de hora inválido: ${timeStr}`);

  const hours = parseInt(m[1], 10);
  const minutes = parseInt(m[2], 10);
  const offset = parseInt(m[3], 10);

  // local → UTC → São Paulo (UTC-3)
  const utcHours = hours - offset;
  const spHours = utcHours - 3;

  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, spHours, minutes, 0);
}

type Stage =
  | "group"
  | "round_of_32"
  | "round_of_16"
  | "quarter_final"
  | "semi_final"
  | "third_place"
  | "final";

function roundToStage(round: string): Stage {
  if (round.startsWith("Matchday")) return "group";
  if (round === "Round of 32") return "round_of_32";
  if (round === "Round of 16") return "round_of_16";
  if (round === "Quarter-final") return "quarter_final";
  if (round === "Semi-final") return "semi_final";
  if (round === "Match for third place") return "third_place";
  if (round === "Final") return "final";
  return "group";
}

/**
 * Todos os 104 jogos da Copa 2026
 * Fonte: https://github.com/openfootball/worldcup.json/blob/master/2026/worldcup.json
 */
const matchesData = [
  // ===== GRUPO A =====
  {
    round: "Matchday 1",
    date: "2026-06-11",
    time: "13:00 UTC-6",
    team1: "Mexico",
    team2: "South Africa",
  },
  {
    round: "Matchday 1",
    date: "2026-06-11",
    time: "20:00 UTC-6",
    team1: "South Korea",
    team2: "Czech Republic",
  },
  {
    round: "Matchday 8",
    date: "2026-06-18",
    time: "12:00 UTC-4",
    team1: "Czech Republic",
    team2: "South Africa",
  },
  {
    round: "Matchday 8",
    date: "2026-06-18",
    time: "19:00 UTC-6",
    team1: "Mexico",
    team2: "South Korea",
  },
  {
    round: "Matchday 14",
    date: "2026-06-24",
    time: "19:00 UTC-6",
    team1: "Czech Republic",
    team2: "Mexico",
  },
  {
    round: "Matchday 14",
    date: "2026-06-24",
    time: "19:00 UTC-6",
    team1: "South Africa",
    team2: "South Korea",
  },
  // ===== GRUPO B =====
  {
    round: "Matchday 2",
    date: "2026-06-12",
    time: "15:00 UTC-4",
    team1: "Canada",
    team2: "Bosnia & Herzegovina",
  },
  {
    round: "Matchday 3",
    date: "2026-06-13",
    time: "12:00 UTC-7",
    team1: "Qatar",
    team2: "Switzerland",
  },
  {
    round: "Matchday 8",
    date: "2026-06-18",
    time: "12:00 UTC-7",
    team1: "Switzerland",
    team2: "Bosnia & Herzegovina",
  },
  {
    round: "Matchday 8",
    date: "2026-06-18",
    time: "15:00 UTC-7",
    team1: "Canada",
    team2: "Qatar",
  },
  {
    round: "Matchday 14",
    date: "2026-06-24",
    time: "12:00 UTC-7",
    team1: "Switzerland",
    team2: "Canada",
  },
  {
    round: "Matchday 14",
    date: "2026-06-24",
    time: "12:00 UTC-7",
    team1: "Bosnia & Herzegovina",
    team2: "Qatar",
  },
  // ===== GRUPO C =====
  {
    round: "Matchday 3",
    date: "2026-06-13",
    time: "18:00 UTC-4",
    team1: "Brazil",
    team2: "Morocco",
  },
  {
    round: "Matchday 3",
    date: "2026-06-13",
    time: "21:00 UTC-4",
    team1: "Haiti",
    team2: "Scotland",
  },
  {
    round: "Matchday 9",
    date: "2026-06-19",
    time: "18:00 UTC-4",
    team1: "Scotland",
    team2: "Morocco",
  },
  {
    round: "Matchday 9",
    date: "2026-06-19",
    time: "20:30 UTC-4",
    team1: "Brazil",
    team2: "Haiti",
  },
  {
    round: "Matchday 14",
    date: "2026-06-24",
    time: "18:00 UTC-4",
    team1: "Scotland",
    team2: "Brazil",
  },
  {
    round: "Matchday 14",
    date: "2026-06-24",
    time: "18:00 UTC-4",
    team1: "Morocco",
    team2: "Haiti",
  },
  // ===== GRUPO D =====
  {
    round: "Matchday 2",
    date: "2026-06-12",
    time: "18:00 UTC-7",
    team1: "USA",
    team2: "Paraguay",
  },
  {
    round: "Matchday 3",
    date: "2026-06-13",
    time: "21:00 UTC-7",
    team1: "Australia",
    team2: "Turkey",
  },
  {
    round: "Matchday 9",
    date: "2026-06-19",
    time: "12:00 UTC-7",
    team1: "USA",
    team2: "Australia",
  },
  {
    round: "Matchday 9",
    date: "2026-06-19",
    time: "20:00 UTC-7",
    team1: "Turkey",
    team2: "Paraguay",
  },
  {
    round: "Matchday 15",
    date: "2026-06-25",
    time: "19:00 UTC-7",
    team1: "Turkey",
    team2: "USA",
  },
  {
    round: "Matchday 15",
    date: "2026-06-25",
    time: "19:00 UTC-7",
    team1: "Paraguay",
    team2: "Australia",
  },
  // ===== GRUPO E =====
  {
    round: "Matchday 4",
    date: "2026-06-14",
    time: "12:00 UTC-5",
    team1: "Germany",
    team2: "Curaçao",
  },
  {
    round: "Matchday 4",
    date: "2026-06-14",
    time: "19:00 UTC-4",
    team1: "Ivory Coast",
    team2: "Ecuador",
  },
  {
    round: "Matchday 10",
    date: "2026-06-20",
    time: "16:00 UTC-4",
    team1: "Germany",
    team2: "Ivory Coast",
  },
  {
    round: "Matchday 10",
    date: "2026-06-20",
    time: "19:00 UTC-5",
    team1: "Ecuador",
    team2: "Curaçao",
  },
  {
    round: "Matchday 15",
    date: "2026-06-25",
    time: "16:00 UTC-4",
    team1: "Curaçao",
    team2: "Ivory Coast",
  },
  {
    round: "Matchday 15",
    date: "2026-06-25",
    time: "16:00 UTC-4",
    team1: "Ecuador",
    team2: "Germany",
  },
  // ===== GRUPO F =====
  {
    round: "Matchday 4",
    date: "2026-06-14",
    time: "15:00 UTC-5",
    team1: "Netherlands",
    team2: "Japan",
  },
  {
    round: "Matchday 4",
    date: "2026-06-14",
    time: "20:00 UTC-6",
    team1: "Sweden",
    team2: "Tunisia",
  },
  {
    round: "Matchday 10",
    date: "2026-06-20",
    time: "12:00 UTC-5",
    team1: "Netherlands",
    team2: "Sweden",
  },
  {
    round: "Matchday 10",
    date: "2026-06-20",
    time: "22:00 UTC-6",
    team1: "Tunisia",
    team2: "Japan",
  },
  {
    round: "Matchday 15",
    date: "2026-06-25",
    time: "18:00 UTC-5",
    team1: "Japan",
    team2: "Sweden",
  },
  {
    round: "Matchday 15",
    date: "2026-06-25",
    time: "18:00 UTC-5",
    team1: "Tunisia",
    team2: "Netherlands",
  },
  // ===== GRUPO G =====
  {
    round: "Matchday 5",
    date: "2026-06-15",
    time: "12:00 UTC-7",
    team1: "Belgium",
    team2: "Egypt",
  },
  {
    round: "Matchday 5",
    date: "2026-06-15",
    time: "18:00 UTC-7",
    team1: "Iran",
    team2: "New Zealand",
  },
  {
    round: "Matchday 11",
    date: "2026-06-21",
    time: "12:00 UTC-7",
    team1: "Belgium",
    team2: "Iran",
  },
  {
    round: "Matchday 11",
    date: "2026-06-21",
    time: "18:00 UTC-7",
    team1: "New Zealand",
    team2: "Egypt",
  },
  {
    round: "Matchday 16",
    date: "2026-06-26",
    time: "20:00 UTC-7",
    team1: "Egypt",
    team2: "Iran",
  },
  {
    round: "Matchday 16",
    date: "2026-06-26",
    time: "20:00 UTC-7",
    team1: "New Zealand",
    team2: "Belgium",
  },
  // ===== GRUPO H =====
  {
    round: "Matchday 5",
    date: "2026-06-15",
    time: "12:00 UTC-4",
    team1: "Spain",
    team2: "Cape Verde",
  },
  {
    round: "Matchday 5",
    date: "2026-06-15",
    time: "18:00 UTC-4",
    team1: "Saudi Arabia",
    team2: "Uruguay",
  },
  {
    round: "Matchday 11",
    date: "2026-06-21",
    time: "12:00 UTC-4",
    team1: "Spain",
    team2: "Saudi Arabia",
  },
  {
    round: "Matchday 11",
    date: "2026-06-21",
    time: "18:00 UTC-4",
    team1: "Uruguay",
    team2: "Cape Verde",
  },
  {
    round: "Matchday 16",
    date: "2026-06-26",
    time: "19:00 UTC-5",
    team1: "Cape Verde",
    team2: "Saudi Arabia",
  },
  {
    round: "Matchday 16",
    date: "2026-06-26",
    time: "18:00 UTC-6",
    team1: "Uruguay",
    team2: "Spain",
  },
  // ===== GRUPO I =====
  {
    round: "Matchday 6",
    date: "2026-06-16",
    time: "15:00 UTC-4",
    team1: "France",
    team2: "Senegal",
  },
  {
    round: "Matchday 6",
    date: "2026-06-16",
    time: "18:00 UTC-4",
    team1: "Iraq",
    team2: "Norway",
  },
  {
    round: "Matchday 12",
    date: "2026-06-22",
    time: "17:00 UTC-4",
    team1: "France",
    team2: "Iraq",
  },
  {
    round: "Matchday 12",
    date: "2026-06-22",
    time: "20:00 UTC-4",
    team1: "Norway",
    team2: "Senegal",
  },
  {
    round: "Matchday 16",
    date: "2026-06-26",
    time: "15:00 UTC-4",
    team1: "Norway",
    team2: "France",
  },
  {
    round: "Matchday 16",
    date: "2026-06-26",
    time: "15:00 UTC-4",
    team1: "Senegal",
    team2: "Iraq",
  },
  // ===== GRUPO J =====
  {
    round: "Matchday 6",
    date: "2026-06-16",
    time: "20:00 UTC-5",
    team1: "Argentina",
    team2: "Algeria",
  },
  {
    round: "Matchday 6",
    date: "2026-06-16",
    time: "21:00 UTC-7",
    team1: "Austria",
    team2: "Jordan",
  },
  {
    round: "Matchday 12",
    date: "2026-06-22",
    time: "12:00 UTC-5",
    team1: "Argentina",
    team2: "Austria",
  },
  {
    round: "Matchday 12",
    date: "2026-06-22",
    time: "20:00 UTC-7",
    team1: "Jordan",
    team2: "Algeria",
  },
  {
    round: "Matchday 17",
    date: "2026-06-27",
    time: "21:00 UTC-5",
    team1: "Algeria",
    team2: "Austria",
  },
  {
    round: "Matchday 17",
    date: "2026-06-27",
    time: "21:00 UTC-5",
    team1: "Jordan",
    team2: "Argentina",
  },
  // ===== GRUPO K =====
  {
    round: "Matchday 7",
    date: "2026-06-17",
    time: "12:00 UTC-5",
    team1: "Portugal",
    team2: "DR Congo",
  },
  {
    round: "Matchday 7",
    date: "2026-06-17",
    time: "20:00 UTC-6",
    team1: "Uzbekistan",
    team2: "Colombia",
  },
  {
    round: "Matchday 13",
    date: "2026-06-23",
    time: "12:00 UTC-5",
    team1: "Portugal",
    team2: "Uzbekistan",
  },
  {
    round: "Matchday 13",
    date: "2026-06-23",
    time: "20:00 UTC-6",
    team1: "Colombia",
    team2: "DR Congo",
  },
  {
    round: "Matchday 17",
    date: "2026-06-27",
    time: "19:30 UTC-4",
    team1: "Colombia",
    team2: "Portugal",
  },
  {
    round: "Matchday 17",
    date: "2026-06-27",
    time: "19:30 UTC-4",
    team1: "DR Congo",
    team2: "Uzbekistan",
  },
  // ===== GRUPO L =====
  {
    round: "Matchday 7",
    date: "2026-06-17",
    time: "15:00 UTC-5",
    team1: "England",
    team2: "Croatia",
  },
  {
    round: "Matchday 7",
    date: "2026-06-17",
    time: "19:00 UTC-4",
    team1: "Ghana",
    team2: "Panama",
  },
  {
    round: "Matchday 13",
    date: "2026-06-23",
    time: "16:00 UTC-4",
    team1: "England",
    team2: "Ghana",
  },
  {
    round: "Matchday 13",
    date: "2026-06-23",
    time: "19:00 UTC-4",
    team1: "Panama",
    team2: "Croatia",
  },
  {
    round: "Matchday 17",
    date: "2026-06-27",
    time: "17:00 UTC-4",
    team1: "Panama",
    team2: "England",
  },
  {
    round: "Matchday 17",
    date: "2026-06-27",
    time: "17:00 UTC-4",
    team1: "Croatia",
    team2: "Ghana",
  },
  // ===== ROUND OF 32 =====
  {
    round: "Round of 32",
    date: "2026-06-28",
    time: "12:00 UTC-7",
    team1: "2A",
    team2: "2B",
    label: "Jogo 73",
  },
  {
    round: "Round of 32",
    date: "2026-06-29",
    time: "16:30 UTC-4",
    team1: "1E",
    team2: "3°",
    label: "Jogo 74",
  },
  {
    round: "Round of 32",
    date: "2026-06-29",
    time: "19:00 UTC-6",
    team1: "1F",
    team2: "2C",
    label: "Jogo 75",
  },
  {
    round: "Round of 32",
    date: "2026-06-29",
    time: "12:00 UTC-5",
    team1: "1C",
    team2: "2F",
    label: "Jogo 76",
  },
  {
    round: "Round of 32",
    date: "2026-06-30",
    time: "17:00 UTC-4",
    team1: "1I",
    team2: "3°",
    label: "Jogo 77",
  },
  {
    round: "Round of 32",
    date: "2026-06-30",
    time: "12:00 UTC-5",
    team1: "2E",
    team2: "2I",
    label: "Jogo 78",
  },
  {
    round: "Round of 32",
    date: "2026-06-30",
    time: "19:00 UTC-6",
    team1: "1A",
    team2: "3°",
    label: "Jogo 79",
  },
  {
    round: "Round of 32",
    date: "2026-07-01",
    time: "12:00 UTC-4",
    team1: "1L",
    team2: "3°",
    label: "Jogo 80",
  },
  {
    round: "Round of 32",
    date: "2026-07-01",
    time: "17:00 UTC-7",
    team1: "1D",
    team2: "3°",
    label: "Jogo 81",
  },
  {
    round: "Round of 32",
    date: "2026-07-01",
    time: "13:00 UTC-7",
    team1: "1G",
    team2: "3°",
    label: "Jogo 82",
  },
  {
    round: "Round of 32",
    date: "2026-07-02",
    time: "19:00 UTC-4",
    team1: "2K",
    team2: "2L",
    label: "Jogo 83",
  },
  {
    round: "Round of 32",
    date: "2026-07-02",
    time: "12:00 UTC-7",
    team1: "1H",
    team2: "2J",
    label: "Jogo 84",
  },
  {
    round: "Round of 32",
    date: "2026-07-02",
    time: "20:00 UTC-7",
    team1: "1B",
    team2: "3°",
    label: "Jogo 85",
  },
  {
    round: "Round of 32",
    date: "2026-07-03",
    time: "18:00 UTC-4",
    team1: "1J",
    team2: "2H",
    label: "Jogo 86",
  },
  {
    round: "Round of 32",
    date: "2026-07-03",
    time: "20:30 UTC-5",
    team1: "1K",
    team2: "3°",
    label: "Jogo 87",
  },
  {
    round: "Round of 32",
    date: "2026-07-03",
    time: "13:00 UTC-5",
    team1: "2D",
    team2: "2G",
    label: "Jogo 88",
  },
  // ===== ROUND OF 16 =====
  {
    round: "Round of 16",
    date: "2026-07-04",
    time: "17:00 UTC-4",
    team1: "V74",
    team2: "V77",
    label: "Jogo 89",
  },
  {
    round: "Round of 16",
    date: "2026-07-04",
    time: "12:00 UTC-5",
    team1: "V73",
    team2: "V75",
    label: "Jogo 90",
  },
  {
    round: "Round of 16",
    date: "2026-07-05",
    time: "16:00 UTC-4",
    team1: "V76",
    team2: "V78",
    label: "Jogo 91",
  },
  {
    round: "Round of 16",
    date: "2026-07-05",
    time: "18:00 UTC-6",
    team1: "V79",
    team2: "V80",
    label: "Jogo 92",
  },
  {
    round: "Round of 16",
    date: "2026-07-06",
    time: "14:00 UTC-5",
    team1: "V83",
    team2: "V84",
    label: "Jogo 93",
  },
  {
    round: "Round of 16",
    date: "2026-07-06",
    time: "17:00 UTC-7",
    team1: "V81",
    team2: "V82",
    label: "Jogo 94",
  },
  {
    round: "Round of 16",
    date: "2026-07-07",
    time: "12:00 UTC-4",
    team1: "V86",
    team2: "V88",
    label: "Jogo 95",
  },
  {
    round: "Round of 16",
    date: "2026-07-07",
    time: "13:00 UTC-7",
    team1: "V85",
    team2: "V87",
    label: "Jogo 96",
  },
  // ===== QUARTAS DE FINAL =====
  {
    round: "Quarter-final",
    date: "2026-07-09",
    time: "16:00 UTC-4",
    team1: "V89",
    team2: "V90",
    label: "Jogo 97",
  },
  {
    round: "Quarter-final",
    date: "2026-07-10",
    time: "12:00 UTC-7",
    team1: "V93",
    team2: "V94",
    label: "Jogo 98",
  },
  {
    round: "Quarter-final",
    date: "2026-07-11",
    time: "17:00 UTC-4",
    team1: "V91",
    team2: "V92",
    label: "Jogo 99",
  },
  {
    round: "Quarter-final",
    date: "2026-07-11",
    time: "20:00 UTC-5",
    team1: "V95",
    team2: "V96",
    label: "Jogo 100",
  },
  // ===== SEMIFINAIS =====
  {
    round: "Semi-final",
    date: "2026-07-14",
    time: "14:00 UTC-5",
    team1: "V97",
    team2: "V98",
    label: "Jogo 101",
  },
  {
    round: "Semi-final",
    date: "2026-07-15",
    time: "15:00 UTC-4",
    team1: "V99",
    team2: "V100",
    label: "Jogo 102",
  },
  // ===== 3º LUGAR =====
  {
    round: "Match for third place",
    date: "2026-07-18",
    time: "17:00 UTC-4",
    team1: "P101",
    team2: "P102",
    label: "3º lugar",
  },
  // ===== FINAL =====
  {
    round: "Final",
    date: "2026-07-19",
    time: "15:00 UTC-4",
    team1: "V101",
    team2: "V102",
    label: "Final",
  },
];

async function seed() {
  await dataSource.initialize();
  console.log("🌱 Conectado ao banco de dados");

  // 1. Seed das seleções
  const teamRepo = dataSource.getRepository("Team");
  const teamMap: Record<string, number> = {};

  console.log("\n📋 Populando 48 seleções...");
  for (const team of teams) {
    let entity = await teamRepo.findOne({ where: { code: team.code } });
    if (!entity) {
      entity = await teamRepo.save(teamRepo.create(team));
      console.log(`  ✓ ${team.name} (${team.code}) - Grupo ${team.group}`);
    }
    teamMap[team.code] = (entity as any).id;
  }
  console.log(`  Total: ${Object.keys(teamMap).length} seleções\n`);

  // 2. Seed dos jogos
  const matchRepo = dataSource.getRepository("Match");
  console.log("⚽ Populando 104 jogos (horários em São Paulo GMT-3)...");

  let created = 0;
  for (const m of matchesData) {
    const stage = roundToStage(m.round);
    const matchDate = parseMatchDate(m.date, m.time);
    const isGroupStage = stage === "group";

    const homeTeamId =
      isGroupStage && nameToCode[m.team1] ? teamMap[nameToCode[m.team1]] : null;
    const awayTeamId =
      isGroupStage && nameToCode[m.team2] ? teamMap[nameToCode[m.team2]] : null;
    const label = (m as any).label || `${m.team1} vs ${m.team2}`;

    const existing = await matchRepo.findOne({ where: { matchLabel: label } });
    if (!existing) {
      await matchRepo.save(
        matchRepo.create({
          homeTeam: homeTeamId ? { id: homeTeamId } : null,
          awayTeam: awayTeamId ? { id: awayTeamId } : null,
          matchDate,
          stage,
          matchLabel: label,
          played: false,
        } as any)
      );
      created++;
    } else if (isGroupStage && !existing.home_team_id) {
      await matchRepo.update(existing.id, {
        homeTeam: homeTeamId ? { id: homeTeamId } : null,
        awayTeam: awayTeamId ? { id: awayTeamId } : null,
      } as any);
      created++;
    }
  }

  console.log(`  ✓ ${created} jogos criados/atualizados`);
  console.log("\n🏆 Seed concluído!");
  console.log("  • 72 jogos fase de grupos");
  console.log("  • 16 oitavas (32avos)");
  console.log("  • 8 oitavas de final");
  console.log("  • 4 quartas de final");
  console.log("  • 2 semifinais");
  console.log("  • 1 disputa 3º lugar");
  console.log("  • 1 final");
  console.log("\n⏰ Todos os horários em GMT-3 (América/São_Paulo)");

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error("❌ Erro no seed:", err);
  process.exit(1);
});
