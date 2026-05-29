import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Team } from '../types';
import { getFlagUrl } from '../utils/flags';

export default function TeamsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<Team[]>('/teams').then((data) => {
            setTeams(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="text-center py-12 text-dark-400">Carregando seleções...</div>;

    const groups = teams.reduce<Record<string, Team[]>>((acc, team) => {
        const g = team.group || '?';
        if (!acc[g]) acc[g] = [];
        acc[g].push(team);
        return acc;
    }, {});

    const sortedGroups = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));

    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">🌍 Seleções por Grupo</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedGroups.map(([group, groupTeams]) => (
                    <div key={group} className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden hover:border-primary-500/30 transition-all">
                        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2.5 font-bold text-center">
                            Grupo {group}
                        </div>
                        <ul className="divide-y divide-dark-700">
                            {groupTeams.map((team) => (
                                <li key={team.id} className="px-4 py-3 flex items-center gap-3 hover:bg-dark-700/50 transition-colors">
                                    <img
                                        src={getFlagUrl(team.code, 40)}
                                        alt={team.code}
                                        className="w-8 h-5 object-cover rounded shadow-sm"
                                    />
                                    <div>
                                        <p className="font-medium text-dark-100">{team.name}</p>
                                        <p className="text-xs text-dark-500">{team.code}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {teams.length === 0 && (
                <p className="text-dark-500 text-center py-12">Nenhuma seleção cadastrada.</p>
            )}
        </div>
    );
}
