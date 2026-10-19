import React, { useState } from "react";
import { Search, Filter, PlusCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { useSchool } from "../../context/SchoolContext";
import { formatRupees, paiseToRupees } from "../../utils/currency";
import Badge from "../../components/common/Badge";

export default function StudentFeeDetailsPage({ onCollectFeeForStudent }) {
  const { studentFeeAccounts, classes, academicYears } = useSchool();
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = studentFeeAccounts.filter((a) => {
    const matchSearch =
      a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.grNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClass = classFilter === "all" || a.className === classFilter;
    const matchStatus = statusFilter === "all" || a.paymentStatus.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchClass && matchStatus;
  });

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Student Fee Accounts & Ledger Balances</h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Official student financial accounts showing discounts, installments, collections, and status
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.25rem"
        }}
      >
        <div className="search-box" style={{ flex: 1, maxWidth: "340px" }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by student name or GR number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <select
            className="form-select"
            style={{ width: "auto" }}
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="all">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ width: "auto" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="partially paid">Partially Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>GR Number</th>
              <th>Student Name</th>
              <th>Class & Div</th>
              <th>Session</th>
              <th>Applicable Fee</th>
              <th>Discount</th>
              <th>Total Payable</th>
              <th>Total Paid</th>
              <th>Remaining Balance</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="11" style={{ textAlign: "center", padding: "2.5rem", color: "#94a3b8" }}>
                  No student fee accounts matched your filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((a) => {
                const payable = paiseToRupees(a.totalPayablePaise);
                const paid = paiseToRupees(a.totalPaidPaise);
                const bal = paiseToRupees(a.remainingBalancePaise);
                const disc = paiseToRupees(a.discountPaise || 0);
                const applic = paiseToRupees(a.totalApplicableFeePaise);

                return (
                  <tr key={a.id}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontWeight: "700" }}>{a.grNumber}</span>
                    </td>
                    <td>
                      <strong>{a.studentName}</strong>
                    </td>
                    <td>
                      {a.className} - {a.division || "A"}
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{a.academicYear}</span>
                    </td>
                    <td>{formatRupees(applic)}</td>
                    <td style={{ color: disc > 0 ? "#2563eb" : "#64748b" }}>
                      {disc > 0 ? formatRupees(disc) : "—"}
                    </td>
                    <td>
                      <strong>{formatRupees(payable)}</strong>
                    </td>
                    <td style={{ color: "#16a34a", fontWeight: "700" }}>
                      {formatRupees(paid)}
                    </td>
                    <td>
                      <strong style={{ color: bal > 0 ? "#dc2626" : "#64748b", fontSize: "0.95rem" }}>
                        {formatRupees(bal)}
                      </strong>
                    </td>
                    <td>
                      <Badge status={a.paymentStatus} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {bal > 0 ? (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onCollectFeeForStudent(a.studentId)}
                        >
                          <PlusCircle size={13} />
                          <span>Collect</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: "0.82rem", color: "#16a34a", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <CheckCircle2 size={14} /> Settled
                        </span>
                      )}
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
