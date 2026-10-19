import React, { useState } from "react";
import { Search, User, CreditCard, CalendarCheck, Phone, Mail, MapPin, Printer } from "lucide-react";
import { useSchool } from "../../context/SchoolContext";
import { formatRupees, paiseToRupees } from "../../utils/currency";
import Badge from "../../components/common/Badge";

export default function StudentDetailsPage({ onOpenCollectFee }) {
  const { students, studentFeeAccounts, feePayments } = useSchool();
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || "");
  const [searchTerm, setSearchTerm] = useState("");

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const currentFeeAccount = studentFeeAccounts.find((a) => a.studentId === currentStudent?.id);
  const studentPayments = feePayments.filter((p) => p.studentId === currentStudent?.id);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.grNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Student Comprehensive Profile & Ledger</h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Academic record, admission credentials, parent contact details, and financial account ledger
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "1.5rem" }}>
        {/* Student Selector Sidebar */}
        <div className="card" style={{ padding: "1rem" }}>
          <div className="search-box" style={{ marginBottom: "1rem" }}>
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Filter student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ maxHeight: "600px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {filteredStudents.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStudentId(s.id)}
                style={{
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: s.id === currentStudent?.id ? "var(--primary)" : "var(--border-color)",
                  background: s.id === currentStudent?.id ? "#eef2ff" : "#ffffff",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <div style={{ fontWeight: "700", fontSize: "0.92rem", color: "#0f172a" }}>{s.name}</div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  GR: {s.grNumber} • {s.className}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Profile & Ledger Display */}
        {currentStudent && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Top Identity Card */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "16px",
                      background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
                      color: "#ffffff",
                      fontSize: "1.75rem",
                      fontWeight: "800",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    {currentStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                      {currentStudent.name}
                    </h2>
                    <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", color: "#64748b", marginTop: "4px" }}>
                      <span>GR No: <strong>{currentStudent.grNumber}</strong></span>
                      <span>Admission: <strong>{currentStudent.admissionNumber}</strong></span>
                      <span>Class: <strong>{currentStudent.className} - {currentStudent.division || "A"}</strong></span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onOpenCollectFee(currentStudent.id)}
                  >
                    <CreditCard size={15} />
                    <span>Collect Fee</span>
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
                    <Printer size={15} />
                    <span>Print Ledger</span>
                  </button>
                </div>
              </div>

              {/* Contact Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                  marginTop: "1.5rem",
                  paddingTop: "1.5rem",
                  borderTop: "1px solid var(--border-light)"
                }}
              >
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Parent / Guardian</div>
                  <div style={{ fontWeight: "700", marginTop: "2px" }}>{currentStudent.parentName}</div>
                </div>

                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Contact Phone</div>
                  <div style={{ fontWeight: "600", marginTop: "2px" }}>{currentStudent.parentPhone}</div>
                </div>

                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Academic Year</div>
                  <div style={{ fontWeight: "600", marginTop: "2px" }}>{currentStudent.academicYear}</div>
                </div>

                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Attendance Record</div>
                  <div style={{ fontWeight: "700", color: "#10b981", marginTop: "2px" }}>{currentStudent.attendancePercentage || 95}% Present</div>
                </div>
              </div>
            </div>

            {/* Financial Ledger Section */}
            {currentFeeAccount && (
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title">Fee Account Financial Summary</h4>
                  <Badge status={currentFeeAccount.paymentStatus} />
                </div>
                <div className="card-body">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
                    <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px" }}>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Total Applicable Fee</div>
                      <div style={{ fontSize: "1.35rem", fontWeight: "800" }}>
                        {formatRupees(paiseToRupees(currentFeeAccount.totalApplicableFeePaise))}
                      </div>
                    </div>

                    <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px" }}>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Scholarship / Discount</div>
                      <div style={{ fontSize: "1.35rem", fontWeight: "800", color: "#2563eb" }}>
                        {formatRupees(paiseToRupees(currentFeeAccount.discountPaise || 0))}
                      </div>
                    </div>

                    <div style={{ background: "#ecfdf5", padding: "1rem", borderRadius: "8px" }}>
                      <div style={{ fontSize: "0.75rem", color: "#065f46" }}>Total Paid Amount</div>
                      <div style={{ fontSize: "1.35rem", fontWeight: "800", color: "#059669" }}>
                        {formatRupees(paiseToRupees(currentFeeAccount.totalPaidPaise))}
                      </div>
                    </div>

                    <div style={{ background: "#fef2f2", padding: "1rem", borderRadius: "8px" }}>
                      <div style={{ fontSize: "0.75rem", color: "#991b1b" }}>Remaining Balance</div>
                      <div style={{ fontSize: "1.35rem", fontWeight: "800", color: "#dc2626" }}>
                        {formatRupees(paiseToRupees(currentFeeAccount.remainingBalancePaise))}
                      </div>
                    </div>
                  </div>

                  <h5 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "0.75rem" }}>Recorded Payment History</h5>
                  <div className="table-responsive" style={{ border: "none" }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Receipt #</th>
                          <th>Date</th>
                          <th>Fee Component</th>
                          <th>Method</th>
                          <th>Txn Reference</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentPayments.length === 0 ? (
                          <tr>
                            <td colSpan="6" style={{ textAlign: "center", padding: "1.5rem", color: "#94a3b8" }}>
                              No payment transactions recorded for this student yet.
                            </td>
                          </tr>
                        ) : (
                          studentPayments.map((p) => (
                            <tr key={p.id}>
                              <td style={{ fontFamily: "monospace", fontWeight: "700" }}>{p.receiptNo}</td>
                              <td>{p.paymentDate}</td>
                              <td>{p.feeComponent}</td>
                              <td>{p.paymentMode}</td>
                              <td>{p.transactionReference}</td>
                              <td>
                                <strong style={{ color: "#16a34a" }}>
                                  {formatRupees(paiseToRupees(p.amountPaise))}
                                </strong>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
