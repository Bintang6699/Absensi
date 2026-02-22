import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Swal from 'sweetalert2';
import { FaFileDownload, FaSave, FaCheckCircle, FaTimesCircle, FaClock, FaUserCheck } from 'react-icons/fa';

const statusConfig = [
    { value: 'Present', label: 'Hadir', color: 'green', icon: '✓' },
    { value: 'Absent', label: 'Absen', color: 'red', icon: '✗' },
    { value: 'Excused', label: 'Izin', color: 'blue', icon: 'I' },
    { value: 'Late', label: 'Terlambat', color: 'yellow', icon: '!' },
];

const statusStyles = {
    Present: {
        active: 'bg-green-500 text-white border-green-500 shadow-md',
        inactive: 'bg-white text-green-600 border-green-200 hover:bg-green-50',
    },
    Absent: {
        active: 'bg-red-500 text-white border-red-500 shadow-md',
        inactive: 'bg-white text-red-600 border-red-200 hover:bg-red-50',
    },
    Excused: {
        active: 'bg-blue-500 text-white border-blue-500 shadow-md',
        inactive: 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50',
    },
    Late: {
        active: 'bg-yellow-500 text-white border-yellow-500 shadow-md',
        inactive: 'bg-white text-yellow-600 border-yellow-200 hover:bg-yellow-50',
    },
};

