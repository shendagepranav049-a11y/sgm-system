import React, { useState } from "react";
import { Plus, Layers, DoorOpen, Users } from "lucide-react";
import { useSchool } from "../../context/SchoolContext";
import Modal from "../../components/common/Modal";

export default function DivisionsPage() {
  const { divisions, classes, teachers } = useSchool();
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    className: classes[0]?.name || "Grade 10",
    division: "A",
    classTeacher: teachers[0]?.name || "",
    room: "Room 101"
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Class Divisions & Sections</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Classroom divisions, seating assignments, and allocated section supervisors
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          <span>+ Add Division</span>
        </button>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Class & Division</th>
              <th>Class Teacher</th>
              <th>Classroom Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {divisions.map((div) => (
              <tr key={div.id}>
                <td>
                  <strong>{div.className}</strong> - Division {div.division}
                </td>
                <td>{div.classTeacher}</td>
                <td>{div.room}</td>
                <td>
                  <span className="badge badge-paid">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Division">
        <form onSubmit={(e) => { e.preventDefault(); setModalOpen(false); }}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Select Class *</label>
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
              <label className="form-label">Division / Section *</label>
              <input
                type="text"
                className="form-input"
                value={formData.division}
                onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                placeholder="e.g. C"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Class Teacher</label>
            <select
              className="form-select"
              value={formData.classTeacher}
              onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.subject})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Room Number</label>
            <input
              type="text"
              className="form-input"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ margin: "1.5rem -1.5rem -1.5rem", padding: "1rem 1.5rem" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Division
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
