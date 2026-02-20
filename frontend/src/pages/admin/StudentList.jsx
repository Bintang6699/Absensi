import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Modal from '../../components/Modal';
import Swal from 'sweetalert2';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaChartBar, FaBan, FaCheckCircle, FaEye, FaUserGraduate, FaIdCard, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUniversity, FaCalendarAlt } from 'react-icons/fa';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import StudentStats from '../../components/StudentStats';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [expandedClasses, setExpandedClasses] = useState({
        'Basic': true,
        'Intermediate': true,
        'Advanced': true,
        'Unassigned': true
    });

    const toggleClass = (level) => {
        setExpandedClasses(prev => ({
            ...prev,
            [level]: !prev[level]
        }));
    };

    // Stats View State
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [statsData, setStatsData] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);

    // Detail View State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [viewingStudent, setViewingStudent] = useState(null);

    // Ban View State
    const [isBanModalOpen, setIsBanModalOpen] = useState(false);
    const [banningStudent, setBanningStudent] = useState(null);
    const [banReason, setBanReason] = useState('');
    const [banDuration, setBanDuration] = useState('permanent');
    const [banExpires, setBanExpires] = useState('');

    const fetchStudents = async () => {
        try {
            const { data } = await API.get(`/students?keyword=${searchTerm}&pageNumber=${page}`);
            setStudents(data.students);
            setTotalPages(data.pages);
            setLoading(false);
        } catch (error) {
            console.error('Error loading students:', error);
            const errMsg = error.response?.data?.message || error.message || 'Gagal memuat data siswa';
            const status = error.response?.status ? `(${error.response.status})` : '';
            Swal.fire('Error', `${errMsg} ${status}`, 'error');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [page, searchTerm]);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Data siswa akan dihapus (soft delete)!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            try {
                await API.delete(`/students/${id}`);
                Swal.fire('Terhapus!', 'Data siswa telah dihapus.', 'success');
                fetchStudents();
            } catch (error) {
                Swal.fire('Error', 'Gagal menghapus siswa', 'error');
            }
        }
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingStudent(null);
        setIsModalOpen(true);
    };

    const handleViewStats = async (student) => {
        setStatsLoading(true);
        setIsStatsModalOpen(true);
        setStatsData(null); // Clear previous data
        try {
            const { data } = await API.get(`/grades/summary/${student._id}`);
            setStatsData(data);
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Gagal memuat statistik siswa', 'error');
            setIsStatsModalOpen(false);
        } finally {
            setStatsLoading(false);
        }
    };

    const handleViewDetail = (student) => {
        setViewingStudent(student);
        setIsDetailModalOpen(true);
    };

    const handleBan = (student) => {
        setBanningStudent(student);
        setBanReason('');
        setBanDuration('permanent');
        setBanExpires('');
        setIsBanModalOpen(true);
    };

    const handleBanStudent = async () => {
        if (!banReason.trim()) {
            Swal.fire('Error', 'Alasan banned wajib diisi', 'error');
            return;
        }

        if (banDuration === 'temporary' && !banExpires) {
            Swal.fire('Error', 'Tanggal berakhir banned wajib diisi', 'error');
            return;
        }

        try {
            await API.post('/admin/ban', {
                userId: banningStudent._id,
                reason: banReason,
                expires: banDuration === 'temporary' ? banExpires : null,
            });

            Swal.fire('Sukses', `${banningStudent.name} berhasil di-banned`, 'success');
            setIsBanModalOpen(false);
            fetchStudents();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Gagal memban siswa', 'error');
        }
    };

    const handleUnban = async (student) => {
        const result = await Swal.fire({
            title: 'Unban siswa ini?',
            text: `${student.name} akan dapat mengakses dashboard kembali`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, unban',
        });

        if (result.isConfirmed) {
            try {
                await API.post('/admin/unban', { userId: student._id });
                Swal.fire('Sukses', `${student.name} berhasil di-unban`, 'success');
                fetchStudents();
            } catch (error) {
                Swal.fire('Error', 'Gagal unban siswa', 'error');
            }
        }
    };

    // Formik Setup
    const formik = useFormik({
        initialValues: {
            name: editingStudent ? editingStudent.name : '',
            email: editingStudent ? editingStudent.email : '',
            password: '', // Only for new students
            classLevel: editingStudent ? editingStudent.classLevel : 'Basic',
            address: editingStudent?.biodata?.address || '',
            phone: editingStudent?.biodata?.phone || '',
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            name: Yup.string().required('Nama wajib diisi'),
            email: Yup.string().email('Email tidak valid').required('Email wajib diisi'),
            classLevel: Yup.string().required('Pilih kelas'),
        }),
        onSubmit: async (values) => {
            try {
                const payload = {
                    name: values.name,
                    email: values.email,
                    classLevel: values.classLevel,
                    biodata: {
                        address: values.address,
                        phone: values.phone
                    }
                };

                if (!editingStudent) {
                    payload.password = values.password || '123456';
                    payload.role = 'student';
                    await API.post('/auth/register', payload);
                    Swal.fire('Sukses', 'Siswa berhasil ditambahkan', 'success');
                } else {
                    await API.put(`/students/${editingStudent._id}`, payload);
                    Swal.fire('Sukses', 'Data siswa diperbarui', 'success');
                }

                setIsModalOpen(false);
                fetchStudents();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Gagal menyimpan data', 'error');
            }
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Siswa</h1>
                <button
                    onClick={handleAdd}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
                >
                    <FaPlus /> Tambah Siswa
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                <FaSearch className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Cari nama siswa..."
                    className="flex-1 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Class Grouping Accordion */}
            <div className="space-y-4">
                {['Basic', 'Intermediate', 'Advanced', 'Unassigned'].map((level) => {
                    const classStudents = students.filter(s =>
                        level === 'Unassigned' ? !['Basic', 'Intermediate', 'Advanced'].includes(s.classLevel) : s.classLevel === level
                    );

                    if (classStudents.length === 0) return null;

                    const isExpanded = expandedClasses[level];

                    return (
                        <div key={level} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div
                                onClick={() => toggleClass(level)}
                                className="p-4 bg-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition"
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold
                                        ${level === 'Basic' ? 'bg-green-100 text-green-700' :
                                            level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                                level === 'Advanced' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        {level}
                                    </span>
                                    <span className="font-semibold text-gray-700">{classStudents.length} Siswa</span>
                                </div>
                                <div className="text-gray-400">
                                    {isExpanded ? '▼' : '▶'}
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="p-0">
                                    <table className="w-full text-left">
                                        <thead className="bg-white border-b">
                                            <tr>
                                                <th className="p-4 font-semibold text-gray-600 text-sm">ID Siswa</th>
                                                <th className="p-4 font-semibold text-gray-600 text-sm">Nama</th>
                                                <th className="p-4 font-semibold text-gray-600 text-sm">Email</th>
                                                <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                                                <th className="p-4 font-semibold text-gray-600 text-sm">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {classStudents.map((student) => (
                                                <tr key={student._id} className={`hover:bg-gray-50 transition ${student.isBanned ? 'bg-red-50' : ''}`}>
                                                    <td className="p-4">
                                                        <div className="font-medium text-primary text-sm">{student.studentId || '-'}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-medium text-gray-800">{student.name}</div>
                                                        <div className="text-xs text-gray-500">{student.biodata?.phone || '-'}</div>
                                                    </td>
                                                    <td className="p-4 text-gray-600 text-sm">{student.email}</td>
                                                    <td className="p-4">
                                                        {student.isBanned ? (
                                                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 flex items-center gap-1 w-fit">
                                                                <FaBan /> BANNED
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">AKTIF</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 flex gap-2">
                                                        <button
                                                            onClick={() => handleViewDetail(student)}
                                                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded transition"
                                                            title="Lihat Detail Biodata"
                                                        >
                                                            <FaEye />
                                                        </button>
                                                        <button
                                                            onClick={() => handleViewStats(student)}
                                                            className="p-2 text-purple-600 hover:bg-purple-50 rounded transition"
                                                            title="Lihat Statistik"
                                                        >
                                                            <FaChartBar />
                                                        </button>
                                                        {student.isBanned ? (
                                                            <button
                                                                onClick={() => handleUnban(student)}
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                                                                title="Unban"
                                                            >
                                                                <FaCheckCircle />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleBan(student)}
                                                                className="p-2 text-orange-600 hover:bg-orange-50 rounded transition"
                                                                title="Ban"
                                                            >
                                                                <FaBan />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleEdit(student)}
                                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded transition"
                                                            title="Edit"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(student._id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded transition"
                                                            title="Hapus"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    );
                })}
                {students.length === 0 && !loading && (
                    <div className="text-center p-8 bg-white rounded-xl text-gray-500 border border-gray-100">
                        Tidak ada data siswa ditemukan.
                    </div>
                )}
                {loading && (
                    <div className="text-center p-8">Loading...</div>
                )}
            </div>

            {/* Pagination Implementation could go here */}

            {/* Modal Form */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingStudent ? 'Edit Siswa' : 'Tambah Siswa Baru'}
            >
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                        <input
                            type="text"
                            name="name"
                            {...formik.getFieldProps('name')}
                            className="mt-1 block w-full border rounded-md p-2 focus:ring-primary focus:border-primary"
                        />
                        {formik.touched.name && formik.errors.name && (
                            <div className="text-red-500 text-xs mt-1">{formik.errors.name}</div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            {...formik.getFieldProps('email')}
                            className="mt-1 block w-full border rounded-md p-2 focus:ring-primary focus:border-primary"
                        />
                        {formik.touched.email && formik.errors.email && (
                            <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
                        )}
                    </div>

                    {!editingStudent && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                name="password"
                                {...formik.getFieldProps('password')}
                                className="mt-1 block w-full border rounded-md p-2 focus:ring-primary focus:border-primary"
                                placeholder="Default: 123456"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tingkat Kelas</label>
                        <select
                            name="classLevel"
                            {...formik.getFieldProps('classLevel')}
                            className="mt-1 block w-full border rounded-md p-2 focus:ring-primary focus:border-primary"
                        >
                            <option value="Basic">Basic</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Alamat</label>
                        <textarea
                            name="address"
                            {...formik.getFieldProps('address')}
                            rows="2"
                            className="mt-1 block w-full border rounded-md p-2 focus:ring-primary focus:border-primary"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">No. Telepon</label>
                        <input
                            type="text"
                            name="phone"
                            {...formik.getFieldProps('phone')}
                            className="mt-1 block w-full border rounded-md p-2 focus:ring-primary focus:border-primary"
                        />
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
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Stats Modal */}
            {isStatsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-800">Statistik Siswa</h2>
                            <button
                                onClick={() => setIsStatsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="p-6">
                            {statsLoading ? (
                                <div className="text-center py-12">Loading statistics...</div>
                            ) : statsData ? (
                                <StudentStats data={statsData} />
                            ) : (
                                <div className="text-center py-12 text-gray-500">Gagal memuat data statistik.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Ban Modal */}
            <Modal
                isOpen={isBanModalOpen}
                onClose={() => setIsBanModalOpen(false)}
                title="Ban Siswa"
            >
                <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                            <strong>Peringatan:</strong> Siswa yang di-ban tidak akan bisa mengakses dashboard.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Siswa</label>
                        <input
                            type="text"
                            value={banningStudent?.name || ''}
                            disabled
                            className="w-full p-3 border rounded-lg bg-gray-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ID Siswa</label>
                        <input
                            type="text"
                            value={banningStudent?.studentId || ''}
                            disabled
                            className="w-full p-3 border rounded-lg bg-gray-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Alasan Banned *</label>
                        <textarea
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                            rows="4"
                            className="w-full p-3 border rounded-lg"
                            placeholder="Masukkan alasan banned (wajib diisi)"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Durasi Banned</label>
                        <select
                            value={banDuration}
                            onChange={(e) => setBanDuration(e.target.value)}
                            className="w-full p-3 border rounded-lg"
                        >
                            <option value="permanent">Permanen</option>
                            <option value="temporary">Sementara</option>
                        </select>
                    </div>

                    {banDuration === 'temporary' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Berakhir</label>
                            <input
                                type="date"
                                value={banExpires}
                                onChange={(e) => setBanExpires(e.target.value)}
                                className="w-full p-3 border rounded-lg"
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            onClick={() => setIsBanModalOpen(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleBanStudent}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                        >
                            <FaBan /> Ban Siswa
                        </button>
                    </div>
                </div>
            </Modal>
            {/* Detail Biodata Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="Detail Biodata Siswa"
            >
                {viewingStudent && (
                    <div className="space-y-6">
                        {/* Header Profile */}
                        <div className="flex items-center gap-4 border-b pb-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl">
                                <FaUserGraduate />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{viewingStudent.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${viewingStudent.classLevel === 'Basic' ? 'bg-green-100 text-green-700' :
                                        viewingStudent.classLevel === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                            viewingStudent.classLevel === 'Advanced' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {viewingStudent.classLevel || 'Unassigned'}
                                    </span>
                                    <span>•</span>
                                    <span>{viewingStudent.role}</span>
                                </div>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <FaIdCard /> ID Siswa
                                </label>
                                <p className="font-medium text-gray-800 bg-gray-50 p-2 rounded">{viewingStudent.studentId || '-'}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <FaEnvelope /> Email
                                </label>
                                <p className="font-medium text-gray-800 bg-gray-50 p-2 rounded">{viewingStudent.email}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <FaPhone /> Telepon
                                </label>
                                <p className="font-medium text-gray-800 bg-gray-50 p-2 rounded">{viewingStudent.biodata?.phone || '-'}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <FaCalendarAlt /> Umur
                                </label>
                                <p className="font-medium text-gray-800 bg-gray-50 p-2 rounded">{viewingStudent.age ? `${viewingStudent.age} Tahun` : '-'}</p>
                            </div>

                            <div className="col-span-1 md:col-span-2 space-y-1">
                                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <FaUniversity /> Institusi / Sekolah
                                </label>
                                <p className="font-medium text-gray-800 bg-gray-50 p-2 rounded">{viewingStudent.institution || '-'}</p>
                            </div>

                            <div className="col-span-1 md:col-span-2 space-y-1">
                                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <FaMapMarkerAlt /> Alamat
                                </label>
                                <p className="font-medium text-gray-800 bg-gray-50 p-2 rounded block whitespace-pre-line">
                                    {viewingStudent.biodata?.address || '-'}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default StudentList;