const AttendancePage = () => {
    const [classLevel, setClassLevel] = useState('Basic');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [savedRows, setSavedRows] = useState({});

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const { data } = await API.get(`/attendance/class?classLevel=${classLevel}&date=${date}`);
            setAttendanceData(data);
            setSavedRows({});
            setLoading(false);
        } catch (error) {
            Swal.fire('Error', 'Gagal memuat data absensi', 'error');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (classLevel && date) {
            fetchAttendance();
        }
    }, [classLevel, date]);

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev => prev.map(item =>
            item.student._id === studentId ? { ...item, status } : item
        ));
        setSavedRows(prev => ({ ...prev, [studentId]: false }));
    };

    const handleNotesChange = (studentId, notes) => {
        setAttendanceData(prev => prev.map(item =>
            item.student._id === studentId ? { ...item, notes } : item
        ));
    };

    const saveAttendance = async (item) => {
        try {
            await API.post('/attendance', {
                studentId: item.student._id,
                date,
                status: item.status,
                notes: item.notes
            });
            setSavedRows(prev => ({ ...prev, [item.student._id]: true }));
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Gagal menyimpan absensi siswa ini', 'error');
        }
    };

    const handleSaveAll = async () => {
        setLoading(true);
        try {
            const promises = attendanceData.map(item =>
                API.post('/attendance', {
                    studentId: item.student._id,
                    date,
                    status: item.status,
                    notes: item.notes
                })
            );
            await Promise.all(promises);
            const saved = {};
            attendanceData.forEach(item => { saved[item.student._id] = true; });
            setSavedRows(saved);
            Swal.fire('Sukses', 'Semua data absensi tersimpan', 'success');
            fetchAttendance();
        } catch (error) {
            Swal.fire('Error', 'Gagal menyimpan semua data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const response = await API.get(`/reports/attendance/class?classLevel=${classLevel}&date=${date}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Attendance_${classLevel}_${date}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            Swal.fire('Error', 'Gagal mengunduh PDF', 'error');
        }
    };

    const presentCount = attendanceData.filter(i => i.status === 'Present').length;
    const absentCount = attendanceData.filter(i => i.status === 'Absent').length;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Manajemen Absensi</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Kelola kehadiran siswa per kelas</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Kelas</label>
                        <select
                            value={classLevel}
                            onChange={(e) => setClassLevel(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-700 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                        >
                            <option value="Basic">Basic</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Tanggal</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                        />
                    </div>
                </div>
            </div>

            {/* Summary + Action Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                {/* Status summary */}
                <div className="flex gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {presentCount} Hadir
                    </div>
                    <div className="flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        {absentCount} Absen
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full text-sm font-semibold">
                        Total: {attendanceData.length}
                    </div>
                </div>
                {/* Action buttons */}
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition flex-1 sm:flex-none"
                    >
                        <FaFileDownload className="text-red-500 flex-shrink-0" />
                        <span className="hidden xs:inline">Export</span> PDF
                    </button>
                    <button
                        onClick={handleSaveAll}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex-1 sm:flex-none"
                        disabled={loading}
                    >
                        <FaSave className="flex-shrink-0" />
                        Simpan Semua
                    </button>
                </div>
            </div>

            {/* Attendance List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full mb-3"></div>
                        <p className="text-sm">Memuat data...</p>
                    </div>
                ) : attendanceData.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <FaUserCheck className="text-4xl mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Tidak ada siswa di kelas ini</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {/* Table header - desktop only */}
                        <div className="hidden sm:grid sm:grid-cols-[2fr_2.5fr_1fr] gap-4 px-5 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            <span>Siswa</span>
                            <span>Status Kehadiran</span>
                            <span>Catatan</span>
                        </div>

                        {attendanceData.map((item, idx) => (
                            <div key={item.student._id} className={`p-4 sm:p-5 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                {/* Mobile layout */}
                                <div className="sm:hidden space-y-3">
                                    {/* Student info */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-semibold text-gray-800">{item.student.name}</div>
                                            <div className="text-xs text-gray-400">{item.student.studentId || '-'}</div>
                                        </div>
                                        {savedRows[item.student._id] && (
                                            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                <FaCheckCircle /> Tersimpan
                                            </span>
                                        )}
                                    </div>

                                    {/* Status pills - compact 2x2 grid */}
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {statusConfig.map((s) => (
                                            <button
                                                key={s.value}
                                                onClick={() => handleStatusChange(item.student._id, s.value)}
                                                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center gap-1.5
                                                    ${item.status === s.value
                                                        ? statusStyles[s.value].active
                                                        : statusStyles[s.value].inactive
                                                    }`}
                                            >
                                                <span className="font-bold">{s.icon}</span>
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Notes + save */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={item.notes}
                                            onChange={(e) => handleNotesChange(item.student._id, e.target.value)}
                                            placeholder="Catatan (opsional)..."
                                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                        />
                                        <button
                                            onClick={() => saveAttendance(item)}
                                            className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm flex-shrink-0"
                                            title="Simpan"
                                        >
                                            <FaSave />
                                        </button>
                                    </div>
                                </div>

                                {/* Desktop layout */}
                                <div className="hidden sm:grid sm:grid-cols-[2fr_2.5fr_1fr] gap-4 items-center">
                                    {/* Student info */}
                                    <div>
                                        <div className="font-semibold text-gray-800 text-sm">{item.student.name}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">{item.student.studentId || '-'}</div>
                                    </div>

                                    {/* Status buttons - horizontal */}
                                    <div className="flex gap-1.5 flex-wrap">
                                        {statusConfig.map((s) => (
                                            <button
                                                key={s.value}
                                                onClick={() => handleStatusChange(item.student._id, s.value)}
                                                className={`py-1.5 px-3 rounded-lg border text-xs font-semibold transition-all
                                                    ${item.status === s.value
                                                        ? statusStyles[s.value].active
                                                        : statusStyles[s.value].inactive
                                                    }`}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Notes + save */}
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            value={item.notes}
                                            onChange={(e) => handleNotesChange(item.student._id, e.target.value)}
                                            placeholder="Catatan..."
                                            className="flex-1 min-w-0 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                        />
                                        <button
                                            onClick={() => saveAttendance(item)}
                                            className={`p-1.5 rounded-lg transition text-sm flex-shrink-0 ${savedRows[item.student._id]
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                                                }`}
                                            title="Simpan baris ini"
                                        >
                                            {savedRows[item.student._id] ? <FaCheckCircle /> : <FaSave />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendancePage;
