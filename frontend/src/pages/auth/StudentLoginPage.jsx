import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaGoogle, FaArrowLeft } from 'react-icons/fa';

const StudentLoginPage = () => {
    const { user, loginWithToken } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Check for token in URL (from Google redirect)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (token) {
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
    }, [location, loginWithToken]);

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

    const handleGoogleLogin = () => {
        // Gunakan VITE_API_URL di production (Vercel), localhost di development
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        window.open(`${backendUrl}/api/auth/google`, '_self');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center relative">
                <Link to="/" className="absolute top-4 left-4 text-gray-500 hover:text-primary transition">
                    <FaArrowLeft />
                </Link>
                <div className="mb-8 mt-4">
                    <h1 className="text-2xl font-bold text-gray-800">Login Siswa</h1>
                    <p className="text-gray-500">Masuk untuk mengakses materi dan nilai</p>
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Gunakan akun Google Anda untuk masuk</p>
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition duration-300 flex items-center justify-center gap-2 font-medium shadow-sm"
                    >
                        <FaGoogle className="text-red-500 text-xl" /> Masuk dengan Google
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentLoginPage;
