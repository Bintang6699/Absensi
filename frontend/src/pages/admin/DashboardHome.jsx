import { useState, useEffect } from 'react';
import {
    FaUserGraduate, FaChalkboardTeacher, FaCalendarCheck,
    FaChartLine, FaBell, FaClock, FaArrowUp
} from 'react-icons/fa';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer
} from 'recharts';
import API from '../../api/axios';
import { Link } from 'react-router-dom';

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-100 shadow-xl rounded-xl px-3 py-2 text-xs">
                {label && <p className="font-bold text-gray-700 mb-1">{label}</p>}
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color }} className="font-semibold">
                        {p.name}: <span className="font-bold">{p.value}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Stat Card premium dengan gradient
const StatCard = ({ title, value, icon, gradient, sub }) => (
    <div className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 text-white ${gradient} shadow-lg`}>
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
                <p className="text-white/70 text-xs font-medium mb-1 truncate">{title}</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold leading-none">{value}</h3>
                {sub && (
                    <p className="text-white/60 text-[10px] mt-1.5 flex items-center gap-1">
                        <FaArrowUp className="text-[8px]" />{sub}
                    </p>
                )}
            </div>
            <div className="text-white/25 text-3xl sm:text-4xl flex-shrink-0">{icon}</div>
        </div>
        {/* Dekoratif */}
        <div className="absolute -bottom-5 -right-5 w-20 h-20 rounded-full bg-white/10" />
        <div className="absolute -bottom-2 -right-10 w-28 h-28 rounded-full bg-white/5" />
    </div>
);

// Live Clock Component
const LiveClock = () => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="flex items-center gap-2">
            <FaClock className="text-indigo-400 flex-shrink-0 text-xs sm:text-sm" />
            <div>
                <div className="text-xs sm:text-sm font-bold text-gray-800 font-mono leading-none">{timeStr}</div>
                <div className="text-[10px] text-gray-400 leading-none mt-0.5 hidden sm:block">{dateStr}</div>
            </div>
        </div>
    );
};

const DashboardHome = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        attendanceRate: 0,
        avgGrade: 0,
        activeClasses: 0,
        weeklyAttendance: [],
        recentStudents: []
    });
    const [unreadMessages, setUnreadMessages] = useState(0);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await API.get('/dashboard/stats');
                setStats(data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            }
        };
        const fetchUnread = async () => {
            try {
                const { data } = await API.get('/messages/unread/count');
                setUnreadMessages(data.unreadCount);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };
        fetchStats();
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-4 sm:space-y-5">
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                    <h1 className="text-lg sm:text-2xl font-extrabold text-gray-800">Dashboard Overview</h1>
                    <p className="text-gray-400 text-xs sm:text-sm mt-0.5">Selamat datang kembali, Admin!</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="bg-white rounded-xl border border-indigo-100 shadow-sm px-3 py-2">
                        <LiveClock />
                    </div>
                    {unreadMessages > 0 && (
                        <Link
                            to="/admin/messages"
                            className="bg-red-500 text-white px-3 py-2 rounded-xl flex items-center gap-2 animate-pulse hover:bg-red-600 transition shadow-md shadow-red-100 text-xs font-bold"
                        >
                            <FaBell className="flex-shrink-0" />
                            <span>{unreadMessages} Pesan Baru</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Stat Cards — 2 kolom mobile, 4 kolom desktop */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                    title="Total Siswa"
                    value={stats.totalStudents}
                    icon={<FaUserGraduate />}
                    gradient="bg-gradient-to-br from-blue-500 to-blue-700"
                    sub="Siswa terdaftar"
                />
                <StatCard
                    title="Kehadiran"
                    value={`${stats.attendanceRate}%`}
                    icon={<FaCalendarCheck />}
                    gradient="bg-gradient-to-br from-emerald-500 to-green-700"
                    sub="Rata-rata kehadiran"
                />
                <StatCard
                    title="Rata-rata Nilai"
                    value={stats.avgGrade}
                    icon={<FaChartLine />}
                    gradient="bg-gradient-to-br from-purple-500 to-violet-700"
                    sub="Semua mata pelajaran"
                />
                <StatCard
                    title="Kelas Aktif"
                    value={stats.activeClasses}
                    icon={<FaChalkboardTeacher />}
                    gradient="bg-gradient-to-br from-orange-400 to-rose-500"
                    sub="Kelas berjalan"
                />
            </div>

            {/* Charts + Recent Students */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4">
                {/* Weekly Attendance Chart — lebih lebar */}
                <div className="lg:col-span-3 bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm sm:text-base font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                            Kehadiran Mingguan
                        </h3>
                    </div>
                    <div className="h-48 sm:h-60">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.weeklyAttendance} margin={{ top: 0, right: 4, left: -28, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="date"
                                    fontSize={9}
                                    tick={{ fill: '#9ca3af' }}
                                    interval={0}
                                />
                                <YAxis fontSize={9} tick={{ fill: '#9ca3af' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    iconType="circle"
                                    iconSize={8}
                                    formatter={(v) => <span className="text-xs text-gray-600">{v}</span>}
                                />
                                <Bar dataKey="Hadir" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                                <Bar dataKey="Absen" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Students */}
                <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm sm:text-base font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                            Siswa Terbaru
                        </h3>
                        <Link
                            to="/admin/students"
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold bg-indigo-50 px-2 py-1 rounded-lg transition"
                        >
                            Lihat Semua →
                        </Link>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1 max-h-52 sm:max-h-60">
                        {stats.recentStudents.length > 0 ? (
                            stats.recentStudents.map((student, idx) => (
                                <div
                                    key={student._id}
                                    className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        {/* Avatar dengan warna bergantian */}
                                        <div
                                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                            style={{
                                                background: [
                                                    'linear-gradient(135deg,#4F46E5,#7C3AED)',
                                                    'linear-gradient(135deg,#059669,#10B981)',
                                                    'linear-gradient(135deg,#DC2626,#F97316)',
                                                    'linear-gradient(135deg,#0EA5E9,#6366F1)',
                                                    'linear-gradient(135deg,#D97706,#F59E0B)',
                                                ][idx % 5]
                                            }}
                                        >
                                            {student.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-semibold text-gray-800 text-xs sm:text-sm truncate">
                                                {student.name}
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-mono">
                                                {student.studentId || '-'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-gray-400 flex-shrink-0 ml-2 bg-gray-50 group-hover:bg-white px-2 py-1 rounded-lg transition">
                                        {new Date(student.createdAt).toLocaleDateString('id-ID', {
                                            day: 'numeric', month: 'short'
                                        })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-300">
                                <FaUserGraduate className="text-4xl mx-auto mb-2" />
                                <p className="text-xs">Belum ada siswa baru</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
