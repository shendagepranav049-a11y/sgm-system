import React, { useState } from "react";
import { Printer, Award, School, CheckCircle2 } from "lucide-react";
import { useSchool } from "../../context/SchoolContext";

export default function ReportCardsPage() {
  const { students, results, settings } = useSchool();
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || "");

  const student = students.find((s) => s.id === selectedStudentId) || students[0];
  const studentScores = results.filter((r) => r.studentId === student?.id || r.studentName === student?.name);

  const totalScored = studentScores.reduce((acc, r) => acc + Number(r.marksObtained || 0), 0);
  const totalMax = studentScores.reduce((acc, r) => acc + Number(r.maxMarks || 100), 0);
  const avgPct = totalMax > 0 ? Math.round((totalScored / totalMax) * 100) : 92;

  return (
    <div>
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div>
            <label className="form-label">Select Student</label>
            <select
              className="form-select"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.grNumber}) - {s.className}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => window.print()}>
          <Printer size={16} />
          <span>Print Official Report Card</span>
        </button>
      </div>

      {/* Official Printable Academic Report Card */}
      {student && (
        <div
          className="receipt-printable"
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "2.5rem",
            maxWidth: "900px",
            margin: "0 auto"
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "3px solid #4f46e5", paddingBottom: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <School size={32} />
              </div>
              <div>
                <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#1e1b4b", margin: 0 }}>
                  {settings.schoolName || "SGM International Academy"}
                </h2>
                <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "2px 0 0" }}>
                  {settings.address || "Academic City, Mumbai, MH"}
                </p>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  background: "#eef2ff",
                  color: "#4338ca",
                  fontWeight: "700",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  marginBottom: "4px"
                }}
              >
                ANNUAL ACADEMIC PROGRESS REPORT
              </div>
              <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                Session: {settings.academicYear || "2025-2026"}
              </div>
            </div>
          </div>

          {/* Student Info Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1rem",
              background: "#f8fafc",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1.5rem"
            }}
          >
            <div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Student Full Name</div>
              <div style={{ fontWeight: "800", color: "#0f172a" }}>{student.name}</div>
            </div>

            <div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>GR / Admission No.</div>
              <div style={{ fontWeight: "700", fontFamily: "monospace" }}>{student.grNumber}</div>
            </div>

            <div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Grade & Section</div>
              <div style={{ fontWeight: "700" }}>{student.className} - {student.division || "A"}</div>
            </div>

            <div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Attendance Rate</div>
              <div style={{ fontWeight: "700", color: "#10b981" }}>{student.attendancePercentage || 95}%</div>
            </div>
          </div>

          {/* Marks Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "1.5rem" }}>
            <thead>
              <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                <th style={{ padding: "0.75rem 1rem", borderBottom: "2px solid #cbd5e1" }}>Course Subject</th>
                <th style={{ padding: "0.75rem 1rem", borderBottom: "2px solid #cbd5e1" }}>Max Marks</th>
                <th style={{ padding: "0.75rem 1rem", borderBottom: "2px solid #cbd5e1" }}>Marks Scored</th>
                <th style={{ padding: "0.75rem 1rem", borderBottom: "2px solid #cbd5e1" }}>Grade</th>
                <th style={{ padding: "0.75rem 1rem", borderBottom: "2px solid #cbd5e1" }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {studentScores.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "1.5rem", color: "#94a3b8" }}>
                    No recorded assessment scores for this student.
                  </td>
                </tr>
              ) : (
                studentScores.map((score, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "0.75rem 1rem" }}><strong>{score.subject}</strong></td>
                    <td style={{ padding: "0.75rem 1rem" }}>{score.maxMarks || 100}</td>
                    <td style={{ padding: "0.75rem 1rem" }}><strong>{score.marksObtained}</strong></td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span style={{ fontWeight: "800", color: "#4f46e5" }}>{score.grade || "A+"}</span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#64748b" }}>{score.remarks || "Excellent"}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "2px solid #0f172a" }}>
                <td style={{ padding: "1rem", fontWeight: "700" }}>Overall Aggregate:</td>
                <td style={{ padding: "1rem", fontWeight: "700" }}>{totalMax}</td>
                <td style={{ padding: "1rem", fontWeight: "800", color: "#10b981" }}>{totalScored}</td>
                <td colSpan="2" style={{ padding: "1rem", fontWeight: "800", color: "#4f46e5" }}>
                  Percentage: {avgPct}% (Grade: A+)
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Principal & Teacher Signature Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "3.5rem" }}>
            <div style={{ textAlign: "center", minWidth: "160px" }}>
              <div style={{ borderBottom: "1px solid #0f172a", marginBottom: "0.5rem", height: "40px" }}></div>
              <div style={{ fontSize: "0.82rem", fontWeight: "700" }}>Class Teacher Signature</div>
            </div>

            <div style={{ textAlign: "center", minWidth: "160px" }}>
              <div style={{ borderBottom: "1px solid #0f172a", marginBottom: "0.5rem", height: "40px" }}></div>
              <div style={{ fontSize: "0.82rem", fontWeight: "700" }}>{settings.principalName || "Principal Signature"}</div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Head of Institution</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
