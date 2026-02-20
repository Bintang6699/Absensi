import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const StudentBiodata = () => {
    const { user, loginWithToken } = useAuth();
    const [loading, setLoading] = useState(false);

    const formik = useFormik({
        initialValues: {
            name: user?.name || '',
            email: user?.email || '',
            institution: user?.institution || '',
            age: user?.age || '',
            classLevel: user?.classLevel || '',
            address: user?.biodata?.address || '',
            phone: user?.biodata?.phone || '',
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            institution: Yup.string().max(100, 'Maksimal 100 karakter'),
            age: Yup.number().min(5, 'Minimal 5 tahun').max(99, 'Maksimal 99 tahun'),
            address: Yup.string().required('Alamat wajib diisi'),
            phone: Yup.string().required('No. Telepon wajib diisi'),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const { data } = await API.put(`/students/${user._id}`, {
                    name: user.name, // Keep original
                    email: user.email, // Keep original
                    classLevel: user.classLevel, // Keep original
                    age: values.age,
                    institution: values.institution,
                    biodata: {
                        address: values.address,
                        phone: values.phone
                    }
                });

                // Update local user context
                const updatedUser = { ...user, ...data };
                loginWithToken(updatedUser); // Reuse this to update state

                Swal.fire('Sukses', 'Biodata berhasil diperbarui', 'success');
            } catch (error) {
                Swal.fire('Error', 'Gagal memperbarui biodata', 'error');
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Biodata Saya</h1>

            <form onSubmit={formik.handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ID Siswa</label>
                        <input
                            type="text"
                            value={user?.studentId || '-'}
                            disabled
                            className="mt-1 block w-full border border-gray-200 bg-gray-100 rounded-md p-2 text-gray-600 font-mono cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                        <input
                            type="text"
                            value={formik.values.name}
                            disabled
                            className="mt-1 block w-full border border-gray-200 bg-gray-50 rounded-md p-2 text-gray-500 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={formik.values.email}
                            disabled
                            className="mt-1 block w-full border border-gray-200 bg-gray-50 rounded-md p-2 text-gray-500 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tingkat Kelas</label>
                        <input
                            type="text"
                            value={formik.values.classLevel}
                            disabled
                            className="mt-1 block w-full border border-gray-200 bg-gray-50 rounded-md p-2 text-gray-500 cursor-not-allowed"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Asal Sekolah / Kampus</label>
                        <input
                            type="text"
                            name="institution"
                            {...formik.getFieldProps('institution')}
                            placeholder="Contoh: SMA Negeri 1 Jakarta"
                            className="mt-1 block w-full border rounded-md p-2 focus:ring-primary focus:border-primary"
                        />
                        {formik.touched.institution && formik.errors.institution && (
                            <div className="text-red-500 text-xs mt-1">{formik.errors.institution}</div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Umur</label>
                        <input
                            type="number"
                            name="age"
                            {...formik.getFieldProps('age')}
                            className="mt-1 block w-full border rounded-md p-2 focus:ring-primary focus:border-primary"
                        />
                        {formik.touched.age && formik.errors.age && (
                            <div className="text-red-500 text-xs mt-1">{formik.errors.age}</div>
                        )}
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Informasi Kontak</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">No. Telepon / WhatsApp</label>
                            <input
                                type="text"
                                name="phone"
                                {...formik.getFieldProps('phone')}
                                className="mt-1 block w-full border rounded-md p-2 focus:ring-primary focus:border-primary"
                            />
                            {formik.touched.phone && formik.errors.phone && (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.phone}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Alamat Lengkap</label>
                            <textarea
                                name="address"
                                {...formik.getFieldProps('address')}
                                rows="3"
                                className="mt-1 block w-full border rounded-md p-2 focus:ring-primary focus:border-primary"
                            ></textarea>
                            {formik.touched.address && formik.errors.address && (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.address}</div>
                            )}
                        </div>
                    </div>
                </div>



                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form >
        </div >
    );
};

export default StudentBiodata;
