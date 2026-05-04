import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { DOCUMENTS } from "../constants/documents";
import { STUDENTS } from "../constants/students";

export function generatePDF(allData) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Student Document Report", 40, 40);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  // doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 40, 56);
  doc.setTextColor(0);

  // Abbreviated column headers to fit landscape A4
  const docShortNames = {
    "Aadhaar Card Student": "Aadhaar (S)",
    "Aadhaar Card Mom": "Aadhaar (M)",
    "Aadhaar Card Dad": "Aadhaar (F)",
    "Bank Account": "Bank",
    "Caste Certificate": "Caste Cert",
    "Date Of Birth Certificate": "DOB (Old)",
    "DOB new": "DOB (New)",
    "Residence Certificate": "Residence",
    "Income Certificate": "Income",
    "Detail Mark Sheet (Last Year)": "DMC",
    "School Leaving Certificate": "SLC",
    "Transfer Certificate": "TC",
    Fees: "Fees",
    "Passport Size Photo": "Photo",
    "Quali Mom": "Mother Edu",
    "Quali Dad": "Father Edu",
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
      fontSize: 8, // 👈 was 10 → reduce slightly
      cellPadding: 3, // 👈 tighter spacing
      halign: "center",
      valign: "middle",
      lineWidth: 0.6,
      lineColor: [0, 0, 0],
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
        cellWidth: 75,
        overflow: "linebreak",
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
  const className = "9th";
  const year = new Date().getFullYear();
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleString("en-IN", { month: "short" });

  const fileName = `9th 26 Documents`;
  console.log("Generated file name:", fileName);
  // saveAs(file, fileName);

  doc.save(`${fileName}.pdf`);
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
  const className = "9th";
  const year = new Date().getFullYear();
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleString("en-IN", { month: "short" });

  const fileName = `${className}_${year}_${month}_${day}_Documents.xlsx`;
  console.log("Generated file name:", fileName);
  saveAs(file, fileName);
}
