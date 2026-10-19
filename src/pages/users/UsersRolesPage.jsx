import React, { useState } from "react";
import { ShieldCheck, UserCheck, Key, Lock, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const DEFAULT_STAFF_USERS = [
  { id: "usr-1", name: "Dr. Eleanor Vance", email: "principal@sgmacademy.edu", role: "Super Admin", department: "Executive Board", status: "Active" },
  { id: "usr-2", name: "Marcus Thorne", email: "finance@sgmacademy.edu", role: "Accountant", department: "Accounts & Fees Dept", status: "Active" },
  { id: "usr-3", name: "Sarah Jenkins", email: "s.jenkins@sgmacademy.edu", role: "Teacher", department: "English Literature", status: "Active" },
  { id: "usr-4", name: "David Wright", email: "david.w@example.com", role: "Parent", department: "Parent Portal", status: "Active" },
  { id: "usr-5", name: "Alexander Hayes", email: "a.hayes@student.sgmacademy.edu", role: "Student", department: "Grade 10", status: "Active" }
];

export default function UsersRolesPage() {
  const { currentUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState("Super Admin");

  const rolesCatalog = [
    {
      name: "Super Admin",
      description: "Unrestricted access across all financial ledgers, audit logs, student accounts, and system settings.",
      permissions: ["Full CRUD on all collections", "Authorize Payment Reversals", "Database Synchronization"]
    },
    {
      name: "Accountant",
      description: "Direct control over fee structures, fee collection, pending dues, receipt generation, and financial reports.",
      permissions: ["Collect Fees", "Create Fee Structures", "Issue Receipts", "Export Reports"]
    },
    {
      name: "Teacher",
      description: "Access to student attendance sheets, exam marks entry, homework assignment, and timetable.",
      permissions: ["Mark Attendance", "Record Exam Scores", "Post Homework", "Class Schedule"]
    },
    {
      name: "Parent / Student",
      description: "Read-only access to individual report cards, fee dues, attendance percentage, and notices.",
      permissions: ["View Fee Receipts", "View Report Cards", "Check Attendance", "Read Circulars"]
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>System Users, Permissions & Role-Based Access</h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Configure institutional roles, security scopes, and credential privileges for Cloud Firestore
        </p>
      </div>

      {/* Role Scopes Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginBottom: "1.75rem" }}>
        {rolesCatalog.map((r) => (
          <div key={r.name} className="card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <ShieldCheck size={20} style={{ color: "var(--primary)" }} />
              <h4 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#0f172a" }}>{r.name}</h4>
            </div>
            <p style={{ fontSize: "0.84rem", color: "#64748b", lineHeight: "1.5", marginBottom: "1rem" }}>
              {r.description}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              {r.permissions.map((p, idx) => (
                <div key={idx} style={{ fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "5px", color: "#059669" }}>
                  <CheckCircle2 size={13} />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Staff Accounts Table */}
      <div className="card">
        <div className="card-header">
          <h4 className="card-title">Configured Staff & User Directory</h4>
        </div>
        <div className="table-responsive" style={{ border: "none" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>User Full Name</th>
                <th>Email Address</th>
                <th>Assigned Role</th>
                <th>Department / Unit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {DEFAULT_STAFF_USERS.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td>
                    <span
                      style={{
                        padding: "0.2rem 0.6rem",
                        borderRadius: "999px",
                        fontSize: "0.78rem",
                        fontWeight: "700",
                        background: "#eef2ff",
                        color: "#4338ca"
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td>{u.department}</td>
                  <td><span className="badge badge-paid">{u.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
