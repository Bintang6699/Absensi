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
    FaTimes,
    FaChevronRight
} from 'react-icons/fa';

const menuItems = [
    { path: '/student', name: 'Dashboard', icon: <FaHome /> },
    { path: '/student/biodata', name: 'Biodata', icon: <FaUser /> },
    { path: '/student/attendance', name: 'Absensi Saya', icon: <FaCalendarAlt /> },
    { path: '/student/grades', name: 'Nilai & Laporan', icon: <FaStar /> },
    { path: '/student/messages', name: 'Pesan', icon: <FaEnvelope /> },
];

const StudentSidebar = ({ isMobileOpen, setIsMobileOpen }) => {
    const { logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => {
        if (path === '/student' && location.pathname === '/student') return true;
        if (path !== '/student' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const handleLinkClick = () => {
        setIsMobileOpen(false);
    };

    return (
        <>
            {/* Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 md:relative md:z-auto
                bg-white w-72 md:w-64 min-h-screen shadow-xl flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Header Sidebar */}
                <div className="p-5 border-b flex items-center justify-between bg-gradient-to-r from-green-600 to-emerald-500">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                            S
                        </div>
                        <h1 className="text-lg font-bold text-white">Student Area</h1>
                    </div>
                    {/* Tombol tutup (mobile only) */}
                    <button
                        className="md:hidden text-white/80 hover:text-white p-1"
                        onClick={() => setIsMobileOpen(false)}
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={handleLinkClick}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${isActive(item.path)
                                    ? 'bg-green-50 text-green-700 shadow-sm border border-green-100 font-semibold'
                                    : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
                                }`}
                        >
                            <span className={`text-base ${isActive(item.path) ? 'text-green-600' : 'text-gray-400'}`}>
                                {item.icon}
                            </span>
                            <span className="font-medium text-sm">{item.name}</span>
                            {isActive(item.path) && (
                                <FaChevronRight className="ml-auto text-xs text-green-400" />
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="p-3 border-t">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-red-500 hover:bg-red-50 active:bg-red-100 rounded-xl transition-all font-medium text-sm"
                    >
                        <FaSignOutAlt />
                        <span>Keluar</span>
                    </button>
                </div>
            </div>
        </>
    );
};

// Bottom Navigation Bar untuk Mobile
const BottomNav = ({ location }) => {
    const isActive = (path) => {
        if (path === '/student' && location.pathname === '/student') return true;
        if (path !== '/student' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 safe-area-bottom shadow-lg">
            <div className="flex items-center justify-around h-16">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all active:scale-90 ${isActive(item.path)
                                ? 'text-green-600'
                                : 'text-gray-400'
                            }`}
                    >
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-[10px] font-medium leading-tight">{item.name}</span>
                        {isActive(item.path) && (
                            <span className="absolute bottom-0 w-1 h-1 bg-green-600 rounded-full mb-1" />
                        )}
                    </Link>
                ))}
            </div>
        </nav>
    );
};

const StudentLayout = () => {
    const { user } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();

    // Tutup sidebar saat navigate
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar (visible desktop only) */}
            <div className="hidden md:block">
                <StudentSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
            </div>

            {/* Mobile Sidebar (drawer) */}
            {isMobileOpen && (
                <StudentSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white shadow-sm h-14 md:h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        {/* Hamburger (mobile only) */}
                        <button
                            className="md:hidden text-gray-600 text-xl p-1 hover:text-green-600 transition-colors"
                            onClick={() => setIsMobileOpen(true)}
                        >
                            <FaBars />
                        </button>

                        {/* Title halaman (mobile) */}
                        <span className="md:hidden font-semibold text-gray-700 text-sm">
                            {menuItems.find(m =>
                                m.path === '/student'
                                    ? location.pathname === '/student'
                                    : location.pathname.startsWith(m.path)
                            )?.name || 'Student Area'}
                        </span>
                    </div>

                    {/* User info */}
                    <div className="flex items-center gap-3">
                        {/* Nama + kelas – hanya desktop */}
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                            <p className="text-xs text-gray-500">Kelas: {user?.classLevel || '-'}</p>
                        </div>
                        {/* Avatar */}
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden ring-2 ring-green-100">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                                <span className="text-base font-bold text-gray-500">{user?.name?.charAt(0)}</span>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content — tambah padding bottom agar tidak ketutup BottomNav */}
                <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>

            {/* Bottom Navigation (mobile only) */}
            <BottomNav location={location} />
        </div>
    );
};

export default StudentLayout;
