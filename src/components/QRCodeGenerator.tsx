import { X, Printer, Download } from 'lucide-react';
import QRCode from 'react-qr-code';
import { Database } from '../lib/database.types';

type Machine = Database['public']['Tables']['machines']['Row'];

interface QRCodeGeneratorProps {
    machine: Machine;
    onClose: () => void;
}

export default function QRCodeGenerator({ machine, onClose }: QRCodeGeneratorProps) {

    // URL que será aberta ao escanear (por enquanto, apenas o ID)
    // Futuro: https://machlog.app/scan?id=...
    const qrValue = JSON.stringify({
        type: 'machlog_machine',
        id: machine.id,
        code: machine.code
    });

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 print:p-0 print:bg-white">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 print:shadow-none print:w-full print:max-w-none">

                {/* Header (Esconder na impressão) */}
                <div className="flex justify-between items-center p-4 border-b print:hidden">
                    <h2 className="text-lg font-semibold text-gray-900">QR Code da Máquina</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col items-center text-center space-y-4">
                    <div className="border-4 border-black p-4 rounded-lg bg-white">
                        <QRCode
                            value={qrValue}
                            size={200}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 256 256`}
                        />
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{machine.name}</h3>
                        <p className="text-gray-500 font-mono text-lg">{machine.code}</p>
                        <p className="text-xs text-gray-400 mt-1">{machine.location}</p>
                    </div>

                    <div className="text-xs text-gray-400 print:hidden">
                        ID: {machine.id}
                    </div>
                </div>

                {/* Footer Actions (Esconder na impressão) */}
                <div className="p-4 bg-gray-50 flex gap-3 justify-center print:hidden">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <Printer className="w-4 h-4" />
                        Imprimir
                    </button>
                </div>
            </div>
        </div>
    );
}
