import React, { useState } from "react";
import { Plus, FileSpreadsheet, Calendar, Award } from "lucide-react";
import { useSchool } from "../context/SchoolContext";
import Modal from "../components/common/Modal";
import Badge from "../components/common/Badge";

export default function ExamsPage({ onNavigateToResults }) {
  const { exams, addExam } = useSchool();
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    term: "Second Term",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    status: "Upcoming",
    totalMarks: 100
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addExam(formData);
    setModalOpen(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Examinations & Assessments</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Schedule academic assessment terms, evaluation timelines, and grading criteria
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          <span>+ Schedule Exam</span>
        </button>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Assessment Title</th>
              <th>Academic Term</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Standard Total</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Results</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((ex) => (
              <tr key={ex.id}>
                <td>
                  <strong style={{ fontSize: "0.95rem" }}>{ex.title}</strong>
                </td>
                <td>
                  <span className="badge badge-info">{ex.term}</span>
                </td>
                <td>{ex.startDate}</td>
                <td>{ex.endDate}</td>
                <td>{ex.totalMarks || 100} Marks</td>
                <td>
                  <Badge status={ex.status || "Upcoming"} />
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onNavigateToResults(ex.id)}
                  >
                    <Award size={14} />
                    <span>Scores</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Schedule Exam Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Examination">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Exam Title *</label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Mid-Term Evaluation 2026"
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Academic Term</label>
              <select
                className="form-select"
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
              >
                <option value="First Term">First Term</option>
                <option value="Mid-Term">Mid-Term</option>
                <option value="Second Term">Second Term</option>
                <option value="Final Term">Final Term</option>
                <option value="Mock Board Exam">Mock Board Exam</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Standard Maximum Marks</label>
              <input
                type="number"
                className="form-input"
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                min="10"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Upcoming">Upcoming</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="modal-footer" style={{ margin: "1.5rem -1.5rem -1.5rem", padding: "1rem 1.5rem" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Schedule Exam
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
