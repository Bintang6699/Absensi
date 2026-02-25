import React, { useRef } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { FaDownload, FaUserGraduate, FaCalendarCheck, FaClipboardList, FaTrophy, FaStar } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Custom Tooltip yang lebih cantik
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-100 shadow-xl rounded-xl px-3 py-2 text-xs">
                {label && <p className="font-bold text-gray-700 mb-1">{label}</p>}
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color }} className="font-semibold">
                        {p.name}: <span className="font-bold">{p.value}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Mini Stat Card untuk ringkasan
const MiniStat = ({ label, value, icon, gradient, sub }) => (
    <div className={`relative overflow-hidden rounded-2xl p-4 text-white ${gradient} shadow-md`}>
        <div className="flex items-start justify-between">
            <div>
                <p className="text-white/70 text-xs font-medium mb-1">{label}</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold leading-none">{value}</h3>
                {sub && <p className="text-white/60 text-[10px] mt-1">{sub}</p>}
            </div>
            <div className="text-white/30 text-3xl sm:text-4xl">{icon}</div>
        </div>
        {/* Dekoratif bulatan */}
        <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-white/10" />
        <div className="absolute -bottom-2 -right-8 w-24 h-24 rounded-full bg-white/5" />
    </div>
);

// Progress bar predikat
const PredikatBadge = ({ nilai }) => {
    let label, color, bg, pct;
    if (nilai >= 90) { label = 'A - Istimewa'; color = 'text-emerald-700'; bg = 'bg-emerald-100'; pct = 100; }
    else if (nilai >= 80) { label = 'B - Sangat Baik'; color = 'text-blue-700'; bg = 'bg-blue-100'; pct = 80; }
    else if (nilai >= 70) { label = 'C - Baik'; color = 'text-indigo-700'; bg = 'bg-indigo-100'; pct = 60; }
    else if (nilai >= 60) { label = 'D - Cukup'; color = 'text-orange-700'; bg = 'bg-orange-100'; pct = 40; }
    else { label = 'E - Perlu Bimbingan'; color = 'text-red-700'; bg = 'bg-red-100'; pct = 20; }

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${bg} ${color}`}>
            <FaStar className="text-yellow-500" />
            {label}
        </div>
    );
};

const StudentStats = ({ data }) => {
    const printRef = useRef();

    const downloadPDF = async () => {
        const element = printRef.current;
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Laporan_${data.student.name.replace(/\s+/g, '_')}.pdf`);
    };

    if (!data) return null;

    const gradeData = data.gradesList || [];
    const attendanceData = data.attendanceChart || [];
    const monthlyAttendance = data.monthlyAttendance || [];
    const subjectAverages = data.subjectAverages || [];
    const avgScore = Number(data.averageScore) || 0;

    return (
        <div className="space-y-4">
            {/* Tombol Download */}
            <div className="flex justify-end">
                <button
                    onClick={downloadPDF}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:opacity-90 transition shadow-md shadow-indigo-100 text-xs sm:text-sm font-semibold"
                >
                    <FaDownload />
                    <span>Download PDF</span>
                </button>
            </div>

            <div ref={printRef} className="space-y-4">
                {/* Header Kartu Identitas */}
                <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
                    {/* Dekor background */}
                    <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-10 w-20 h-20 bg-white/5 rounded-full translate-y-1/2" />

                    <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Avatar */}
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl sm:text-3xl font-extrabold flex-shrink-0">
                            {data.student.name?.charAt(0).toUpperCase()}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg sm:text-xl font-extrabold leading-tight truncate">{data.student.name}</h2>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="bg-white/20 text-white text-xs font-mono px-2 py-0.5 rounded-lg">
                                    {data.student.studentId || '-'}
                                </span>
                                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-lg">
                                    Kelas {data.student.classLevel || '-'}
                                </span>
                            </div>
                            <div className="mt-2">
                                <PredikatBadge nilai={avgScore} />
                            </div>
                        </div>
                        {/* Nilai besar */}
                        <div className="text-center bg-white/15 border border-white/30 rounded-2xl px-5 py-3 flex-shrink-0">
                            <p className="text-white/70 text-[10px] font-medium uppercase tracking-wider">Rata-rata</p>
                            <p className="text-3xl sm:text-4xl font-black leading-none">{avgScore}</p>
                            <p className="text-white/60 text-[10px] mt-0.5">/ 100</p>
                        </div>
                    </div>
                </div>

                {/* Mini Stats — 3 kolom di mobile */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <MiniStat
                        label="Rata-rata Nilai"
                        value={avgScore}
                        icon={<FaTrophy />}
                        gradient="bg-gradient-to-br from-blue-500 to-blue-700"
                        sub="dari 100"
                    />
                    <MiniStat
                        label="Kehadiran"
                        value={`${data.attendancePercentage}%`}
                        icon={<FaCalendarCheck />}
                        gradient="bg-gradient-to-br from-emerald-500 to-green-700"
                        sub="dari total"
                    />
                    <MiniStat
                        label="Total Tugas"
                        value={data.gradeCount}
                        icon={<FaClipboardList />}
                        gradient="bg-gradient-to-br from-purple-500 to-violet-700"
                        sub="dinilai"
                    />
                </div>

                {/* Charts Row 1: Nilai + Kehadiran Pie */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* Grafik Perkembangan Nilai */}
                    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                            Perkembangan Nilai
                        </h3>
                        <div className="h-44 sm:h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={gradeData} margin={{ top: 4, right: 8, left: -28, bottom: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis
                                        dataKey="title"
                                        angle={-40}
                                        textAnchor="end"
                                        height={50}
                                        fontSize={8}
                                        tick={{ fill: '#9ca3af' }}
                                        interval={0}
                                    />
                                    <YAxis domain={[0, 100]} fontSize={9} tick={{ fill: '#9ca3af' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#4F46E5"
                                        strokeWidth={2.5}
                                        name="Nilai"
                                        dot={{ r: 3, fill: '#4F46E5' }}
                                        activeDot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Pie Chart Kehadiran */}
                    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                            Persentase Kehadiran
                        </h3>
                        <div className="h-44 sm:h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={attendanceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="45%"
                                        outerRadius="70%"
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {attendanceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        iconType="circle"
                                        iconSize={8}
                                        formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Charts Row 2: Kehadiran Bulanan + Radar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* Kehadiran Bulanan Bar */}
                    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                            Kehadiran Bulanan
                        </h3>
                        <div className="h-44 sm:h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyAttendance} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="name" fontSize={9} tick={{ fill: '#9ca3af' }} interval={0} />
                                    <YAxis allowDecimals={false} fontSize={9} tick={{ fill: '#9ca3af' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        iconType="circle"
                                        iconSize={8}
                                        formatter={(v) => <span className="text-xs text-gray-600">{v}</span>}
                                    />
                                    <Bar dataKey="present" name="Hadir" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={24} />
                                    <Bar dataKey="absent" name="Absen" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Radar Mata Pelajaran */}
                    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                            Rata-rata per Mapel
                        </h3>
                        <div className="h-44 sm:h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={subjectAverages}>
                                    <PolarGrid stroke="#f3f4f6" />
                                    <PolarAngleAxis
                                        dataKey="subject"
                                        fontSize={8}
                                        tick={{ fill: '#9ca3af' }}
                                    />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={8} tick={{ fill: '#c4b5fd' }} />
                                    <Radar
                                        name="Rata-rata"
                                        dataKey="average"
                                        stroke="#8B5CF6"
                                        fill="#8B5CF6"
                                        fillOpacity={0.35}
                                        strokeWidth={2}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center py-3 text-gray-300 text-[10px] border-t border-gray-100">
                    Dicetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} · English Course Management System
                </div>
            </div>
        </div>
    );
};

export default StudentStats;
