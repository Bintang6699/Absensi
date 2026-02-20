import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const StudentGrades = () => {
    const { user } = useAuth();
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const { data } = await API.get(`/grades/student/${user._id}`);
                setGrades(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        if (user?._id) fetchGrades();
    }, [user]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Daftar Nilai</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Judul Kegiatan</th>
                            <th className="p-4 font-semibold text-gray-600">Tipe</th>
                            <th className="p-4 font-semibold text-gray-600">Nilai</th>
                            <th className="p-4 font-semibold text-gray-600">Feedback</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr><td colSpan="4" className="p-8 text-center">Loading...</td></tr>
                        ) : grades.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-500">Belum ada data nilai</td></tr>
                        ) : (
                            grades.map((grade) => (
                                <tr key={grade._id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 font-medium text-gray-800">{grade.title}</td>
                                    <td className="p-4 text-sm text-gray-500">{grade.type}</td>
                                    <td className="p-4 font-bold text-primary">{grade.score}</td>
                                    <td className="p-4 text-sm text-gray-600 italic">
                                        {grade.feedback || '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentGrades;
