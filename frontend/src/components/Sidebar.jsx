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
    FaEnvelope,
    FaTimes,
    FaChevronRight
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
        setIsMobileOpen(false);
    };

    return (
        <>
            <div className={`
                fixed inset-y-0 left-0 z-50
                bg-white w-72 md:w-64 min-h-screen shadow-xl flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Header */}
                <div className="p-5 border-b flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                            E
                        </div>
                        <h1 className="text-lg font-bold text-white">English Course</h1>
                    </div>
                    <button
                        className="md:hidden text-white/80 hover:text-white p-1"
                        onClick={() => setIsMobileOpen(false)}
                    >
                        <FaTimes className="text-xl" />
                    </button>
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
