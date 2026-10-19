import React, { useState } from "react";
import { AlertTriangle, Send, PlusCircle, Search } from "lucide-react";
import { useSchool } from "../../context/SchoolContext";
import Badge from "../common/Badge";

export default function PendingFeesTab({ onCollectFeeForStudent }) {
  const { students, settings, showToast } = useSchool();
  const [searchTerm, setSearchTerm] = useState("");

  const pendingStudents = students.filter((s) => Number(s.pendingFee || 0) > 0);
  const totalPendingAmount = pendingStudents.reduce((acc, s) => acc + Number(s.pendingFee || 0), 0);
  const currency = settings.currency || "$";

  const filtered = pendingStudents.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendReminder = (student) => {
    showToast(`Payment reminder SMS dispatched to ${student.parentPhone} (${student.parentName})`, "info");
  };

  const handleBroadcastReminders = () => {
    showToast(`Dispatched payment reminders to all ${pendingStudents.length} pending student guardians via SMS/Email.`, "success");
  };

  return (
    <div>
      {/* Outstanding Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
          marginBottom: "1.5rem"
        }}
      >
        <div
          style={{
            background: "#fff1f2",
            border: "1px solid #fecdd3",
            borderRadius: "12px",
            padding: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem"
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "10px",
              background: "#ef4444",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.8rem", color: "#9f1239", fontWeight: "700", textTransform: "uppercase" }}>
              Total Outstanding Dues
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#9f1239" }}>
              {currency}{totalPendingAmount.toLocaleString()}
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "12px",
            padding: "1.25rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div>
            <div style={{ fontSize: "0.8rem", color: "#92400e", fontWeight: "700", textTransform: "uppercase" }}>
              Students With Pending Dues
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#92400e" }}>
              {pendingStudents.length} Students
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleBroadcastReminders}>
            <Send size={14} />
            <span>Notify All</span>
          </button>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div className="search-box" style={{ maxWidth: "340px", flex: 1 }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search pending student or class..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Student Name</th>
              <th>Class</th>
              <th>Parent / Guardian</th>
              <th>Phone</th>
              <th>Total Bill</th>
              <th>Outstanding Due</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                  🎉 Awesome! No students have outstanding pending fees.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span style={{ fontFamily: "monospace", fontWeight: "700" }}>{s.rollNo}</span>
                  </td>
                  <td>
                    <strong>{s.name}</strong>
                  </td>
                  <td>{s.className}</td>
                  <td>{s.parentName || "Guardian"}</td>
                  <td>{s.parentPhone}</td>
                  <td>{currency}{Number(s.totalFee || 0).toLocaleString()}</td>
                  <td>
                    <strong style={{ color: "#dc2626", fontSize: "1rem" }}>
                      {currency}{Number(s.pendingFee || 0).toLocaleString()}
                    </strong>
                  </td>
                  <td>
                    <Badge status={s.feeStatus} />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleSendReminder(s)}
                        title="Send SMS Payment Reminder"
                      >
                        <Send size={13} />
                        <span>Remind</span>
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onCollectFeeForStudent(s.id)}
                      >
                        <PlusCircle size={13} />
                        <span>Collect</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
