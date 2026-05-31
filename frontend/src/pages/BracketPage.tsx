import { useState, useEffect, useCallback, useMemo } from 'react';
import { useI18n } from '../i18n';
import { api } from '../services/api';
import { Match, Team, Prediction } from '../types';
import { getFlagUrl } from '../utils/flags';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BracketMatch {
    id: string;
    round: number;
    position: number;
    homeTeam: Team | null;
    awayTeam: Team | null;
    homeScore: string;
    awayScore: string;
    winner: Team | null;
    sourceMatchHome?: string;
    sourceMatchAway?: string;
    realMatch?: Match;
}

type BracketState = Record<string, BracketMatch>;

interface GroupStanding {
    team: Team;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDiff: number;
    points: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ROUNDS = [
    { key: 'round_of_32', label: '32avos', matches: 16 },
    { key: 'round_of_16', label: 'Oitavas', matches: 8 },
    { key: 'quarter_final', label: 'Quartas', matches: 4 },
    { key: 'semi_final', label: 'Semis', matches: 2 },
    { key: 'final', label: 'Final', matches: 1 },
];

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateBracketId(round: number, position: number): string {
    return `r${round}-p${position}`;
}

interface MatchResult {
    homeTeamId: number;
    awayTeamId: number;
    homeScore: number;
    awayScore: number;
}

function getHeadToHead(teamIds: number[], results: MatchResult[]): Map<number, { points: number; goalDiff: number; goalsFor: number }> {
    const h2h = new Map<number, { points: number; goalDiff: number; goalsFor: number }>();
    for (const id of teamIds) {
        h2h.set(id, { points: 0, goalDiff: 0, goalsFor: 0 });
    }

    const teamSet = new Set(teamIds);
    for (const r of results) {
        if (!teamSet.has(r.homeTeamId) || !teamSet.has(r.awayTeamId)) continue;

        const home = h2h.get(r.homeTeamId)!;
        const away = h2h.get(r.awayTeamId)!;

        home.goalsFor += r.homeScore;
        home.goalDiff += r.homeScore - r.awayScore;
        away.goalsFor += r.awayScore;
        away.goalDiff += r.awayScore - r.homeScore;

        if (r.homeScore > r.awayScore) {
            home.points += 3;
        } else if (r.homeScore < r.awayScore) {
            away.points += 3;
        } else {
            home.points += 1;
            away.points += 1;
        }
    }

    return h2h;
}

/**
 * FIFA World Cup tiebreakers:
 * Step 1 (head-to-head among tied teams):
 *   1. Points in matches between tied teams
 *   2. Goal difference in matches between tied teams
 *   3. Goals scored in matches between tied teams
 * Step 2 (overall group):
 *   4. Overall goal difference in all group matches
 *   5. Overall goals scored in all group matches
 * Step 3:
 *   6. FIFA ranking (approximated by team ID / seed order)
 */
function sortWithFifaTiebreakers(standings: GroupStanding[], results: MatchResult[]): GroupStanding[] {
    // Initial sort by points
    const sorted = [...standings].sort((a, b) => b.points - a.points);

    // Find groups of teams tied on points and apply tiebreakers
    const final: GroupStanding[] = [];
    let i = 0;
    while (i < sorted.length) {
        let j = i + 1;
        while (j < sorted.length && sorted[j].points === sorted[i].points) {
            j++;
        }

        if (j - i === 1) {
            // No tie
            final.push(sorted[i]);
        } else {
            // Tied teams: apply head-to-head
            const tiedTeams = sorted.slice(i, j);
            const tiedIds = tiedTeams.map((s) => s.team.id);
            const h2h = getHeadToHead(tiedIds, results);

            tiedTeams.sort((a, b) => {
                const ah = h2h.get(a.team.id)!;
                const bh = h2h.get(b.team.id)!;

                // Step 1: Head-to-head
                if (bh.points !== ah.points) return bh.points - ah.points;
                if (bh.goalDiff !== ah.goalDiff) return bh.goalDiff - ah.goalDiff;
                if (bh.goalsFor !== ah.goalsFor) return bh.goalsFor - ah.goalsFor;

                // Step 2: Overall group stats
                if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
                if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;

                // Step 3: FIFA ranking (lower ID = higher seed as approximation)
                return a.team.id - b.team.id;
            });

            final.push(...tiedTeams);
        }

        i = j;
    }

    return final;
}

function simulateGroupStandings(
    groupMatches: Match[],
    predictions: Prediction[],
    group: string
): GroupStanding[] {
    const teamsInGroup = new Map<number, Team>();
    for (const m of groupMatches) {
        if (m.homeTeam && m.homeTeam.group === group) teamsInGroup.set(m.homeTeam.id, m.homeTeam);
        if (m.awayTeam && m.awayTeam.group === group) teamsInGroup.set(m.awayTeam.id, m.awayTeam);
    }

    const standings = new Map<number, GroupStanding>();
    for (const [id, team] of teamsInGroup) {
        standings.set(id, {
            team,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDiff: 0,
            points: 0,
        });
    }

    const predByMatch = new Map<number, Prediction>();
    for (const p of predictions) {
        predByMatch.set(p.match.id, p);
    }

    const matchesInGroup = groupMatches.filter(
        (m) => m.homeTeam?.group === group || m.awayTeam?.group === group
    );

    for (const match of matchesInGroup) {
        if (!match.homeTeam || !match.awayTeam) continue;

        let homeScore: number | null = null;
        let awayScore: number | null = null;

        // Priority: real result (admin) > prediction (simulation)
        if (match.played && match.homeScore != null && match.awayScore != null) {
            homeScore = match.homeScore;
            awayScore = match.awayScore;
        } else {
            const pred = predByMatch.get(match.id);
            if (pred) {
                homeScore = pred.homeScore;
                awayScore = pred.awayScore;
            }
        }

        if (homeScore == null || awayScore == null) continue;

        const home = standings.get(match.homeTeam.id);
        const away = standings.get(match.awayTeam.id);
        if (!home || !away) continue;

        home.played++;
        away.played++;
        home.goalsFor += homeScore;
        home.goalsAgainst += awayScore;
        away.goalsFor += awayScore;
        away.goalsAgainst += homeScore;

        if (homeScore > awayScore) {
            home.won++;
            home.points += 3;
            away.lost++;
        } else if (homeScore < awayScore) {
            away.won++;
            away.points += 3;
            home.lost++;
        } else {
            home.drawn++;
            away.drawn++;
            home.points += 1;
            away.points += 1;
        }

        home.goalDiff = home.goalsFor - home.goalsAgainst;
        away.goalDiff = away.goalsFor - away.goalsAgainst;
    }

    // Collect match results for head-to-head tiebreaker
    const results: MatchResult[] = [];
    for (const match of matchesInGroup) {
        if (!match.homeTeam || !match.awayTeam) continue;
        let homeScore: number | null = null;
        let awayScore: number | null = null;

        if (match.played && match.homeScore != null && match.awayScore != null) {
            homeScore = match.homeScore;
            awayScore = match.awayScore;
        } else {
            const pred = predByMatch.get(match.id);
            if (pred) {
                homeScore = pred.homeScore;
                awayScore = pred.awayScore;
            }
        }

        if (homeScore != null && awayScore != null) {
            results.push({
                homeTeamId: match.homeTeam.id,
                awayTeamId: match.awayTeam.id,
                homeScore,
                awayScore,
            });
        }
    }

    return sortWithFifaTiebreakers(Array.from(standings.values()), results);
}

// ─── FIFA 2026 Official Bracket Seeding ───────────────────────────────────────
// Based on the official FIFA bracket image.
// Each R32 match is defined by:
//   home: "1X" (1st of group X) or "2X" (2nd of group X)
//   away: same, or "3rd" (filled from best 3rd-place teams)

interface R32Slot {
    home: string;  // e.g. "1E", "2A"
    away: string;  // e.g. "3ABCDF", "2B"
}

// Official FIFA 2026 Round of 32 matchups from the bracket image
// Left side of bracket (positions 0-7), Right side (positions 8-15)
const R32_BRACKET: R32Slot[] = [
    // Left side
    { home: '1E', away: '3ABCDF' },   // pos 0 (Match 74)
    { home: '1I', away: '3CDFGH' },   // pos 1 (Match 77)
    { home: '2A', away: '2B' },        // pos 2 (Match 78)
    { home: '1F', away: '2C' },        // pos 3 (Match 75)
    { home: '2K', away: '2L' },        // pos 4 (Match 83)
    { home: '1H', away: '2J' },        // pos 5 (Match 84)
    { home: '1D', away: '3BEFIJ' },   // pos 6 (Match 81)
    { home: '1G', away: '3AEHIJ' },   // pos 7 (Match 82)
    // Right side
    { home: '1C', away: '2F' },        // pos 8 (Match 76)
    { home: '2E', away: '2I' },        // pos 9 (Match 78)
    { home: '1A', away: '3CEFHI' },   // pos 10 (Match 79)
    { home: '1L', away: '3EHIJK' },   // pos 11 (Match 80)
    { home: '1J', away: '2H' },        // pos 12 (Match 86)
    { home: '2D', away: '2G' },        // pos 13 (Match 88)
    { home: '1B', away: '3EFGIJ' },   // pos 14 (Match 85)
    { home: '1K', away: '3DEIJL' },   // pos 15 (Match 87)
];

function getTeamByPosition(
    position: string,
    standings: Record<string, GroupStanding[]>
): Team | null {
    const rank = parseInt(position[0]) - 1; // '1' -> 0, '2' -> 1
    const group = position[1];
    const groupStandings = standings[group];
    if (!groupStandings || !groupStandings[rank]) return null;
    return groupStandings[rank].team;
}

function assignThirdPlaceTeams(
    standings: Record<string, GroupStanding[]>
): Map<string, Team> {
    // Get all 3rd-place teams with their group and stats
    const allThirds: { team: Team; group: string; standing: GroupStanding }[] = [];
    for (const group of GROUPS) {
        const gs = standings[group];
        if (gs && gs.length >= 3) {
            allThirds.push({ team: gs[2].team, group, standing: gs[2] });
        }
    }

    // Sort to find best 8 third-place teams
    allThirds.sort((a, b) => {
        if (b.standing.points !== a.standing.points) return b.standing.points - a.standing.points;
        if (b.standing.goalDiff !== a.standing.goalDiff) return b.standing.goalDiff - a.standing.goalDiff;
        return b.standing.goalsFor - a.standing.goalsFor;
    });

    const qualified = allThirds.slice(0, 8);
    const qualifiedGroups = new Set(qualified.map((q) => q.group));

    // For each 3rd-place slot in the bracket, determine which team goes there
    // Each slot lists possible source groups (e.g., "3ABCDF" means 3rd could come from A, B, C, D, or F)
    const thirdSlots = R32_BRACKET
        .map((slot, idx) => ({ idx, away: slot.away }))
        .filter((s) => s.away.startsWith('3') && s.away.length > 2);

    // Assignment: for each slot, find a matching qualified 3rd that hasn't been used yet
    const assigned = new Map<string, Team>(); // slot away code -> team
    const usedGroups = new Set<string>();

    // Sort slots by number of allowed groups (ascending) for better assignment
    const sortedSlots = [...thirdSlots].sort(
        (a, b) => a.away.length - b.away.length
    );

    for (const slot of sortedSlots) {
        const allowedGroups = slot.away.slice(1).split('');
        // Find best available 3rd-place team from allowed groups
        for (const q of qualified) {
            if (usedGroups.has(q.group)) continue;
            if (!allowedGroups.includes(q.group)) continue;
            if (!qualifiedGroups.has(q.group)) continue;
            assigned.set(slot.away, q.team);
            usedGroups.add(q.group);
            break;
        }
    }

    return assigned;
}

function seedR32(standings: Record<string, GroupStanding[]>): { home: Team | null; away: Team | null }[] {
    const thirdAssignments = assignThirdPlaceTeams(standings);

    return R32_BRACKET.map((slot) => {
        // Resolve home team
        let home: Team | null = null;
        if (slot.home.length === 2) {
            home = getTeamByPosition(slot.home, standings);
        }

        // Resolve away team
        let away: Team | null = null;
        if (slot.away.length === 2) {
            // Direct position (e.g., "2B")
            away = getTeamByPosition(slot.away, standings);
        } else if (slot.away.startsWith('3')) {
            // 3rd place assignment
            away = thirdAssignments.get(slot.away) || null;
        }

        return { home, away };
    });
}

function initializeBracket(
    knockoutMatches: Match[],
    qualifiedSeeding: { home: Team | null; away: Team | null }[]
): BracketState {
    const state: BracketState = {};

    const matchesByStage: Record<string, Match[]> = {};
    for (const m of knockoutMatches) {
        if (!matchesByStage[m.stage]) matchesByStage[m.stage] = [];
        matchesByStage[m.stage].push(m);
    }

    for (const stage of Object.keys(matchesByStage)) {
        matchesByStage[stage].sort(
            (a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime()
        );
    }

    ROUNDS.forEach((round, roundIdx) => {
        const stageMatches = matchesByStage[round.key] || [];
        for (let pos = 0; pos < round.matches; pos++) {
            const id = generateBracketId(roundIdx, pos);
            const realMatch = stageMatches[pos] || undefined;

            let homeTeam: Team | null = null;
            let awayTeam: Team | null = null;
            let homeScore = '';
            let awayScore = '';
            let winner: Team | null = null;

            // Only use realMatch if it has actual teams assigned (admin-defined)
            const realHasTeams = realMatch && (realMatch.homeTeam != null || realMatch.awayTeam != null);

            if (realHasTeams) {
                homeTeam = realMatch!.homeTeam;
                awayTeam = realMatch!.awayTeam;
                if (realMatch!.homeScore != null) homeScore = String(realMatch!.homeScore);
                if (realMatch!.awayScore != null) awayScore = String(realMatch!.awayScore);

                if (realMatch!.played && realMatch!.homeScore != null && realMatch!.awayScore != null) {
                    winner = realMatch!.homeScore > realMatch!.awayScore
                        ? realMatch!.homeTeam
                        : realMatch!.homeScore < realMatch!.awayScore
                            ? realMatch!.awayTeam
                            : null;
                }
            } else if (roundIdx === 0 && qualifiedSeeding[pos]) {
                // Use simulated seeding for R32 when no real teams are set
                homeTeam = qualifiedSeeding[pos].home;
                awayTeam = qualifiedSeeding[pos].away;
            }

            const bracketMatch: BracketMatch = {
                id,
                round: roundIdx,
                position: pos,
                homeTeam,
                awayTeam,
                homeScore,
                awayScore,
                winner,
                realMatch,
            };

            if (roundIdx > 0) {
                bracketMatch.sourceMatchHome = generateBracketId(roundIdx - 1, pos * 2);
                bracketMatch.sourceMatchAway = generateBracketId(roundIdx - 1, pos * 2 + 1);
            }

            state[id] = bracketMatch;
        }
    });

    return state;
}

// ─── Components ───────────────────────────────────────────────────────────────

function GroupTable({ standings, group, t }: { standings: GroupStanding[]; group: string; t: Record<string, string> }) {
    return (
        <div className="bg-dark-800/60 rounded-lg border border-dark-600/30 overflow-hidden">
            <div className="px-3 py-1.5 bg-dark-700/50 border-b border-dark-600/30">
                <span className="text-xs font-bold text-primary-400">
                    {t.teamsGroup || 'Grupo'} {group}
                </span>
            </div>
            <table className="w-full text-xs">
                <thead>
                    <tr className="text-dark-400 border-b border-dark-700/50">
                        <th className="text-left px-2 py-1">{t.teamsTeam || 'Seleção'}</th>
                        <th className="px-1 py-1">J</th>
                        <th className="px-1 py-1">V</th>
                        <th className="px-1 py-1">E</th>
                        <th className="px-1 py-1">D</th>
                        <th className="px-1 py-1">SG</th>
                        <th className="px-1 py-1 text-primary-400">Pts</th>
                    </tr>
                </thead>
                <tbody>
                    {standings.map((s, idx) => (
                        <tr
                            key={s.team.id}
                            className={`border-b border-dark-700/30 ${idx < 2
                                ? 'bg-green-900/10'
                                : idx === 2
                                    ? 'bg-yellow-900/10'
                                    : ''
                                }`}
                        >
                            <td className="px-2 py-1 flex items-center gap-1">
                                <img src={getFlagUrl(s.team.code, 20)} alt="" className="w-4 h-3 rounded-sm" />
                                <span className={`truncate ${idx < 2 ? 'text-green-300' : idx === 2 ? 'text-yellow-300' : 'text-dark-300'}`}>
                                    {s.team.name}
                                </span>
                            </td>
                            <td className="text-center text-dark-300">{s.played}</td>
                            <td className="text-center text-dark-300">{s.won}</td>
                            <td className="text-center text-dark-300">{s.drawn}</td>
                            <td className="text-center text-dark-300">{s.lost}</td>
                            <td className="text-center text-dark-300">{s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}</td>
                            <td className="text-center font-bold text-primary-300">{s.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function TeamSlot({
    team,
    score,
    isWinner,
    isClickable,
    onSelect,
    onScoreChange,
}: {
    team: Team | null;
    score: string;
    isWinner: boolean;
    isClickable: boolean;
    onSelect: () => void;
    onScoreChange: (val: string) => void;
}) {
    const { t } = useI18n();

    return (
        <div
            className={`flex items-center gap-2 px-2 py-1.5 rounded transition-all ${isWinner
                ? 'bg-green-900/40 border border-green-500/50'
                : 'bg-dark-800/60 border border-dark-600/30'
                } ${isClickable ? 'cursor-pointer hover:bg-dark-700/80 hover:border-primary-500/40' : ''}`}
            onClick={isClickable ? onSelect : undefined}
        >
            {team ? (
                <>
                    <img
                        src={getFlagUrl(team.code, 20)}
                        alt={team.name}
                        className="w-5 h-3.5 rounded-sm object-cover"
                    />
                    <span className={`text-xs font-medium flex-1 truncate ${isWinner ? 'text-green-300' : 'text-dark-200'}`}>
                        {team.name}
                    </span>
                    <input
                        type="text"
                        value={score}
                        onChange={(e) => {
                            e.stopPropagation();
                            const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                            onScoreChange(val);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-7 h-5 text-center text-xs bg-dark-900/80 border border-dark-500 rounded text-white focus:border-primary-400 focus:outline-none"
                        placeholder="-"
                    />
                </>
            ) : (
                <span className="text-xs text-dark-500 italic flex-1">
                    {t.bracketTBD}
                </span>
            )}
        </div>
    );
}

function BracketMatchCard({
    match,
    onSelectWinner,
    onScoreChange,
}: {
    match: BracketMatch;
    onSelectWinner: (team: 'home' | 'away') => void;
    onScoreChange: (team: 'home' | 'away', score: string) => void;
}) {
    const hasTeams = !!(match.homeTeam && match.awayTeam);
    const isLocked = match.realMatch?.played || false;

    return (
        <div className={`w-44 rounded-lg border overflow-hidden shadow-sm ${isLocked ? 'bg-dark-800/60 border-dark-500/50' : 'bg-dark-800/40 border-dark-600/30'}`}>
            <TeamSlot
                team={match.homeTeam}
                score={match.homeScore}
                isWinner={match.winner?.id === match.homeTeam?.id && match.winner != null}
                isClickable={!isLocked && hasTeams}
                onSelect={() => onSelectWinner('home')}
                onScoreChange={(val) => onScoreChange('home', val)}
            />
            <div className="h-px bg-dark-600/50" />
            <TeamSlot
                team={match.awayTeam}
                score={match.awayScore}
                isWinner={match.winner?.id === match.awayTeam?.id && match.winner != null}
                isClickable={!isLocked && hasTeams}
                onSelect={() => onSelectWinner('away')}
                onScoreChange={(val) => onScoreChange('away', val)}
            />
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BracketPage() {
    const { t } = useI18n();
    const [bracket, setBracket] = useState<BracketState>({});
    const [loading, setLoading] = useState(true);
    const [champion, setChampion] = useState<Team | null>(null);
    const [groupStandings, setGroupStandings] = useState<Record<string, GroupStanding[]>>({});
    const [showGroups, setShowGroups] = useState(true);
    const [hasPredictions, setHasPredictions] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const [matches, predictions] = await Promise.all([
                    api.get<Match[]>('/matches'),
                    api.get<Prediction[]>('/predictions/my'),
                ]);

                const groupMatches = matches.filter((m) => m.stage === 'group');
                const knockoutMatches = matches.filter((m) => m.stage !== 'group');

                const groupPredictions = predictions.filter(
                    (p) => p.match.stage === 'group'
                );
                setHasPredictions(groupPredictions.length > 0);

                // Simulate group standings based on predictions
                const standings: Record<string, GroupStanding[]> = {};
                for (const group of GROUPS) {
                    standings[group] = simulateGroupStandings(groupMatches, groupPredictions, group);
                }
                setGroupStandings(standings);

                // Seed R32 bracket using official FIFA 2026 bracket structure
                const seeding = seedR32(standings);

                // Initialize bracket with real knockout matches + simulated seeding
                const initial = initializeBracket(knockoutMatches, seeding);
                setBracket(initial);

                const finalMatch = initial[generateBracketId(4, 0)];
                if (finalMatch?.winner) setChampion(finalMatch.winner);
            } catch {
                // Ignore
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const propagateWinner = useCallback(
        (state: BracketState, matchId: string, winner: Team): BracketState => {
            const newState = { ...state };
            const match = newState[matchId];
            newState[matchId] = { ...match, winner };

            const nextRound = match.round + 1;
            if (nextRound < ROUNDS.length) {
                const nextPos = Math.floor(match.position / 2);
                const nextId = generateBracketId(nextRound, nextPos);
                const nextMatch = newState[nextId];
                if (nextMatch) {
                    const isHome = match.position % 2 === 0;
                    newState[nextId] = {
                        ...nextMatch,
                        homeTeam: isHome ? winner : nextMatch.homeTeam,
                        awayTeam: isHome ? nextMatch.awayTeam : winner,
                        homeScore: '',
                        awayScore: '',
                        winner: null,
                    };

                    const clearDownstream = (id: string, round: number) => {
                        const further = round + 1;
                        if (further >= ROUNDS.length) return;
                        const furtherPos = Math.floor((newState[id]?.position ?? 0) / 2);
                        const furtherId = generateBracketId(further, furtherPos);
                        const furtherMatch = newState[furtherId];
                        if (furtherMatch) {
                            const slot = (newState[id]?.position ?? 0) % 2 === 0;
                            newState[furtherId] = {
                                ...furtherMatch,
                                homeTeam: slot ? null : furtherMatch.homeTeam,
                                awayTeam: slot ? furtherMatch.awayTeam : null,
                                homeScore: '',
                                awayScore: '',
                                winner: null,
                            };
                            clearDownstream(furtherId, further);
                        }
                    };
                    clearDownstream(nextId, nextRound);
                }
            }

            return newState;
        },
        []
    );

    const handleSelectWinner = useCallback(
        (matchId: string, team: 'home' | 'away') => {
            setBracket((prev) => {
                const match = prev[matchId];
                if (!match) return prev;
                const winner = team === 'home' ? match.homeTeam : match.awayTeam;
                if (!winner) return prev;

                const newState = propagateWinner(prev, matchId, winner);

                const finalId = generateBracketId(4, 0);
                if (newState[finalId]?.winner) {
                    setChampion(newState[finalId].winner);
                } else {
                    setChampion(null);
                }

                return newState;
            });
        },
        [propagateWinner]
    );

    const handleScoreChange = useCallback(
        (matchId: string, team: 'home' | 'away', score: string) => {
            setBracket((prev) => {
                const match = prev[matchId];
                if (!match) return prev;

                const updated = {
                    ...prev,
                    [matchId]: {
                        ...match,
                        homeScore: team === 'home' ? score : match.homeScore,
                        awayScore: team === 'away' ? score : match.awayScore,
                    },
                };

                const newHome = team === 'home' ? score : match.homeScore;
                const newAway = team === 'away' ? score : match.awayScore;

                if (newHome !== '' && newAway !== '') {
                    const h = parseInt(newHome);
                    const a = parseInt(newAway);
                    if (!isNaN(h) && !isNaN(a) && h !== a) {
                        const winner = h > a ? match.homeTeam : match.awayTeam;
                        if (winner) {
                            const propagated = propagateWinner(updated, matchId, winner);
                            const finalId = generateBracketId(4, 0);
                            if (propagated[finalId]?.winner) {
                                setChampion(propagated[finalId].winner);
                            } else {
                                setChampion(null);
                            }
                            return propagated;
                        }
                    }
                }

                return updated;
            });
        },
        [propagateWinner]
    );

    const handleReset = () => {
        setBracket((prev) => {
            const reset: BracketState = {};
            for (const [id, match] of Object.entries(prev)) {
                const isRealPlayed = match.realMatch?.played || false;
                if (isRealPlayed) {
                    reset[id] = match;
                } else {
                    reset[id] = {
                        ...match,
                        homeScore: '',
                        awayScore: '',
                        winner: null,
                        homeTeam: match.round === 0 ? match.homeTeam : null,
                        awayTeam: match.round === 0 ? match.awayTeam : null,
                    };
                }
            }
            setChampion(null);
            return reset;
        });
    };

    const roundMatches: BracketMatch[][] = useMemo(
        () =>
            ROUNDS.map((_, roundIdx) => {
                const matches: BracketMatch[] = [];
                for (let pos = 0; pos < ROUNDS[roundIdx].matches; pos++) {
                    const id = generateBracketId(roundIdx, pos);
                    if (bracket[id]) matches.push(bracket[id]);
                }
                return matches;
            }),
        [bracket]
    );

    if (loading) {
        return <div className="p-8 text-center text-dark-400">{t.loading}</div>;
    }

    const roundLabels = [
        t.bracketRound32,
        t.bracketRound16,
        t.bracketQuarters,
        t.bracketSemis,
        t.bracketFinal,
    ];

    return (
        <div className="p-4 max-w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-white">
                    🏆 {t.bracketTitle}
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowGroups(!showGroups)}
                        className="text-sm bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white px-3 py-1.5 rounded-lg transition-all border border-dark-600"
                    >
                        {showGroups
                            ? `📊 ${t.bracketHideGroups || 'Esconder Grupos'}`
                            : `📊 ${t.bracketShowGroups || 'Ver Grupos'}`}
                    </button>
                    <button
                        onClick={handleReset}
                        className="text-sm bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white px-3 py-1.5 rounded-lg transition-all border border-dark-600"
                    >
                        🔄 {t.bracketReset}
                    </button>
                </div>
            </div>

            {/* Info banner */}
            <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <p className="text-xs text-blue-300">
                    {t.bracketSimInfo || 'Os grupos são simulados com base nos seus palpites. O resultado oficial é definido apenas pelo Admin.'}
                    {!hasPredictions && (
                        <span className="block mt-1 text-yellow-400">
                            {t.bracketNoPredictions || '⚠️ Você ainda não tem palpites na fase de grupos. Faça seus palpites para ver a simulação!'}
                        </span>
                    )}
                </p>
            </div>

            {/* Group Standings (simulated) */}
            {showGroups && (
                <div className="mb-6">
                    <h2 className="text-sm font-semibold text-dark-300 mb-3">
                        {t.bracketGroupStage || '📊 Classificação dos Grupos (Simulação)'}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {GROUPS.map((group) => (
                            <GroupTable
                                key={group}
                                group={group}
                                standings={groupStandings[group] || []}
                                t={t as unknown as Record<string, string>}
                            />
                        ))}
                    </div>
                    <div className="mt-2 flex gap-3 text-xs text-dark-400">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded bg-green-900/40 border border-green-500/50 inline-block" />
                            {t.bracketQualified || 'Classificado direto (1º/2º)'}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded bg-yellow-900/40 border border-yellow-500/50 inline-block" />
                            {t.bracketThirdPlace || 'Possível 3º classificado'}
                        </span>
                    </div>
                </div>
            )}

            {/* Instruction */}
            <p className="text-sm text-dark-400 mb-4">
                {t.bracketInstruction}
            </p>

            {/* Champion */}
            {champion && (
                <div className="mb-6 p-4 bg-gradient-to-r from-yellow-900/30 to-yellow-700/20 border border-yellow-500/40 rounded-xl text-center">
                    <div className="text-2xl mb-1">🏆</div>
                    <div className="flex items-center justify-center gap-2">
                        <img
                            src={getFlagUrl(champion.code, 40)}
                            alt={champion.name}
                            className="w-8 h-5 rounded object-cover"
                        />
                        <span className="text-lg font-bold text-yellow-300">{champion.name}</span>
                    </div>
                    <p className="text-xs text-yellow-500/70 mt-1">{t.bracketChampion}</p>
                </div>
            )}

            {/* Bracket Grid */}
            <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max items-start">
                    {roundMatches.map((matches, roundIdx) => (
                        <div key={roundIdx} className="flex flex-col items-center">
                            <div className="text-xs font-semibold text-primary-400 mb-3 px-2 py-1 bg-primary-900/20 rounded-full border border-primary-700/30">
                                {roundLabels[roundIdx]}
                            </div>
                            <div
                                className="flex flex-col justify-around"
                                style={{
                                    gap: `${Math.pow(2, roundIdx) * 8 + 8}px`,
                                    minHeight: `${ROUNDS[0].matches * 68}px`,
                                }}
                            >
                                {matches.map((match) => (
                                    <BracketMatchCard
                                        key={match.id}
                                        match={match}
                                        onSelectWinner={(team) => handleSelectWinner(match.id, team)}
                                        onScoreChange={(team, score) => handleScoreChange(match.id, team, score)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-dark-400">
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-green-900/40 border border-green-500/50 inline-block" />
                    {t.bracketWinner}
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-dark-800/60 border border-dark-600/30 inline-block" />
                    {t.bracketPending}
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-dark-800/60 border border-dark-500/50 inline-block" />
                    {t.bracketLocked || 'Resultado oficial (Admin)'}
                </span>
            </div>
        </div>
    );
}
