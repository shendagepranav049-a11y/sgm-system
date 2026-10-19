import React, { useState } from "react";
import { Plus, Edit2, FileSpreadsheet, ShieldAlert } from "lucide-react";
import { useSchool } from "../../context/SchoolContext";
import { formatRupees, paiseToRupees, rupeesToPaise } from "../../utils/currency";
import Modal from "../../components/common/Modal";

export default function FeeStructurePage() {
  const { feeStructures, classes, academicYears, addFeeStructure, updateFeeStructure } = useSchool();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const defaultForm = {
    academicYear: "2025-2026",
    className: classes[0]?.name || "Grade 10",
    classId: classes[0]?.id || "cls-10",
    tuitionFeeRupees: 320000,
    admissionFeeRupees: 40000,
    examFeeRupees: 25000,
    computerFeeRupees: 15000,
    libraryFeeRupees: 15000,
    transportFeeRupees: 50000,
    otherFeeRupees: 10000,
    installmentCount: 2
  };

  const [formData, setFormData] = useState(defaultForm);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(defaultForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (fs) => {
    setEditingId(fs.id);
    setFormData({
      academicYear: fs.academicYear,
      className: fs.className,
      classId: fs.classId,
      tuitionFeeRupees: paiseToRupees(fs.tuitionFeePaise || 0),
      admissionFeeRupees: paiseToRupees(fs.admissionFeePaise || 0),
      examFeeRupees: paiseToRupees(fs.examFeePaise || 0),
      computerFeeRupees: paiseToRupees(fs.computerFeePaise || 0),
      libraryFeeRupees: paiseToRupees(fs.libraryFeePaise || 0),
      transportFeeRupees: paiseToRupees(fs.transportFeePaise || 0),
      otherFeeRupees: paiseToRupees(fs.otherFeePaise || 0),
      installmentCount: fs.installments?.length || 2
    });
    setModalOpen(true);
  };

  const calculatedTotalRupees =
    Number(formData.tuitionFeeRupees || 0) +
    Number(formData.admissionFeeRupees || 0) +
    Number(formData.examFeeRupees || 0) +
    Number(formData.computerFeeRupees || 0) +
    Number(formData.libraryFeeRupees || 0) +
    Number(formData.transportFeeRupees || 0) +
    Number(formData.otherFeeRupees || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      academicYear: formData.academicYear,
      className: formData.className,
      classId: formData.classId,
      tuitionFeePaise: rupeesToPaise(formData.tuitionFeeRupees),
      admissionFeePaise: rupeesToPaise(formData.admissionFeeRupees),
      examFeePaise: rupeesToPaise(formData.examFeeRupees),
      computerFeePaise: rupeesToPaise(formData.computerFeeRupees),
      libraryFeePaise: rupeesToPaise(formData.libraryFeePaise),
      transportFeePaise: rupeesToPaise(formData.transportFeeRupees),
      otherFeePaise: rupeesToPaise(formData.otherFeeRupees),
      installments: [
        { name: "Term 1 (First Half)", amountPaise: rupeesToPaise(calculatedTotalRupees / 2), dueDate: "2025-08-15" },
        { name: "Term 2 (Second Half)", amountPaise: rupeesToPaise(calculatedTotalRupees / 2), dueDate: "2025-11-30" }
      ]
    };

    if (editingId) {
      await updateFeeStructure(editingId, payload);
    } else {
      await addFeeStructure(payload);
    }
    setModalOpen(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Official Class Fee Structures</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Configure tuition, examination, laboratory, and transport components with installment terms
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>+ Create Fee Structure</span>
        </button>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Class / Level</th>
              <th>Academic Session</th>
              <th>Tuition Fee</th>
              <th>Admission</th>
              <th>Exam & Lab</th>
              <th>Transport & Aux</th>
              <th>Total Annual Fee</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {feeStructures.map((fs) => (
              <tr key={fs.id}>
                <td>
                  <strong>{fs.className}</strong>
                </td>
                <td>
                  <span className="badge badge-info">{fs.academicYear}</span>
                </td>
                <td>{formatRupees(paiseToRupees(fs.tuitionFeePaise))}</td>
                <td>{formatRupees(paiseToRupees(fs.admissionFeePaise))}</td>
                <td>
                  {formatRupees(paiseToRupees((fs.examFeePaise || 0) + (fs.computerFeePaise || 0)))}
                </td>
                <td>
                  {formatRupees(paiseToRupees((fs.transportFeePaise || 0) + (fs.otherFeePaise || 0)))}
                </td>
                <td>
                  <strong style={{ color: "var(--primary)", fontSize: "1.05rem" }}>
                    {formatRupees(paiseToRupees(fs.totalAmountPaise))}
                  </strong>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleOpenEdit(fs)}
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Fee Structure" : "New Class Fee Structure"}
        size="large"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Academic Year *</label>
              <select
                className="form-select"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              >
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.name}>
                    {ay.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Class Level *</label>
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
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Tuition Fee (₹) *</label>
              <input
                type="number"
                className="form-input"
                value={formData.tuitionFeeRupees}
                onChange={(e) => setFormData({ ...formData, tuitionFeeRupees: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Admission Fee (₹)</label>
              <input
                type="number"
                className="form-input"
                value={formData.admissionFeeRupees}
                onChange={(e) => setFormData({ ...formData, admissionFeeRupees: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Examination Fee (₹)</label>
              <input
                type="number"
                className="form-input"
                value={formData.examFeeRupees}
                onChange={(e) => setFormData({ ...formData, examFeeRupees: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Computer / Lab Fee (₹)</label>
              <input
                type="number"
                className="form-input"
                value={formData.computerFeeRupees}
                onChange={(e) => setFormData({ ...formData, computerFeeRupees: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Library Fee (₹)</label>
              <input
                type="number"
                className="form-input"
                value={formData.libraryFeeRupees}
                onChange={(e) => setFormData({ ...formData, libraryFeeRupees: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Transport Fee (₹)</label>
              <input
                type="number"
                className="form-input"
                value={formData.transportFeeRupees}
                onChange={(e) => setFormData({ ...formData, transportFeeRupees: e.target.value })}
              />
            </div>
          </div>

          <div
            style={{
              background: "#eef2ff",
              padding: "1rem 1.25rem",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              margin: "1rem 0"
            }}
          >
            <span style={{ fontWeight: "700", color: "#3730a3" }}>Computed Total Annual Fee:</span>
            <span style={{ fontSize: "1.35rem", fontWeight: "800", color: "#4f46e5" }}>
              {formatRupees(calculatedTotalRupees)}
            </span>
          </div>

          <div className="modal-footer" style={{ margin: "1.5rem -1.5rem -1.5rem", padding: "1rem 1.5rem" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingId ? "Save Structure Changes" : "Create Structure"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
