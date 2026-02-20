import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaBell, FaClock } from 'react-icons/fa';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
    const { user } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
                    <button
                        className="md:hidden text-gray-600 text-xl hover:text-primary transition-colors"
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                    >
                        <FaBars />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        {/* Real-time Clock */}
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-gray-600 text-sm font-medium border border-gray-200 shadow-sm">
                            <FaClock className="text-primary" />
                            <span>
                                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                {' - '}
                                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>
                        <button className="text-gray-500 hover:text-primary transition-colors relative">
                            <FaBell className="text-xl" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="flex items-center gap-3 border-l pl-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-lg font-bold text-gray-500">{user?.name?.charAt(0)}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
