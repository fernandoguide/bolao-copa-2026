import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { Team, Match } from '../types';
import { getFlagUrl } from '../utils/flags';

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

export default function TeamsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="text-center py-12 text-dark-400">Carregando grupos...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">🌍 Grupos — Copa 2026</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {sortedGroups.map(([group, standings]) => (
                    <div key={group} className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
                        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2.5 font-bold text-center">
                            Grupo {group}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-dark-900 text-dark-400 text-xs">
                                        <th className="text-left px-3 py-2 w-[40%]">Seleção</th>
                                        <th className="text-center px-1 py-2">J</th>
                                        <th className="text-center px-1 py-2">V</th>
                                        <th className="text-center px-1 py-2">E</th>
                                        <th className="text-center px-1 py-2">D</th>
                                        <th className="text-center px-1 py-2">GP</th>
                                        <th className="text-center px-1 py-2">GC</th>
                                        <th className="text-center px-1 py-2">SG</th>
                                        <th className="text-center px-2 py-2 font-bold text-primary-400">PTS</th>
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
                <p className="text-dark-500 text-center py-12">Nenhuma seleção cadastrada.</p>
            )}
        </div>
    );
}
