import React, { useState } from "react";
import { Plus, BookMarked, Calendar, CheckCircle2 } from "lucide-react";
import { useSchool } from "../../context/SchoolContext";
import Modal from "../../components/common/Modal";

export default function HomeworkPage() {
  const { homework, classes, subjects, teachers, addHomework } = useSchool();
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    className: classes[0]?.name || "Grade 10",
    subject: subjects[0]?.name || "Mathematics",
    assignedBy: teachers[0]?.name || "Emily Watson",
    assignedDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
    instructions: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addHomework(formData);
    setModalOpen(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Daily Homework & Assignment Tracker</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Post classroom coursework, assignment deadlines, and submission directives
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          <span>+ Assign Homework</span>
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
        {homework.map((hw) => (
          <div key={hw.id} className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
              <span className="badge badge-info">{hw.className}</span>
              <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: "600" }}>Due: {hw.dueDate}</span>
            </div>

            <h4 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#0f172a", margin: "0.25rem 0" }}>
              {hw.title}
            </h4>

            <div style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: "600", marginBottom: "0.75rem" }}>
              {hw.subject} • By {hw.assignedBy}
            </div>

            <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.5", flex: 1 }}>
              {hw.instructions}
            </p>

            <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-light)", fontSize: "0.75rem", color: "#94a3b8" }}>
              Assigned on: {hw.assignedDate}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Assign New Homework">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Assignment Title *</label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Chemical Bonding Problem Set 3"
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Target Class</label>
              <select
                className="form-select"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <select
                className="form-select"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Due Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Instructor</label>
              <select
                className="form-select"
                value={formData.assignedBy}
                onChange={(e) => setFormData({ ...formData, assignedBy: e.target.value })}
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Instructions & Details</label>
            <textarea
              rows="3"
              className="form-textarea"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Mention questions, book pages, or reference guidelines..."
            ></textarea>
          </div>

          <div className="modal-footer" style={{ margin: "1.5rem -1.5rem -1.5rem", padding: "1rem 1.5rem" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Assign to Class
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
