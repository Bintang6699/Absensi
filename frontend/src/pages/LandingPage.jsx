import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaChalkboardTeacher, FaUsers, FaWhatsapp, FaInstagram, FaFacebook, FaTiktok, FaMapMarkerAlt, FaClock, FaEnvelope } from 'react-icons/fa';

const LandingPage = () => {
    const { user } = useAuth();

    return (
        <div className="font-sans antialiased text-gray-800">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary font-bold text-xl">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">E</div>
                        English Course
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                        <a href="#home" className="hover:text-primary transition">Beranda</a>
                        <a href="#about" className="hover:text-primary transition">Tentang</a>
                        <a href="#programs" className="hover:text-primary transition">Program</a>
                        <a href="#contact" className="hover:text-primary transition">Kontak</a>
                    </div>
                    <div>
                        {user ? (
                            <Link
                                to={user.role === 'admin' ? '/admin' : '/student'}
                                className="bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition transform hover:-translate-y-0.5"
                            >
                                Dashboard ({user.name})
                            </Link>
                        ) : (
                            <div className="flex gap-4">
                                <Link to="/login/admin" className="text-gray-600 hover:text-primary font-medium transition">
                                    Login Admin
                                </Link>
                                <Link to="/login/student" className="bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition transform hover:-translate-y-0.5">
                                    Login Siswa
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="pt-32 pb-20 px-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold tracking-wide uppercase">Lembaga Kursus Bahasa Inggris Terbaik</span>
                        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                            Wujudkan Mimpi <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Go International</span>
                        </h1>
                        <p className="text-lg text-gray-500 max-w-lg">
                            Bergabunglah bersama kami untuk menguasai Bahasa Inggris dengan metode belajar yang menyenangkan, interaktif, dan terbukti efektif.
                        </p>
                        <div className="flex gap-4">
                            {user ? (
                                <Link 
                                    to={user.role === 'admin' ? '/admin' : '/student'}
                                    className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                                >
                                    Buka Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login/student" className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                                        Login sebagai Siswa
                                    </Link>
                                    <Link to="/login/admin" className="px-8 py-3 rounded-full font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition">
                                        Login sebagai Admin
                                    </Link>
                                </>
                            )}
                        </div>
                        <div className="pt-8 flex items-center gap-8 text-gray-400">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-gray-800">1000+</span>
                                <span className="text-xs">Alumni<br />Sukses</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-gray-800">50+</span>
                                <span className="text-xs">Pengajar<br />Expert</span>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -top-10 -right-10 w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-indigo-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                        <img
                            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
                            alt="Student learning"
                            className="relative rounded-2xl shadow-2xl z-10 transform tilt-1 hover:scale-[1.02] transition duration-500"
                        />
                    </div>
                </div>
            </section>

            {/* Brand/Features Section */}
            <section className="py-12 border-t border-b border-gray-50 bg-white">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-gray-400 font-bold text-xl opacity-70">
                    <div className="flex flex-col items-center gap-2 hover:opacity-100 transition hover:text-indigo-600">
                        <FaGraduationCap className="text-4xl mb-2" />
                        <span className="text-sm uppercase tracking-widest">Sertifikat Resmi</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 hover:opacity-100 transition hover:text-indigo-600">
                        <FaChalkboardTeacher className="text-4xl mb-2" />
                        <span className="text-sm uppercase tracking-widest">Mentor Berpengalaman</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 hover:opacity-100 transition hover:text-indigo-600">
                        <FaUsers className="text-4xl mb-2" />
                        <span className="text-sm uppercase tracking-widest">Komunitas Aktif</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 hover:opacity-100 transition hover:text-indigo-600">
                        <FaClock className="text-4xl mb-2" />
                        <span className="text-sm uppercase tracking-widest">Jadwal Felsibel</span>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div className="grid grid-cols-2 gap-4">
                        <img className="rounded-2xl shadow-lg mt-8" src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Classroom" />
                        <img className="rounded-2xl shadow-lg" src="https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Teaching" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold mb-6">Membangun Masa Depan Melalui Bahasa</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Established in 2010, English Course telah membantu ribuan siswa mencapai potensi maksimal mereka.
                            Visi kami adalah menciptakan generasi yang percaya diri berkomunikasi di panggung global.
                        </p>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Kami percaya bahwa belajar bahasa tidak harus membosankan. Kurikulum kami dirancang modern, berfokus pada percakapan aktif, dan relevan dengan kebutuhan industri saat ini.
                        </p>
                        <a href="#contact" className="text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-2">
                            Hubungi Kami &rarr;
                        </a>
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section className="py-20 px-6 bg-gray-50">
                <div className="max-w-7xl mx-auto text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Galeri Kegiatan</h2>
                    <p className="text-gray-500">Intip keseruan suasana belajar mengajar di English Course</p>
                </div>
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1427504746696-ea3093e62644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    ].map((src, idx) => (
                        <div key={idx} className="group relative overflow-hidden rounded-xl cursor-pointer">
                            <img src={src} alt="Gallery" className="w-full h-64 object-cover transform group-hover:scale-110 transition duration-500" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                <span className="text-white font-semibold">Lihat Foto</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 px-6">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
                    <div className="bg-indigo-900 text-white p-10 md:w-1/2 flex flex-col justify-between">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Hubungi Kami</h2>
                            <p className="opacity-80 mb-8">Punya pertanyaan seputar program kami? Jangan ragu untuk menghubungi kami.</p>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <FaWhatsapp className="text-2xl" />
                                    <div>
                                        <p className="text-xs opacity-70">WhatsApp</p>
                                        <p className="font-semibold">+62 812 3456 7890</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <FaEnvelope className="text-2xl" />
                                    <div>
                                        <p className="text-xs opacity-70">Email</p>
                                        <p className="font-semibold">info@englishcourse.com</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <FaMapMarkerAlt className="text-2xl" />
                                    <div>
                                        <p className="text-xs opacity-70">Alamat</p>
                                        <p className="font-semibold">Jl. Pendidikan No. 123, Jakarta</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-12 flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"><FaInstagram /></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"><FaFacebook /></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"><FaTiktok /></a>
                        </div>
                    </div>
                    <div className="p-10 md:w-1/2">
                        <form className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none" placeholder="Masukkan nama Anda" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none" placeholder="nama@email.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pesan</label>
                                <textarea rows="4" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none" placeholder="Tulis pesan Anda..."></textarea>
                            </div>
                            <button className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">Kirim Pesan</button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <h3 className="text-white font-bold text-xl mb-2">English Course</h3>
                        <p className="text-sm">© 2026 English Course. All rights reserved.</p>
                    </div>
                    <div className="flex gap-8 text-sm font-medium">
                        <a href="#" className="hover:text-white transition">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition">Terms of Service</a>
                        <a href="#" className="hover:text-white transition">FAQ</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
