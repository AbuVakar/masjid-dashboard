/* eslint-disable no-restricted-globals */

// In a real-world CRA setup, you might need a library like `craco` to configure workers properly.
// For this environment, we'll use importScripts to load dependencies from a CDN.
try {
  self.importScripts(
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js',
  );
} catch (e) {
  console.error('Failed to load worker scripts:', e);
  // Post an error back to the main thread if scripts fail to load
  self.postMessage({ error: 'WORKER_SCRIPT_LOAD_FAILED' });
}

const generateExcel = (houses) => {
  if (!self.XLSX) throw new Error('XLSX library not loaded');

  const exportData = [];
  houses.forEach((house) => {
    exportData.push({
      Type: 'House',
      'House Number': house.number,
      Street: house.street,
      'Data Point': 'Taleem',
      Value: house.taleem ? 'Yes' : 'No',
    });
    exportData.push({ 'House Number': house.number, Street: house.street, 'Data Point': 'Mashwara', Value: house.mashwara ? 'Yes' : 'No' });
    exportData.push({ 'House Number': house.number, Street: house.street, 'Data Point': 'Notes', Value: house.notes || '' });

    if (house.members && house.members.length > 0) {
      house.members.forEach((member) => {
        exportData.push({
          Type: 'Member',
          'House Number': house.number,
          Street: house.street,
          'Data Point': 'Name',
          Value: member.name,
          Age: member.age,
          Gender: member.gender,
          Occupation: member.occupation,
          Education: member.education,
          Mobile: member.mobile || '',
        });
      });
    }
  });

  const worksheet = self.XLSX.utils.json_to_sheet(exportData);
  const workbook = self.XLSX.utils.book_new();
  self.XLSX.utils.book_append_sheet(workbook, worksheet, 'Houses Data');

  const excelBuffer = self.XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

const generatePdf = (houses) => {
    if (!self.jspdf) throw new Error('jsPDF library not loaded');
    const { jsPDF } = self.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Silsila-ul-Ahwaal - Houses Report', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const head = [['House', 'Street', 'Member Name', 'Age', 'Gender', 'Occupation', 'Education', 'Mobile']];
    const body = [];

    houses.forEach(house => {
        if (house.members && house.members.length > 0) {
            house.members.forEach(member => {
                body.push([
                    house.number,
                    house.street,
                    member.name,
                    member.age,
                    member.gender,
                    member.occupation,
                    member.education,
                    member.mobile || 'N/A',
                ]);
            });
        } else {
            body.push([house.number, house.street, '(No members listed)', '', '', '', '', '']);
        }
    });

    doc.autoTable({
        startY: 35,
        head: head,
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [22, 160, 133] },
    });

    return doc.output('blob');
};


self.onmessage = (event) => {
  const { houses, format } = event.data;

  if (!format || !houses) {
    self.postMessage({ error: 'Invalid data received by worker.' });
    return;
  }

  try {
    if (format === 'excel') {
      const fileBlob = generateExcel(houses);
      self.postMessage({ success: true, format: 'excel', blob: fileBlob });
    } else if (format === 'pdf') {
      const fileBlob = generatePdf(houses);
      self.postMessage({ success: true, format: 'pdf', blob: fileBlob });
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    self.postMessage({ error: `Failed to generate ${format} file: ${error.message}` });
  }
};
