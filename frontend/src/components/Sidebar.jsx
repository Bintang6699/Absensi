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
        <div className={`
            fixed inset-y-0 left-0 z-50 md:sticky md:top-0 md:h-screen
            bg-white w-64 shadow-xl flex flex-col
            transform transition-transform duration-300 ease-in-out
            ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
            {/* Header */}
            <div className="p-5 border-b flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        E
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white leading-tight">English Course</h1>
                        <p className="text-white/60 text-[10px]">Admin Panel</p>
                    </div>
                </div>
                <button
                    className="md:hidden text-white/80 hover:text-white p-1 -mr-1"
                    onClick={() => setIsMobileOpen(false)}
                >
                    <FaTimes className="text-xl" />
                </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={handleLinkClick}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                                ${active
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                                    : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
                                }`}
                        >
                            <span className={`text-base flex-shrink-0 ${active ? 'text-white' : 'text-gray-400'}`}>
                                {item.icon}
                            </span>
                            <span className="font-medium text-sm">{item.name}</span>
                            {active && <FaChevronRight className="ml-auto text-xs text-white/60 flex-shrink-0" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 border-t flex-shrink-0">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 active:bg-red-100 rounded-xl transition-all font-medium text-sm"
                >
                    <FaSignOutAlt className="flex-shrink-0" />
                    <span>Keluar</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
