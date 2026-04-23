import { useState, useEffect, useCallback } from "react";
import { STUDENTS } from "./constants/students.js";
import { DOCUMENTS } from "./constants/documents.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const STORAGE_KEY = "student_doc_tracker_v1";

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

function formatTime(date) {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function generatePDF(allData) {
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
    const docCells = DOCUMENTS.map((d) => (sData[d] ? "\u2713" : "\u2717"));
    const total = DOCUMENTS.filter((d) => sData[d]).length;
    return [student, ...docCells, `${total}/${DOCUMENTS.length}`];
  });

  autoTable(doc, {
    head,
    body,
    startY: 68,
    styles: {
      fontSize: 7.5,
      cellPadding: 4,
      halign: "center",
      valign: "middle",
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 7,
      halign: "center",
    },
    columnStyles: {
      0: { halign: "left", fontStyle: "bold", cellWidth: 90 },
      [DOCUMENTS.length + 1]: { fontStyle: "bold", cellWidth: 36 },
    },
    didParseCell(data) {
      if (
        data.section === "body" &&
        data.column.index >= 1 &&
        data.column.index <= DOCUMENTS.length
      ) {
        if (data.cell.raw === "\u2713") {
          data.cell.styles.textColor = [22, 101, 52];
          data.cell.styles.fillColor = [240, 253, 244];
        } else if (data.cell.raw === "\u2717") {
          data.cell.styles.textColor = [185, 28, 28];
          data.cell.styles.fillColor = [255, 245, 245];
        }
      }
      if (
        data.section === "body" &&
        data.column.index === DOCUMENTS.length + 1
      ) {
        const parts = (data.cell.raw || "").split("/").map(Number);
        if (parts[0] === parts[1]) {
          data.cell.styles.textColor = [22, 101, 52];
          data.cell.styles.fillColor = [220, 252, 231];
        } else {
          data.cell.styles.textColor = [133, 77, 14];
          data.cell.styles.fillColor = [254, 249, 195];
        }
      }
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 40, right: 40 },
  });

  doc.save("student_document_report.pdf");
}

