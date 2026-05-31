import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Pool } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';
import { isValidPoolName, isValidInviteCode, sanitizeText } from '../utils/security';

export default function PoolsPage() {
    const { t } = useI18n();
    const { user } = useAuth();
    const [pools, setPools] = useState<Pool[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [newPoolName, setNewPoolName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [selectedPool, setSelectedPool] = useState<Pool | null>(null);

    useEffect(() => {
        loadPools();
    }, []);

    async function loadPools() {
        try {
            const data = await api.get<Pool[]>('/pools/my');
            setPools(data);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }

    async function createPool() {
        if (!newPoolName.trim()) return;
        const cleanName = sanitizeText(newPoolName);
        if (!isValidPoolName(cleanName)) {
            setMessage({ type: 'error', text: 'Nome inválido (3-100 caracteres, sem caracteres especiais)' });
            return;
        }
        setMessage(null);
        try {
            await api.post('/pools', { name: cleanName });
            setNewPoolName('');
            setShowCreate(false);
            setMessage({ type: 'success', text: 'Bolão criado com sucesso!' });
            await loadPools();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Erro ao criar bolão' });
        }
    }

    async function joinPool() {
        if (!joinCode.trim()) return;
        const cleanCode = joinCode.trim();
        if (!isValidInviteCode(cleanCode)) {
            setMessage({ type: 'error', text: 'Código inválido (apenas letras, números e hífens)' });
            return;
        }
        setMessage(null);
        try {
            await api.post('/pools/join', { inviteCode: cleanCode });
            setJoinCode('');
            setShowJoin(false);
            setMessage({ type: 'success', text: 'Você entrou no bolão!' });
            await loadPools();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Código inválido ou você já participa' });
        }
    }

    async function viewPool(poolId: number) {
        try {
            const data = await api.get<Pool>(`/pools/${poolId}`);
            setSelectedPool(data);
        } catch {
            // ignore
        }
    }

    async function leavePool(poolId: number) {
        setMessage(null);
        try {
            await api.delete(`/pools/${poolId}/leave`);
            setMessage({ type: 'success', text: 'Você saiu do bolão.' });
            setSelectedPool(null);
            await loadPools();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Erro ao sair' });
        }
    }

    async function deletePool(poolId: number) {
        setMessage(null);
        try {
            await api.delete(`/pools/${poolId}`);
            setMessage({ type: 'success', text: 'Bolão deletado.' });
            setSelectedPool(null);
            await loadPools();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Erro ao deletar' });
        }
    }

    if (loading) return <div className="text-center py-12 text-dark-400">{t.loading}</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold text-white">🏆 Meus Bolões</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => { setShowCreate(true); setShowJoin(false); }}
                        className="bg-primary-600 hover:bg-primary-500 text-white font-semibold px-4 py-2 rounded-xl transition-all text-sm"
                    >
                        + Criar Bolão
                    </button>
                    <button
                        onClick={() => { setShowJoin(true); setShowCreate(false); }}
                        className="bg-dark-700 hover:bg-dark-600 text-white font-semibold px-4 py-2 rounded-xl transition-all text-sm border border-dark-600"
                    >
                        🔑 Entrar com Código
                    </button>
                </div>
            </div>

            {message && (
                <div className={`p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-900/30 border border-green-500/30 text-green-300' : 'bg-red-900/30 border border-red-500/30 text-red-300'}`}>
                    {message.text}
                </div>
            )}

            {/* Create form */}
            {showCreate && (
                <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 space-y-3">
                    <h3 className="text-white font-medium">Criar Novo Bolão</h3>
                    <input
                        type="text"
                        placeholder="Nome do bolão"
                        value={newPoolName}
                        onChange={(e) => setNewPoolName(e.target.value)}
                        className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white text-sm"
                    />
                    <div className="flex gap-2">
                        <button onClick={createPool} className="bg-primary-600 hover:bg-primary-500 text-white text-sm px-4 py-2 rounded-lg">
                            Criar
                        </button>
                        <button onClick={() => setShowCreate(false)} className="text-dark-400 text-sm px-4 py-2">
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Join form */}
            {showJoin && (
                <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 space-y-3">
                    <h3 className="text-white font-medium">Entrar em um Bolão</h3>
                    <input
                        type="text"
                        placeholder="Código de convite"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white text-sm uppercase"
                    />
                    <div className="flex gap-2">
                        <button onClick={joinPool} className="bg-primary-600 hover:bg-primary-500 text-white text-sm px-4 py-2 rounded-lg">
                            Entrar
                        </button>
                        <button onClick={() => setShowJoin(false)} className="text-dark-400 text-sm px-4 py-2">
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Pool list */}
            {pools.length === 0 && !showCreate && !showJoin && (
                <p className="text-center text-dark-500 text-sm py-8">
                    Você ainda não participa de nenhum bolão privado. Crie um ou entre com um código de convite!
                </p>
            )}

            <div className="grid gap-3">
                {pools.map((pool) => (
                    <div
                        key={pool.id}
                        className="bg-dark-800 border border-dark-700 rounded-xl p-4 cursor-pointer hover:border-primary-500/40 transition-all"
                        onClick={() => viewPool(pool.id)}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-medium">{pool.name}</h3>
                                <p className="text-xs text-dark-400 mt-1">
                                    {pool.ownerId === user?.id ? '👑 Você é o dono' : 'Participante'}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-dark-500">Código:</div>
                                <div className="text-sm font-mono text-primary-300">{pool.inviteCode}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pool detail modal */}
            {selectedPool && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPool(null)}>
                    <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 max-w-md w-full space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">{selectedPool.name}</h2>
                            <button onClick={() => setSelectedPool(null)} className="text-dark-400 hover:text-white text-xl">✕</button>
                        </div>

                        <div className="bg-dark-700/50 rounded-lg p-3">
                            <div className="text-xs text-dark-400 mb-1">Código de convite:</div>
                            <div className="text-lg font-mono text-primary-300 font-bold">{selectedPool.inviteCode}</div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-dark-300 mb-2">
                                Participantes ({selectedPool.members?.length || 0})
                            </h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {selectedPool.members?.map((member) => (
                                    <div key={member.id} className="flex items-center gap-2 text-sm">
                                        <div className="w-6 h-6 bg-primary-600/20 rounded-full flex items-center justify-center text-primary-300 text-xs font-bold">
                                            {member.user?.name?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <span className="text-white">
                                            {member.user?.name || 'Desconhecido'}
                                            {member.userId === selectedPool.ownerId && ' 👑'}
                                            {member.userId === user?.id && ' (Você)'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-dark-700">
                            {selectedPool.ownerId === user?.id ? (
                                <button
                                    onClick={() => deletePool(selectedPool.id)}
                                    className="bg-red-600/20 hover:bg-red-600/30 text-red-300 text-sm px-4 py-2 rounded-lg border border-red-500/30"
                                >
                                    Deletar Bolão
                                </button>
                            ) : (
                                <button
                                    onClick={() => leavePool(selectedPool.id)}
                                    className="bg-red-600/20 hover:bg-red-600/30 text-red-300 text-sm px-4 py-2 rounded-lg border border-red-500/30"
                                >
                                    Sair do Bolão
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
