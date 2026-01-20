import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
    ArrowLeft, CheckCircle2, AlertCircle, XCircle,
    Loader2, Save, MessageSquare, ChevronRight, ChevronLeft
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Question {
    id: string;
    question: string;
    category: string;
}

interface ChecklistItem {
    question_id: string;
    status: 'ok' | 'warning' | 'fail';
    notes: string;
}

export default function Checklist() {
    const { checkinId } = useParams<{ checkinId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [responses, setResponses] = useState<Record<string, ChecklistItem>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [step, setStep] = useState(0); // For mobile-friendly step-by-step
    const [observation, setObservation] = useState('');

    useEffect(() => {
        loadQuestions();
    }, []);

    async function loadQuestions() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('checklist_questions')
                .select('*')
                .order('category', { ascending: true });

            if (error) throw error;
            setQuestions(data || []);

            // Initialize responses
            const initialResponses: Record<string, ChecklistItem> = {};
            data?.forEach(q => {
                initialResponses[q.id] = {
                    question_id: q.id,
                    status: 'ok',
                    notes: ''
                };
            });
            setResponses(initialResponses);
        } catch (err) {
            console.error('Erro ao carregar questões:', err);
        } finally {
            setLoading(false);
        }
    }

    const handleStatusChange = (questionId: string, status: 'ok' | 'warning' | 'fail') => {
        setResponses(prev => ({
            ...prev,
            [questionId]: { ...prev[questionId], status }
        }));
    };

    const handleNoteChange = (questionId: string, notes: string) => {
        setResponses(prev => ({
            ...prev,
            [questionId]: { ...prev[questionId], notes }
        }));
    };

    const handleSubmit = async () => {
        if (!checkinId || !user) return;

        try {
            setSaving(true);

            // 1. Get checkin details to get machine_id
            const { data: checkin } = await supabase
                .from('checkins')
                .select('machine_id')
                .eq('id', checkinId)
                .single();

            if (!checkin) throw new Error('Check-in não encontrado');

            // 2. Create the main checklist entry
            const hasIssues = Object.values(responses).some(r => r.status !== 'ok');
            const { data: checklist, error: checklistError } = await supabase
                .from('checklists')
                .insert({
                    checkin_id: checkinId,
                    machine_id: checkin.machine_id,
                    user_id: user.id,
                    observations: observation,
                    status: hasIssues ? 'issue_reported' : 'ok'
                })
                .select()
                .single();

            if (checklistError) throw checklistError;

            // 3. Create items
            const itemsToInsert = Object.values(responses).map(r => ({
                checklist_id: checklist.id,
                question_id: r.question_id,
                status: r.status,
                notes: r.notes
            }));

            const { error: itemsError } = await supabase
                .from('checklist_items')
                .insert(itemsToInsert);

            if (itemsError) throw itemsError;

            alert('Inspeção concluída com sucesso!');
            navigate('/operator');
        } catch (err: any) {
            console.error('Erro ao salvar checklist:', err);
            alert('Erro ao salvar: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500 animate-pulse">Carregando itens de inspeção...</p>
            </div>
        );
    }

    const currentQuestion = questions[step];
    const totalSteps = questions.length;
    const progress = ((step + 1) / totalSteps) * 100;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div className="text-center">
                    <h1 className="font-bold text-gray-900 leading-none mb-1">Inspeção Técnica</h1>
                    <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">Passo {step + 1} de {totalSteps}</p>
                </div>
                <div className="w-10" /> {/* Spacer */}
            </header>

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-gray-200 sticky top-[57px] z-20">
                <div
                    className="h-full bg-blue-600 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <main className="flex-1 flex flex-col max-w-lg mx-auto w-full p-4 md:p-6">
                {currentQuestion && (
                    <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 fade-in duration-300">
                        {/* Category Badge */}
                        <div className="mb-4">
                            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                {currentQuestion.category}
                            </span>
                        </div>

                        {/* Question Title */}
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-tight">
                            {currentQuestion.question}
                        </h2>

                        {/* Status Selection Cards */}
                        <div className="grid grid-cols-1 gap-4 mb-8">
                            {[
                                { id: 'ok', label: 'Conforme (OK)', icon: CheckCircle2, color: 'green', desc: 'Item em perfeitas condições.' },
                                { id: 'warning', label: 'Alerta / Atenção', icon: AlertCircle, color: 'orange', desc: 'Funciona, mas requer observação.' },
                                { id: 'fail', label: 'Não Conforme', icon: XCircle, color: 'red', desc: 'Item com defeito ou falha grave.' }
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => handleStatusChange(currentQuestion.id, opt.id as any)}
                                    className={cn(
                                        "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left group",
                                        responses[currentQuestion.id]?.status === opt.id
                                            ? {
                                                'border-green-500 bg-green-50': opt.id === 'ok',
                                                'border-orange-500 bg-orange-50': opt.id === 'warning',
                                                'border-red-500 bg-red-50': opt.id === 'fail',
                                            }
                                            : "border-gray-100 bg-white hover:border-gray-300"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-active:scale-90",
                                        responses[currentQuestion.id]?.status === opt.id
                                            ? {
                                                'bg-green-500 text-white': opt.id === 'ok',
                                                'bg-orange-500 text-white': opt.id === 'warning',
                                                'bg-red-500 text-white': opt.id === 'fail',
                                            }
                                            : "bg-gray-100 text-gray-400"
                                    )}>
                                        <opt.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className={cn(
                                            "font-bold text-lg leading-none mb-1",
                                            responses[currentQuestion.id]?.status === opt.id ? "text-gray-900" : "text-gray-500"
                                        )}>
                                            {opt.label}
                                        </p>
                                        <p className="text-xs text-gray-400">{opt.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Quick Notes */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-gray-400" />
                                Observações do Item (opcional)
                            </label>
                            <textarea
                                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow bg-white min-h-[100px]"
                                placeholder="Descreva qualquer detalhe relevante sobre este item..."
                                value={responses[currentQuestion.id]?.notes}
                                onChange={(e) => handleNoteChange(currentQuestion.id, e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Last Step: Overall Summary */}
                {step === totalSteps && (
                    <div className="flex-1 flex flex-col animate-in fade-in duration-300">
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center flex-1 flex flex-col justify-center">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quase Pronto!</h2>
                            <p className="text-gray-500 mb-8">Todos os itens foram verificados. Deseja adicionar uma observação geral à inspeção?</p>

                            <textarea
                                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none h-32 bg-gray-50"
                                placeholder="Ex: Máquina liberada para operação..."
                                value={observation}
                                onChange={(e) => setObservation(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Controls */}
            <footer className="bg-white border-t p-4 pb-8 md:p-6 sticky bottom-0 z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                <div className="max-w-lg mx-auto flex gap-3">
                    {step > 0 && (
                        <button
                            onClick={() => setStep(prev => prev - 1)}
                            className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Anterior
                        </button>
                    )}

                    {step < totalSteps ? (
                        <button
                            onClick={() => setStep(prev => prev + 1)}
                            className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group"
                        >
                            Próximo
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="flex-[2] py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {saving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            Finalizar Inspeção
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
}