export default function App() {
  const [allData, setAllData] = useState(loadData);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [savedMsg, setSavedMsg] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [view, setView] = useState("tracker"); // "tracker" | "summary"
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const student = STUDENTS[currentIdx];
  const studentDocs = allData[student] || {};

  const submittedDocs = DOCUMENTS.filter((d) => studentDocs[d]);
  const missingDocs = DOCUMENTS.filter((d) => !studentDocs[d]);

  const triggerSaved = useCallback(() => {
    const now = new Date();
    setLastUpdated(now);
    setSavedMsg("Saved ✓");
    setTimeout(() => setSavedMsg(null), 2500);
  }, []);

  const toggleDoc = useCallback(
    (doc) => {
      setAllData((prev) => {
        const updated = {
          ...prev,
          [student]: {
            ...(prev[student] || {}),
            [doc]: !prev[student]?.[doc],
          },
        };
        saveData(updated);
        return updated;
      });
      triggerSaved();
    },
    [student, triggerSaved],
  );

  const handleSaveButton = () => {
    setSavedMsg("All changes already saved ✓");
    setTimeout(() => setSavedMsg(null), 2500);
  };

  const goTo = (idx) => {
    setCurrentIdx(idx);
    setDropdownOpen(false);
    setSavedMsg(null);
    setLastUpdated(null);
  };

  const completionPct = Math.round(
    (submittedDocs.length / DOCUMENTS.length) * 100,
  );

  return (
    <div style={styles.root}>
      {/* ── STICKY HEADER ── */}
      <header style={styles.header}>
        <div style={styles.headerTop}>
          <div style={styles.headerLeft}>
            <span style={styles.schoolLabel}>📋 DocTrack</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={styles.pdfBtn} onClick={() => generatePDF(allData)}>
              ⬇ PDF
            </button>
            <button
              style={
                view === "summary"
                  ? { ...styles.tabBtn, ...styles.tabBtnActive }
                  : styles.tabBtn
              }
              onClick={() =>
                setView((v) => (v === "summary" ? "tracker" : "summary"))
              }
            >
              {view === "summary" ? "← Back" : "Summary"}
            </button>
          </div>
        </div>

        {view === "tracker" && (
          <>
            {/* Student selector */}
            <div style={styles.studentRow}>
              <button
                style={styles.navBtn}
                onClick={() =>
                  goTo((currentIdx - 1 + STUDENTS.length) % STUDENTS.length)
                }
              >
                ‹
              </button>
              <div
                style={styles.studentNameWrap}
                onClick={() => setDropdownOpen((o) => !o)}
              >
                <span style={styles.studentIdx}>
                  {currentIdx + 1} / {STUDENTS.length}
                </span>
                <span style={styles.studentName}>{student}</span>
                <span style={styles.dropArrow}>{dropdownOpen ? "▲" : "▼"}</span>
              </div>
              <button
                style={styles.navBtn}
                onClick={() => goTo((currentIdx + 1) % STUDENTS.length)}
              >
                ›
              </button>
            </div>

            {/* Progress bar */}
            <div style={styles.progressWrap}>
              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${completionPct}%`,
                    background: completionPct === 100 ? "#22c55e" : "#f59e0b",
                  }}
                />
              </div>
              <span style={styles.progressLabel}>
                {submittedDocs.length}/{DOCUMENTS.length} submitted
              </span>
            </div>

            {/* Dropdown */}
            {dropdownOpen && (
              <div style={styles.dropdown}>
                {STUDENTS.map((s, i) => {
                  const sData = allData[s] || {};
                  const missing = DOCUMENTS.filter((d) => !sData[d]).length;
                  return (
                    <div
                      key={s}
                      style={{
                        ...styles.dropItem,
                        ...(i === currentIdx ? styles.dropItemActive : {}),
                      }}
                      onClick={() => goTo(i)}
                    >
                      <span style={styles.dropName}>{s}</span>
                      <span
                        style={{
                          ...styles.dropBadge,
                          background: missing === 0 ? "#dcfce7" : "#fef9c3",
                          color: missing === 0 ? "#166534" : "#854d0e",
                        }}
                      >
                        {missing === 0 ? "✓ Complete" : `${missing} missing`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {view === "summary" && (
          <div style={styles.summaryTitle}>Class Overview</div>
        )}
      </header>

      {/* ── MAIN CONTENT ── */}
      <main style={styles.main}>
        {view === "tracker" ? (
          <>
            {/* Documents list */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Documents</h2>
              {DOCUMENTS.map((doc) => {
                const checked = !!studentDocs[doc];
                return (
                  <label
                    key={doc}
                    style={{
                      ...styles.docRow,
                      ...(checked ? styles.docRowChecked : {}),
                    }}
                  >
                    <div
                      style={{
                        ...styles.checkbox,
                        ...(checked ? styles.checkboxChecked : {}),
                      }}
                    >
                      {checked && <span style={styles.checkmark}>✓</span>}
                    </div>
                    <span
                      style={{
                        ...styles.docLabel,
                        ...(checked ? styles.docLabelChecked : {}),
                      }}
                    >
                      {doc}
                    </span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDoc(doc)}
                      style={{ display: "none" }}
                    />
                  </label>
                );
              })}
            </section>

            {/* Missing documents */}
            {missingDocs.length > 0 && (
              <section style={styles.section}>
                <h2 style={{ ...styles.sectionTitle, color: "#dc2626" }}>
                  ⚠ Missing ({missingDocs.length})
                </h2>
                {missingDocs.map((doc) => (
                  <div key={doc} style={styles.missingRow}>
                    <span style={styles.missingDot} />
                    <span style={styles.missingLabel}>{doc}</span>
                  </div>
                ))}
              </section>
            )}

            {missingDocs.length === 0 && (
              <div style={styles.allDoneCard}>
                <span style={styles.allDoneIcon}>🎉</span>
                <span style={styles.allDoneText}>All documents submitted!</span>
              </div>
            )}
          </>
        ) : (
          <SummaryView
            allData={allData}
            goTo={(i) => {
              goTo(i);
              setView("tracker");
            }}
            currentIdx={currentIdx}
            generatePDF={() => generatePDF(allData)}
          />
        )}
      </main>

      {/* ── STICKY FOOTER ── */}
      {view === "tracker" && (
        <footer style={styles.footer}>
          <div style={styles.footerSave}>
            {savedMsg ? (
              <span style={styles.savedMsg}>{savedMsg}</span>
            ) : lastUpdated ? (
              <span style={styles.lastUpdated}>
                Last updated: {formatTime(lastUpdated)}
              </span>
            ) : (
              <span style={styles.lastUpdated}>Auto-saves on every change</span>
            )}
            <button style={styles.saveBtn} onClick={handleSaveButton}>
              Save
            </button>
          </div>
          <div style={styles.footerNav}>
            <button
              style={styles.footerNavBtn}
              onClick={() =>
                goTo((currentIdx - 1 + STUDENTS.length) % STUDENTS.length)
              }
            >
              ← Previous
            </button>
            <span style={styles.footerStudentCount}>
              {currentIdx + 1} of {STUDENTS.length}
            </span>
            <button
              style={styles.footerNavBtn}
              onClick={() => goTo((currentIdx + 1) % STUDENTS.length)}
            >
              Next →
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}

function SummaryView({ allData, goTo, currentIdx, generatePDF }) {
  const sorted = STUDENTS.map((s, i) => {
    const sData = allData[s] || {};
    const missing = DOCUMENTS.filter((d) => !sData[d]).length;
    return { name: s, idx: i, missing };
  }).sort((a, b) => b.missing - a.missing);

  const complete = sorted.filter((s) => s.missing === 0).length;
  const pending = sorted.filter((s) => s.missing > 0).length;

  return (
    <div>
      {/* Stats bar */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <span style={styles.statNum}>{STUDENTS.length}</span>
          <span style={styles.statLabel}>Total</span>
        </div>
        <div style={{ ...styles.statCard, background: "#dcfce7" }}>
          <span style={{ ...styles.statNum, color: "#166534" }}>
            {complete}
          </span>
          <span style={{ ...styles.statLabel, color: "#166534" }}>
            Complete
          </span>
        </div>
        <div style={{ ...styles.statCard, background: "#fef9c3" }}>
          <span style={{ ...styles.statNum, color: "#854d0e" }}>{pending}</span>
          <span style={{ ...styles.statLabel, color: "#854d0e" }}>Pending</span>
        </div>
      </div>

      {/* Student list */}
      <section style={styles.section}>
        {sorted.map(({ name, idx, missing }) => (
          <div
            key={name}
            style={{
              ...styles.summaryRow,
              ...(missing === 0
                ? styles.summaryRowDone
                : styles.summaryRowPending),
            }}
            onClick={() => goTo(idx)}
          >
            <div style={styles.summaryRowLeft}>
              <span style={styles.summaryName}>{name}</span>
              <span style={styles.summarySubtext}>
                {DOCUMENTS.length - missing} / {DOCUMENTS.length} submitted
              </span>
            </div>
            <div style={styles.summaryRight}>
              {missing === 0 ? (
                <span style={styles.badgeComplete}>✓ Done</span>
              ) : (
                <span style={styles.badgeMissing}>{missing} missing</span>
              )}
              <span style={styles.summaryArrow}>›</span>
            </div>
          </div>
        ))}
      </section>

      {/* Download PDF */}
      <div style={{ padding: "16px 16px 8px" }}>
        <button style={styles.downloadPdfBtn} onClick={generatePDF}>
          ⬇ Download Full Report as PDF
        </button>
      </div>
    </div>
  );
}

const styles = {
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#f8fafc",
    minHeight: "100vh",
    maxWidth: 480,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "#1e293b",
    color: "#fff",
    padding: "12px 16px 0",
    boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 8 },
  schoolLabel: { fontSize: 17, fontWeight: 700, letterSpacing: 0.3 },
  tabBtn: {
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  pdfBtn: {
    background: "#0f766e",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  tabBtnActive: { background: "#3b82f6", borderColor: "#3b82f6" },
  studentRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  navBtn: {
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    width: 38,
    height: 38,
    fontSize: 22,
    cursor: "pointer",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  studentNameWrap: {
    flex: 1,
    background: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: "8px 12px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  studentIdx: { fontSize: 11, color: "#94a3b8", fontWeight: 500 },
  studentName: { fontSize: 17, fontWeight: 700, color: "#fff" },
  dropArrow: { fontSize: 10, color: "#94a3b8", alignSelf: "flex-end" },
  progressWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    paddingBottom: 12,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    background: "rgba(255,255,255,0.15)",
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
    transition: "width 0.4s ease",
  },
  progressLabel: {
    fontSize: 12,
    color: "#cbd5e1",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "#1e293b",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    maxHeight: 320,
    overflowY: "auto",
    zIndex: 200,
    boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
  },
  dropItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    cursor: "pointer",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  dropItemActive: { background: "rgba(59,130,246,0.2)" },
  dropName: { color: "#e2e8f0", fontSize: 15, fontWeight: 500 },
  dropBadge: {
    fontSize: 12,
    fontWeight: 600,
    padding: "3px 8px",
    borderRadius: 99,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 700,
    paddingBottom: 12,
    color: "#fff",
  },
  main: {
    flex: 1,
    overflowY: "auto",
    paddingBottom: 120,
  },
  section: {
    padding: "16px 16px 0",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  docRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "#fff",
    borderRadius: 12,
    padding: "14px 16px",
    marginBottom: 8,
    cursor: "pointer",
    border: "2px solid transparent",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    transition: "all 0.18s ease",
  },
  docRowChecked: {
    border: "2px solid #86efac",
    background: "#f0fdf4",
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    border: "2px solid #cbd5e1",
    background: "#fff",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.18s ease",
  },
  checkboxChecked: {
    background: "#22c55e",
    borderColor: "#22c55e",
  },
  checkmark: {
    color: "#fff",
    fontSize: 16,
    fontWeight: 800,
    lineHeight: 1,
  },
  docLabel: {
    fontSize: 15,
    fontWeight: 500,
    color: "#334155",
    flex: 1,
  },
  docLabelChecked: {
    color: "#166534",
    textDecoration: "line-through",
    textDecorationColor: "#86efac",
  },
  missingRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    background: "#fff5f5",
    borderRadius: 10,
    marginBottom: 8,
    border: "1px solid #fecaca",
  },
  missingDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#ef4444",
    flexShrink: 0,
  },
  missingLabel: { fontSize: 14, color: "#dc2626", fontWeight: 500 },
  allDoneCard: {
    margin: "20px 16px",
    background: "#f0fdf4",
    border: "2px solid #86efac",
    borderRadius: 16,
    padding: "28px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
  allDoneIcon: { fontSize: 40 },
  allDoneText: { fontSize: 18, fontWeight: 700, color: "#166534" },
  footer: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 480,
    background: "#fff",
    borderTop: "1px solid #e2e8f0",
    padding: "10px 16px 14px",
    zIndex: 100,
    boxShadow: "0 -4px 16px rgba(0,0,0,0.08)",
  },
  footerSave: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  savedMsg: {
    fontSize: 13,
    color: "#16a34a",
    fontWeight: 700,
    animation: "fadeIn 0.2s ease",
  },
  lastUpdated: { fontSize: 12, color: "#94a3b8" },
  saveBtn: {
    background: "#1e293b",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "7px 18px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  footerNav: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  footerNavBtn: {
    flex: 1,
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "13px 0",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
  footerStudentCount: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    minWidth: 52,
  },
  // Summary styles
  statsRow: {
    display: "flex",
    gap: 10,
    padding: "16px 16px 0",
  },
  statCard: {
    flex: 1,
    background: "#fff",
    borderRadius: 12,
    padding: "14px 10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  statNum: { fontSize: 26, fontWeight: 800, color: "#1e293b" },
  statLabel: { fontSize: 12, fontWeight: 600, color: "#64748b" },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fff",
    borderRadius: 12,
    padding: "14px 16px",
    marginBottom: 8,
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    border: "2px solid transparent",
  },
  summaryRowDone: { borderColor: "#86efac", background: "#f0fdf4" },
  summaryRowPending: { borderColor: "#fde68a", background: "#fffbeb" },
  summaryRowLeft: { display: "flex", flexDirection: "column", gap: 3 },
  summaryName: { fontSize: 15, fontWeight: 600, color: "#1e293b" },
  summarySubtext: { fontSize: 12, color: "#64748b" },
  summaryRight: { display: "flex", alignItems: "center", gap: 8 },
  badgeComplete: {
    background: "#dcfce7",
    color: "#166534",
    fontSize: 12,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 99,
  },
  badgeMissing: {
    background: "#fef3c7",
    color: "#92400e",
    fontSize: 12,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 99,
  },
  summaryArrow: { color: "#94a3b8", fontSize: 20 },
  downloadPdfBtn: {
    width: "100%",
    background: "#0f766e",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "15px 0",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: 0.3,
  },
};
