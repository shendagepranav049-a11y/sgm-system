import React, { useState } from "react";
import { Plus, BookOpen, Users, Edit2, Trash2, DoorOpen } from "lucide-react";
import { useSchool } from "../context/SchoolContext";
import Modal from "../components/common/Modal";

export default function ClassesPage({ onNavigateToStudents }) {
  const { classes, teachers, students, addClass, updateClass, deleteClass } = useSchool();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    section: "A",
    classTeacher: teachers[0]?.name || "",
    room: "Room 101",
    capacity: 35
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: "",
      section: "A",
      classTeacher: teachers[0]?.name || "",
      room: "Room 101",
      capacity: 35
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (cls) => {
    setEditingId(cls.id);
    setFormData({
      name: cls.name,
      section: cls.section,
      classTeacher: cls.classTeacher,
      room: cls.room,
      capacity: cls.capacity
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateClass(editingId, formData);
    } else {
      await addClass(formData);
    }
    setModalOpen(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Classrooms & Academic Divisions</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Monitor student occupancy, class teachers, and room assignments
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>+ Create New Class</span>
        </button>
      </div>

      {/* Classes Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
        {classes.map((c) => {
          const enrolled = students.filter((s) => s.className === c.name || s.classId === c.id).length;
          const capacity = Number(c.capacity || 35);
          const percent = Math.min(100, Math.round((enrolled / capacity) * 100));

          return (
            <div key={c.id} className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div>
                  <h4 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--text-main)" }}>
                    {c.name}
                  </h4>
                  <span style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: "700" }}>
                    Section {c.section}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: "0.25rem 0.4rem" }}
                    onClick={() => handleOpenEdit(c)}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ padding: "0.25rem 0.4rem" }}
                    onClick={() => {
                      if (confirm(`Delete class ${c.name} (${c.section})?`)) {
                        deleteClass(c.id);
                      }
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                Class Teacher: <strong>{c.classTeacher || "Unassigned"}</strong>
              </div>

              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "1rem" }}>
                <DoorOpen size={14} />
                <span>Location: {c.room || "Room 101"}</span>
              </div>

              <div style={{ marginTop: "auto", borderTop: "1px solid var(--border-light)", paddingTop: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Enrolled Capacity:</span>
                  <span style={{ fontWeight: "700" }}>{enrolled} / {capacity} Students</span>
                </div>
                <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${percent}%`,
                      height: "100%",
                      background: percent > 90 ? "#ef4444" : "#4f46e5",
                      borderRadius: "999px"
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Class Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Class" : "Create New Class"}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Class Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Grade 10"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Section *</label>
              <input
                type="text"
                className="form-input"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                placeholder="e.g. A"
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
              <option value="">-- Select Teacher --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.subject})
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Room / Classroom</label>
              <input
                type="text"
                className="form-input"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="e.g. Room 204 or Lab A"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Maximum Student Capacity</label>
              <input
                type="number"
                className="form-input"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                min="1"
              />
            </div>
          </div>

          <div className="modal-footer" style={{ margin: "1.5rem -1.5rem -1.5rem", padding: "1rem 1.5rem" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingId ? "Save Changes" : "Create Class"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
