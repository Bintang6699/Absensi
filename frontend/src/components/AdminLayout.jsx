import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaTimes } from 'react-icons/fa';
import { Outlet, useLocation, Link } from 'react-router-dom';
import {
    FaHome, FaUserGraduate, FaCalendarCheck,
    FaClipboardList, FaEnvelope, FaFileAlt, FaCog
} from 'react-icons/fa';

const adminMenuItems = [
    { path: '/admin', name: 'Dashboard', shortName: 'Home', icon: <FaHome /> },
    { path: '/admin/students', name: 'Data Siswa', shortName: 'Siswa', icon: <FaUserGraduate /> },
    { path: '/admin/attendance', name: 'Absensi', shortName: 'Absensi', icon: <FaCalendarCheck /> },
    { path: '/admin/grades', name: 'Penilaian', shortName: 'Nilai', icon: <FaClipboardList /> },
    { path: '/admin/messages', name: 'Pesan', shortName: 'Pesan', icon: <FaEnvelope /> },
    { path: '/admin/reports', name: 'Laporan', shortName: 'Laporan', icon: <FaFileAlt /> },
];

// Bottom nav khusus admin
const AdminBottomNav = ({ location }) => {
    const isActive = (path) => {
        if (path === '/admin' && location.pathname === '/admin') return true;
        if (path !== '/admin' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-lg">
            <div className="flex items-stretch" style={{ height: '60px' }}>
                {adminMenuItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center flex-1 px-0.5 pt-1 pb-1 transition-all active:scale-90 relative
                                ${active ? 'text-indigo-600' : 'text-gray-400'}`}
                        >
                            {active && (
                                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-600 rounded-full"></span>
                            )}
                            <span className={`text-base mb-0.5 ${active ? 'scale-110' : ''} transition-transform`}>
                                {item.icon}
                            </span>
                            <span className="text-[9px] font-semibold leading-none text-center whitespace-nowrap">
                                {item.shortName}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

const AdminLayout = () => {
    const { user } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();

    // Tutup sidebar saat navigate
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    const currentPage = adminMenuItems.find(m =>
        m.path === '/admin'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(m.path)
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Overlay mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white shadow-sm h-14 md:h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            className="md:hidden text-gray-600 text-xl p-1 hover:text-indigo-600 transition-colors flex-shrink-0"
                            onClick={() => setIsMobileOpen(true)}
                        >
                            <FaBars />
                        </button>
                        {/* Page title (mobile) */}
                        <div className="md:hidden min-w-0">
                            <span className="font-bold text-gray-800 text-sm block truncate">
                                {currentPage?.name || 'Admin'}
                            </span>
                            <span className="text-xs text-gray-400">Panel Admin</span>
                        </div>
                        {/* Logo/Brand (desktop) */}
                        <div className="hidden md:flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                E
                            </div>
                            <span className="font-bold text-gray-800">English Course</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden ring-2 ring-indigo-100 flex-shrink-0">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                                <span className="text-base font-bold text-gray-500">{user?.name?.charAt(0)}</span>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>

            {/* Bottom Nav Mobile */}
            <AdminBottomNav location={location} />
        </div>
    );
};

export default AdminLayout;
