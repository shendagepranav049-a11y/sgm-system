import React, { useState } from "react";
import { Plus, Calendar, CheckCircle2, Clock } from "lucide-react";
import { useSchool } from "../../context/SchoolContext";
import Modal from "../../components/common/Modal";

export default function AcademicYearsPage() {
  const { academicYears } = useSchool();
  const [modalOpen, setModalOpen] = useState(false);
  const [newYear, setNewYear] = useState({ name: "2026-2027", status: "Upcoming", isCurrent: false });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Academic Sessions & Calendars</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Configure active and historical institutional sessions for student enrollment and billing
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          <span>+ Add Academic Year</span>
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
        {academicYears.map((ay) => (
          <div
            key={ay.id}
            className="card"
            style={{
              padding: "1.5rem",
              borderLeft: ay.isCurrent ? "5px solid #10b981" : "1px solid var(--border-color)",
              background: ay.isCurrent ? "#f0fdf4" : "#ffffff"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <h4 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a" }}>{ay.name}</h4>
                <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "2px" }}>Academic Session</div>
              </div>
              <span
                style={{
                  padding: "0.25rem 0.65rem",
                  borderRadius: "999px",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  background: ay.isCurrent ? "#dcfce7" : "#f1f5f9",
                  color: ay.isCurrent ? "#15803d" : "#475569"
                }}
              >
                {ay.isCurrent ? "Active Session" : ay.status}
              </span>
            </div>

            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              {ay.isCurrent
                ? "All active student fee collections, promotions, and attendance records are tied to this session."
                : "Historical archived records preserved for audits and reporting."}
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Academic Session">
        <form onSubmit={(e) => { e.preventDefault(); setModalOpen(false); }}>
          <div className="form-group">
            <label className="form-label">Session Name *</label>
            <input
              type="text"
              className="form-input"
              value={newYear.name}
              onChange={(e) => setNewYear({ ...newYear, name: e.target.value })}
              placeholder="e.g. 2026-2027"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Initial Status</label>
            <select
              className="form-select"
              value={newYear.status}
              onChange={(e) => setNewYear({ ...newYear, status: e.target.value })}
            >
              <option value="Upcoming">Upcoming</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="modal-footer" style={{ margin: "1.5rem -1.5rem -1.5rem", padding: "1rem 1.5rem" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Session
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
