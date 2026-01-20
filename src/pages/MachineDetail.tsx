import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { ArrowLeft, MapPin, Hash, Clock, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Machine = Database['public']['Tables']['machines']['Row'];

export default function MachineDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [machine, setMachine] = useState<Machine | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [creatingCheckin, setCreatingCheckin] = useState(false);

    useEffect(() => {
        loadMachine();
    }, [id]);

    async function loadMachine() {
        try {
            setLoading(true);
            // @ts-ignore
            const { data, error } = await supabase
                .from('machines')
                .select('*')
                .eq('qr_code_uuid', id)
                .single();

            if (error) throw error;
            if (!data) throw new Error('Máquina não encontrada');

            setMachine(data);
        } catch (err: any) {
            console.error('Erro ao carregar máquina:', err);
            setError(err.message || 'Erro ao carregar máquina');
        } finally {
            setLoading(false);
        }
    }

    async function handleStartInspection() {
        if (!machine || !user) return;

        try {
            setCreatingCheckin(true);
            // @ts-ignore
            const { data, error } = await supabase
                .from('checkins')
                .insert({
                    user_id: user.id,
                    machine_id: machine.id,
                    shift_start: new Date().toISOString(),
                })
                .select()
                .single();

            if (error) throw error;

            // Redirecionar para o checklist detalhado
            navigate(`/checklist/${data.id}`);
        } catch (err: any) {
            console.error('Erro ao criar check-in:', err);
            setError(err.message || 'Erro ao iniciar inspeção');
        } finally {
            setCreatingCheckin(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !machine) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-md mx-auto mt-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-800 mb-4">{error || 'Máquina não encontrada'}</p>
                        <button
                            onClick={() => navigate('/operator')}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Voltar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-4xl mx-auto p-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/operator')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Detalhes da Máquina</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 space-y-4">
                {/* Machine Info Card */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{machine.name}</h2>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-700">
                            <Hash className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500">Código</p>
                                <p className="font-medium">{machine.code}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-gray-700">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500">Localização</p>
                                <p className="font-medium">{machine.location}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={handleStartInspection}
                        disabled={creatingCheckin}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {creatingCheckin ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Iniciando...
                            </>
                        ) : (
                            <>
                                <Clock className="w-5 h-5" />
                                Iniciar Inspeção
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => alert('Documentos será implementado em breve')}
                        className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <FileText className="w-5 h-5" />
                        Ver Documentos
                    </button>
                </div>

                {/* Recent Check-ins (placeholder) */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Histórico Recente</h3>
                    <p className="text-gray-500 text-sm text-center py-4">
                        Nenhum check-in recente
                    </p>
                </div>
            </div>
        </div>
    );
}
