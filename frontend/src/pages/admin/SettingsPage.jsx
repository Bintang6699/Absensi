import { useState } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { FaUserCog, FaEnvelope, FaLock } from 'react-icons/fa';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const SettingsPage = () => {
    const { user, loginWithToken } = useAuth();
    const [loading, setLoading] = useState(false);

    const formik = useFormik({
        initialValues: {
            name: user?.name || '',
            email: user?.email || '',
            password: '',
            confirmPassword: ''
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            name: Yup.string().required('Nama wajib diisi'),
            email: Yup.string().email('Email tidak valid').required('Email wajib diisi'),
            password: Yup.string().min(6, 'Password minimal 6 karakter'),
            confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Konfirmasi password tidak cocok')
        }),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const payload = {
                    name: values.name,
                    email: values.email
                };

                if (values.password) {
                    payload.password = values.password;
                }

                const { data } = await API.put('/auth/me', payload);

                // Update local context
                loginWithToken(data);

                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Profil berhasil diperbarui',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Gagal memperbarui profil', 'error');
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Pengaturan Admin</h1>
                <p className="text-gray-500">Kelola informasi akun dan keamanan Anda.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 bg-gray-50 border-b">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FaUserCog className="text-primary" /> Informasi Profil
                    </h2>
                </div>
                <div className="p-6">
                    <form onSubmit={formik.handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                                    {...formik.getFieldProps('name')}
                                />
                                {formik.touched.name && formik.errors.name && (
                                    <p className="text-red-500 text-xs mt-1">{formik.errors.name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="email"
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                                        {...formik.getFieldProps('email')}
                                    />
                                </div>
                                {formik.touched.email && formik.errors.email && (
                                    <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
                                )}
                            </div>
                        </div>

                        <div className="border-t pt-4 mt-6">
                            <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <FaLock className="text-primary" /> Ganti Password
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                                        placeholder="Biarkan kosong jika tidak ingin ganti"
                                        {...formik.getFieldProps('password')}
                                    />
                                    {formik.touched.password && formik.errors.password && (
                                        <p className="text-red-500 text-xs mt-1">{formik.errors.password}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                                        {...formik.getFieldProps('confirmPassword')}
                                    />
                                    {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                        <p className="text-red-500 text-xs mt-1">{formik.errors.confirmPassword}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary text-white px-8 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
                            >
                                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
