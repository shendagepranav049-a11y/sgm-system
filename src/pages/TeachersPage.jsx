import React, { useState } from "react";
import { Plus, Search, Edit2, Trash2, Mail, Phone, GraduationCap } from "lucide-react";
import { useSchool } from "../context/SchoolContext";
import Modal from "../components/common/Modal";
import Badge from "../components/common/Badge";

export default function TeachersPage() {
  const { teachers, addTeacher, updateTeacher, deleteTeacher } = useSchool();
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const defaultForm = {
    name: "",
    teacherId: `TCH-${Math.floor(100 + Math.random() * 900)}`,
    email: "",
    phone: "",
    subject: "Mathematics",
    qualification: "M.Sc.",
    joinedDate: new Date().toISOString().split("T")[0],
    status: "Active"
  };

  const [formData, setFormData] = useState(defaultForm);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      ...defaultForm,
      teacherId: `TCH-${Math.floor(100 + Math.random() * 900)}`
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingId(t.id);
    setFormData({
      name: t.name || "",
      teacherId: t.teacherId || "",
      email: t.email || "",
      phone: t.phone || "",
      subject: t.subject || "",
      qualification: t.qualification || "",
      joinedDate: t.joinedDate || "",
      status: t.status || "Active"
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateTeacher(editingId, formData);
    } else {
      await addTeacher(formData);
    }
    setModalOpen(false);
  };

  const filtered = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.teacherId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div className="search-box" style={{ maxWidth: "360px", flex: 1 }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search teacher by name, subject, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>+ Add Faculty Member</span>
        </button>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Teacher ID</th>
              <th>Faculty Name</th>
              <th>Department / Subject</th>
              <th>Qualification</th>
              <th>Contact Details</th>
              <th>Joined Date</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                  No teachers found.
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id}>
                  <td>
                    <span style={{ fontFamily: "monospace", fontWeight: "700" }}>{t.teacherId}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "50%",
                          background: "#e0f2fe",
                          color: "#0369a1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "700"
                        }}
                      >
                        {t.name.charAt(0)}
                      </div>
                      <strong>{t.name}</strong>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "0.2rem 0.6rem",
                        borderRadius: "4px",
                        background: "#eef2ff",
                        color: "#4338ca",
                        fontWeight: "600",
                        fontSize: "0.82rem"
                      }}
                    >
                      {t.subject}
                    </span>
                  </td>
                  <td>{t.qualification}</td>
                  <td>
                    <div style={{ fontSize: "0.82rem" }}>{t.email}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{t.phone}</div>
                  </td>
                  <td>{t.joinedDate}</td>
                  <td>
                    <Badge status={t.status || "Active"} />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ marginRight: "0.5rem", padding: "0.3rem 0.5rem" }}
                      onClick={() => handleOpenEdit(t)}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ padding: "0.3rem 0.5rem" }}
                      onClick={() => {
                        if (confirm(`Delete teacher ${t.name}?`)) {
                          deleteTeacher(t.id);
                        }
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Teacher Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Faculty Profile" : "Register Faculty Member"}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Teacher ID *</label>
              <input
                type="text"
                className="form-input"
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Subject / Specialty *</label>
              <input
                type="text"
                className="form-input"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Physics, Chemistry, English"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Academic Qualification *</label>
              <input
                type="text"
                className="form-input"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g. Ph.D., M.Sc., B.Ed."
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Joined Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.joinedDate}
                onChange={(e) => setFormData({ ...formData, joinedDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="modal-footer" style={{ margin: "1.5rem -1.5rem -1.5rem", padding: "1rem 1.5rem" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingId ? "Save Changes" : "Register Teacher"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
