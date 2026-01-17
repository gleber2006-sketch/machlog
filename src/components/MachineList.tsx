import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { Plus, Search, QrCode, Edit, Trash2 } from 'lucide-react';

type Machine = Database['public']['Tables']['machines']['Row'];

interface MachineListProps {
    onEdit: (machine: Machine) => void;
    onShowQR: (machine: Machine) => void;
    onCreate: () => void;
}

export default function MachineList({ onEdit, onShowQR, onCreate }: MachineListProps) {
    const [machines, setMachines] = useState<Machine[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMachines();
    }, []);

    async function fetchMachines() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('machines')
                .select('*')
                .order('name');

            if (error) throw error;
            setMachines(data || []);
        } catch (error) {
            console.error('Erro ao buscar máquinas:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredMachines = machines.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header e Filtros */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar máquina..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={onCreate}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nova Máquina
                </button>
            </div>

            {/* Lista */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-medium">
                        <tr>
                            <th className="p-4">Nome</th>
                            <th className="p-4">Código</th>
                            <th className="p-4">Local</th>
                            <th className="p-4 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">Carregando...</td>
                            </tr>
                        ) : filteredMachines.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">Nenhuma máquina encontrada.</td>
                            </tr>
                        ) : (
                            filteredMachines.map((machine) => (
                                <tr key={machine.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-gray-900">{machine.name}</td>
                                    <td className="p-4 text-gray-600">{machine.code}</td>
                                    <td className="p-4 text-gray-600">{machine.location}</td>
                                    <td className="p-4 flex justify-center gap-2">
                                        <button
                                            onClick={() => onShowQR(machine)}
                                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                                            title="Ver QR Code"
                                        >
                                            <QrCode className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onEdit(machine)}
                                            className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-full"
                                            title="Editar"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
