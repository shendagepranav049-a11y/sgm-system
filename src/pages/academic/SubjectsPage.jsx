import React, { useState } from "react";
import { Plus, BookOpen } from "lucide-react";
import { useSchool } from "../../context/SchoolContext";
import Modal from "../../components/common/Modal";

export default function SubjectsPage() {
  const { subjects } = useSchool();
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", code: "", department: "Science & Math" });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Curriculum Subjects & Departments</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Academic syllabus, course codes, and disciplinary departments
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          <span>+ Add Subject</span>
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
        {subjects.map((sub) => (
          <div key={sub.id} className="card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
              <h4 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#0f172a" }}>{sub.name}</h4>
              <span style={{ fontFamily: "monospace", fontSize: "0.78rem", background: "#eef2ff", color: "#4f46e5", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: "700" }}>
                {sub.code}
              </span>
            </div>
            <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
              Department: <strong>{sub.department}</strong>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register Academic Subject">
        <form onSubmit={(e) => { e.preventDefault(); setModalOpen(false); }}>
          <div className="form-group">
            <label className="form-label">Subject Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Economics"
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Course / Subject Code *</label>
              <input
                type="text"
                className="form-input"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. ECO-101"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="Science & Math">Science & Math</option>
                <option value="Humanities">Humanities</option>
                <option value="Technology">Technology</option>
                <option value="Commerce & Finance">Commerce & Finance</option>
                <option value="Languages">Languages</option>
              </select>
            </div>
          </div>

          <div className="modal-footer" style={{ margin: "1.5rem -1.5rem -1.5rem", padding: "1rem 1.5rem" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Subject
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
