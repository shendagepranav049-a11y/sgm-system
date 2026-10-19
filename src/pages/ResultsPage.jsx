import React, { useState } from "react";
import { Plus, Award, Search, Printer, CheckCircle2 } from "lucide-react";
import { useSchool } from "../context/SchoolContext";
import Modal from "../components/common/Modal";

export default function ResultsPage() {
  const { results, exams, students, classes, addResult } = useSchool();
  const [selectedExam, setSelectedExam] = useState(exams[0]?.id || "all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    examId: exams[0]?.id || "",
    studentId: students[0]?.id || "",
    subject: "Mathematics",
    marksObtained: "",
    maxMarks: 100,
    remarks: "Good performance"
  });

  const calculateGrade = (score, max) => {
    const percent = (Number(score) / Number(max)) * 100;
    if (percent >= 90) return "A+";
    if (percent >= 80) return "A";
    if (percent >= 70) return "B";
    if (percent >= 60) return "C";
    if (percent >= 50) return "D";
    return "F";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const student = students.find((s) => s.id === formData.studentId);
    const grade = calculateGrade(formData.marksObtained, formData.maxMarks);

    await addResult({
      ...formData,
      marksObtained: Number(formData.marksObtained),
      maxMarks: Number(formData.maxMarks),
      grade,
      studentName: student ? student.name : "Student",
      rollNo: student ? student.rollNo : "N/A",
      className: student ? student.className : "N/A"
    });

    setModalOpen(false);
  };

  const filteredResults = results.filter((r) => {
    const matchExam = selectedExam === "all" || r.examId === selectedExam;
    const matchClass = selectedClass === "all" || r.className === selectedClass;
    return matchExam && matchClass;
  });

  return (
    <div>
      {/* Filters and Add Score */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem"
        }}
      >
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <select
              className="form-select"
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
            >
              <option value="all">All Examinations</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="form-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="all">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          <span>+ Enter Student Marks</span>
        </button>
      </div>

      {/* Results Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Student</th>
              <th>Class</th>
              <th>Subject</th>
              <th>Marks Scored</th>
              <th>Max Marks</th>
              <th>Percentage</th>
              <th>Grade</th>
              <th>Teacher Feedback</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                  No examination results recorded for this selection.
                </td>
              </tr>
            ) : (
              filteredResults.map((r) => {
                const percent = Math.round((Number(r.marksObtained) / Number(r.maxMarks || 100)) * 100);
                return (
                  <tr key={r.id}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontWeight: "700" }}>{r.rollNo}</span>
                    </td>
                    <td>
                      <strong>{r.studentName}</strong>
                    </td>
                    <td>{r.className}</td>
                    <td>
                      <span style={{ fontWeight: "600", color: "var(--primary)" }}>{r.subject}</span>
                    </td>
                    <td>
                      <strong style={{ fontSize: "1rem" }}>{r.marksObtained}</strong>
                    </td>
                    <td>{r.maxMarks}</td>
                    <td>{percent}%</td>
                    <td>
                      <span
                        style={{
                          padding: "0.2rem 0.6rem",
                          borderRadius: "4px",
                          fontWeight: "800",
                          fontSize: "0.85rem",
                          background: percent >= 80 ? "#ecfdf5" : percent >= 60 ? "#eff6ff" : "#fef2f2",
                          color: percent >= 80 ? "#065f46" : percent >= 60 ? "#1e40af" : "#991b1b"
                        }}
                      >
                        {r.grade || calculateGrade(r.marksObtained, r.maxMarks)}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                      {r.remarks || "Satisfactory"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Enter Marks Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Enter Student Exam Score">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Examination *</label>
            <select
              className="form-select"
              value={formData.examId}
              onChange={(e) => setFormData({ ...formData, examId: e.target.value })}
              required
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} ({ex.term})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Student *</label>
            <select
              className="form-select"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              required
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.rollNo}) - {s.className}
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Subject *</label>
              <input
                type="text"
                className="form-input"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Physics"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Marks Scored *</label>
              <input
                type="number"
                className="form-input"
                value={formData.marksObtained}
                onChange={(e) => setFormData({ ...formData, marksObtained: e.target.value })}
                placeholder="e.g. 92"
                required
                min="0"
                max="100"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Max Marks</label>
              <input
                type="number"
                className="form-input"
                value={formData.maxMarks}
                onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                required
                min="10"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Teacher Remarks</label>
            <input
              type="text"
              className="form-input"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="e.g. Demonstrates strong conceptual clarity"
            />
          </div>

          <div className="modal-footer" style={{ margin: "1.5rem -1.5rem -1.5rem", padding: "1rem 1.5rem" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Score
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
