import React, { useState } from "react";
import { Plus, BookOpen, Trash2 } from "lucide-react";
import { useSchool } from "../../context/SchoolContext";
import Modal from "../../components/common/Modal";

export default function SubjectsPage() {
  const { subjects, addSubject, deleteSubject } = useSchool();
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", code: "", department: "Science & Math" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addSubject(formData);
    setModalOpen(false);
    setFormData({ name: "", code: "", department: "Science & Math" });
  };

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
        {subjects.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
            कोणताही विषय जोडलेला नाही. वर '+ Add Subject' वर क्लिक करा.
          </div>
        ) : (
          subjects.map((sub) => (
            <div key={sub.id} className="card" style={{ padding: "1.25rem", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <h4 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#0f172a" }}>{sub.name}</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.78rem",
                      background: "#eef2ff",
                      color: "#4f46e5",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      fontWeight: "700"
                    }}
                  >
                    {sub.code}
                  </span>
                  <button
                    className="btn btn-sm"
                    style={{ color: "#ef4444", background: "transparent", padding: "2px" }}
                    onClick={() => deleteSubject(sub.id)}
                    title="Delete Subject"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                Department: <strong>{sub.department}</strong>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register Academic Subject">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Subject Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. History & Political Science"
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
                placeholder="e.g. HIS-101"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                className="form-select"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="Science & Math">Science & Math</option>
                <option value="Languages">Languages</option>
                <option value="Social Sciences">Social Sciences</option>
                <option value="Humanities">Humanities</option>
                <option value="Technology">Technology & Computers</option>
                <option value="Commerce">Commerce & Accounts</option>
                <option value="Physical Education">Physical Education & Sports</option>
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
