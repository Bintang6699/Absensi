import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    FaGraduationCap, FaChalkboardTeacher, FaUsers, FaWhatsapp,
    FaInstagram, FaFacebook, FaTiktok, FaMapMarkerAlt,
    FaClock, FaEnvelope, FaBars, FaTimes
} from 'react-icons/fa';

const LandingPage = () => {
    const { user } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="font-sans antialiased text-gray-800">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg md:text-xl">
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm md:text-base">
                            E
                        </div>
                        <span>English Course</span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                        <a href="#home" className="hover:text-indigo-600 transition">Beranda</a>
                        <a href="#about" className="hover:text-indigo-600 transition">Tentang</a>
                        <a href="#programs" className="hover:text-indigo-600 transition">Program</a>
                        <a href="#contact" className="hover:text-indigo-600 transition">Kontak</a>
                    </div>

                    {/* CTA Desktop */}
                    <div className="hidden md:flex gap-3">
                        {user ? (
                            <Link
                                to={user.role === 'admin' ? '/admin' : '/student'}
                                className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/login/admin" className="text-gray-600 hover:text-indigo-600 font-medium transition text-sm">
                                    Login Admin
                                </Link>
                                <Link to="/login/student" className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition">
                                    Login Siswa
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile: CTA + Hamburger */}
                    <div className="flex items-center gap-2 md:hidden">
                        {user ? (
                            <Link
                                to={user.role === 'admin' ? '/admin' : '/student'}
                                className="bg-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link to="/login/student" className="bg-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                                Login Siswa
                            </Link>
                        )}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-gray-600 hover:text-indigo-600"
                        >
                            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-3 shadow-lg">
                        <a href="#home" onClick={() => setMobileMenuOpen(false)} className="py-2 text-gray-700 font-medium border-b border-gray-50">Beranda</a>
                        <a href="#about" onClick={() => setMobileMenuOpen(false)} className="py-2 text-gray-700 font-medium border-b border-gray-50">Tentang</a>
                        <a href="#programs" onClick={() => setMobileMenuOpen(false)} className="py-2 text-gray-700 font-medium border-b border-gray-50">Program</a>
                        <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="py-2 text-gray-700 font-medium border-b border-gray-50">Kontak</a>
                        {!user && (
                            <Link to="/login/admin" className="py-2 text-indigo-600 font-medium">Login Admin</Link>
                        )}
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section id="home" className="pt-20 md:pt-32 pb-12 md:pb-20 px-4 md:px-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <div className="max-w-7xl mx-auto">
                    {/* Mobile: Stack layout */}
                    <div className="flex flex-col md:grid md:grid-cols-2 md:gap-12 md:items-center gap-8">
                        {/* Text */}
                        <div className="space-y-4 md:space-y-6 text-center md:text-left">
                            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold tracking-wide uppercase">
                                Lembaga Kursus Bahasa Inggris Terbaik
                            </span>
                            <h1 className="text-3xl md:text-6xl font-bold leading-tight">
                                Wujudkan Mimpi{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                    Go International
                                </span>
                            </h1>
                            <p className="text-base md:text-lg text-gray-500 max-w-lg mx-auto md:mx-0">
                                Bergabunglah bersama kami untuk menguasai Bahasa Inggris dengan metode belajar yang menyenangkan, interaktif, dan terbukti efektif.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                                {user ? (
                                    <Link
                                        to={user.role === 'admin' ? '/admin' : '/student'}
                                        className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 text-center"
                                    >
                                        Buka Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link to="/login/student" className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 text-center">
                                            Login sebagai Siswa
                                        </Link>
                                        <Link to="/login/admin" className="px-8 py-3 rounded-full font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition text-center">
                                            Login sebagai Admin
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-8 justify-center md:justify-start pt-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-gray-800">1000+</span>
                                    <span className="text-xs text-gray-400">Alumni<br />Sukses</span>
                                </div>
                                <div className="w-px h-8 bg-gray-200" />
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-gray-800">50+</span>
                                    <span className="text-xs text-gray-400">Pengajar<br />Expert</span>
                                </div>
                            </div>
                        </div>

                        {/* Image */}
                        <div className="relative">
                            <div className="absolute -top-6 -right-6 w-48 md:w-72 h-48 md:h-72 bg-purple-200 rounded-full blur-3xl opacity-30 animate-pulse" />
                            <div className="absolute -bottom-6 -left-6 w-48 md:w-72 h-48 md:h-72 bg-indigo-200 rounded-full blur-3xl opacity-30 animate-pulse" />
                            <img
                                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
                                alt="Student learning"
                                className="relative rounded-2xl shadow-2xl z-10 w-full object-cover max-h-64 md:max-h-none"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-10 md:py-12 border-t border-b border-gray-50 bg-white">
                <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {[
                        { icon: <FaGraduationCap />, label: 'Sertifikat Resmi' },
                        { icon: <FaChalkboardTeacher />, label: 'Mentor Berpengalaman' },
                        { icon: <FaUsers />, label: 'Komunitas Aktif' },
                        { icon: <FaClock />, label: 'Jadwal Fleksibel' },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 text-gray-400 hover:text-indigo-600 transition group">
                            <span className="text-3xl md:text-4xl group-hover:scale-110 transition">{item.icon}</span>
                            <span className="text-xs font-semibold uppercase tracking-wider">{item.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-14 md:py-20 px-4 md:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:grid md:grid-cols-2 md:gap-16 md:items-center gap-10">
                        {/* Images */}
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                            <img className="rounded-xl md:rounded-2xl shadow-lg mt-6 md:mt-8 w-full object-cover" src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Classroom" />
                            <img className="rounded-xl md:rounded-2xl shadow-lg w-full object-cover" src="https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Teaching" />
                        </div>
                        {/* Text */}
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Membangun Masa Depan Melalui Bahasa</h2>
                            <p className="text-gray-600 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                                Established in 2010, English Course telah membantu ribuan siswa mencapai potensi maksimal mereka.
                                Visi kami adalah menciptakan generasi yang percaya diri berkomunikasi di panggung global.
                            </p>
                            <p className="text-gray-600 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
                                Kami percaya bahwa belajar bahasa tidak harus membosankan. Kurikulum kami dirancang modern, berfokus pada percakapan aktif, dan relevan dengan kebutuhan industri saat ini.
                            </p>
                            <a href="#contact" className="text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-2 text-sm md:text-base">
                                Hubungi Kami →
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery */}
            <section className="py-14 md:py-20 px-4 md:px-6 bg-gray-50">
                <div className="max-w-7xl mx-auto text-center mb-8 md:mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Galeri Kegiatan</h2>
                    <p className="text-gray-500 text-sm md:text-base">Intip keseruan suasana belajar mengajar di English Course</p>
                </div>
                {/* Mobile: 2 kolom, Desktop: 3 kolom */}
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                    {[
                        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1427504746696-ea3093e62644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    ].map((src, idx) => (
                        <div key={idx} className="group relative overflow-hidden rounded-xl cursor-pointer">
                            <img src={src} alt="Gallery" className="w-full h-36 md:h-64 object-cover transform group-hover:scale-110 transition duration-500" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">Lihat Foto</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-14 md:py-20 px-4 md:px-6">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
                    {/* Info */}
                    <div className="bg-indigo-900 text-white p-8 md:p-10 md:w-1/2">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Hubungi Kami</h2>
                        <p className="opacity-80 mb-6 md:mb-8 text-sm md:text-base">Punya pertanyaan seputar program kami? Jangan ragu untuk menghubungi kami.</p>
                        <div className="space-y-4 md:space-y-6">
                            {[
                                { icon: <FaWhatsapp />, label: 'WhatsApp', value: '+62 812 3456 7890' },
                                { icon: <FaEnvelope />, label: 'Email', value: 'info@englishcourse.com' },
                                { icon: <FaMapMarkerAlt />, label: 'Alamat', value: 'Jl. Pendidikan No. 123, Jakarta' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <span className="text-xl mt-0.5">{item.icon}</span>
                                    <div>
                                        <p className="text-xs opacity-70">{item.label}</p>
                                        <p className="font-semibold text-sm md:text-base">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 flex gap-3">
                            {[<FaInstagram />, <FaFacebook />, <FaTiktok />].map((icon, i) => (
                                <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                                    {icon}
                                </a>
                            ))}
                        </div>
                    </div>
                    {/* Form */}
                    <div className="p-8 md:p-10 md:w-1/2">
                        <form className="space-y-4 md:space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                <input type="text" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-sm" placeholder="Masukkan nama Anda" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-sm" placeholder="nama@email.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pesan</label>
                                <textarea rows="4" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-sm" placeholder="Tulis pesan Anda..." />
                            </div>
                            <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition text-sm">
                                Kirim Pesan
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-10 px-4 md:px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                    <div>
                        <h3 className="text-white font-bold text-xl mb-1">English Course</h3>
                        <p className="text-sm">© 2026 English Course. All rights reserved.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm font-medium">
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
