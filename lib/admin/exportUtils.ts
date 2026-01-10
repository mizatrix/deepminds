import { Submission } from '@/lib/submissions';
import jsPDF from 'jspdf';

/**
 * Export submissions to CSV format
 */
export function exportSubmissionsToCSV(submissions: Submission[], filename: string = 'submissions') {
    const headers = [
        'ID',
        'Student Name',
        'Student Email',
        'Title',
        'Category',
        'Organization',
        'Location',
        'Achievement Date',
        'Description',
        'Status',
        'Points',
        'Submitted At',
        'Reviewed By',
        'Admin Feedback'
    ];

    const csvContent = [
        headers.join(','),
        ...submissions.map(sub => [
            escapeCSV(sub.id),
            escapeCSV(sub.studentName),
            escapeCSV(sub.studentEmail),
            escapeCSV(sub.title),
            escapeCSV(sub.category),
            escapeCSV(sub.orgName),
            escapeCSV(sub.location),
            escapeCSV(sub.achievementDate),
            escapeCSV(sub.description),
            escapeCSV(sub.status),
            sub.points?.toString() || '',
            escapeCSV(sub.submittedAt),
            escapeCSV(sub.reviewedBy || ''),
            escapeCSV(sub.adminFeedback || '')
        ].join(','))
    ].join('\n');

    downloadFile(csvContent, `${filename}.csv`, 'text/csv');
}

/**
 * Export submissions to PDF format
 */
export function exportSubmissionsToPDF(submissions: Submission[], filename: string = 'submissions') {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(124, 58, 237); // Purple
    doc.text('CS Excellence Portal', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text('Submissions Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Summary stats
    const approved = submissions.filter(s => s.status === 'approved').length;
    const pending = submissions.filter(s => s.status === 'pending').length;
    const rejected = submissions.filter(s => s.status === 'rejected').length;
    const totalPoints = submissions.reduce((sum, s) => sum + (s.points || 0), 0);

    doc.setFontSize(11);
    doc.setTextColor(60);
    doc.text(`Total: ${submissions.length} | Approved: ${approved} | Pending: ${pending} | Rejected: ${rejected} | Points: ${totalPoints}`, margin, yPos);
    yPos += 15;

    // Line separator
    doc.setDrawColor(200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Submissions
    submissions.forEach((sub, index) => {
        // Check if we need a new page
        if (yPos > 260) {
            doc.addPage();
            yPos = 20;
        }

        // Submission card
        doc.setFillColor(248, 250, 252); // Light gray background
        doc.roundedRect(margin, yPos - 5, pageWidth - margin * 2, 40, 3, 3, 'F');

        doc.setFontSize(12);
        doc.setTextColor(30);
        doc.text(`${index + 1}. ${sub.title}`, margin + 5, yPos + 5);

        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Student: ${sub.studentName} (${sub.studentEmail})`, margin + 5, yPos + 12);
        doc.text(`Category: ${sub.category} | Organization: ${sub.orgName}`, margin + 5, yPos + 19);
        doc.text(`Date: ${sub.achievementDate} | Status: ${sub.status.toUpperCase()}${sub.points ? ` | Points: ${sub.points}` : ''}`, margin + 5, yPos + 26);

        // Status badge color
        const statusColor = sub.status === 'approved' ? [16, 185, 129] : // Green
            sub.status === 'rejected' ? [239, 68, 68] : // Red
                [245, 158, 11]; // Amber

        doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
        doc.circle(pageWidth - margin - 10, yPos + 15, 4, 'F');

        yPos += 50;
    });

    doc.save(`${filename}.pdf`);
}

/**
 * Escape value for CSV format
 */
function escapeCSV(value: string): string {
    if (!value) return '';
    // Escape quotes and wrap in quotes if contains comma, newline, or quotes
    const escaped = value.replace(/"/g, '""');
    if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
        return `"${escaped}"`;
    }
    return escaped;
}

/**
 * Trigger file download in browser
 */
function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
