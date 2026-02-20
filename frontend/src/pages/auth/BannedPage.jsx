import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaSignOutAlt } from 'react-icons/fa';

const BannedPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // If user is not banned or not logged in, redirect
        if (!user) {
            navigate('/');
        } else if (!user.isBanned) {
            navigate(user.role === 'admin' ? '/admin' : '/student');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Format date DD/MM/YYYY
    const formatDate = (dateString) => {
        const date = dateString ? new Date(dateString) : new Date();
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
    };

    // Teacher contact info
    const teacherEmail = 'absensi@gmail.com';
    const teacherWhatsApp = '+62 812-3456-7890';

    if (!user || !user.isBanned) return null;

    const banReason = user.banReason || '[Alasan dari guru]';
    const banDate = formatDate(user.createdAt || user.updatedAt);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-mono">
            <div className="max-w-2xl w-full">
                {/* ASCII Box Style Ban Message */}
                <div className="bg-white border-2 border-gray-900 shadow-lg p-8">
                    <pre className="text-sm md:text-base text-gray-900 whitespace-pre-wrap break-words font-mono">{`┌─────────────────────────────────────┐
│   🚫 AKUN ANDA TELAH DI-BANNED      │
│                                     │
│   Alasan: ${banReason.padEnd(26)}│
│   Tanggal Banned: ${banDate.padEnd(17)}│
│                                     │
│   Segera hubungi guru Anda untuk   │
│   informasi lebih lanjut.          │
│                                     │
│   📧 Email: ${teacherEmail.padEnd(25)}│
│   📱 WhatsApp: ${teacherWhatsApp.padEnd(19)}│
└─────────────────────────────────────┘`}</pre>
                </div>

                {/* Button */}
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={handleLogout}
                        className="bg-gray-900 text-white py-3 px-8 font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] flex items-center justify-center gap-2"
                    >
                        <FaSignOutAlt />
                        Keluar Sekarang
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BannedPage;
