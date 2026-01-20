import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { X, Loader2, Camera, FileText, Info, MapPin, Hash, Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

type Machine = Database['public']['Tables']['machines']['Row'];

interface MachineFormProps {
    machineToEdit?: Machine | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function MachineForm({ machineToEdit, onClose, onSuccess }: MachineFormProps) {
    const [activeTab, setActiveTab] = useState<'basic' | 'technical' | 'files'>('basic');
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        brand: '',
        model: '',
        serial_number: '',
        year_of_manufacture: '',
        location: '',
        description: '',
        main_image_url: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (machineToEdit) {
            setFormData({
                name: machineToEdit.name || '',
                code: machineToEdit.code || '',
                brand: machineToEdit.brand || '',
                model: machineToEdit.model || '',
                serial_number: machineToEdit.serial_number || '',
                year_of_manufacture: machineToEdit.year_of_manufacture?.toString() || '',
                location: machineToEdit.location || '',
                description: machineToEdit.description || '',
                main_image_url: machineToEdit.main_image_url || '',
            });
        }
    }, [machineToEdit]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                name: formData.name,
                code: formData.code,
                brand: formData.brand || null,
                model: formData.model || null,
                serial_number: formData.serial_number || null,
                year_of_manufacture: formData.year_of_manufacture ? parseInt(formData.year_of_manufacture) : null,
                location: formData.location,
                description: formData.description || null,
                main_image_url: formData.main_image_url || null,
            };

            if (machineToEdit) {
                const { error } = await supabase
                    .from('machines')
                    .update(payload)
                    .eq('id', machineToEdit.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('machines')
                    .insert({
                        ...payload,
                        qr_code_uuid: uuidv4(),
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {machineToEdit ? 'Editar Máquina' : 'Novo Equipamento'}
                        </h2>
                        <p className="text-sm text-gray-500">Preencha o prontuário técnico do ativo.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b px-6 bg-white shrink-0">
                    {[
                        { id: 'basic', label: 'Básico', icon: Info },
                        { id: 'technical', label: 'Dados Técnicos', icon: Hash },
                        { id: 'files', label: 'Anexos e Fotos', icon: Camera },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-[2px] ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <form id="machine-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl flex items-center gap-3">
                            <X className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {activeTab === 'basic' && (
                        <div className="space-y-4 animate-in slide-in-from-left-4 duration-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Equipamento *</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ex: Escavadeira Hidráulica Volvo EC210"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Código / TAG *</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Ex: ESC-001"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.code}
                                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Localização Atual *</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Ex: Obra Centro"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição Breve</label>
                                <textarea
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                                    placeholder="Informações relevantes sobre o uso ou estado geral..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'technical' && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Marca</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Caterpillar, Volvo"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.brand}
                                        onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Modelo</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: 320D, L120"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.model}
                                        onChange={e => setFormData({ ...formData, model: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nº de Série / Chassi</label>
                                    <input
                                        type="text"
                                        placeholder="Identificação do fabricante"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.serial_number}
                                        onChange={e => setFormData({ ...formData, serial_number: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ano de Fabricação</label>
                                    <input
                                        type="number"
                                        placeholder="AAAA"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.year_of_manufacture}
                                        onChange={e => setFormData({ ...formData, year_of_manufacture: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'files' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-200 text-center py-4">
                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center group hover:border-blue-400 transition-colors">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Camera className="w-8 h-8" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">Foto Principal</h3>
                                <p className="text-sm text-gray-500 mb-4">Envie uma foto clara que identifique o equipamento.</p>
                                <button type="button" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
                                    Selecionar Imagem
                                </button>
                                <p className="text-[10px] text-gray-400 mt-2 uppercase">Apenas JPG ou PNG até 5MB</p>
                            </div>

                            <div className="space-y-3 text-left">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-500" />
                                    Planos e Manuais (PDF)
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-3 bg-white border rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Plano_Inspecao.pdf</p>
                                                <p className="text-[10px] text-gray-400 uppercase">Documento Técnico</p>
                                            </div>
                                        </div>
                                        <button type="button" className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button type="button" className="w-full py-3 border-2 border-dashed rounded-xl text-sm font-semibold text-gray-400 hover:text-blue-500 hover:border-blue-400 transition-all flex items-center justify-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        Adicionar Documento
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </form>

                <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        form="machine-form"
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 shadow-lg shadow-blue-200 transition-all active:scale-95"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Equipamento'}
                    </button>
                </div>
            </div>
        </div>
    );
}
