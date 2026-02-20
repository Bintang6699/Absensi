import { useState, useEffect, useRef } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StudentStats from '../../components/StudentStats';
import DashboardEditor from '../../components/DashboardEditor';
import SimpleRichText from '../../components/SimpleRichText';
import { FaEdit, FaImage, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';

const StudentDashboardHome = () => {
    const { user, refreshUser } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [widgets, setWidgets] = useState([]);

    // Auto-save debouncer
    const saveTimeout = useRef(null);

    // Default widgets configuration
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
            // Load widgets from user config or defaults
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

        // Debounce Auto-save
        if (saveTimeout.current) clearTimeout(saveTimeout.current);

        saveTimeout.current = setTimeout(async () => {
            try {
                await API.put(`/students/${user._id}`, {
                    dashboardConfig: updatedWidgets
                });
            } catch (error) {
                console.error("Failed to auto-save widget data", error);
            }
        }, 1000); // Save after 1 second of inactivity
    };

    // Widget Renderers
    const renderWidget = (widget) => {
        switch (widget.type) {
            case 'System':
                if (widget.id === 'overview') return stats ? <StudentStats key={widget.id} data={stats} /> : <div key={widget.id} className="animate-pulse bg-gray-200 h-48 rounded-xl"></div>;
                if (widget.id === 'motivation') return (
                    <div key={widget.id} className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white h-full flex flex-col justify-center shadow-lg">
                        <h2 className="text-xl font-bold mb-2">Terus Semangat!</h2>
                        <p className="opacity-90 italic">
                            "Pendidikan adalah senjata paling ampuh yang bisa kamu gunakan untuk mengubah dunia."
                        </p>
                    </div>
                );
                return null;

            case 'Image':
                return (
                    <div key={widget.id} className="rounded-2xl overflow-hidden shadow-sm h-full max-h-64 relative bg-gray-100 flex items-center justify-center">
                        {widget.data ? (
                            <img src={widget.data} alt="Dashboard Widget" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-gray-400 flex flex-col items-center">
                                <FaImage size={32} />
                                <span className="text-xs mt-2">Gambar belum diatur</span>
                            </div>
                        )}
                    </div>
                );

            case 'Custom': // Notes
                return (
                    <div key={widget.id} className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 h-full flex flex-col relative group shadow-sm min-h-[250px]">
                        <div className="flex justify-between items-center mb-2 border-b border-yellow-200 pb-2">
                            <h3 className="font-bold text-yellow-800 flex items-center gap-2 text-sm">
                                <span className="p-1 bg-yellow-200 rounded text-xs"><FaEdit /></span> {widget.content}
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

    if (loading) return <div className="p-8 text-center text-gray-500">Memuat dashboard...</div>;

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Halo, {user?.name}!</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-mono py-1 px-2 rounded-md">
                            {user?.studentId || 'ID: -'}
                        </span>
                        <p className="text-gray-500 text-sm hidden sm:block">Sesuaikan dashboard-mu agar lebih nyaman.</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm"
                >
                    <FaEdit /> Atur Layout
                </button>
            </div>

            {/* Grid Layout based on widgets order */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {widgets.map(widget => (
                    <div key={widget.id} className={widget.id === 'overview' ? 'md:col-span-2 lg:col-span-2' : 'h-full'}>
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
