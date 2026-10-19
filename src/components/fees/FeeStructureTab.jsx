import React, { useState } from "react";
import { Plus, Edit2, Trash2, DollarSign } from "lucide-react";
import { useSchool } from "../../context/SchoolContext";
import Modal from "../common/Modal";

export default function FeeStructureTab() {
  const { feeStructures, classes, addFeeStructure, updateFeeStructure, deleteFeeStructure, settings } = useSchool();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    className: "",
    classId: "",
    tuitionFee: "",
    admissionFee: "",
    labFee: "",
    libraryFee: "",
    sportsFee: "",
    transportFee: "",
    term: "Annual 2025-26"
  });

  const currency = settings.currency || "$";

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      className: classes[0]?.name || "Grade 8",
      classId: classes[0]?.id || "",
      tuitionFee: 3000,
      admissionFee: 400,
      labFee: 200,
      libraryFee: 150,
      sportsFee: 150,
      transportFee: 450,
      term: "Annual 2025-26"
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (structure) => {
    setEditingId(structure.id);
    setFormData({
      className: structure.className,
      classId: structure.classId || "",
      tuitionFee: structure.tuitionFee || 0,
      admissionFee: structure.admissionFee || 0,
      labFee: structure.labFee || 0,
      libraryFee: structure.libraryFee || 0,
      sportsFee: structure.sportsFee || 0,
      transportFee: structure.transportFee || 0,
      term: structure.term || "Annual 2025-26"
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateFeeStructure(editingId, formData);
    } else {
      await addFeeStructure(formData);
    }
    setModalOpen(false);
  };

  const totalCalculated =
    Number(formData.tuitionFee || 0) +
    Number(formData.admissionFee || 0) +
    Number(formData.labFee || 0) +
    Number(formData.libraryFee || 0) +
    Number(formData.sportsFee || 0) +
    Number(formData.transportFee || 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Standard Class Fee Structures</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Configure tuition, laboratory, sports, and auxiliary fees by grade level
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Add Fee Structure</span>
        </button>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Class / Grade</th>
              <th>Term</th>
              <th>Tuition</th>
              <th>Admission</th>
              <th>Lab & Library</th>
              <th>Sports & Transport</th>
              <th>Total Annual Fee</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {feeStructures.map((f) => (
              <tr key={f.id}>
                <td>
                  <strong>{f.className}</strong>
                </td>
                <td>
                  <span className="badge badge-info">{f.term}</span>
                </td>
                <td>{currency}{Number(f.tuitionFee || 0).toLocaleString()}</td>
                <td>{currency}{Number(f.admissionFee || 0).toLocaleString()}</td>
                <td>{currency}{(Number(f.labFee || 0) + Number(f.libraryFee || 0)).toLocaleString()}</td>
                <td>{currency}{(Number(f.sportsFee || 0) + Number(f.transportFee || 0)).toLocaleString()}</td>
                <td>
                  <strong style={{ color: "var(--primary)", fontSize: "1rem" }}>
                    {currency}{Number(f.totalAmount || 0).toLocaleString()}
                  </strong>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ marginRight: "0.5rem", padding: "0.3rem 0.5rem" }}
                    onClick={() => handleOpenEdit(f)}
                    title="Edit Structure"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ padding: "0.3rem 0.5rem" }}
                    onClick={() => {
                      if (confirm(`Delete fee structure for ${f.className}?`)) {
                        deleteFeeStructure(f.id);
                      }
                    }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Fee Structure Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Class Fee Structure" : "Create New Class Fee Structure"}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Grade / Class Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                placeholder="e.g. Grade 10"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Academic Term *</label>
              <input
                type="text"
                className="form-input"
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Tuition Fee ({currency}) *</label>
              <input
                type="number"
                className="form-input"
                value={formData.tuitionFee}
                onChange={(e) => setFormData({ ...formData, tuitionFee: e.target.value })}
                required
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Admission Fee ({currency})</label>
              <input
                type="number"
                className="form-input"
                value={formData.admissionFee}
                onChange={(e) => setFormData({ ...formData, admissionFee: e.target.value })}
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Lab Fee ({currency})</label>
              <input
                type="number"
                className="form-input"
                value={formData.labFee}
                onChange={(e) => setFormData({ ...formData, labFee: e.target.value })}
                min="0"
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Library Fee ({currency})</label>
              <input
                type="number"
                className="form-input"
                value={formData.libraryFee}
                onChange={(e) => setFormData({ ...formData, libraryFee: e.target.value })}
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Sports Fee ({currency})</label>
              <input
                type="number"
                className="form-input"
                value={formData.sportsFee}
                onChange={(e) => setFormData({ ...formData, sportsFee: e.target.value })}
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Transport Fee ({currency})</label>
              <input
                type="number"
                className="form-input"
                value={formData.transportFee}
                onChange={(e) => setFormData({ ...formData, transportFee: e.target.value })}
                min="0"
              />
            </div>
          </div>

          <div
            style={{
              background: "#eef2ff",
              padding: "1rem",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              margin: "1rem 0"
            }}
          >
            <span style={{ fontWeight: "700", color: "#3730a3" }}>Computed Total Amount:</span>
            <span style={{ fontSize: "1.25rem", fontWeight: "800", color: "#4f46e5" }}>
              {currency}{totalCalculated.toLocaleString()}
            </span>
          </div>

          <div className="modal-footer" style={{ margin: "1rem -1.5rem -1.5rem", padding: "1rem 1.5rem" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingId ? "Save Changes" : "Create Structure"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
