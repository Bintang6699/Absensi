const PDFDocument = require('pdfkit');

const buildPDF = (dataCallback, endCallback) => {
    const doc = new PDFDocument();

    doc.on('data', dataCallback);
    doc.on('end', endCallback);

    doc.fontSize(25).text('Here is some vector graphics...', 100, 100);

    doc.end();
};

const generateAttendancePDF = (doc, data) => {
    // Colors
    const primaryColor = '#4338ca'; // Indigo
    const secondaryColor = '#6b7280'; // Gray
    const activeColor = '#10B981'; // Green for Active

    // --- Header ---
    doc.fillColor(primaryColor).fontSize(20).text('ENGLISH COURSE', { align: 'center', characterSpacing: 1 });
    doc.fillColor(secondaryColor).fontSize(10).text('Laporan Kehadiran Harian', { align: 'center' });
    doc.moveDown(1);

    // --- Meta Info ---
    doc.fillColor('black').fontSize(11);
    const dateFormatted = new Date(data.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    doc.text(`Kelas: ${data.classLevel}`, 50, 130);
    doc.text(`Tanggal: ${dateFormatted}`, 50, 145);

    // --- Table Configuration ---
    const tableTop = 180;
    const colX = { name: 50, statusActive: 250, attendance: 350, notes: 450 };
    const rowHeight = 30;

    // --- Table Header ---
    // Background for header
    doc.rect(40, tableTop - 5, 520, 25).fill('#f3f4f6');

    doc.font('Helvetica-Bold').fontSize(10).fillColor('black');
    doc.text('NAMA SISWA', colX.name, tableTop + 5);
    doc.text('STATUS SISWA', colX.statusActive, tableTop + 5);
    doc.text('KEHADIRAN', colX.attendance, tableTop + 5);
    doc.text('KET.', colX.notes, tableTop + 5);

    doc.moveTo(40, tableTop + 20).lineTo(560, tableTop + 20).strokeColor('#e5e7eb').stroke();

    // --- Table Content ---
    doc.font('Helvetica').fontSize(10);
    let y = tableTop + 30;

    data.attendance.forEach((record, i) => {
        // Alternating Row Background
        if (i % 2 === 1) {
            doc.rect(40, y - 5, 520, rowHeight).fill('#f9fafb');
        }

        // 1. Name (Black)
        doc.fillColor('black').text(record.student.name, colX.name, y + 5);

        // 2. statusActive (Green - Always Active)
        doc.fillColor(activeColor).text('Aktif', colX.statusActive, y + 5);

        // 3. Attendance Status (Color Coded)  
        let statusColor = 'black';
        let statusText = record.status || '-';

        if (statusText === 'Present') {
            statusColor = '#10B981'; // Green
            statusText = 'Hadir';
        } else if (statusText === 'Absent') {
            statusColor = '#EF4444'; // Red
            statusText = 'Tidak Hadir';
        } else if (statusText === 'Excused') {
            statusColor = '#3B82F6'; // Blue
            statusText = 'Izin';
        } else if (statusText === 'Late') {
            statusColor = '#F59E0B'; // Yellow/Orange
            statusText = 'Terlambat';
        }

        doc.fillColor(statusColor).font('Helvetica-Bold').text(statusText, colX.attendance, y + 5);

        // 4. Notes (Black, Regular Font)
        doc.font('Helvetica').fillColor('gray').text(record.notes || '-', colX.notes, y + 5);

        // Row Line
        doc.moveTo(40, y + 25).lineTo(560, y + 25).strokeColor('#e5e7eb').stroke();

        y += rowHeight;

        // Page Break Logic
        if (y > 700) {
            doc.addPage();
            y = 50;
            // Re-draw header on new page if needed (omitted for simplicity here)
        }
    });

    // --- Footer ---
    const pageBottom = 750;
    doc.fontSize(8).fillColor('gray');
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 50, pageBottom);
    doc.text('Sistem Manajemen Absensi', 400, pageBottom, { align: 'right' });
}

module.exports = { buildPDF, generateAttendancePDF };
