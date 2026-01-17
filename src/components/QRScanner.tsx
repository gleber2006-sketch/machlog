import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { X, Camera } from 'lucide-react';

interface QRScannerProps {
    onScan: (qrCodeUuid: string) => void;
    onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);
    const readerRef = useRef<BrowserMultiFormatReader | null>(null);

    useEffect(() => {
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        const startScanning = async () => {
            try {
                const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();

                if (videoInputDevices.length === 0) {
                    setError('Nenhuma câmera encontrada');
                    return;
                }

                // Preferir câmera traseira em dispositivos móveis
                const backCamera = videoInputDevices.find((device: MediaDeviceInfo) =>
                    device.label.toLowerCase().includes('back') ||
                    device.label.toLowerCase().includes('traseira')
                );
                const selectedDevice = backCamera || videoInputDevices[0];

                reader.decodeFromVideoDevice(
                    selectedDevice.deviceId,
                    videoRef.current!,
                    (result) => {
                        if (result) {
                            const qrText = result.getText();
                            // Validar se é um UUID válido
                            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                            if (uuidRegex.test(qrText)) {
                                onScan(qrText);
                            } else {
                                setError('QR Code inválido. Escaneie um QR Code de máquina válido.');
                            }
                        }
                    }
                );
            } catch (err: any) {
                console.error('Erro ao acessar câmera:', err);
                setError('Erro ao acessar câmera. Verifique as permissões.');
            }
        };

        startScanning();

        // Cleanup automático
        return () => { };
    }, [onScan]);

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Header */}
            <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Camera className="w-6 h-6" />
                    <h2 className="text-lg font-semibold">Escanear QR Code</h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Video Preview */}
            <div className="flex-1 relative flex items-center justify-center bg-black">
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                />

                {/* Scanning Frame */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 border-4 border-blue-500 rounded-lg shadow-lg">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                    </div>
                </div>
            </div>

            {/* Instructions / Error */}
            <div className="bg-gray-900 text-white p-6 text-center">
                {error ? (
                    <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
                        <p className="text-red-200">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="mt-2 text-sm underline"
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : (
                    <div>
                        <p className="text-lg font-medium mb-2">Posicione o QR Code no centro</p>
                        <p className="text-sm text-gray-400">
                            O código será detectado automaticamente
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
