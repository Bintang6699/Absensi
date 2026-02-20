import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const StudentAttendance = () => {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                // We need an endpoint to get attendance by student ID
                // Backend: router.get('/student/:studentId', getStudentAttendance);
                const { data } = await API.get(`/attendance/student/${user._id}`);
                setAttendance(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        if (user?._id) fetchAttendance();
    }, [user]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Riwayat Absensi</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Tanggal</th>
                            <th className="p-4 font-semibold text-gray-600">Status</th>
                            <th className="p-4 font-semibold text-gray-600">Catatan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr><td colSpan="3" className="p-8 text-center">Loading...</td></tr>
                        ) : attendance.length === 0 ? (
                            <tr><td colSpan="3" className="p-8 text-center text-gray-500">Belum ada data absensi</td></tr>
                        ) : (
                            attendance.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 text-gray-800">
                                        {new Date(item.date).toLocaleDateString('id-ID', {
                                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                            ${item.status === 'Present' ? 'bg-green-100 text-green-700' :
                                                item.status === 'Absent' ? 'bg-red-100 text-red-700' :
                                                    item.status === 'Excused' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-yellow-100 text-yellow-700'}`}>
                                            {item.status === 'Present' ? 'Hadir' :
                                                item.status === 'Absent' ? 'Tidak Hadir' :
                                                    item.status === 'Excused' ? 'Izin' : 'Terlambat'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600 text-sm">
                                        {item.notes || '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentAttendance;
