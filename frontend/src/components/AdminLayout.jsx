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
    { path: '/admin', name: 'Dashboard', icon: <FaHome /> },
    { path: '/admin/students', name: 'Siswa', icon: <FaUserGraduate /> },
    { path: '/admin/attendance', name: 'Absensi', icon: <FaCalendarCheck /> },
    { path: '/admin/grades', name: 'Nilai', icon: <FaClipboardList /> },
    { path: '/admin/messages', name: 'Pesan', icon: <FaEnvelope /> },
];

// Bottom nav khusus admin - hanya menu utama supaya tidak sesak
const AdminBottomNav = ({ location }) => {
    const isActive = (path) => {
        if (path === '/admin' && location.pathname === '/admin') return true;
        if (path !== '/admin' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-lg">
            <div className="flex items-center justify-around h-16">
                {adminMenuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all active:scale-90 ${isActive(item.path) ? 'text-indigo-600' : 'text-gray-400'
                            }`}
                    >
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-[10px] font-medium leading-tight">{item.name}</span>
                    </Link>
                ))}
                {/* Tombol "More" untuk menu lain */}
                <Link
                    to="/admin/reports"
                    className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all active:scale-90 ${location.pathname.startsWith('/admin/reports') || location.pathname.startsWith('/admin/settings')
                            ? 'text-indigo-600' : 'text-gray-400'
                        }`}
                >
                    <span className="text-lg"><FaFileAlt /></span>
                    <span className="text-[10px] font-medium leading-tight">Laporan</span>
                </Link>
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

    const currentPageName = adminMenuItems.find(m =>
        m.path === '/admin'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(m.path)
    )?.name || 'Admin';

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
                    <div className="flex items-center gap-3">
                        <button
                            className="md:hidden text-gray-600 text-xl p-1 hover:text-indigo-600 transition-colors"
                            onClick={() => setIsMobileOpen(true)}
                        >
                            <FaBars />
                        </button>
                        <span className="md:hidden font-semibold text-gray-700 text-sm">
                            {currentPageName}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden ring-2 ring-indigo-100">
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
