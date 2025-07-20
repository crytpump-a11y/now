import jsPDF from 'jspdf';
import { Medicine, MedicineTaken } from '../types';

export class ReportService {
  static async generateMedicineReport(
    medicines: Medicine[],
    medicineTaken: MedicineTaken[],
    profileName: string = 'Kullanıcı'
  ): Promise<void> {
    const pdf = new jsPDF();
    
    // Türkçe karakter desteği için font ayarları
    pdf.setFont('helvetica');
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Modern Header with Background
    pdf.setFillColor(59, 130, 246); // Blue background
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    pdf.setTextColor(255, 255, 255); // White text
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ILAC KULLANIM RAPORU', pageWidth / 2, 25, { align: 'center' });
    
    yPosition = 50;
    pdf.setTextColor(0, 0, 0); // Reset to black

    // Profile Info Box
    pdf.setFillColor(248, 250, 252); // Light gray background
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 25, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 25, 'S');

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Profil: ${profileName}`, margin + 5, yPosition + 10);
    pdf.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, margin + 5, yPosition + 20);
    yPosition += 35;

    // Statistics Box
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTaken = (medicineTaken || [])
      .filter(t => new Date(t.takenAt) >= thirtyDaysAgo);
    const totalTaken = recentTaken.filter(t => t.status === 'taken').length;
    const totalMissed = recentTaken.filter(t => t.status === 'missed').length;
    const totalScheduled = totalTaken + totalMissed;
    const adherenceRate = totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 0;

    pdf.setFillColor(34, 197, 94); // Green background
    pdf.rect(margin, yPosition, (pageWidth - 3 * margin) / 2, 30, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('UYUM ORANI', margin + 10, yPosition + 15);
    pdf.setFontSize(20);
    pdf.text(`%${adherenceRate}`, margin + 10, yPosition + 25);

    pdf.setFillColor(239, 68, 68); // Red background
    pdf.rect(margin + (pageWidth - 3 * margin) / 2 + 10, yPosition, (pageWidth - 3 * margin) / 2, 30, 'F');
    pdf.setFontSize(14);
    pdf.text('KACIRILDI', margin + (pageWidth - 3 * margin) / 2 + 20, yPosition + 15);
    pdf.setFontSize(20);
    pdf.text(`${totalMissed}`, margin + (pageWidth - 3 * margin) / 2 + 20, yPosition + 25);
    
    yPosition += 45;
    pdf.setTextColor(0, 0, 0); // Reset to black

    // Active Medicines Section with modern styling
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(59, 130, 246);
    pdf.text('AKTIF ILACLAR', margin, yPosition);
    pdf.setTextColor(0, 0, 0);
    yPosition += 15;

    const activeMedicines = medicines.filter(m => m.isActive);
    
    if (activeMedicines.length === 0) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Aktif ilac bulunmamaktadir.', margin, yPosition);
      yPosition += 10;
    } else {
      activeMedicines.forEach((medicine, index) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }

        // Medicine card background
        pdf.setFillColor(249, 250, 251);
        pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 25, 'F');
        pdf.setDrawColor(229, 231, 235);
        pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 25, 'S');
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(17, 24, 39);
        pdf.text(`${index + 1}. ${medicine.name}`, margin + 5, yPosition + 3);
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(75, 85, 99);
        pdf.text(`Doz: ${medicine.dosage} | Saat: ${medicine.times.join(', ')} | Baslangic: ${new Date(medicine.startDate).toLocaleDateString('tr-TR')}`, margin + 5, yPosition + 12);
        
        if (medicine.endDate) {
          pdf.text(`Bitis: ${new Date(medicine.endDate).toLocaleDateString('tr-TR')}`, margin + 5, yPosition + 18);
        }
        
        yPosition += 30;
        pdf.setTextColor(0, 0, 0);
      });
    }

    // Usage History Section with modern styling
    yPosition += 10;
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(59, 130, 246);
    pdf.text('SON 30 GUN KULLANIM GECMISI', margin, yPosition);
    pdf.setTextColor(0, 0, 0);
    yPosition += 15;

    const limitedTaken = recentTaken
      .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime())
      .slice(0, 20); // Limit to 20 entries

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    if (limitedTaken.length === 0) {
      pdf.text('Son 30 gunde ilac kullanim kaydi bulunmamaktadir.', margin, yPosition);
    } else {
      limitedTaken.forEach((taken, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = margin;
        }

        const medicine = (medicines || []).find(m => m.id === taken.medicineId);
        const medicineName = medicine ? medicine.name : 'Bilinmeyen Ilac';
        const date = new Date(taken.takenAt).toLocaleDateString('tr-TR');
        const time = taken.scheduledTime;
        const status = taken.status === 'taken' ? 'Alindi' : 'Kacirildi';
        
        // Alternate row colors
        if (index % 2 === 0) {
          pdf.setFillColor(249, 250, 251);
          pdf.rect(margin, yPosition - 2, pageWidth - 2 * margin, 8, 'F');
        }

        pdf.text(`${date} ${time} - ${medicineName} - ${status}`, margin + 2, yPosition + 3);
        yPosition += 6;
      });
    }

    // Final Statistics Section
    yPosition += 15;
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFillColor(59, 130, 246);
    pdf.rect(0, yPosition - 10, pageWidth, 50, 'F');
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('ISTATISTIKLER', margin, yPosition);
    yPosition += 15;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Toplam Programlanan: ${totalScheduled}`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Alindi: ${totalTaken}`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Kacirildi: ${totalMissed}`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Uyum Orani: %${adherenceRate}`, margin, yPosition);

    // Save PDF
    const fileName = `ilac-raporu-${profileName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  }
}