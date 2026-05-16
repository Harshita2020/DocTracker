import { STUDENTS } from "../constants/students";
import { DOCUMENTS } from "../constants/documents";
import { getStudentData } from "../utils/studentHelpers";
import { getFieldData, normalizeField } from "../utils/documentHelpers";

function SummaryView({ allData, goTo, currentIdx, generatePDF, styles }) {
  const sorted = STUDENTS.map((student, i) => {
    const sData = getStudentData(allData, student);

    const missing = DOCUMENTS.filter((doc) => {
      const rawField = getFieldData(sData, doc);
      const field = normalizeField(rawField);

      return !field.hasDoc;
    }).length;

    return {
      name: student.name,
      idx: i,
      missing,
    };
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

export default SummaryView;
