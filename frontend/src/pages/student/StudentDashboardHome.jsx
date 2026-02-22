import { useState, useEffect, useRef } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StudentStats from '../../components/StudentStats';
import DashboardEditor from '../../components/DashboardEditor';
import SimpleRichText from '../../components/SimpleRichText';
import { FaEdit, FaImage, FaClock } from 'react-icons/fa';
import Swal from 'sweetalert2';

// Live Clock
const LiveClock = () => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="bg-white rounded-xl border border-green-100 shadow-sm px-3 py-2 flex items-center gap-2">
            <FaClock className="text-green-400 flex-shrink-0 text-sm" />
            <div>
                <div className="text-sm font-bold text-gray-800 font-mono leading-none">{timeStr}</div>
                <div className="text-[10px] text-gray-400 leading-none mt-0.5 hidden sm:block">{dateStr}</div>
            </div>
        </div>
    );
};

const StudentDashboardHome = () => {
    const { user, refreshUser } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [widgets, setWidgets] = useState([]);

    const saveTimeout = useRef(null);

    const defaultWidgets = [
        { id: 'overview', type: 'System', content: 'Ringkasan Akademik' },
        { id: 'motivation', type: 'System', content: 'Kutipan Motivasi' },
        { id: 'notes', type: 'Custom', content: 'Catatan Pribadi', data: '' },
    ];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await API.get(`/grades/summary/${user._id}`);
                setStats(data);
            } catch (error) {
                console.error("Error fetching student stats", error);
            } finally {
                setLoading(false);
            }
        };

        if (user?._id) {
            fetchStats();
            if (user.dashboardConfig && user.dashboardConfig.length > 0) {
                setWidgets(user.dashboardConfig);
            } else {
                setWidgets(defaultWidgets);
            }
        }
    }, [user]);

    const handleSaveLayout = async (newWidgets) => {
        try {
            await API.put(`/students/${user._id}`, {
                dashboardConfig: newWidgets
            });
            setWidgets(newWidgets);
            setIsEditing(false);
            refreshUser();
            Swal.fire('Sukses', 'Tata letak dashboard tersimpan', 'success');
        } catch (error) {
            Swal.fire('Error', 'Gagal menyimpan tata letak', 'error');
        }
    };

    const updateWidgetData = (id, newData) => {
        const updatedWidgets = widgets.map(w =>
            w.id === id ? { ...w, data: newData } : w
        );
        setWidgets(updatedWidgets);

        if (saveTimeout.current) clearTimeout(saveTimeout.current);

        saveTimeout.current = setTimeout(async () => {
            try {
                await API.put(`/students/${user._id}`, {
                    dashboardConfig: updatedWidgets
                });
            } catch (error) {
                console.error("Failed to auto-save widget data", error);
            }
        }, 1000);
    };

    const renderWidget = (widget) => {
        switch (widget.type) {
            case 'System':
                if (widget.id === 'overview')
                    return stats
                        ? <StudentStats key={widget.id} data={stats} />
                        : <div key={widget.id} className="animate-pulse bg-gray-200 h-48 rounded-xl"></div>;
                if (widget.id === 'motivation') return (
                    <div key={widget.id} className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 sm:p-8 text-white flex flex-col justify-center shadow-lg">
                        <h2 className="text-lg sm:text-xl font-bold mb-2">Terus Semangat! 💪</h2>
                        <p className="opacity-90 italic text-sm sm:text-base leading-relaxed">
                            "Pendidikan adalah senjata paling ampuh yang bisa kamu gunakan untuk mengubah dunia."
                        </p>
                        <p className="text-white/60 text-xs mt-3">— Nelson Mandela</p>
                    </div>
                );
                return null;

            case 'Image':
                return (
                    <div key={widget.id} className="rounded-2xl overflow-hidden shadow-sm h-full max-h-64 relative bg-gray-100 flex items-center justify-center">
                        {widget.data ? (
                            <img src={widget.data} alt="Dashboard Widget" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-gray-400 flex flex-col items-center py-8">
                                <FaImage size={32} />
                                <span className="text-xs mt-2">Gambar belum diatur</span>
                            </div>
                        )}
                    </div>
                );

            case 'Custom':
                return (
                    <div key={widget.id} className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 h-full flex flex-col relative shadow-sm min-h-[250px]">
                        <div className="flex justify-between items-center mb-2 border-b border-yellow-200 pb-2">
                            <h3 className="font-bold text-yellow-800 flex items-center gap-2 text-sm">
                                <span className="p-1 bg-yellow-200 rounded text-xs"><FaEdit /></span>
                                {widget.content}
                            </h3>
                            <span className="text-[10px] text-yellow-600 italic">Auto-save</span>
                        </div>
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <SimpleRichText
                                initialValue={widget.data || ''}
                                onChange={(html) => updateWidgetData(widget.id, html)}
                                placeholder="Tulis catatanmu di sini..."
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-12 text-gray-400">
            <div className="animate-spin w-8 h-8 border-4 border-green-200 border-t-green-500 rounded-full mb-3"></div>
            <p className="text-sm">Memuat dashboard...</p>
        </div>
    );

    return (
        <div className="space-y-5 pb-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                        Halo, {user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="bg-green-100 text-green-700 text-xs font-mono py-1 px-2 rounded-md">
                            {user?.studentId || 'ID: -'}
                        </span>
                        <span className="text-gray-400 text-xs hidden sm:inline">•</span>
                        <p className="text-gray-500 text-xs sm:text-sm hidden sm:block">Sesuaikan dashboard-mu.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Clock tampil di semua ukuran */}
                    <LiveClock />
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-50 transition shadow-sm text-sm font-medium"
                    >
                        <FaEdit className="flex-shrink-0" />
                        <span className="hidden sm:inline">Atur Layout</span>
                    </button>
                </div>
            </div>

            {/* Widget Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {widgets.map(widget => (
                    <div
                        key={widget.id}
                        className={widget.id === 'overview' ? 'md:col-span-2 lg:col-span-2' : 'h-full'}
                    >
                        {renderWidget(widget)}
                    </div>
                ))}
            </div>

            {isEditing && (
                <DashboardEditor
                    initialConfig={widgets}
                    onSave={handleSaveLayout}
                    onCancel={() => setIsEditing(false)}
                />
            )}
        </div>
    );
};

export default StudentDashboardHome;
