const PDFDocument = require('pdfkit');

class PdfService {
  generatePrescriptionPDF(prescription, res) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Prescription_${prescription._id.toString().substring(0, 8)}.pdf`
    );

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    doc.pipe(res);

    doc.fillColor('#0f172a')
       .font('Helvetica-Bold')
       .fontSize(26)
       .text('RxManager', 50, 50);

    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#64748b')
       .text('Official Digital Prescription Platform', 50, 80);

    doc.fontSize(40)
       .font('Times-BoldItalic')
       .fillColor('#3b82f6')
       .text('Rx', doc.page.width - 100, 45, { align: 'right' });

    doc.moveTo(50, 100)
       .lineTo(doc.page.width - 50, 100)
       .lineWidth(1)
       .strokeColor('#e2e8f0')
       .stroke();

    doc.y = 120;

    doc.font('Helvetica-Bold')
       .fontSize(12)
       .fillColor('#1e293b')
       .text('ISSUED BY:', 50, 120);

    doc.font('Helvetica-Bold')
       .fontSize(11)
       .fillColor('#0f172a')
       .text(prescription.doctor.name, 50, 140);

    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#475569')
       .text(`Email: ${prescription.doctor.email}`, 50, 155);

    doc.font('Helvetica-Bold')
       .fontSize(12)
       .fillColor('#1e293b')
       .text('PRESCRIBED TO:', 300, 120);

    doc.font('Helvetica-Bold')
       .fontSize(11)
       .fillColor('#0f172a')
       .text(prescription.patient.name, 300, 140);

    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#475569')
       .text(`Email: ${prescription.patient.email}`, 300, 155);

    doc.y = 190;
    doc.font('Helvetica-Bold')
       .fontSize(10)
       .fillColor('#475569')
       .text('Date of Issue: ', 50, 190, { continued: true })
       .font('Helvetica')
       .text(new Date(prescription.createdAt).toLocaleDateString());

    const expiry = prescription.expirationDate || new Date(new Date(prescription.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000);
    doc.font('Helvetica-Bold')
       .text('Date of Expiry: ', 300, 190, { continued: true })
       .font('Helvetica')
       .text(new Date(expiry).toLocaleDateString());

    // Section Divider
    doc.moveTo(50, 215)
       .lineTo(doc.page.width - 50, 215)
       .lineWidth(1)
       .strokeColor('#e2e8f0')
       .stroke();

    doc.y = 240;

    const medicinesCount = prescription.medicines ? prescription.medicines.length : 0;
    const cardHeight = Math.max(160, 50 + medicinesCount * 45);

    // Outer card styling for prescription details
    doc.rect(50, 240, doc.page.width - 100, cardHeight)
       .fillColor('#f8fafc')
       .fill()
       .rect(50, 240, doc.page.width - 100, cardHeight)
       .lineWidth(1)
       .strokeColor('#cbd5e1')
       .stroke();

    // Label & Medicines Title
    doc.fillColor('#0f172a');
    doc.font('Helvetica-Bold')
       .fontSize(11)
       .fillColor('#64748b')
       .text('PRESCRIBED MEDICINES & DOSAGE', 70, 260);

    let currentY = 285;
    if (prescription.medicines && prescription.medicines.length > 0) {
      prescription.medicines.forEach((med, idx) => {
        doc.font('Helvetica-Bold')
           .fontSize(13)
           .fillColor('#3b82f6')
           .text(`${idx + 1}. ${med.name}`, 70, currentY);

        doc.font('Helvetica')
           .fontSize(10)
           .fillColor('#334155')
           .text(`Dosage: ${med.dosage}  |  Frequency: ${med.frequency}  |  Duration: ${med.duration}`, 70, currentY + 16);

        currentY += 40;
      });
    } else {
      doc.font('Helvetica-Oblique')
         .fontSize(12)
         .fillColor('#64748b')
         .text('No medicines prescribed.', 70, 285);
    }

    // --- Signatures & Footers ---
    const signatureY = 240 + cardHeight + 40;
    doc.y = signatureY;
    doc.moveTo(300, signatureY + 30)
       .lineTo(doc.page.width - 50, signatureY + 30)
       .lineWidth(1)
       .strokeColor('#94a3b8')
       .stroke();

    doc.font('Times-BoldItalic')
       .fontSize(14)
       .fillColor('#10b981')
       .text(prescription.signature, 300, signatureY + 10, { align: 'center', width: doc.page.width - 350 });

    doc.font('Helvetica')
       .fontSize(9)
       .fillColor('#64748b')
       .text('Authorized Doctor Digital Signature', 300, signatureY + 38, { align: 'center', width: doc.page.width - 350 });

    // Footer info
    doc.fontSize(8)
       .fillColor('#94a3b8')
       .text(`Prescription Token: ${prescription._id.toString()}`, 50, doc.page.height - 70);

    doc.text('This is a secure, digital prescription issued via RxManager. Validation and compliance is maintained by state regulation guidelines.', 50, doc.page.height - 55, { width: doc.page.width - 100 });

    // End Document
    doc.end();
  }
}

module.exports = new PdfService();
