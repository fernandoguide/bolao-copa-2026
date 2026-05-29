import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Team } from '../types';

export default function TeamsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<Team[]>('/teams').then((data) => {
            setTeams(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="text-center py-12">Carregando seleções...</div>;

    const groups = teams.reduce<Record<string, Team[]>>((acc, team) => {
        const g = team.group || '?';
        if (!acc[g]) acc[g] = [];
        acc[g].push(team);
        return acc;
    }, {});

    const sortedGroups = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Seleções por Grupo</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedGroups.map(([group, groupTeams]) => (
                    <div key={group} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="bg-primary-700 text-white px-4 py-2 font-bold text-center">
                            Grupo {group}
                        </div>
                        <ul className="divide-y">
                            {groupTeams.map((team) => (
                                <li key={team.id} className="px-4 py-3 flex items-center gap-3">
                                    <span className="text-lg">{team.flagUrl || '🏳️'}</span>
                                    <div>
                                        <p className="font-medium text-gray-800">{team.name}</p>
                                        <p className="text-xs text-gray-500">{team.code}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {teams.length === 0 && (
                <p className="text-gray-500 text-center py-12">Nenhuma seleção cadastrada.</p>
            )}
        </div>
    );
}
