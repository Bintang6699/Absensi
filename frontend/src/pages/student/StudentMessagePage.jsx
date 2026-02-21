import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import Swal from 'sweetalert2';
import { FaPaperPlane, FaInbox, FaPenAlt, FaTrash, FaClock } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const StudentMessagePage = () => {
    const { user, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState('inbox');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [parentMessage, setParentMessage] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [canSend, setCanSend] = useState(true);

    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files));
    };

    useEffect(() => {
        if (activeTab === 'inbox' || activeTab === 'sent') {
            fetchMessages(activeTab);
        }
    }, [activeTab]);

    useEffect(() => {
        checkRateLimit();
        const interval = setInterval(checkRateLimit, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [user]);

    const checkRateLimit = () => {
        if (!user?.lastMessageSentAt) {
            setCanSend(true);
            setTimeRemaining(null);
            return;
        }

        const lastSent = new Date(user.lastMessageSentAt).getTime();
        const now = Date.now();
        const elapsed = now - lastSent;
        const hourLimit = 24 * 60 * 60 * 1000; // 24 hours

        if (elapsed >= hourLimit) {
            setCanSend(true);
            setTimeRemaining(null);
        } else {
            setCanSend(false);
            const remaining = hourLimit - elapsed;
            const hours = Math.floor(remaining / (60 * 60 * 1000));
            const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
            setTimeRemaining({ hours, minutes });
        }
    };

    const fetchMessages = async (type) => {
        setLoading(true);
        try {
            const { data } = await API.get(`/messages?type=${type}`);
            setMessages(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!canSend) {
            Swal.fire('Error', `Anda dapat mengirim pesan lagi dalam ${timeRemaining.hours} jam ${timeRemaining.minutes} menit`, 'error');
            return;
        }

        if (!subject || !content) {
            Swal.fire('Error', 'Judul dan isi pesan wajib diisi', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('subject', subject);
        formData.append('content', content);
        if (parentMessage) {
            formData.append('parentMessage', parentMessage);
        }

        selectedFiles.forEach(file => {
            formData.append('attachments', file);
        });

        try {
            await API.post('/messages', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            Swal.fire('Sukses', 'Pesan berhasil dikirim ke guru', 'success');
            setSubject('');
            setContent('');
            setSelectedFiles([]);
            setParentMessage(null);
            setActiveTab('sent');

            // Update user data to sync lastMessageSentAt
            await refreshUser();
            checkRateLimit();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Gagal mengirim pesan', 'error');
        }
    };

    const handleDelete = async (msgId) => {
        const result = await Swal.fire({
            title: 'Hapus pesan?',
            text: 'Aksi ini tidak dapat dibatalkan',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Hapus',
        });

        if (result.isConfirmed) {
            try {
                await API.delete(`/messages/${msgId}`);
                Swal.fire('Terhapus', 'Pesan berhasil dihapus', 'success');
                fetchMessages(activeTab);
            } catch (error) {
                Swal.fire('Error', 'Gagal menghapus pesan', 'error');
            }
        }
    };

    const handleMarkAsRead = async (msgId) => {
        try {
            await API.put(`/messages/${msgId}/read`);
            fetchMessages(activeTab);
        } catch (error) {
            console.error(error);
        }
    };

    const handleReply = (msg) => {
        setParentMessage(msg._id);
        setSubject(`Re: ${msg.subject}`);
        setContent(`\n\n--- Pesan Asli ---\n${msg.content}`);
        setActiveTab('compose');
    };

    const getCategoryBadge = (cat) => {
        const badges = {
            warning: 'bg-red-100 text-red-700',
            info: 'bg-blue-100 text-blue-700',
            note: 'bg-green-100 text-green-700',
            private: 'bg-purple-100 text-purple-700',
        };
        return badges[cat] || badges.note;
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Sistem Pesan</h1>

            {/* Tabs */}
            <div className="flex gap-2 border-b">
                <button
                    onClick={() => setActiveTab('inbox')}
                    className={`px-6 py-3 font-semibold flex items-center gap-2 ${activeTab === 'inbox' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                >
                    <FaInbox /> Pesan Masuk
                </button>
                <button
                    onClick={() => setActiveTab('sent')}
                    className={`px-6 py-3 font-semibold flex items-center gap-2 ${activeTab === 'sent' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                >
                    <FaPaperPlane /> Terkirim
                </button>
                <button
                    onClick={() => setActiveTab('compose')}
                    className={`px-6 py-3 font-semibold flex items-center gap-2 ${activeTab === 'compose' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                >
                    <FaPenAlt /> Kirim ke Guru
                </button>
            </div>

            {/* Content */}
            {activeTab === 'compose' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border">
                    <h2 className="text-xl font-bold mb-6">Kirim Pesan ke Guru</h2>

                    {!canSend && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                            <FaClock className="text-yellow-600 text-2xl" />
                            <div>
                                <p className="font-semibold text-yellow-800">Anda sudah mengirim pesan hari ini</p>
                                <p className="text-sm text-yellow-700">Anda dapat mengirim pesan lagi dalam: <span className="font-bold">{timeRemaining?.hours} jam {timeRemaining?.minutes} menit</span></p>
                            </div>
                        </div>
                    )}

                    {/* Subject */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Judul</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full p-3 border rounded-lg"
                            placeholder="Masukkan judul pesan"
                            disabled={!canSend}
                        />
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Isi Pesan</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows="8"
                            className="w-full p-3 border rounded-lg"
                            placeholder="Tulis pesan Anda di sini..."
                            disabled={!canSend}
                        />
                    </div>

                    {/* File Upload */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Lampiran (Maks. 5 file)</label>
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="w-full p-2 border rounded-lg"
                            disabled={!canSend}
                        />
                        <p className="text-xs text-gray-500 mt-1">Supported: Images, PDF, Docs</p>
                    </div>

                    {parentMessage && (
                        <div className="mb-4 text-sm text-gray-500 bg-gray-50 p-2 rounded">
                            Membalas pesan. <button onClick={() => { setParentMessage(null); setSubject(''); setContent(''); }} className="text-red-500 underline">Batal</button>
                        </div>
                    )}

                    <button
                        onClick={handleSendMessage}
                        disabled={!canSend}
                        className={`px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition ${canSend
                            ? 'bg-primary text-white hover:bg-indigo-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <FaPaperPlane /> Kirim Pesan
                    </button>
                </div>
            )}

            {(activeTab === 'inbox' || activeTab === 'sent') && (
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12">Loading messages...</div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">Tidak ada pesan</div>
                    ) : (
                        messages.map(msg => (
                            <div
                                key={msg._id}
                                className={`bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition ${!msg.isRead && activeTab === 'inbox' ? 'border-l-4 border-l-primary' : ''}`}
                                onClick={() => !msg.isRead && activeTab === 'inbox' && handleMarkAsRead(msg._id)}
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryBadge(msg.category)}`}>
                                                {msg.category.toUpperCase()}
                                            </span>
                                            {!msg.isRead && activeTab === 'inbox' && (
                                                <span className="text-primary text-xs font-bold">● BARU</span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-800 mb-1">{msg.subject}</h3>
                                        {activeTab === 'inbox' && (
                                            <p className="text-sm text-gray-500 mb-2">Dari: {msg.sender?.name} (Guru/Admin)</p>
                                        )}
                                        <p className="text-gray-700 mb-3">{msg.content}</p>

                                        {/* Attachments Display */}
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {msg.attachments.map((file, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${file.path.replace(/\\/g, '/')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-sm text-blue-600 rounded-lg hover:bg-gray-200"
                                                    >
                                                        📎 {file.filename.split('-').slice(1).join('-')}
                                                    </a>
                                                ))}
                                            </div>
                                        )}

                                        <p className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {activeTab === 'inbox' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleReply(msg);
                                                }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                title="Balas"
                                            >
                                                <FaPenAlt />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(msg._id);
                                            }}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                            title="Hapus"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentMessagePage;
