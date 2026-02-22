import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Modal from '../../components/Modal';
import Swal from 'sweetalert2';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaChartBar, FaBan, FaCheckCircle, FaEye, FaUserGraduate, FaIdCard, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUniversity, FaCalendarAlt, FaFilter } from 'react-icons/fa';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import StudentStats from '../../components/StudentStats';

const levelColor = {
    Basic: { badge: 'bg-green-100 text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
    Intermediate: { badge: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
    Advanced: { badge: 'bg-red-100 text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
    Unassigned: { badge: 'bg-gray-200 text-gray-700', border: 'border-gray-200', dot: 'bg-gray-400' },
};

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
        setStatsData(null);
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

    const formik = useFormik({
        initialValues: {
            name: editingStudent ? editingStudent.name : '',
            email: editingStudent ? editingStudent.email : '',
            password: '',
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

    // Komponen tombol aksi student - dipakai di desktop & mobile
    const ActionButtons = ({ student }) => (
        <div className="flex items-center gap-1">
            <button
                onClick={() => handleViewDetail(student)}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                title="Lihat Detail"
            >
                <FaEye size={14} />
            </button>
            <button
                onClick={() => handleViewStats(student)}
                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                title="Statistik"
            >
                <FaChartBar size={14} />
            </button>
            {student.isBanned ? (
                <button
                    onClick={() => handleUnban(student)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                    title="Unban"
                >
                    <FaCheckCircle size={14} />
                </button>
            ) : (
                <button
                    onClick={() => handleBan(student)}
                    className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition"
                    title="Ban"
                >
                    <FaBan size={14} />
                </button>
            )}
            <button
                onClick={() => handleEdit(student)}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                title="Edit"
            >
                <FaEdit size={14} />
            </button>
            <button
                onClick={() => handleDelete(student._id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                title="Hapus"
            >
                <FaTrash size={14} />
            </button>
        </div>
    );

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Manajemen Siswa</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Kelola semua data siswa kursus</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition font-semibold text-sm shadow-sm"
                >
                    <FaPlus /> Tambah Siswa
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                <FaSearch className="text-gray-400 flex-shrink-0" />
                <input
                    type="text"
                    placeholder="Cari nama siswa..."
                    className="flex-1 focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600 text-xs">
                        ✕
                    </button>
                )}
            </div>

            {/* Loading / Empty */}
            {loading && (
                <div className="text-center p-12 bg-white rounded-xl border border-gray-100">
                    <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full mb-3"></div>
                    <p className="text-sm text-gray-400">Memuat data siswa...</p>
                </div>
            )}

            {/* Class Accordion */}
            <div className="space-y-4">
                {['Basic', 'Intermediate', 'Advanced', 'Unassigned'].map((level) => {
                    const classStudents = students.filter(s =>
                        level === 'Unassigned'
                            ? !['Basic', 'Intermediate', 'Advanced'].includes(s.classLevel)
                            : s.classLevel === level
                    );

                    if (classStudents.length === 0) return null;
                    const isExpanded = expandedClasses[level];
                    const colors = levelColor[level] || levelColor.Unassigned;

                    return (
                        <div key={level} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${colors.border}`}>
                            {/* Accordion Header */}
                            <div
                                onClick={() => toggleClass(level)}
                                className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition select-none"
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`}></span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.badge}`}>
                                        {level}
                                    </span>
                                    <span className="font-semibold text-gray-700 text-sm">
                                        {classStudents.length} Siswa
                                    </span>
                                </div>
                                <span className="text-gray-400 text-sm">{isExpanded ? '▼' : '▶'}</span>
                            </div>

                            {isExpanded && (
                                <>
                                    {/* Desktop Table */}
                                    <div className="hidden sm:block overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 border-y border-gray-100">
                                                <tr>
                                                    <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">ID Siswa</th>
                                                    <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Nama</th>
                                                    <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Email</th>
                                                    <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                                                    <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide text-center">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {classStudents.map((student) => (
                                                    <tr key={student._id} className={`hover:bg-gray-50/80 transition ${student.isBanned ? 'bg-red-50/30' : ''}`}>
                                                        <td className="px-4 py-3">
                                                            <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                                                {student.studentId || '-'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="font-semibold text-gray-800 text-sm">{student.name}</div>
                                                            <div className="text-xs text-gray-400">{student.biodata?.phone || '-'}</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600 text-sm max-w-[200px]">
                                                            <span className="truncate block">{student.email}</span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {student.isBanned ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                                                    <FaBan size={10} /> BANNED
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> AKTIF
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-center gap-0.5">
                                                                <ActionButtons student={student} />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Card View */}
                                    <div className="sm:hidden divide-y divide-gray-100">
                                        {classStudents.map((student) => (
                                            <div key={student._id} className={`p-4 ${student.isBanned ? 'bg-red-50/40' : 'bg-white'}`}>
                                                <div className="flex items-start justify-between gap-2">
                                                    {/* Student info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-semibold text-gray-800 text-sm">{student.name}</span>
                                                            {student.isBanned ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                                                    <FaBan size={9} /> BANNED
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                                    AKTIF
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                            <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                                                {student.studentId || '-'}
                                                            </span>
                                                            <span className="text-xs text-gray-400 truncate max-w-[160px]">{student.email}</span>
                                                        </div>
                                                        {student.biodata?.phone && (
                                                            <div className="text-xs text-gray-400 mt-0.5">{student.biodata.phone}</div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action row */}
                                                <div className="mt-3 flex items-center gap-1 flex-wrap">
                                                    <button
                                                        onClick={() => handleViewDetail(student)}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition font-medium"
                                                    >
                                                        <FaEye size={11} /> Detail
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewStats(student)}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition font-medium"
                                                    >
                                                        <FaChartBar size={11} /> Statistik
                                                    </button>
                                                    {student.isBanned ? (
                                                        <button
                                                            onClick={() => handleUnban(student)}
                                                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition font-medium"
                                                        >
                                                            <FaCheckCircle size={11} /> Unban
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleBan(student)}
                                                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition font-medium"
                                                        >
                                                            <FaBan size={11} /> Ban
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleEdit(student)}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition font-medium"
                                                    >
                                                        <FaEdit size={11} /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(student._id)}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition font-medium"
                                                    >
                                                        <FaTrash size={11} /> Hapus
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}

                {students.length === 0 && !loading && (
                    <div className="text-center p-12 bg-white rounded-xl text-gray-400 border border-gray-100">
                        <FaUserGraduate className="text-4xl mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Tidak ada data siswa ditemukan.</p>
                    </div>
                )}
            </div>

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
                            className="mt-1 block w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
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
                            className="mt-1 block w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
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
                                className="mt-1 block w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                                placeholder="Default: 123456"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tingkat Kelas</label>
                        <select
                            name="classLevel"
                            {...formik.getFieldProps('classLevel')}
                            className="mt-1 block w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
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
                            className="mt-1 block w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">No. Telepon</label>
                        <input
                            type="text"
                            name="phone"
                            {...formik.getFieldProps('phone')}
                            className="mt-1 block w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition text-sm"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-semibold"
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
                        <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-lg font-bold text-gray-800">Statistik Siswa</h2>
                            <button
                                onClick={() => setIsStatsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="p-5">
                            {statsLoading ? (
                                <div className="text-center py-12 text-gray-400">
                                    <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full mb-3"></div>
                                    <p className="text-sm">Memuat statistik...</p>
                                </div>
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
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
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
                            className="w-full p-3 border rounded-lg bg-gray-50 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ID Siswa</label>
                        <input
                            type="text"
                            value={banningStudent?.studentId || ''}
                            disabled
                            className="w-full p-3 border rounded-lg bg-gray-50 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Alasan Banned *</label>
                        <textarea
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                            rows="3"
                            className="w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                            placeholder="Masukkan alasan banned (wajib diisi)"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Durasi Banned</label>
                        <select
                            value={banDuration}
                            onChange={(e) => setBanDuration(e.target.value)}
                            className="w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
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
                                className="w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            onClick={() => setIsBanModalOpen(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition text-sm"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleBanStudent}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 text-sm font-semibold"
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
                    <div className="space-y-5">
                        {/* Header Profile */}
                        <div className="flex items-center gap-4 border-b pb-4">
                            <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 text-2xl flex-shrink-0">
                                <FaUserGraduate />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-base font-bold text-gray-800 truncate">{viewingStudent.name}</h3>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${viewingStudent.classLevel === 'Basic' ? 'bg-green-100 text-green-700' :
                                            viewingStudent.classLevel === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                                viewingStudent.classLevel === 'Advanced' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {viewingStudent.classLevel || 'Unassigned'}
                                    </span>
                                    <span className="text-xs text-gray-500">{viewingStudent.role}</span>
                                </div>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    <FaIdCard className="text-indigo-400" /> ID Siswa
                                </label>
                                <p className="font-medium text-gray-800 bg-gray-50 p-2.5 rounded-lg text-sm">{viewingStudent.studentId || '-'}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    <FaEnvelope className="text-indigo-400" /> Email
                                </label>
                                <p className="font-medium text-gray-800 bg-gray-50 p-2.5 rounded-lg text-sm truncate">{viewingStudent.email}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    <FaPhone className="text-indigo-400" /> Telepon
                                </label>
                                <p className="font-medium text-gray-800 bg-gray-50 p-2.5 rounded-lg text-sm">{viewingStudent.biodata?.phone || '-'}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    <FaCalendarAlt className="text-indigo-400" /> Umur
                                </label>
                                <p className="font-medium text-gray-800 bg-gray-50 p-2.5 rounded-lg text-sm">{viewingStudent.age ? `${viewingStudent.age} Tahun` : '-'}</p>
                            </div>

                            <div className="col-span-1 sm:col-span-2 space-y-1">
                                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    <FaUniversity className="text-indigo-400" /> Institusi / Sekolah
                                </label>
                                <p className="font-medium text-gray-800 bg-gray-50 p-2.5 rounded-lg text-sm">{viewingStudent.institution || '-'}</p>
                            </div>

                            <div className="col-span-1 sm:col-span-2 space-y-1">
                                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    <FaMapMarkerAlt className="text-indigo-400" /> Alamat
                                </label>
                                <p className="font-medium text-gray-800 bg-gray-50 p-2.5 rounded-lg text-sm whitespace-pre-line">
                                    {viewingStudent.biodata?.address || '-'}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-3 border-t">
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
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
