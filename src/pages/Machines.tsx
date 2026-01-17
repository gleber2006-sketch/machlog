import { useState } from 'react';
import type { Database } from '../lib/database.types';
import MachineList from '../components/MachineList';
import MachineForm from '../components/MachineForm';
import QRCodeGenerator from '../components/QRCodeGenerator';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

type Machine = Database['public']['Tables']['machines']['Row'];

export default function Machines() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
    const [qrMachine, setQrMachine] = useState<Machine | null>(null);
    const [refreshKey, setRefreshKey] = useState(0); // Hack simples para recarregar lista

    const handleCreate = () => {
        setEditingMachine(null);
        setIsFormOpen(true);
    };

    const handleEdit = (machine: Machine) => {
        setEditingMachine(machine);
        setIsFormOpen(true);
    };

    const handleSuccess = () => {
        setIsFormOpen(false);
        setEditingMachine(null);
        setRefreshKey(old => old + 1); // Força recarregamento da lista
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Breadcrumb / Header */}
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 hover:bg-white rounded-full transition-colors text-gray-600">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestão de Máquinas</h1>
                        <p className="text-gray-500">Cadastre e gerencie os equipamentos da frota.</p>
                    </div>
                </div>

                {/* Lista Principal */}
                <MachineList
                    key={refreshKey} // Força remontagem ao atualizar
                    onCreate={handleCreate}
                    onEdit={handleEdit}
                    onShowQR={setQrMachine}
                />

                {/* Modais */}
                {isFormOpen && (
                    <MachineForm
                        machineToEdit={editingMachine}
                        onClose={() => setIsFormOpen(false)}
                        onSuccess={handleSuccess}
                    />
                )}

                {qrMachine && (
                    <QRCodeGenerator
                        machine={qrMachine}
                        onClose={() => setQrMachine(null)}
                    />
                )}
            </div>
        </div>
    );
}
