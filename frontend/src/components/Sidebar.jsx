import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FaHome,
    FaUserGraduate,
    FaCalendarCheck,
    FaClipboardList,
    FaFileAlt,
    FaSignOutAlt,
    FaCog,
    FaEnvelope
} from 'react-icons/fa';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
    const { logout } = useAuth();
    const location = useLocation();

    const menuItems = [
        { path: '/admin', name: 'Dashboard', icon: <FaHome /> },
        { path: '/admin/students', name: 'Data Siswa', icon: <FaUserGraduate /> },
        { path: '/admin/attendance', name: 'Absensi', icon: <FaCalendarCheck /> },
        { path: '/admin/grades', name: 'Penilaian', icon: <FaClipboardList /> },
        { path: '/admin/messages', name: 'Pesan', icon: <FaEnvelope /> },
        { path: '/admin/reports', name: 'Laporan', icon: <FaFileAlt /> },
        { path: '/admin/settings', name: 'Pengaturan', icon: <FaCog /> },
    ];

    const isActive = (path) => {
        if (path === '/admin' && location.pathname === '/admin') return true;
        if (path !== '/admin' && location.pathname.startsWith(path)) return true;
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
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        E
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">English Course</h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={handleLinkClick}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                                ? 'bg-primary text-white shadow-md'
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

export default Sidebar;
