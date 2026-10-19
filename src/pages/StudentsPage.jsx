import React, { useState } from "react";
import { Plus, Search, Edit2, Trash2, CreditCard, UserPlus } from "lucide-react";
import { useSchool } from "../context/SchoolContext";
import Modal from "../components/common/Modal";
import Badge from "../components/common/Badge";

export default function StudentsPage({ onOpenCollectFee }) {
  const { students, classes, addStudent, updateStudent, deleteStudent, settings } = useSchool();
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const currency = settings.currency || "$";

  const defaultForm = {
    name: "",
    rollNo: `SGM-${Math.floor(100 + Math.random() * 900)}`,
    gender: "Male",
    className: classes[0]?.name || "Grade 10",
    section: "A",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    address: "",
    dob: "2010-01-01",
    admissionDate: new Date().toISOString().split("T")[0],
    totalFee: 4750,
    paidFee: 0,
    attendancePercentage: 95
  };

  const [formData, setFormData] = useState(defaultForm);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      ...defaultForm,
      rollNo: `SGM-${Math.floor(100 + Math.random() * 900)}`
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditingId(student.id);
    setFormData({
      name: student.name || "",
      rollNo: student.rollNo || "",
      gender: student.gender || "Male",
      className: student.className || "Grade 10",
      section: student.section || "A",
      parentName: student.parentName || "",
      parentPhone: student.parentPhone || "",
      parentEmail: student.parentEmail || "",
      address: student.address || "",
      dob: student.dob || "2010-01-01",
      admissionDate: student.admissionDate || "",
      totalFee: student.totalFee || 0,
      paidFee: student.paidFee || 0,
      attendancePercentage: student.attendancePercentage || 95
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateStudent(editingId, formData);
    } else {
      await addStudent(formData);
    }
    setModalOpen(false);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.rollNo && s.rollNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.parentPhone && s.parentPhone.includes(searchTerm));
    const matchesClass = classFilter === "all" || s.className === classFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div>
      {/* Top Filter and Actions */}
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
        <div style={{ display: "flex", gap: "1rem", flex: 1, maxWidth: "540px" }}>
          <div className="search-box" style={{ flex: 1 }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by student name, roll number, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: "auto" }}
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="all">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name} ({c.section})
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <UserPlus size={16} />
          <span>+ Add Student</span>
        </button>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Student</th>
              <th>Gender</th>
              <th>Class & Sec</th>
              <th>Parent / Guardian</th>
              <th>Phone</th>
              <th>Total Fee</th>
              <th>Fee Status</th>
              <th>Attendance</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                  No student records found.
                </td>
              </tr>
            ) : (
              filteredStudents.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span style={{ fontFamily: "monospace", fontWeight: "700" }}>{s.rollNo}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: "#e0e7ff",
                          color: "#4338ca",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "700",
                          fontSize: "0.85rem"
                        }}
                      >
                        {s.name?.charAt(0) || "S"}
                      </div>
                      <div>
                        <strong>{s.name}</strong>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{s.dob}</div>
                      </div>
                    </div>
                  </td>
                  <td>{s.gender || "Male"}</td>
                  <td>
                    {s.className} - {s.section || "A"}
                  </td>
                  <td>{s.parentName || "Guardian"}</td>
                  <td>{s.parentPhone || "N/A"}</td>
                  <td>
                    {currency}{Number(s.totalFee || 0).toLocaleString()}
                  </td>
                  <td>
                    <Badge status={s.feeStatus || "Unpaid"} />
                  </td>
                  <td>
                    <span style={{ fontWeight: "700", color: "#10b981" }}>
                      {s.attendancePercentage || 95}%
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                      {Number(s.pendingFee || 0) > 0 && (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ padding: "0.3rem 0.5rem" }}
                          onClick={() => onOpenCollectFee(s.id)}
                          title="Collect Student Fee"
                        >
                          <CreditCard size={13} />
                        </button>
                      )}
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "0.3rem 0.5rem" }}
                        onClick={() => handleOpenEdit(s)}
                        title="Edit Student"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ padding: "0.3rem 0.5rem" }}
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${s.name}?`)) {
                            deleteStudent(s.id);
                          }
                        }}
                        title="Delete Student"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Student Details" : "Register New Student"}
        size="large"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Roll Number *</label>
              <input
                type="text"
                className="form-input"
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Class *</label>
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
              <label className="form-label">Section</label>
              <select
                className="form-select"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-input"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Parent / Guardian Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                placeholder="Parent's Name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Parent Phone *</label>
              <input
                type="tel"
                className="form-input"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                placeholder="+1 555-0100"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Parent Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.parentEmail}
                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                placeholder="parent@example.com"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Total Annual Tuition & Fees ({currency}) *</label>
              <input
                type="number"
                className="form-input"
                value={formData.totalFee}
                onChange={(e) => setFormData({ ...formData, totalFee: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Initial Paid Fee ({currency})</label>
              <input
                type="number"
                className="form-input"
                value={formData.paidFee}
                onChange={(e) => setFormData({ ...formData, paidFee: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Residential Address</label>
            <input
              type="text"
              className="form-input"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street address, City, Postal Code"
            />
          </div>

          <div className="modal-footer" style={{ margin: "1.5rem -1.5rem -1.5rem", padding: "1rem 1.5rem" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingId ? "Save Changes" : "Register Student"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
