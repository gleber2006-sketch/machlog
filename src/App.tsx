import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';

// Componente para proteger rotas
function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { session, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/login" />;
    }

    return <>{children}</>;
}

import { Link } from 'react-router-dom';
import { Truck, ChevronRight } from 'lucide-react';

function Dashboard() {
    const { signOut, user, profile } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar simplificada */}
            <nav className="bg-white border-b px-4 py-3 flex justify-between items-center shadow-sm">
                <div className="font-bold text-xl text-blue-600">MachLog</div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 hidden sm:inline">{user?.email}</span>
                    <button
                        onClick={() => signOut()}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                        Sair
                    </button>
                </div>
            </nav>

            {/* Conteúdo */}
            <main className="p-4 sm:p-8 max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Olá, {profile?.full_name || 'Usuário'}</h1>
                    <p className="text-gray-500">Selecione uma opção para começar.</p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Card Máquinas */}
                    <Link to="/machines" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group border border-gray-100">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Truck className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-2 flex items-center justify-between">
                            Gestão de Máquinas
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                        </h3>
                        <p className="text-sm text-gray-500">
                            Cadastre equipamentos, gere etiquetas QR Code e visualize a frota.
                        </p>
                    </Link>

                    {/* Placeholder para futuras funcionalidades */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-200 opacity-75">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                        <h3 className="font-semibold text-gray-400 mb-2">Check-in Operacional</h3>
                        <p className="text-sm text-gray-400">Em breve...</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

import Machines from './pages/Machines';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/machines"
                        element={
                            <PrivateRoute>
                                <Machines />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
