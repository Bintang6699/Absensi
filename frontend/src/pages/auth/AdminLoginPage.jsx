import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaUserShield, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, user } = useAuth();
    const navigate = useNavigate();

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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md relative">
                <Link to="/" className="absolute top-4 left-4 text-gray-500 hover:text-primary transition">
                    <FaArrowLeft />
                </Link>
                <div className="text-center mb-8 mt-4">
                    <h1 className="text-2xl font-bold text-gray-800">Login Admin / Guru</h1>
                    <p className="text-gray-500">Silakan masukkan kredensial Anda</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
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
                        <FaUserShield /> Masuk
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;
