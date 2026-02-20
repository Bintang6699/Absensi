import React, { useRef } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { FaDownload } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const StudentStats = ({ data }) => {
    const printRef = useRef();

    const downloadPDF = async () => {
        const element = printRef.current;
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Laporan_Statistik_${data.student.name.replace(/\s+/g, '_')}.pdf`);
    };

    if (!data) return null;

    // Data for charts
    const gradeData = data.gradesList || [];
    const attendanceData = data.attendanceChart || [];
    const monthlyAttendance = data.monthlyAttendance || [];
    const subjectAverages = data.subjectAverages || [];

    const COLORS = ['#10B981', '#EF4444'];

    return (
        <div className="space-y-8">
            <div className="flex justify-end">
                <button
                    onClick={downloadPDF}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm"
                >
                    <FaDownload /> Download PDF Laporan
                </button>
            </div>

            <div ref={printRef} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
                {/* Header for PDF */}
                <div className="border-b pb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Laporan Statistik Siswa</h1>
                    <p className="text-gray-500">English Course Management System</p>
                    <div className="mt-4 grid grid-cols-2 text-left gap-4 max-w-lg mx-auto bg-gray-50 p-4 rounded-lg">
                        <p><span className="font-semibold">Nama:</span> {data.student.name}</p>
                        <p><span className="font-semibold">Kelas:</span> {data.student.classLevel}</p>
                        <p><span className="font-semibold">Alamat:</span> {data.student.address}</p>
                        <p><span className="font-semibold">Predikat:</span> {data.evaluation}</p>
                    </div>
                </div>

                {/* Ringkasan */}
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-gray-500 text-sm">Rata-rata Nilai</p>
                        <h3 className="text-2xl font-bold text-blue-600">{data.averageScore}</h3>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-gray-500 text-sm">Kehadiran</p>
                        <h3 className="text-2xl font-bold text-green-600">{data.attendancePercentage}%</h3>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-gray-500 text-sm">Total Tugas</p>
                        <h3 className="text-2xl font-bold text-purple-600">{data.gradeCount}</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Grafik Nilai */}
                    <div className="h-80">
                        <h3 className="text-lg font-semibold mb-4 text-center">Perkembangan Nilai</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={gradeData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="title" angle={-45} textAnchor="end" height={60} interval={0} fontSize={10} />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={2} name="Nilai" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Grafik Kehadiran */}
                    <div className="h-80">
                        <h3 className="text-lg font-semibold mb-4 text-center">Persentase Kehadiran</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={attendanceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label
                                >
                                    {attendanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Grafik Kehadiran Bulanan */}
                    <div className="h-80">
                        <h3 className="text-lg font-semibold mb-4 text-center">Kehadiran Bulanan</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyAttendance}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" fontSize={12} interval={0} />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="present" name="Hadir" fill="#10B981" />
                                <Bar dataKey="absent" name="Absen" fill="#EF4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Grafik Rata-rata Pelajaran */}
                    <div className="h-80">
                        <h3 className="text-lg font-semibold mb-4 text-center">Rata-rata per Mata Pelajaran</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectAverages}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                <Radar name="Rata-rata" dataKey="average" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Footer PDF */}
                <div className="text-center pt-8 text-gray-400 text-xs mt-8 border-t">
                    <p>Dicetak pada: {new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
};

export default StudentStats;
