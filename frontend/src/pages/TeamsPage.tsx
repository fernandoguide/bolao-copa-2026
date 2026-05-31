import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { Team, Match } from '../types';
import { getFlagUrl } from '../utils/flags';
import { useI18n } from '../i18n';
import { Translations } from '../i18n/types';

// ─── Knockout Bracket Types & Constants ───────────────────────────────────────

const KNOCKOUT_ROUNDS = [
    { key: 'round_of_32', matches: 16 },
    { key: 'round_of_16', matches: 8 },
    { key: 'quarter_final', matches: 4 },
    { key: 'semi_final', matches: 2 },
    { key: 'final', matches: 1 },
];

interface TeamStanding {
    team: Team;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDiff: number;
    points: number;
}

function calculateStandings(teams: Team[], matches: Match[]): Record<string, TeamStanding[]> {
    // Initialize standings per team
    const standingsMap = new Map<number, TeamStanding>();
    for (const team of teams) {
        standingsMap.set(team.id, {
            team,
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDiff: 0,
            points: 0,
        });
    }

    // Process only group stage matches that have been played
    for (const match of matches) {
        if (match.stage !== 'group' || !match.played) continue;
        if (!match.homeTeam || !match.awayTeam) continue;
        if (match.homeScore === null || match.awayScore === null) continue;

        const home = standingsMap.get(match.homeTeam.id);
        const away = standingsMap.get(match.awayTeam.id);
        if (!home || !away) continue;

        home.played++;
        away.played++;
        home.goalsFor += match.homeScore;
        home.goalsAgainst += match.awayScore;
        away.goalsFor += match.awayScore;
        away.goalsAgainst += match.homeScore;

        if (match.homeScore > match.awayScore) {
            home.wins++;
            home.points += 3;
            away.losses++;
        } else if (match.homeScore < match.awayScore) {
            away.wins++;
            away.points += 3;
            home.losses++;
        } else {
            home.draws++;
            away.draws++;
            home.points += 1;
            away.points += 1;
        }
    }

    // Update goal diff
    for (const s of standingsMap.values()) {
        s.goalDiff = s.goalsFor - s.goalsAgainst;
    }

    // Group by group letter
    const groups: Record<string, TeamStanding[]> = {};
    for (const s of standingsMap.values()) {
        const g = s.team.group || '?';
        if (!groups[g]) groups[g] = [];
        groups[g].push(s);
    }

    // Sort within each group by: points desc, goal diff desc, goals for desc
    for (const g of Object.keys(groups)) {
        groups[g].sort((a, b) =>
            b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor
        );
    }

    return groups;
}

function KnockoutMatchCard({ match, t }: { match: Match; t: Translations }) {
    const homeWinner = match.played && match.homeScore != null && match.awayScore != null && match.homeScore > match.awayScore;
    const awayWinner = match.played && match.homeScore != null && match.awayScore != null && match.homeScore < match.awayScore;

    return (
        <div className={`w-48 rounded-lg border overflow-hidden shadow-sm ${match.played ? 'bg-dark-800/60 border-dark-500/50' : 'bg-dark-800/40 border-dark-600/30'}`}>
            {/* Home */}
            <div className={`flex items-center gap-2 px-2 py-1.5 ${homeWinner ? 'bg-green-900/40 border-l-2 border-l-green-500' : ''}`}>
                {match.homeTeam ? (
                    <>
                        <img src={getFlagUrl(match.homeTeam.code, 20)} alt={match.homeTeam.code} className="w-5 h-3.5 rounded-sm object-cover" />
                        <span className={`text-xs font-medium flex-1 truncate ${homeWinner ? 'text-green-300' : 'text-dark-200'}`}>
                            {match.homeTeam.name}
                        </span>
                    </>
                ) : (
                    <span className="text-xs text-dark-500 italic flex-1">{t.matchesToDefine}</span>
                )}
                {match.played && match.homeScore != null && (
                    <span className={`text-xs font-bold ${homeWinner ? 'text-green-300' : 'text-dark-300'}`}>{match.homeScore}</span>
                )}
            </div>
            <div className="h-px bg-dark-600/50" />
            {/* Away */}
            <div className={`flex items-center gap-2 px-2 py-1.5 ${awayWinner ? 'bg-green-900/40 border-l-2 border-l-green-500' : ''}`}>
                {match.awayTeam ? (
                    <>
                        <img src={getFlagUrl(match.awayTeam.code, 20)} alt={match.awayTeam.code} className="w-5 h-3.5 rounded-sm object-cover" />
                        <span className={`text-xs font-medium flex-1 truncate ${awayWinner ? 'text-green-300' : 'text-dark-200'}`}>
                            {match.awayTeam.name}
                        </span>
                    </>
                ) : (
                    <span className="text-xs text-dark-500 italic flex-1">{t.matchesToDefine}</span>
                )}
                {match.played && match.awayScore != null && (
                    <span className={`text-xs font-bold ${awayWinner ? 'text-green-300' : 'text-dark-300'}`}>{match.awayScore}</span>
                )}
            </div>
        </div>
    );
}

