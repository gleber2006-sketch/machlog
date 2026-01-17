import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { X, Save, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid'; // Instalar: npm i uuid @types/uuid

type Machine = Database['public']['Tables']['machines']['Row'];

interface MachineFormProps {
    machineToEdit?: Machine | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function MachineForm({ machineToEdit, onClose, onSuccess }: MachineFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        location: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (machineToEdit) {
            setFormData({
                name: machineToEdit.name,
                code: machineToEdit.code,
                location: machineToEdit.location,
            });
        }
    }, [machineToEdit]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (machineToEdit) {
                // Update
                const { error } = await supabase
                    .from('machines')
                    .update({
                        name: formData.name,
                        code: formData.code,
                        location: formData.location,
                    })
                    .eq('id', machineToEdit.id);
                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('machines')
                    .insert({
                        name: formData.name,
                        code: formData.code,
                        location: formData.location,
                        qr_code_uuid: uuidv4(), // Gera identificador único para o QR
                    });
                if (error) throw error;
            }
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar máquina.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {machineToEdit ? 'Editar Máquina' : 'Nova Máquina'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome da Máquina
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="Ex: Empilhadeira Hyster 01"
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Código / TAG
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="Ex: EMP-001"
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.code}
                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Localização
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="Ex: Setor de Expedição"
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
