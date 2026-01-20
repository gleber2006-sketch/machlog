import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, UserPlus, Users as UsersIcon, Shield, User as UserIcon,
    Settings2, Loader2, Save, X, Trash2, Mail
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function Users() {
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

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

    const handleEditClick = (profile: Profile) => {
        setEditingProfile({ ...profile });
        setIsEditModalOpen(true);
    };

    const handleUpdateProfile = async () => {
        if (!editingProfile) return;
        try {
            setActionLoading(true);
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: editingProfile.full_name,
                    role: editingProfile.role,
                })
                .eq('id', editingProfile.id);

            if (error) throw error;

            setProfiles(profiles.map(p => p.id === editingProfile.id ? editingProfile : p));
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            alert('Falha ao atualizar perfil.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteProfile = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir o perfil deste usuário? Isso não removerá a conta de autenticação, apenas os dados do sistema.')) return;

        try {
            setActionLoading(true);
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setProfiles(profiles.filter(p => p.id !== id));
        } catch (error) {
            console.error('Erro ao excluir perfil:', error);
            alert('Falha ao excluir perfil.');
        } finally {
            setActionLoading(false);
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Administrador</span>;
            case 'technician':
                return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Técnico</span>;
            default:
                return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Operador</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
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
                            <h1 className="text-xl font-bold text-gray-900 leading-none mb-1">Gestão de Usuários</h1>
                            <p className="text-sm text-gray-500 hidden sm:block">Controle quem acessa o sistema.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/register')}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Cadastrar Usuário</span>
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
                                <thead className="bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wider border-b">
                                    <tr>
                                        <th className="p-4">Usuário</th>
                                        <th className="p-4">Cargo</th>
                                        <th className="p-4 hidden md:table-cell">E-mail</th>
                                        <th className="p-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {profiles.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${p.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                                                            p.role === 'technician' ? 'bg-blue-100 text-blue-600' :
                                                                'bg-green-100 text-green-600'
                                                        }`}>
                                                        {p.role === 'admin' ? <Shield className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-semibold text-gray-900 truncate">{p.full_name || 'Usuário Sem Nome'}</div>
                                                        <div className="text-[10px] text-gray-400 font-mono truncate max-w-[120px]">ID: {p.id.split('-')[0]}...</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {getRoleBadge(p.role)}
                                            </td>
                                            <td className="p-4 hidden md:table-cell">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Mail className="w-3 h-3 text-gray-400" />
                                                    {p.email || <span className="text-gray-300 italic">Não informado</span>}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        onClick={() => handleEditClick(p)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Editar Perfil"
                                                    >
                                                        <Settings2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProfile(p.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Excluir Perfil"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Edição */}
            {isEditModalOpen && editingProfile && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Settings2 className="w-5 h-5 text-blue-600" />
                                Editar Usuário
                            </h3>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome Completo</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={editingProfile.full_name || ''}
                                        onChange={(e) => setEditingProfile({ ...editingProfile, full_name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nível de Acesso</label>
                                <select
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    value={editingProfile.role}
                                    onChange={(e) => setEditingProfile({ ...editingProfile, role: e.target.value as any })}
                                >
                                    <option value="operator">Operador (Apenas Checklist)</option>
                                    <option value="technician">Técnico (Máquinas + Checklist)</option>
                                    <option value="admin">Administrador (Tudo)</option>
                                </select>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg flex gap-3">
                                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-blue-700 uppercase">E-mail de Cadastro</p>
                                    <p className="text-sm text-blue-900">{editingProfile.email || 'Não disponível'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 flex gap-3">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 py-2 text-gray-700 font-medium hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpdateProfile}
                                disabled={actionLoading}
                                className="flex-1 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
