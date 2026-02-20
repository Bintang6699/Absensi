import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Swal from 'sweetalert2';
import { FaFileDownload, FaSave, FaCheckCircle } from 'react-icons/fa';

const AttendancePage = () => {
    const [classLevel, setClassLevel] = useState('Basic');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const { data } = await API.get(`/attendance/class?classLevel=${classLevel}&date=${date}`);
            setAttendanceData(data);
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
            // Show mini toast or simple success indicator?
            // For now just console or a small icon update
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
            Swal.fire('Sukses', 'Semua data absensi tersimpan', 'success');
            fetchAttendance(); // Refresh to ensure IDs are synced if needed
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Absensi</h1>

                <div className="flex gap-4 items-center bg-white p-3 rounded-xl shadow-sm border">
                    <select
                        value={classLevel}
                        onChange={(e) => setClassLevel(e.target.value)}
                        className="border-none focus:ring-0 text-gray-700 font-medium"
                    >
                        <option value="Basic">Basic</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                    <div className="h-6 w-px bg-gray-300"></div>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="border-none focus:ring-0 text-gray-700"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700">Daftar Siswa</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
                        >
                            <FaFileDownload className="text-red-500" /> Export PDF
                        </button>
                        <button
                            onClick={handleSaveAll}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-white rounded hover:bg-indigo-700 transition"
                            disabled={loading}
                        >
                            <FaSave /> Simpan Semua
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Nama Siswa</th>
                                <th className="p-4 font-semibold text-gray-600 text-center">Status Kehadiran</th>
                                <th className="p-4 font-semibold text-gray-600">Catatan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan="4" className="p-8 text-center">Loading...</td></tr>
                            ) : attendanceData.length === 0 ? (
                                <tr><td colSpan="4" className="p-8 text-center text-gray-500">Tidak ada siswa di kelas ini</td></tr>
                            ) : (
                                attendanceData.map((item) => (
                                    <tr key={item.student._id} className="hover:bg-gray-50 transition">
                                        <td className="p-4">
                                            <div className="font-medium text-gray-800">{item.student.name}</div>
                                            <div className="text-xs text-gray-500">{item.student.studentId || '-'}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-center gap-4">
                                                {['Present', 'Absent', 'Excused', 'Late'].map((status) => (
                                                    <label key={status} className="flex items-center gap-1 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={`status-${item.student._id}`}
                                                            value={status}
                                                            checked={item.status === status}
                                                            onChange={() => handleStatusChange(item.student._id, status)}
                                                            className="text-primary focus:ring-primary"
                                                        />
                                                        <span className={`text-sm ${status === 'Present' ? 'text-green-600' :
                                                            status === 'Absent' ? 'text-red-600' :
                                                                status === 'Excused' ? 'text-blue-600' : 'text-yellow-600'
                                                            }`}>
                                                            {status === 'Present' ? 'Hadir' :
                                                                status === 'Absent' ? 'Absen' :
                                                                    status === 'Excused' ? 'Izin' : 'Terlambat'}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <input
                                                type="text"
                                                value={item.notes}
                                                onChange={(e) => handleNotesChange(item.student._id, e.target.value)}
                                                placeholder="Catatan..."
                                                className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:border-primary"
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AttendancePage;
