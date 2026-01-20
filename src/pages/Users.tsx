import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Users as UsersIcon, Shield, User as UserIcon, Settings2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function Users() {
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfiles();
    }, []);

    async function fetchProfiles() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProfiles(data || []);
        } catch (error) {
            console.error('Erro ao buscar perfis:', error);
        } finally {
            setLoading(false);
        }
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold uppercase">Administrador</span>;
            case 'technician':
                return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">Técnico</span>;
            default:
                return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase">Operador</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="max-w-4xl mx-auto p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Gestão de Usuários</h1>
                            <p className="text-sm text-gray-500 hidden sm:block">Controle quem acessa o sistema.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/register')}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Novo Usuário</span>
                        <span className="sm:hidden">Novo</span>
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                        <p className="text-gray-500">Carregando usuários...</p>
                    </div>
                ) : profiles.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UsersIcon className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Nenhum usuário encontrado</h2>
                        <p className="text-gray-500 mb-6">Comece cadastrando o primeiro operador ou técnico do sistema.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-600 text-sm font-semibold border-b">
                                    <tr>
                                        <th className="p-4">Usuário</th>
                                        <th className="p-4">Papel / Nível</th>
                                        <th className="p-4">Data Cadastro</th>
                                        <th className="p-4 text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {profiles.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${p.role === 'admin' ? 'bg-purple-50 text-purple-600' : p.role === 'technician' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                                        {p.role === 'admin' ? <Shield className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{p.full_name || 'Sem nome'}</div>
                                                        <div className="text-xs text-gray-400 font-mono truncate max-w-[150px]">{p.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {getRoleBadge(p.role)}
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">
                                                {new Date(p.created_at).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => alert('Edição de usuário virá em breve')}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Settings2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
