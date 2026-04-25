import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function generatePDF(allData) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Student Document Report", 40, 40);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 40, 56);
  doc.setTextColor(0);

  // Abbreviated column headers to fit landscape A4
  const docShortNames = {
    "Birth Certificate": "Birth\nCert.",
    "Aadhaar Card": "Aadhaar",
    "Previous School TC": "School\nTC",
    "Mark Sheet (Last Year)": "Mark\nSheet",
    "Caste Certificate": "Caste\nCert.",
    "Income Certificate": "Income\nCert.",
    "Medical Fitness Certificate": "Medical\nFitness",
    "Passport-size Photographs": "Photos",
    "Address Proof": "Address\nProof",
    "Parent/Guardian ID Proof": "Parent\nID",
    "Scholarship Form": "Scholar-\nship",
  };

  const head = [
    ["Student Name", ...DOCUMENTS.map((d) => docShortNames[d] || d), "Total"],
  ];

  const body = STUDENTS.map((student) => {
    const sData = allData[student] || {};
    const docCells = DOCUMENTS.map((d) => (sData[d] ? "YES" : ""));
    const total = DOCUMENTS.filter((d) => sData[d]).length;
    return [student, ...docCells, `${total}/${DOCUMENTS.length}`];
  });

  autoTable(doc, {
    head,
    body,
    startY: 68,

    styles: {
      fontSize: 10,
      cellPadding: 6,
      halign: "center",
      valign: "middle",
      lineWidth: 0.8, // 🔥 thick borders
      lineColor: [0, 0, 0], // 🔥 dark lines
    },

    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 10,
    },

    columnStyles: {
      0: {
        halign: "left",
        fontStyle: "bold",
        cellWidth: 100,
      },
    },

    bodyStyles: {
      textColor: 0,
    },

    didParseCell(data) {
      if (
        data.section === "body" &&
        data.column.index >= 1 &&
        data.column.index <= DOCUMENTS.length
      ) {
        const isFilled = data.cell.raw === "YES";

        // Set text
        data.cell.text = [isFilled ? "YES" : ""];

        // Font size
        data.cell.styles.fontSize = 11;

        if (isFilled) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [230, 255, 230]; // 👈 HERE
        }
      }
    },

    alternateRowStyles: {
      fillColor: [245, 245, 245], // light grey
    },

    margin: { left: 40, right: 40 },
  });

  doc.save("student_document_report.pdf");
}


export function exportJSON(allData) {
  try {
    const blob = new Blob([JSON.stringify(allData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "student_data_backup.json";
    a.click();

    URL.revokeObjectURL(url);
  } catch (err) {
    alert("Export failed");
  }
}


export function exportExcel(allData) {
  const rows = STUDENTS.map((student) => {
    const sData = allData[student] || {};

    let row = { Student: student };

    DOCUMENTS.forEach((doc) => {
      row[doc] = sData[doc] ? "✓" : "";
    });

    row["Total"] = DOCUMENTS.filter((d) => sData[d]).length;

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const file = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(file, "Student_Report.xlsx");
}