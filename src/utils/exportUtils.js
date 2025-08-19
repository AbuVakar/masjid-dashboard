/**
 * Export Utilities
 * Provides Excel and PDF export functionality for houses and members data
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { logError, ERROR_SEVERITY } from './errorHandler';

/**
 * Export houses data to Excel
 * @param {Array} houses - Houses data to export
 * @param {string} filename - Optional filename
 */
export const exportToExcel = (houses, filename = 'houses-data') => {
  try {
    // Validate input
    if (!Array.isArray(houses)) {
      throw new Error('Houses data must be an array');
    }

    if (houses.length === 0) {
      throw new Error('No houses data to export');
    }

    // Prepare data for export
    const exportData = [];

    houses.forEach((house) => {
      // Add house information
      const houseRow = {
        'House Number': house.number,
        Street: house.street,
        Taleem: house.taleem ? 'Yes' : 'No',
        Mashwara: house.mashwara ? 'Yes' : 'No',
        Notes: house.notes || '',
        'Total Members': house.members?.length || 0,
        Adults: house.members?.filter((m) => m.age >= 14).length || 0,
        Children: house.members?.filter((m) => m.age < 14).length || 0,
      };
      exportData.push(houseRow);

      // Add member information
      if (house.members && house.members.length > 0) {
        house.members.forEach((member) => {
          const memberRow = {
            'House Number': house.number,
            Street: house.street,
            'Member Name': member.name,
            "Father's Name": member.fatherName || '',
            Age: member.age,
            Gender: member.gender,
            Occupation: member.occupation,
            Education: member.education,
            Quran: member.quran,
            Maktab: member.maktab,
            Dawat: member.dawat,
            Mobile: member.mobile || '',
            Role: member.role,
          };
          exportData.push(memberRow);
        });
      }
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Auto-size columns
    const columnWidths = [
      { wch: 12 }, // House Number
      { wch: 20 }, // Street
      { wch: 25 }, // Member Name
      { wch: 20 }, // Father's Name
      { wch: 8 }, // Age
      { wch: 10 }, // Gender
      { wch: 15 }, // Occupation
      { wch: 15 }, // Education
      { wch: 8 }, // Quran
      { wch: 10 }, // Maktab
      { wch: 12 }, // Dawat
      { wch: 15 }, // Mobile
      { wch: 10 }, // Role
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Houses Data');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const finalFilename = `${filename}-${timestamp}.xlsx`;

    // Save file
    XLSX.writeFile(workbook, finalFilename);

    return true;
  } catch (error) {
    logError(error, 'Export Excel', ERROR_SEVERITY.MEDIUM);
    throw new Error(`Failed to export Excel file: ${error.message}`);
  }
};

/**
 * Export houses data to PDF
 * @param {Array} houses - Houses data to export
 * @param {string} filename - Optional filename
 */
export const exportToPDF = (houses, filename = 'houses-data') => {
  try {
    // Validate input
    if (!Array.isArray(houses)) {
      throw new Error('Houses data must be an array');
    }

    if (houses.length === 0) {
      throw new Error('No houses data to export');
    }

    console.log('Exporting PDF with houses:', houses.length);
    console.log('jsPDF available:', typeof jsPDF);
    console.log('Sample house data:', houses[0]);

    // Check if jsPDF is available
    if (typeof jsPDF !== 'function') {
      throw new Error('jsPDF library is not available');
    }

    // Create a simple PDF
    const doc = new jsPDF();
    console.log('PDF document created successfully');

    // Add simple content
    doc.setFontSize(20);
    doc.text('Silsila-ul-Ahwaal - Houses Report', 14, 22);
    console.log('Title added to PDF');

    doc.setFontSize(12);
    doc.text(`Total Houses: ${houses.length}`, 14, 40);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 50);

    // Add house information
    let y = 70;
    houses.forEach((house, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(14);
      doc.text(`House ${house.number} - ${house.street}`, 14, y);
      y += 10;

      doc.setFontSize(10);
      doc.text(`Members: ${house.members?.length || 0}`, 14, y);
      y += 8;

      if (house.notes) {
        doc.text(`Notes: ${house.notes}`, 14, y);
        y += 8;
      }

      y += 10; // Add space between houses
    });

    // Generate filename with timestamp
    const timestampStr = new Date().toISOString().split('T')[0];
    const finalFilename = `${filename}-${timestampStr}.pdf`;

    console.log('Saving PDF as:', finalFilename);

    // Save file
    try {
      doc.save(finalFilename);
      console.log('PDF saved successfully');
    } catch (saveError) {
      console.error('Error saving PDF:', saveError);
      throw saveError;
    }

    return true;
  } catch (error) {
    console.error('PDF Export Error:', error);
    logError(error, 'Export PDF', ERROR_SEVERITY.MEDIUM);
    throw new Error(`Failed to export PDF file: ${error.message}`);
  }
};
