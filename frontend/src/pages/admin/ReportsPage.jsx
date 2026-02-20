import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { FaFilePdf, FaDownload, FaUserGraduate, FaCalendarAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';

const ReportsPage = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form States
    const [selectedClass, setSelectedClass] = useState('Basic');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedStudent, setSelectedStudent] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const { data } = await API.get('/students?nopage=true');
            // Backend now filters out inactive/deleted students automatically
            setStudents(data.students || []);
        } catch (error) {
            console.error('Failed to fetch students', error);
        }
    };

    const handleDownloadAttendance = async () => {
        if (!selectedDate) {
            Swal.fire('Error', 'Pilih tanggal terlebih dahulu', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await API.get(`/reports/attendance/class`, {
                params: { classLevel: selectedClass, date: selectedDate },
                responseType: 'blob', // Important for PDF download
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Absensi_${selectedClass}_${selectedDate}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            Swal.fire('Error', 'Gagal mengunduh laporan absensi', 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReportCard = async () => {
        if (!selectedStudent) {
            Swal.fire('Error', 'Pilih siswa terlebih dahulu', 'error');
            return;
        }

        setLoading(true);
        try {
            const student = students.find(s => s._id === selectedStudent);
            const studentName = student ? student.name.replace(/\s+/g, '_') : 'Siswa';

            const response = await API.get(`/reports/student/${selectedStudent}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Rapor_${studentName}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            Swal.fire('Error', 'Gagal mengunduh rapor siswa', 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Laporan & Evaluasi</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Attendance Report Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <FaCalendarAlt size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Laporan Absensi Kelas</h2>
                    </div>
                    <p className="text-gray-500 mb-6 text-sm">
                        Unduh rekap kehadiran siswa per kelas untuk tanggal tertentu dalam format PDF.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Kelas</label>
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="Basic">Basic</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <button
                            onClick={handleDownloadAttendance}
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                        >
                            {loading ? 'Mengunduh...' : <><FaDownload /> Unduh Laporan Absensi</>}
                        </button>
                    </div>
                </div>

                {/* Student Report Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                            <FaUserGraduate size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Rapor Hasil Belajar</h2>
                    </div>
                    <p className="text-gray-500 mb-6 text-sm">
                        Unduh rapor lengkap siswa yang berisi nilai evaluasi dan persentase kehadiran.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Pilih Siswa</label>
                            <select
                                value={selectedStudent}
                                onChange={(e) => setSelectedStudent(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            >
                                <option value="">-- Pilih Siswa --</option>
                                {students.map((student) => (
                                    <option key={student._id} value={student._id}>
                                        {student.name} ({student.classLevel})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="h-[74px]"></div> {/* Spacer to align buttons if needed */}

                        <button
                            onClick={handleDownloadReportCard}
                            disabled={loading || !selectedStudent}
                            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Mengunduh...' : <><FaFilePdf /> Unduh Rapor Siswa</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
