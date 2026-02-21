import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaGoogle, FaUserShield } from 'react-icons/fa';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, user, loginWithToken } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Check for token in URL (from Google redirect)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (token) {
            // Need to fetch user details with this token
            // For now, let's assume valid and fetch profile
            // Or better, backend should have redirected with more info or we fetch /me
            import('../../api/axios').then(module => {
                const API = module.default;
                API.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
                    .then(res => {
                        const userData = { ...res.data, token };
                        loginWithToken(userData);
                    })
                    .catch(err => {
                        Swal.fire('Error', 'Google Login Failed', 'error');
                    });
            });
        }
    }, [location]);

    useEffect(() => {
        if (user) {
            if (user.isBanned) {
                navigate('/banned');
            } else {
                if (user.role === 'admin') navigate('/admin');
                else navigate('/student');
            }
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            Swal.fire('Error', 'Mohon isi semua field', 'error');
            return;
        }

        const res = await login(email, password);
        if (res.success) {
            Swal.fire({
                icon: 'success',
                title: 'Login Berhasil',
                showConfirmButton: false,
                timer: 1500
            });
        } else {
            Swal.fire('Login Gagal', res.message, 'error');
        }
    };

    const handleGoogleLogin = () => {
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        window.open(`${backendUrl}/api/auth/google`, '_self');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Sistem Kursus Inggris</h1>
                    <p className="text-gray-500">Silakan login untuk melanjutkan</p>
                </div>

                {/* Admin/Teacher Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email (Admin)</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-300 flex items-center justify-center gap-2"
                    >
                        <FaUserShield /> Login sebagai Admin
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Atau masuk sebagai Siswa</span>
                    </div>
                </div>

                {/* Student Google Login */}
                <button
                    onClick={handleGoogleLogin}
                    className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition duration-300 flex items-center justify-center gap-2"
                >
                    <FaGoogle className="text-red-500" /> Masuk dengan Google
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
