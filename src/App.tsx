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
import { Truck, ChevronRight, Users as UsersIcon } from 'lucide-react';

function Dashboard() {
    const { signOut, user, profile } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar simplificada */}
            <nav className="bg-white border-b px-4 py-3 flex justify-between items-center shadow-sm">
                <div className="font-bold text-xl text-blue-600">Machlog</div>
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
                    {/* Card Máquinas - Disponível para Técnico e Admin */}
                    {(profile?.role === 'technician' || profile?.role === 'admin') && (
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
                    )}

                    {/* Card Scanner - Disponível para todos (Técnico também pode fazer se ausência do operador) */}
                    <Link to="/operator" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group border border-gray-100">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 00-1 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-2 flex items-center justify-between">
                            Escanear Máquina
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors" />
                        </h3>
                        <p className="text-sm text-gray-500">
                            Escaneie QR Code e faça check-in para iniciar inspeção.
                        </p>
                    </Link>

                    {/* Card Gestão de Usuários - Apenas Admin */}
                    {profile?.role === 'admin' && (
                        <Link to="/users" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group border border-gray-100">
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <UsersIcon className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-2 flex items-center justify-between">
                                Gestão de Usuários
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-500 transition-colors" />
                            </h3>
                            <p className="text-sm text-gray-500">
                                Gerencie níveis de acesso e cadastre novos usuários.
                            </p>
                        </Link>
                    )}
                </div>
            </main>
        </div>
    );
}

import Machines from './pages/Machines';
import OperatorDashboard from './pages/OperatorDashboard';
import MachineDetail from './pages/MachineDetail';
import Users from './pages/Users';

function AppRoutes() {
    const { profile } = useAuth();

    return (
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
                        {profile?.role === 'technician' || profile?.role === 'admin' ? (
                            <Machines />
                        ) : (
                            <Navigate to="/" />
                        )}
                    </PrivateRoute>
                }
            />
            <Route
                path="/operator"
                element={
                    <PrivateRoute>
                        <OperatorDashboard />
                    </PrivateRoute>
                }
            />
            <Route
                path="/machine/:id"
                element={
                    <PrivateRoute>
                        <MachineDetail />
                    </PrivateRoute>
                }
            />
            <Route
                path="/users"
                element={
                    <PrivateRoute>
                        {profile?.role === 'admin' ? <Users /> : <Navigate to="/" />}
                    </PrivateRoute>
                }
            />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
