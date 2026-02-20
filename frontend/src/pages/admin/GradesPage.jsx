import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Swal from 'sweetalert2';
import { FaSearch, FaPlus, FaChartBar } from 'react-icons/fa';
import Modal from '../../components/Modal';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const GradesPage = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [grades, setGrades] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Search students to select
    useEffect(() => {
        const fetchStudents = async () => {
            if (searchTerm.length > 2) {
                try {
                    const { data } = await API.get(`/students?keyword=${searchTerm}`);
                    setStudents(data.students);
                } catch (error) {
                    console.error(error);
                }
            }
        };
        const timeoutId = setTimeout(fetchStudents, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleSelectStudent = async (student) => {
        setSelectedStudent(student);
        setStudents([]); // Clear search results
        setSearchTerm('');
        fetchStudentData(student._id);
    };

    const fetchStudentData = async (studentId) => {
        setLoading(true);
        try {
            const gradesRes = await API.get(`/grades/student/${studentId}`);
            setGrades(gradesRes.data);

            const summaryRes = await API.get(`/reports/student/${studentId}`);
            // Note: Currently reports/student/:id returns PDF.
            // We need a JSON summary endpoint. 
            // The backend controller `getStudentSummary` corresponds to `/api/grades/summary/:id`
            // Let's use that.
            const statsRes = await API.get(`/grades/summary/${studentId}`);
            setSummary(statsRes.data);

            setLoading(false);
        } catch (error) {
            Swal.fire('Error', 'Gagal memuat data nilai', 'error');
            setLoading(false);
        }
    };

    const formik = useFormik({
        initialValues: {
            title: '',
            subject: 'General',
            type: 'Assignment',
            score: '',
            feedback: ''
        },
        validationSchema: Yup.object({
            title: Yup.string().required('Judul wajib diisi'),
            score: Yup.number().required('Nilai wajib diisi').min(0).max(100),
        }),
        onSubmit: async (values, { resetForm }) => {
            if (!selectedStudent) return;

            try {
                await API.post('/grades', {
                    studentId: selectedStudent._id,
                    ...values
                });
                Swal.fire('Sukses', 'Nilai berhasil ditambahkan', 'success');
                setIsModalOpen(false);
                resetForm();
                fetchStudentData(selectedStudent._id);
            } catch (error) {
                Swal.fire('Error', 'Gagal menyimpan nilai', 'error');
            }
        },
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Manajemen Penilaian</h1>

            {/* Student Search Section */}
            {!selectedStudent ? (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto text-center space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700">Pilih Siswa untuk Input Nilai</h2>
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Ketik nama siswa..."
                            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {students.length > 0 && (
                        <div className="border rounded-lg divide-y text-left max-h-60 overflow-y-auto">
                            {students.map(student => (
                                <div
                                    key={student._id}
                                    onClick={() => handleSelectStudent(student)}
                                    className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-medium text-gray-800">{student.name}</p>
                                        <div className="flex gap-2 text-sm text-gray-500">
                                            <span>{student.classLevel}</span>
                                            <span>•</span>
                                            <span>{student.studentId || '-'}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">Pilih</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Selected Student Header */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-gray-800">{selectedStudent.name}</h2>
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                                    {selectedStudent.classLevel}
                                </span>
                            </div>
                            <div className="text-gray-500 text-sm mt-1 flex gap-3">
                                <span>{selectedStudent.studentId}</span>
                                <span>•</span>
                                <span>{selectedStudent.email}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedStudent(null)}
                            className="text-sm text-gray-500 hover:text-red-500 underline"
                        >
                            Ganti Siswa
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Summary Stats */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                                <div className="flex items-center gap-3 mb-4">
                                    <FaChartBar className="text-2xl opacity-80" />
                                    <h3 className="font-semibold text-lg">Ringkasan Performa</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end border-b border-white/20 pb-2">
                                        <span className="text-white/80">Rata-rata Nilai</span>
                                        <span className="text-3xl font-bold">{summary?.averageScore || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-end border-b border-white/20 pb-2">
                                        <span className="text-white/80">Kehadiran</span>
                                        <span className="text-2xl font-bold">{summary?.attendancePercentage || 0}%</span>
                                    </div>
                                    <div className="pt-2">
                                        <span className="text-white/80 block text-sm mb-1">Evaluasi</span>
                                        <span className="inline-block bg-white/20 px-3 py-1 rounded text-sm font-medium">
                                            {summary?.evaluation || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary hover:text-primary transition flex items-center justify-center gap-2"
                            >
                                <FaPlus /> Tambah Nilai Baru
                            </button>
                        </div>

                        {/* Grades History */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <h3 className="p-4 font-semibold text-gray-700 bg-gray-50 border-b">Riwayat Penilaian</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="p-4 text-sm font-semibold text-gray-600">Judul</th>
                                            <th className="p-4 text-sm font-semibold text-gray-600">Subject</th>
                                            <th className="p-4 text-sm font-semibold text-gray-600">Tipe</th>
                                            <th className="p-4 text-sm font-semibold text-gray-600">Nilai</th>
                                            <th className="p-4 text-sm font-semibold text-gray-600">Tanggal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {loading ? (
                                            <tr><td colSpan="5" className="p-6 text-center">Loading...</td></tr>
                                        ) : grades.length === 0 ? (
                                            <tr><td colSpan="5" className="p-6 text-center text-gray-500">Belum ada data nilai</td></tr>
                                        ) : (
                                            grades.map((grade) => (
                                                <tr key={grade._id} className="hover:bg-gray-50">
                                                    <td className="p-4">
                                                        <div className="font-medium text-gray-800">{grade.title}</div>
                                                        <div className="text-xs text-gray-500 italic">{grade.feedback}</div>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-600">
                                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{grade.subject || 'General'}</span>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-600">{grade.type}</td>
                                                    <td className="p-4 font-bold text-gray-800">{grade.score}</td>
                                                    <td className="p-4 text-sm text-gray-500">
                                                        {new Date(grade.date).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Add Grade */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Input Nilai Baru"
            >
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Judul Kegiatan</label>
                        <input
                            type="text"
                            name="title"
                            {...formik.getFieldProps('title')}
                            placeholder="Contoh: Quiz Grammar Unit 1"
                            className="mt-1 block w-full border rounded-md p-2 focus:ring-primary focus:border-primary"
                        />
                        {formik.touched.title && formik.errors.title && (
                            <div className="text-red-500 text-xs mt-1">{formik.errors.title}</div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mata Pelajaran</label>
                        <select
                            name="subject"
                            {...formik.getFieldProps('subject')}
                            className="mt-1 block w-full border rounded-md p-2 focus:ring-primary focus:border-primary"
                        >
                            <option value="General">General</option>
                            <option value="Grammar">Grammar</option>
                            <option value="Vocabulary">Vocabulary</option>
                            <option value="Listening">Listening</option>
                            <option value="Speaking">Speaking</option>
                            <option value="Reading">Reading</option>
                            <option value="Writing">Writing</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipe</label>
                            <select
                                name="type"
                                {...formik.getFieldProps('type')}
                                className="mt-1 block w-full border rounded-md p-2 focus:ring-primary focus:border-primary"
                            >
                                <option value="Assignment">Assignment</option>
                                <option value="Quiz">Quiz</option>
                                <option value="Midterm">Midterm</option>
                                <option value="Final">Final</option>
                                <option value="Participation">Participation</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nilai (0-100)</label>
                            <input
                                type="number"
                                name="score"
                                {...formik.getFieldProps('score')}
                                className="mt-1 block w-full border rounded-md p-2 focus:ring-primary focus:border-primary"
                            />
                            {formik.touched.score && formik.errors.score && (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.score}</div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Feedback / Catatan</label>
                        <textarea
                            name="feedback"
                            {...formik.getFieldProps('feedback')}
                            rows="2"
                            className="mt-1 block w-full border rounded-md p-2 focus:ring-primary focus:border-primary"
                        ></textarea>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            Simpan Nilai
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default GradesPage;
