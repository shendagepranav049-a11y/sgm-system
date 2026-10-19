import React, { useState } from "react";
import { Search, Filter, PlusCircle, CheckCircle } from "lucide-react";
import { useSchool } from "../../context/SchoolContext";
import Badge from "../common/Badge";

export default function StudentFeeDetailsTab({ onCollectFeeForStudent }) {
  const { students, classes, settings } = useSchool();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const currency = settings.currency || "$";

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === "all" || s.className === selectedClass;
    const matchesStatus = statusFilter === "all" || s.feeStatus.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesClass && matchesStatus;
  });

  return (
    <div>
      {/* Filters & Search */}
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
        <div className="search-box" style={{ flex: "1", maxWidth: "340px" }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by student name or roll..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <select
            className="form-select"
            style={{ width: "auto" }}
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="all">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name} ({c.section})
              </option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ width: "auto" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
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
              <th>Total Fee</th>
              <th>Paid Amount</th>
              <th>Pending Dues</th>
              <th>Payment Progress</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                  No students matched your search criteria.
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const total = Number(s.totalFee || 0);
                const paid = Number(s.paidFee || 0);
                const percent = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

                return (
                  <tr key={s.id}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontWeight: "700" }}>{s.rollNo}</span>
                    </td>
                    <td>
                      <strong>{s.name}</strong>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{s.parentPhone}</div>
                    </td>
                    <td>{s.className}</td>
                    <td>{currency}{total.toLocaleString()}</td>
                    <td style={{ color: "#16a34a", fontWeight: "600" }}>
                      {currency}{paid.toLocaleString()}
                    </td>
                    <td>
                      <strong style={{ color: Number(s.pendingFee || 0) > 0 ? "#dc2626" : "var(--text-muted)" }}>
                        {currency}{Number(s.pendingFee || 0).toLocaleString()}
                      </strong>
                    </td>
                    <td style={{ minWidth: "140px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div
                          style={{
                            flex: 1,
                            height: "6px",
                            background: "#e2e8f0",
                            borderRadius: "999px",
                            overflow: "hidden"
                          }}
                        >
                          <div
                            style={{
                              width: `${percent}%`,
                              height: "100%",
                              background: percent === 100 ? "#10b981" : percent > 0 ? "#f59e0b" : "#ef4444",
                              borderRadius: "999px"
                            }}
                          ></div>
                        </div>
                        <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>
                          {percent}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <Badge status={s.feeStatus} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {Number(s.pendingFee || 0) > 0 ? (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onCollectFeeForStudent(s.id)}
                        >
                          <PlusCircle size={14} />
                          <span>Collect</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: "0.82rem", color: "#16a34a", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <CheckCircle size={14} /> Cleared
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
