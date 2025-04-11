import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalyticsData } from '../context/AnalyticsContext';

interface ExtendedJsPDF extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export const generateAnalyticsPDF = async (data: AnalyticsData): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4') as ExtendedJsPDF;
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  pdf.setFontSize(20);
  pdf.setTextColor(106, 27, 154);
  pdf.text('Thesis Repository Analytics Report', pageWidth / 2, 15, { align: 'center' });
  
  const date = new Date();
  pdf.setFontSize(12);
  pdf.setTextColor(102, 102, 102);
  pdf.text(`Generated on ${date.toLocaleDateString()}`, pageWidth / 2, 22, { align: 'center' });
  
  // Summary statistics section
  pdf.setFontSize(16);
  pdf.setTextColor(106, 27, 154);
  pdf.text('Summary Statistics', 14, 35);
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Total Theses: ${data.thesisStats.total}`, 14, 45);
  pdf.text(`Active Theses: ${data.thesisStats.active}`, 14, 52);
  pdf.text(`Inactive Theses: ${data.thesisStats.inactive}`, 14, 59);
  
  pdf.text(`Total Users: ${data.userCount}`, 100, 45);
  
  // User role distribution
  let yPos = 52;
  data.userRoleStats.forEach(roleStat => {
    pdf.text(`${roleStat.role}: ${roleStat.count}`, 100, yPos);
    yPos += 7;
  });

  pdf.text('', 150, yPos);
  yPos += 150;
  
  // Category distribution section
  pdf.setFontSize(16);
  pdf.setTextColor(106, 27, 154);
  pdf.text('Thesis Distribution by Category', 14, 75);

  autoTable(pdf, {
    startY: 80,
    head: [['Category', 'Total Theses', 'Active', 'Inactive', 'Views', 'Bookmarks']],
    body: data.categoryMetrics.map(cat => [
      cat.category,
      cat.total,
      cat.active,
      cat.inactive,
      cat.views,
      cat.bookmarks
    ]),
    headStyles: { fillColor: [106, 27, 154], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    tableWidth: 'auto',
    margin: { top: 10, right: 14, bottom: 10, left: 14 },
    styles: { overflow: 'linebreak', cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 'auto' },
      5: { cellWidth: 'auto' }
    }
  });
  
  // Top thesis per category section (most viewed and bookmarked)
  const topThesesY = (pdf as any).lastAutoTable.finalY + 15;
  
  pdf.setFontSize(16);
  pdf.setTextColor(106, 27, 154);
  pdf.text('Top Thesis Per Category', 14, topThesesY);
  
  const topThesesData = [];
  
  for (const category of data.topCategories) {
    const categoryTheses = data.thesesByCategory[category]
      .filter(thesis => thesis.isActive);
    
    if (!categoryTheses || categoryTheses.length === 0) continue;
    
    const mostViewed = [...categoryTheses].sort((a, b) => b.view_count - a.view_count)[0];
    const mostBookmarked = [...categoryTheses].sort((a, b) => b.bookmark_count - a.bookmark_count)[0];
    
    topThesesData.push([
      category,
      mostViewed.title,
      mostViewed.view_count,
      mostBookmarked.title,
      mostBookmarked.bookmark_count
    ]);
  }
  
  autoTable(pdf, {
    startY: topThesesY + 5,
    head: [['Category', 'Most Viewed Thesis', 'Views', 'Most Bookmarked Thesis', 'Bookmarks']],
    body: topThesesData,
    headStyles: { fillColor: [46, 125, 50], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    tableWidth: 'auto',
    margin: { top: 10, right: 14, bottom: 10, left: 14 },
    styles: { overflow: 'linebreak', cellPadding: 5, fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 50 },
      2: { cellWidth: 20 },
      3: { cellWidth: 60 },
      4: { cellWidth: 20 }
    }
  });
  
  // Add a page break if needed
  if ((pdf as any).lastAutoTable.finalY > pdf.internal.pageSize.getHeight() - 40) {
    pdf.addPage();
  } else {
    pdf.addPage();
  }
  
  // Most viewed theses section
  pdf.setFontSize(16);
  pdf.setTextColor(106, 27, 154);
  pdf.text('Most Viewed Theses', 14, 15);
  
  autoTable(pdf, {
    startY: 20,
    head: [['Title', 'Category', 'Views']],
    body: data.mostViewedTheses
      .filter(thesis => thesis.isActive)
      .map(thesis => [
        thesis.title,
        thesis.category,
        thesis.view_count
      ]),
    headStyles: { fillColor: [46, 125, 50], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    tableWidth: 'auto',
    margin: { top: 10, right: 14, bottom: 10, left: 14 },
    styles: { overflow: 'linebreak', cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 50 },
      2: { cellWidth: 25 }
    }
  });
  
  // Most bookmarked theses section
  const bookmarksTableY = (pdf as any).lastAutoTable.finalY + 15;
  
  pdf.setFontSize(16);
  pdf.setTextColor(106, 27, 154);
  pdf.text('Most Bookmarked Theses', 14, bookmarksTableY);
  
  autoTable(pdf, {
    startY: bookmarksTableY + 5,
    head: [['Title', 'Category', 'Bookmarks']],
    body: data.mostBookmarkedTheses
      .filter(thesis => thesis.isActive)
      .map(thesis => [
        thesis.title,
        thesis.category,
        thesis.bookmark_count
      ]),
    headStyles: { fillColor: [156, 39, 176], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    tableWidth: 'auto',
    margin: { top: 10, right: 14, bottom: 10, left: 14 },
    styles: { overflow: 'linebreak', cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 50 },
      2: { cellWidth: 25 }
    }
  });
  
  const formattedDate = date.toISOString().split('T')[0];
  pdf.save(`thesis_analytics_report_${formattedDate}.pdf`);
};