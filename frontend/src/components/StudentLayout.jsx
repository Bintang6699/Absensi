import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Outlet } from 'react-router-dom';
import {
    FaHome,
    FaUser,
    FaCalendarAlt,
    FaStar,
    FaSignOutAlt,
    FaBars,
    FaEnvelope,
    FaClock
} from 'react-icons/fa';

const StudentSidebar = ({ isMobileOpen, setIsMobileOpen }) => {
    const { logout } = useAuth();
    const location = useLocation();

    const menuItems = [
        { path: '/student', name: 'Dashboard', icon: <FaHome /> },
        { path: '/student/biodata', name: 'Biodata', icon: <FaUser /> },
        { path: '/student/attendance', name: 'Absensi Saya', icon: <FaCalendarAlt /> },
        { path: '/student/grades', name: 'Nilai & Laporan', icon: <FaStar /> },
        { path: '/student/messages', name: 'Pesan', icon: <FaEnvelope /> },
    ];

    const isActive = (path) => {
        if (path === '/student' && location.pathname === '/student') return true;
        if (path !== '/student' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const handleLinkClick = () => {
        // Close mobile menu when a link is clicked
        if (window.innerWidth < 768) {
            setIsMobileOpen(false);
        }
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-50
                bg-white w-64 min-h-screen shadow-lg flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6 border-b flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        S
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">Student Area</h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={handleLinkClick}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                                ? 'bg-green-50 text-green-700 shadow-sm border border-green-100'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <FaSignOutAlt />
                        <span className="font-medium">Keluar</span>
                    </button>
                </div>
            </div>
        </>
    );
};

const StudentLayout = () => {
    const { user } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <StudentSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
                    <button
                        className="md:hidden text-gray-600 text-xl hover:text-green-600 transition-colors"
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                    >
                        <FaBars />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        {/* Real-time Clock */}
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-gray-600 text-sm font-medium border border-gray-200">
                            <FaClock className="text-green-600" />
                            <span>
                                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                {' - '}
                                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 border-l pl-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                                <p className="text-xs text-gray-500">Class: {user?.classLevel || 'Not Assigned'}</p>
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

                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;
