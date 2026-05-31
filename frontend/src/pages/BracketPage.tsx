import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '../i18n';
import { api } from '../services/api';
import { Match, Team } from '../types';
import { getFlagUrl } from '../utils/flags';

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

const ROUNDS = [
    { key: 'round_of_32', label: '32avos', matches: 16 },
    { key: 'round_of_16', label: 'Oitavas', matches: 8 },
    { key: 'quarter_final', label: 'Quartas', matches: 4 },
    { key: 'semi_final', label: 'Semis', matches: 2 },
    { key: 'final', label: 'Final', matches: 1 },
];

function generateBracketId(round: number, position: number): string {
    return `r${round}-p${position}`;
}

function initializeBracket(knockoutMatches: Match[]): BracketState {
    const state: BracketState = {};

    // Group matches by stage
    const matchesByStage: Record<string, Match[]> = {};
    for (const m of knockoutMatches) {
        if (!matchesByStage[m.stage]) matchesByStage[m.stage] = [];
        matchesByStage[m.stage].push(m);
    }

    // Sort by date within each stage
    for (const stage of Object.keys(matchesByStage)) {
        matchesByStage[stage].sort(
            (a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime()
        );
    }

    // Build rounds
    ROUNDS.forEach((round, roundIdx) => {
        const stageMatches = matchesByStage[round.key] || [];
        for (let pos = 0; pos < round.matches; pos++) {
            const id = generateBracketId(roundIdx, pos);
            const realMatch = stageMatches[pos] || undefined;

            const bracketMatch: BracketMatch = {
                id,
                round: roundIdx,
                position: pos,
                homeTeam: realMatch?.homeTeam || null,
                awayTeam: realMatch?.awayTeam || null,
                homeScore: realMatch?.homeScore != null ? String(realMatch.homeScore) : '',
                awayScore: realMatch?.awayScore != null ? String(realMatch.awayScore) : '',
                winner: null,
                realMatch,
            };

            // Link to next round
            if (roundIdx > 0) {
                bracketMatch.sourceMatchHome = generateBracketId(roundIdx - 1, pos * 2);
                bracketMatch.sourceMatchAway = generateBracketId(roundIdx - 1, pos * 2 + 1);
            }

            // Determine winner from real result
            if (realMatch?.played && realMatch.homeScore != null && realMatch.awayScore != null) {
                bracketMatch.winner =
                    realMatch.homeScore > realMatch.awayScore
                        ? realMatch.homeTeam
                        : realMatch.homeScore < realMatch.awayScore
                            ? realMatch.awayTeam
                            : null; // draw (penalties decided in knockout - pick home for simplicity)
            }

            state[id] = bracketMatch;
        }
    });

    return state;
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
                    {t.bracketTBD || 'A definir'}
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
        <div className="w-44 bg-dark-800/40 rounded-lg border border-dark-600/30 overflow-hidden shadow-sm">
            <TeamSlot
                team={match.homeTeam}
                score={match.homeScore}
                isWinner={match.winner?.id === match.homeTeam?.id && match.winner != null}
                isClickable={!isLocked && hasTeams === true}
                onSelect={() => onSelectWinner('home')}
                onScoreChange={(val) => onScoreChange('home', val)}
            />
            <div className="h-px bg-dark-600/50" />
            <TeamSlot
                team={match.awayTeam}
                score={match.awayScore}
                isWinner={match.winner?.id === match.awayTeam?.id && match.winner != null}
                isClickable={!isLocked && hasTeams === true}
                onSelect={() => onSelectWinner('away')}
                onScoreChange={(val) => onScoreChange('away', val)}
            />
        </div>
    );
}

export default function BracketPage() {
    const { t } = useI18n();
    const [bracket, setBracket] = useState<BracketState>({});
    const [loading, setLoading] = useState(true);
    const [champion, setChampion] = useState<Team | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const matches = await api.get<Match[]>('/matches');
                const knockout = matches.filter((m) => m.stage !== 'group');
                const initial = initializeBracket(knockout);
                setBracket(initial);

                // Check if final has a winner
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

            // Find next round match that sources from this match
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
                        // Reset scores and winner of subsequent matches when a dependency changes
                        homeScore: '',
                        awayScore: '',
                        winner: null,
                    };

                    // Clear downstream propagation
                    const clearDownstream = (id: string, round: number) => {
                        const further = round + 1;
                        if (further >= ROUNDS.length) return;
                        const furtherPos = Math.floor(
                            (newState[id]?.position ?? 0) / 2
                        );
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

                // Check champion
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

                // Auto-select winner if both scores are filled and different
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

    if (loading) {
        return (
            <div className="p-8 text-center text-dark-400">
                {t.loading}
            </div>
        );
    }

    // Group bracket matches by round
    const roundMatches: BracketMatch[][] = ROUNDS.map((_, roundIdx) => {
        const matches: BracketMatch[] = [];
        for (let pos = 0; pos < ROUNDS[roundIdx].matches; pos++) {
            const id = generateBracketId(roundIdx, pos);
            if (bracket[id]) matches.push(bracket[id]);
        }
        return matches;
    });

    const roundLabels = [
        t.bracketRound32 || '32avos',
        t.bracketRound16 || 'Oitavas',
        t.bracketQuarters || 'Quartas',
        t.bracketSemis || 'Semis',
        t.bracketFinal || 'Final',
    ];

    return (
        <div className="p-4 max-w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">
                    🏆 {t.bracketTitle || 'Simulador de Bracket'}
                </h1>
                <button
                    onClick={handleReset}
                    className="text-sm bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white px-3 py-1.5 rounded-lg transition-all border border-dark-600"
                >
                    🔄 {t.bracketReset || 'Resetar'}
                </button>
            </div>

            {/* Instruction */}
            <p className="text-sm text-dark-400 mb-4">
                {t.bracketInstruction || 'Clique no time vencedor ou preencha os placares para avançar nas brackets.'}
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
                    <p className="text-xs text-yellow-500/70 mt-1">{t.bracketChampion || 'Campeão!'}</p>
                </div>
            )}

            {/* Bracket Grid */}
            <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max items-start">
                    {roundMatches.map((matches, roundIdx) => (
                        <div key={roundIdx} className="flex flex-col items-center">
                            {/* Round label */}
                            <div className="text-xs font-semibold text-primary-400 mb-3 px-2 py-1 bg-primary-900/20 rounded-full border border-primary-700/30">
                                {roundLabels[roundIdx]}
                            </div>

                            {/* Matches in this round */}
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
            <div className="mt-6 flex gap-4 text-xs text-dark-400">
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-green-900/40 border border-green-500/50 inline-block" />
                    {t.bracketWinner || 'Vencedor'}
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-dark-800/60 border border-dark-600/30 inline-block" />
                    {t.bracketPending || 'Pendente'}
                </span>
            </div>
        </div>
    );
}
