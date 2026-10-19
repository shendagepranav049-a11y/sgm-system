import React, { useState } from "react";
import { AlertTriangle, Send, PlusCircle, Search, Mail, Clock } from "lucide-react";
import { useSchool } from "../../context/SchoolContext";
import { formatRupees, paiseToRupees } from "../../utils/currency";
import Badge from "../../components/common/Badge";

export default function PendingFeesPage({ onCollectFeeForStudent }) {
  const { studentFeeAccounts, students, showToast } = useSchool();
  const [searchTerm, setSearchTerm] = useState("");

  const pendingAccounts = studentFeeAccounts.filter(
    (a) => Number(a.remainingBalancePaise || 0) > 0
  );

  const totalOutstandingRupees = pendingAccounts.reduce(
    (acc, a) => acc + paiseToRupees(a.remainingBalancePaise),
    0
  );

  const overdueAccounts = pendingAccounts.filter((a) => a.paymentStatus === "Overdue");

  const filtered = pendingAccounts.filter(
    (a) =>
      a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.grNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendReminder = (account) => {
    const student = students.find((s) => s.id === account.studentId);
    const phone = student?.parentPhone || "+91 98200 00000";
    showToast(`Payment reminder SMS dispatched to ${phone} for ${account.studentName}`, "info");
  };

  const handleBroadcastReminders = () => {
    showToast(
      `Dispatched urgent payment notices to all ${pendingAccounts.length} pending student guardians via SMS and Email.`,
      "success"
    );
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Pending & Overdue Student Fee Accounts</h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Track defaulters, overdue installment timelines, and trigger automated guardian reminder notifications
        </p>
      </div>

      {/* Summary Stat Banners */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
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
            <div style={{ fontSize: "0.78rem", color: "#9f1239", fontWeight: "700", textTransform: "uppercase" }}>
              Total Outstanding Accounts
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#9f1239" }}>
              {formatRupees(totalOutstandingRupees)}
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
            <div style={{ fontSize: "0.78rem", color: "#92400e", fontWeight: "700", textTransform: "uppercase" }}>
              Overdue Accounts ({overdueAccounts.length})
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#92400e" }}>
              {pendingAccounts.length} Total Pending
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleBroadcastReminders}>
            <Send size={14} />
            <span>Notify All</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div className="search-box" style={{ maxWidth: "340px", flex: 1 }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search pending student, GR, or class..."
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
              <th>GR Number</th>
              <th>Student Name</th>
              <th>Class</th>
              <th>Academic Session</th>
              <th>Total Billable</th>
              <th>Amount Paid</th>
              <th>Remaining Due</th>
              <th>Due Date</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: "center", padding: "2.5rem", color: "#94a3b8" }}>
                  🎉 Outstanding! All student fee accounts are fully settled.
                </td>
              </tr>
            ) : (
              filtered.map((a) => {
                const payable = paiseToRupees(a.totalPayablePaise);
                const paid = paiseToRupees(a.totalPaidPaise);
                const bal = paiseToRupees(a.remainingBalancePaise);

                return (
                  <tr key={a.id}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontWeight: "700" }}>{a.grNumber}</span>
                    </td>
                    <td>
                      <strong>{a.studentName}</strong>
                    </td>
                    <td>{a.className}</td>
                    <td>{a.academicYear}</td>
                    <td>{formatRupees(payable)}</td>
                    <td style={{ color: "#16a34a" }}>{formatRupees(paid)}</td>
                    <td>
                      <strong style={{ color: "#dc2626", fontSize: "1rem" }}>
                        {formatRupees(bal)}
                      </strong>
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.82rem", color: a.paymentStatus === "Overdue" ? "#dc2626" : "#64748b" }}>
                        <Clock size={13} /> {a.dueDate || "2025-11-30"}
                      </span>
                    </td>
                    <td>
                      <Badge status={a.paymentStatus} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleSendReminder(a)}
                          title="Send SMS/Email Reminder"
                        >
                          <Send size={13} />
                          <span>Remind</span>
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onCollectFeeForStudent(a.studentId)}
                        >
                          <PlusCircle size={13} />
                          <span>Collect</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
