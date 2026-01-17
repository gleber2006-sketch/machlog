import { useState } from 'react';
import { QrCode } from 'lucide-react';
import QRScanner from '../components/QRScanner';
import { useNavigate } from 'react-router-dom';

export default function OperatorDashboard() {
    const [showScanner, setShowScanner] = useState(false);
    const navigate = useNavigate();

    const handleQRScan = (qrCodeUuid: string) => {
        setShowScanner(false);
        navigate(`/machine/${qrCodeUuid}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Operador</h1>
                    <p className="text-gray-600">Escaneie uma máquina para iniciar inspeção</p>
                </div>

                {/* Main Action Button */}
                <button
                    onClick={() => setShowScanner(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95"
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                            <QrCode className="w-12 h-12" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Escanear QR Code</h2>
                            <p className="text-blue-100">Toque para abrir a câmera</p>
                        </div>
                    </div>
                </button>

                {/* Recent Check-ins (placeholder for now) */}
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Inspeções Recentes</h3>
                    <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                        Nenhuma inspeção recente
                    </div>
                </div>
            </div>

            {/* QR Scanner Modal */}
            {showScanner && (
                <QRScanner
                    onScan={handleQRScan}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </div>
    );
}
