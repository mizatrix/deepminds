import jsPDF from 'jspdf';
import type { Certificate } from '@/lib/actions/certificates';
import { getCertificateConfig, getTierDisplayName } from './certificate-config';

/**
 * Generate PDF certificate with category-specific design
 */
export function generateCertificatePDF(certificate: Certificate): void {
    const config = getCertificateConfig(certificate.category);
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
    });

    // Get RGB values from hex colors
    const primaryRGB = hexToRGB(config.colors.primary);
    const secondaryRGB = hexToRGB(config.colors.secondary);
    const accentRGB = hexToRGB(config.colors.accent);

    // Background
    doc.setFillColor(252, 252, 255);
    doc.rect(0, 0, 297, 210, 'F');

    // Decorative Header with category color
    doc.setFillColor(...primaryRGB);
    doc.rect(0, 0, 297, 45, 'F');

    // Add gradient effect (simulate with multiple rectangles)
    for (let i = 0; i < 10; i++) {
        const alpha = 1 - (i * 0.1);
        const adjustedColor = primaryRGB.map(c => Math.min(255, c + (255 - c) * (1 - alpha)));
        doc.setFillColor(...adjustedColor as [number, number, number]);
        doc.rect(0, 35 + i, 297, 1, 'F');
    }

    // Border with category accent color
    doc.setLineWidth(3);
    doc.setDrawColor(...accentRGB);
    doc.rect(12, 12, 273, 186);

    // Inner border
    doc.setLineWidth(1);
    doc.setDrawColor(...secondaryRGB);
    doc.rect(15, 15, 267, 180);

    // Certificate Title
    doc.setTextColor(255, 255, 255);
    doc.setFont(config.fonts.title, 'bold');
    doc.setFontSize(32);
    const tierTitle = getTierDisplayName(certificate.tier);
    doc.text(tierTitle.toUpperCase(), 148.5, 28, { align: 'center' });

    // Category Badge
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(certificate.category.toUpperCase(), 148.5, 38, { align: 'center' });

    // Main Content Area
    doc.setTextColor(...hexToRGB(config.colors.text));

    // "This certifies that"
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.text('This certificate is proudly presented to', 148.5, 75, { align: 'center' });

    // Student Name (Large and prominent)
    doc.setTextColor(...primaryRGB);
    doc.setFont(config.fonts.title, 'bolditalic');
    doc.setFontSize(42);
    doc.text(certificate.recipient, 148.5, 95, { align: 'center' });

    // Achievement Title
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text('For outstanding achievement in', 148.5, 115, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(certificate.title, 148.5, 128, { align: 'center' });

    // Points Badge (if honor or excellence)
    if (certificate.tier !== 'standard') {
        doc.setFillColor(...accentRGB);
        doc.roundedRect(130, 138, 37, 12, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${certificate.points} Points`, 148.5, 145, { align: 'center' });
    }

    // Distinction Banner for Excellence
    if (certificate.tier === 'excellence') {
        doc.setFillColor(...secondaryRGB);
        doc.rect(0, 155, 297, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('★ WITH DISTINCTION ★', 148.5, 160, { align: 'center' });
    }

    // Footer Information
    const footerY = certificate.tier === 'excellence' ? 173 : 165;
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    // Date
    const dateStr = new Date(certificate.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    doc.text(`Issued: ${dateStr}`, 30, footerY);

    // Issuer
    doc.text(`By: ${certificate.issuer}`, 30, footerY + 8);

    // Certificate Number
    doc.text(`Certificate No: ${certificate.certificateNo}`, 200, footerY, { align: 'right' });

    // QR Code Placeholder (will be replaced with actual QR if available)
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(1);
    doc.rect(250, footerY - 5, 25, 25);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Scan to', 262.5, footerY + 22, { align: 'center' });
    doc.text('Verify', 262.5, footerY + 26, { align: 'center' });

    // Watermark (semi-transparent)
    doc.setTextColor(230, 230, 230);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(60);
//     doc.saveGraphicsState();
//     doc.setGState(new doc.GState({ opacity: 0.1 }));
    doc.text('AUTHENTIC', 148.5, 115, {
        align: 'center',
        angle: -45
    });
//     doc.restoreGraphicsState();

    // Seal (decorative circle with category color)
    const sealX = 40;
    const sealY = footerY + 5;
    doc.setFillColor(...accentRGB);
    doc.circle(sealX, sealY, 12, 'F');
    doc.setFillColor(255, 255, 255);
    doc.circle(sealX, sealY, 10, 'F');
    doc.setFillColor(...primaryRGB);
    doc.circle(sealX, sealY, 8, 'F');

    // MSA in seal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('MSA', sealX, sealY + 2, { align: 'center' });

    // Save PDF
    doc.save(`${certificate.certificateNo}.pdf`);
}

/**
 * Convert hex color to RGB array
 */
function hexToRGB(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ]
        : [0, 0, 0];
}