export default function TeamsPage() {
    const { t } = useI18n();
    const [teams, setTeams] = useState<Team[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [showKnockout, setShowKnockout] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get<Team[]>('/teams'),
            api.get<Match[]>('/matches'),
        ]).then(([teamsData, matchesData]) => {
            setTeams(teamsData);
            setMatches(matchesData);
            setLoading(false);
        });
    }, []);

    const groups = useMemo(() => calculateStandings(teams, matches), [teams, matches]);
    const sortedGroups = useMemo(
        () => Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)),
        [groups]
    );

    const knockoutMatches = useMemo(() => {
        return matches.filter((m) => m.stage !== 'group');
    }, [matches]);

    const knockoutRounds = useMemo(() => {
        const byStage: Record<string, Match[]> = {};
        for (const m of knockoutMatches) {
            if (!byStage[m.stage]) byStage[m.stage] = [];
            byStage[m.stage].push(m);
        }
        for (const stage of Object.keys(byStage)) {
            byStage[stage].sort(
                (a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime()
            );
        }
        return KNOCKOUT_ROUNDS.map((round) => ({
            ...round,
            matchList: byStage[round.key] || [],
        }));
    }, [knockoutMatches]);

    const hasKnockoutMatches = knockoutMatches.length > 0;

    const stageLabels: Record<string, string> = {
        round_of_32: t.stageRoundOf32,
        round_of_16: t.stageRoundOf16,
        quarter_final: t.stageQuarterFinal,
        semi_final: t.stageSemiFinal,
        third_place: t.stageThirdPlace,
        final: t.stageFinal,
    };

    if (loading) return <div className="text-center py-12 text-dark-400">{t.teamsLoading}</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">{t.teamsTitle}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {sortedGroups.map(([group, standings]) => (
                    <div key={group} className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
                        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2.5 font-bold text-center">
                            {t.teamsGroup} {group}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-dark-900 text-dark-400 text-xs">
                                        <th className="text-left px-3 py-2 w-[40%]">{t.teamsTeam}</th>
                                        <th className="text-center px-1 py-2">{t.teamsPlayed}</th>
                                        <th className="text-center px-1 py-2">{t.teamsWins}</th>
                                        <th className="text-center px-1 py-2">{t.teamsDraws}</th>
                                        <th className="text-center px-1 py-2">{t.teamsLosses}</th>
                                        <th className="text-center px-1 py-2">{t.teamsGoalsFor}</th>
                                        <th className="text-center px-1 py-2">{t.teamsGoalsAgainst}</th>
                                        <th className="text-center px-1 py-2">{t.teamsGoalDiff}</th>
                                        <th className="text-center px-2 py-2 font-bold text-primary-400">{t.teamsPointsAbbr}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dark-700">
                                    {standings.map((s, idx) => (
                                        <tr
                                            key={s.team.id}
                                            className={`hover:bg-dark-700/50 transition-colors ${idx < 2 ? 'border-l-2 border-l-green-500/50' : idx === 2 ? 'border-l-2 border-l-yellow-500/50' : ''}`}
                                        >
                                            <td className="px-3 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={getFlagUrl(s.team.code, 40)}
                                                        alt={s.team.code}
                                                        className="w-6 h-4 object-cover rounded shadow-sm"
                                                    />
                                                    <span className="font-medium text-dark-100 truncate">{s.team.name}</span>
                                                </div>
                                            </td>
                                            <td className="text-center text-dark-300">{s.played}</td>
                                            <td className="text-center text-dark-300">{s.wins}</td>
                                            <td className="text-center text-dark-300">{s.draws}</td>
                                            <td className="text-center text-dark-300">{s.losses}</td>
                                            <td className="text-center text-dark-300">{s.goalsFor}</td>
                                            <td className="text-center text-dark-300">{s.goalsAgainst}</td>
                                            <td className="text-center text-dark-300">
                                                <span className={s.goalDiff > 0 ? 'text-green-400' : s.goalDiff < 0 ? 'text-red-400' : ''}>
                                                    {s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}
                                                </span>
                                            </td>
                                            <td className="text-center font-bold text-white">{s.points}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>

            {teams.length === 0 && (
                <p className="text-dark-500 text-center py-12">{t.teamsEmpty}</p>
            )}

            {/* Knockout Bracket (Real results) */}
            {hasKnockoutMatches && (
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">{t.teamsKnockoutTitle}</h2>
                        <button
                            onClick={() => setShowKnockout(!showKnockout)}
                            className="text-sm bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white px-3 py-1.5 rounded-lg transition-all border border-dark-600"
                        >
                            {showKnockout ? t.teamsKnockoutHideBracket : t.teamsKnockoutShowBracket}
                        </button>
                    </div>

                    {showKnockout && (
                        <div className="overflow-x-auto pb-4">
                            <div className="flex gap-4 min-w-max items-start">
                                {knockoutRounds.map((round) => {
                                    if (round.matchList.length === 0) return null;
                                    const stageLabel = stageLabels[round.key] || round.key;
                                    return (
                                        <div key={round.key} className="flex flex-col items-center">
                                            <div className="text-xs font-semibold text-primary-400 mb-3 px-2 py-1 bg-primary-900/20 rounded-full border border-primary-700/30">
                                                {stageLabel}
                                            </div>
                                            <div
                                                className="flex flex-col gap-2"
                                                style={{
                                                    minHeight: `${round.matchList.length * 68}px`,
                                                }}
                                            >
                                                {round.matchList.map((match) => (
                                                    <KnockoutMatchCard key={match.id} match={match} t={t} />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
