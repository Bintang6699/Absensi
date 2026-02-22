import { useState, useEffect } from 'react';
import { FaUserGraduate, FaChalkboardTeacher, FaCalendarCheck, FaChartLine, FaBell, FaClock } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import API from '../../api/axios';
import { Link } from 'react-router-dom';

// Stat Card
const StatCard = ({ title, value, icon, color }) => {
    const colorMap = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
        green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
    };
    const c = colorMap[color] || colorMap.blue;

    return (
        <div className={`bg-white p-4 sm:p-5 rounded-xl shadow-sm border ${c.border} flex items-center gap-4 hover:shadow-md transition-shadow`}>
            <div className={`p-3 sm:p-4 rounded-xl ${c.bg} ${c.text} text-xl sm:text-2xl flex-shrink-0`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-gray-500 text-xs sm:text-sm font-medium truncate">{title}</p>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{value}</h3>
            </div>
        </div>
    );
};

// Live Clock Component
const LiveClock = () => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="flex items-center gap-2 text-right">
            <FaClock className="text-indigo-400 flex-shrink-0" />
            <div>
                <div className="text-sm sm:text-base font-bold text-gray-800 font-mono leading-none">{timeStr}</div>
                <div className="text-[10px] sm:text-xs text-gray-400 leading-none mt-0.5">{dateStr}</div>
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
        <div className="space-y-5">
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Selamat datang kembali, Admin!</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    {/* Live Clock - tampil di semua ukuran layar */}
                    <div className="bg-white rounded-xl border border-indigo-100 shadow-sm px-3 py-2">
                        <LiveClock />
                    </div>
                    {unreadMessages > 0 && (
                        <Link
                            to="/admin/messages"
                            className="bg-red-50 text-red-600 px-3 py-2 rounded-xl flex items-center gap-2 animate-pulse hover:bg-red-100 transition border border-red-100"
                        >
                            <FaBell className="flex-shrink-0" />
                            <span className="font-bold text-sm">{unreadMessages} Pesan Baru</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                    title="Total Siswa"
                    value={stats.totalStudents}
                    icon={<FaUserGraduate />}
                    color="blue"
                />
                <StatCard
                    title="Kehadiran"
                    value={`${stats.attendanceRate}%`}
                    icon={<FaCalendarCheck />}
                    color="green"
                />
                <StatCard
                    title="Rata-rata Nilai"
                    value={stats.avgGrade}
                    icon={<FaChartLine />}
                    color="purple"
                />
                <StatCard
                    title="Kelas Aktif"
                    value={stats.activeClasses}
                    icon={<FaChalkboardTeacher />}
                    color="orange"
                />
            </div>

            {/* Charts + Recent Students */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Weekly Attendance Chart */}
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Kehadiran Mingguan</h3>
                    <div className="h-56 sm:h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.weeklyAttendance} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="date" fontSize={10} tick={{ fill: '#9ca3af' }} />
                                <YAxis fontSize={10} tick={{ fill: '#9ca3af' }} />
                                <Tooltip
                                    contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Bar dataKey="Hadir" fill="#10B981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Absen" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Students */}
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base sm:text-lg font-bold text-gray-800">Siswa Terbaru</h3>
                        <Link to="/admin/students" className="text-xs sm:text-sm text-indigo-600 hover:underline font-medium">
                            Lihat Semua
                        </Link>
                    </div>
                    <div className="overflow-y-auto flex-1 max-h-52 sm:max-h-64">
                        {stats.recentStudents.length > 0 ? (
                            <div className="space-y-2">
                                {stats.recentStudents.map(student => (
                                    <div key={student._id} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg transition">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                                                {student.name?.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-medium text-gray-800 text-sm truncate">{student.name}</div>
                                                <div className="text-xs text-gray-400">{student.studentId || '-'}</div>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-2">
                                            <div className="text-xs text-gray-400">
                                                {new Date(student.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                <FaUserGraduate className="text-3xl mx-auto mb-2 opacity-30" />
                                Belum ada siswa baru
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
