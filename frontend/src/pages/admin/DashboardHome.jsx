import { useState, useEffect } from 'react';
import { FaUserGraduate, FaChalkboardTeacher, FaCalendarCheck, FaChartLine, FaBell } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import API from '../../api/axios';
import { Link } from 'react-router-dom';

// Mock components for stats card
const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className={`p-4 rounded-lg bg-${color}-100 text-${color}-600 text-2xl`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
    </div>
);

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

        // Real-time notification polling (every 30s)
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                    <p className="text-gray-500">Selamat datang kembali, Admin!</p>
                </div>
                {unreadMessages > 0 && (
                    <Link to="/admin/messages" className="bg-red-50 text-red-600 px-4 py-2 rounded-lg flex items-center gap-2 animate-pulse hover:bg-red-100 transition">
                        <FaBell />
                        <span className="font-bold">{unreadMessages} Pesan Baru</span>
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Siswa"
                    value={stats.totalStudents}
                    icon={<FaUserGraduate />}
                    color="blue"
                />
                <StatCard
                    title="Kehadiran Hari Ini"
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Attendance Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Kehadiran Mingguan</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.weeklyAttendance}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" fontSize={12} />
                            <YAxis fontSize={12} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Hadir" fill="#10B981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Absen" fill="#EF4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Recent Students List */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80 overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Siswa Terbaru</h3>
                        <Link to="/admin/students" className="text-sm text-primary hover:underline">Lihat Semua</Link>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b text-gray-500">
                                    <th className="pb-2">Nama</th>
                                    <th className="pb-2">ID</th>
                                    <th className="pb-2 text-right">Bergabung</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {stats.recentStudents.map(student => (
                                    <tr key={student._id} className="hover:bg-gray-50">
                                        <td className="py-3 font-medium text-gray-800">{student.name}</td>
                                        <td className="py-3 text-gray-500">{student.studentId || '-'}</td>
                                        <td className="py-3 text-right text-gray-400">
                                            {new Date(student.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {stats.recentStudents.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="py-4 text-center text-gray-400">Belum ada siswa baru</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
