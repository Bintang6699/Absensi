import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import Swal from 'sweetalert2';
import { FaPaperPlane, FaInbox, FaPenAlt, FaTrash, FaCheck, FaCheckDouble } from 'react-icons/fa';

const AdminMessagePage = () => {
    const [activeTab, setActiveTab] = useState('inbox');
    const [messages, setMessages] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Compose state
    const [selectedRecipients, setSelectedRecipients] = useState([]);
    const [isBroadcast, setIsBroadcast] = useState(false);
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('note');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files));
    };

    useEffect(() => {
        if (activeTab === 'inbox' || activeTab === 'sent') {
            fetchMessages(activeTab);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchStudents();
    }, []);

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

    const fetchStudents = async () => {
        try {
            const { data } = await API.get('/students?nopage=true');
            setStudents(data.students || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSendMessage = async () => {
        if (!subject || !content) {
            Swal.fire('Error', 'Subject and content are required', 'error');
            return;
        }

        if (!isBroadcast && selectedRecipients.length === 0) {
            Swal.fire('Error', 'Please select at least one recipient', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('subject', subject);
        formData.append('content', content);
        formData.append('category', category);
        formData.append('isBroadcast', isBroadcast);

        if (!isBroadcast) {
            selectedRecipients.forEach(id => formData.append('recipients[]', id));
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

            Swal.fire('Success', 'Message sent successfully', 'success');
            setSubject('');
            setContent('');
            setSelectedRecipients([]);
            setIsBroadcast(false);
            setCategory('note');
            setSelectedFiles([]);
            setActiveTab('sent');
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to send message', 'error');
        }
    };

    const handleDelete = async (msgId) => {
        const result = await Swal.fire({
            title: 'Delete message?',
            text: 'This action cannot be undone',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Delete',
        });

        if (result.isConfirmed) {
            try {
                await API.delete(`/messages/${msgId}`);
                Swal.fire('Deleted', 'Message deleted', 'success');
                fetchMessages(activeTab);
            } catch (error) {
                Swal.fire('Error', 'Failed to delete message', 'error');
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

    const toggleRecipient = (studentId) => {
        if (selectedRecipients.includes(studentId)) {
            setSelectedRecipients(selectedRecipients.filter(id => id !== studentId));
        } else {
            setSelectedRecipients([...selectedRecipients, studentId]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedRecipients.length === students.length) {
            setSelectedRecipients([]);
        } else {
            setSelectedRecipients(students.map(s => s._id));
        }
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

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <FaPenAlt /> Tulis Pesan
                </button>
            </div>

            {/* Content */}
            {activeTab === 'compose' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border">
                    <h2 className="text-xl font-bold mb-6">Tulis Pesan Baru</h2>

                    {/* Broadcast Toggle */}
                    <div className="mb-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isBroadcast}
                                onChange={(e) => {
                                    setIsBroadcast(e.target.checked);
                                    if (e.target.checked) setSelectedRecipients([]);
                                }}
                                className="w-5 h-5"
                            />
                            <span className="font-semibold text-gray-700">Kirim ke Semua Siswa (Broadcast)</span>
                        </label>
                    </div>

                    {/* Recipients Selection */}
                    {!isBroadcast && (
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Penerima</label>
                            <input
                                type="text"
                                placeholder="Cari siswa (nama, ID, email)..."
                                className="w-full p-3 border rounded-lg mb-3"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                                <div className="flex items-center gap-3 mb-3 pb-3 border-b">
                                    <input
                                        type="checkbox"
                                        checked={selectedRecipients.length === students.length}
                                        onChange={toggleSelectAll}
                                        className="w-5 h-5"
                                    />
                                    <span className="font-semibold">Pilih Semua ({students.length})</span>
                                </div>
                                {filteredStudents.map(student => (
                                    <div key={student._id} className="flex items-center gap-3 py-2 hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={selectedRecipients.includes(student._id)}
                                            onChange={() => toggleRecipient(student._id)}
                                            className="w-5 h-5"
                                        />
                                        <div>
                                            <p className="font-medium">{student.name}</p>
                                            <p className="text-xs text-gray-500">{student.studentId} • {student.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-gray-500 mt-2">{selectedRecipients.length} siswa dipilih</p>
                        </div>
                    )}

                    {/* Category */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori Pesan</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full p-3 border rounded-lg"
                        >
                            <option value="note">📝 Catatan Biasa</option>
                            <option value="info">ℹ️ Informasi/Event</option>
                            <option value="warning">⚠️ Peringatan</option>
                        </select>
                    </div>

                    {/* Subject */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Judul</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full p-3 border rounded-lg"
                            placeholder="Masukkan judul pesan"
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
                        />
                        <p className="text-xs text-gray-500 mt-1">Supported: Images, PDF, Docs</p>
                    </div>

                    <button
                        onClick={handleSendMessage}
                        className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2"
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
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryBadge(msg.category)}`}>
                                                {msg.category.toUpperCase()}
                                            </span>
                                            {msg.isBroadcast && (
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">BROADCAST</span>
                                            )}
                                            {!msg.isRead && activeTab === 'inbox' && (
                                                <span className="text-primary text-xs font-bold">● BARU</span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-800 mb-1">{msg.subject}</h3>
                                        {activeTab === 'inbox' && (
                                            <p className="text-sm text-gray-500 mb-2">Dari: {msg.sender?.name} ({msg.sender?.role === 'student' ? 'Siswa' : 'Admin'})</p>
                                        )}
                                        {activeTab === 'sent' && (
                                            <p className="text-sm text-gray-500 mb-2">
                                                Kepada: {msg.isBroadcast ? 'Semua Siswa' : `${msg.recipients?.length || 0} siswa`}
                                            </p>
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
                                                        className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-sm text-blue-600 rounded-lg hover:bg-gray-200"
                                                    >
                                                        📎 {file.filename.split('-').slice(1).join('-')}
                                                    </a>
                                                ))}
                                            </div>
                                        )}

                                        <p className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {activeTab === 'inbox' && !msg.isRead && (
                                            <button
                                                onClick={() => handleMarkAsRead(msg._id)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                                                title="Tandai sudah dibaca"
                                            >
                                                <FaCheckDouble />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(msg._id)}
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

export default AdminMessagePage;
