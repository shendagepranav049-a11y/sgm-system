import React, { useState } from "react";
import { BarChart3, Download, Printer, Filter, Calendar, FileSpreadsheet } from "lucide-react";
import { useSchool } from "../../context/SchoolContext";
import { formatRupees, paiseToRupees } from "../../utils/currency";

export default function FeeReportsPage() {
  const { studentFeeAccounts, feePayments, classes, academicYears } = useSchool();
  const [reportType, setReportType] = useState("classwise");
  const [selectedYear, setSelectedYear] = useState("2025-2026");

  // Export to CSV Function
  const handleExportCSV = () => {
    let csvRows = [];
    if (reportType === "classwise") {
      csvRows.push(["Class", "Enrolled Students", "Total Invoiced (INR)", "Total Collected (INR)", "Pending Dues (INR)", "Realization Rate (%)"]);
      classes.forEach((c) => {
        const accts = studentFeeAccounts.filter((a) => a.className === c.name);
        const invoiced = accts.reduce((sum, a) => sum + paiseToRupees(a.totalPayablePaise), 0);
        const collected = accts.reduce((sum, a) => sum + paiseToRupees(a.totalPaidPaise), 0);
        const pending = Math.max(0, invoiced - collected);
        const rate = invoiced > 0 ? Math.round((collected / invoiced) * 100) : 0;
        csvRows.push([c.name, accts.length, invoiced, collected, pending, `${rate}%`]);
      });
    } else if (reportType === "pending") {
      csvRows.push(["GR Number", "Student Name", "Class", "Total Payable (INR)", "Amount Paid (INR)", "Pending Due (INR)", "Status"]);
      studentFeeAccounts.filter(a => Number(a.remainingBalancePaise) > 0).forEach((a) => {
        csvRows.push([a.grNumber, a.studentName, a.className, paiseToRupees(a.totalPayablePaise), paiseToRupees(a.totalPaidPaise), paiseToRupees(a.remainingBalancePaise), a.paymentStatus]);
      });
    } else {
      csvRows.push(["Receipt No", "Date", "Student Name", "GR Number", "Class", "Payment Mode", "Amount (INR)", "Status"]);
      feePayments.forEach((p) => {
        csvRows.push([p.receiptNo, p.paymentDate, p.studentName, p.grNumber, p.className, p.paymentMode, paiseToRupees(p.amountPaise), p.status]);
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SGM_Fee_Report_${reportType}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Institutional Financial Reports & Audits</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Aggregated revenue reporting by class, payment channels, student accounts, and discounts
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
            <Printer size={15} />
            <span>Print Report</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleExportCSV}>
            <Download size={15} />
            <span>Export to CSV</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <label className="form-label">Report Category</label>
            <select
              className="form-select"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="classwise">Class-wise Revenue Breakdown</option>
              <option value="pending">Pending & Overdue Dues Report</option>
              <option value="transactions">Complete Payments Ledger</option>
              <option value="discounts">Discounts & Scholarships Report</option>
            </select>
          </div>

          <div>
            <label className="form-label">Academic Session</label>
            <select
              className="form-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.name}>
                  {ay.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Render Selected Report View */}
      {reportType === "classwise" && (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Class Level</th>
                <th>Students</th>
                <th>Total Invoiced</th>
                <th>Total Collected</th>
                <th>Pending Dues</th>
                <th>Collection Rate</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => {
                const accts = studentFeeAccounts.filter((a) => a.className === c.name);
                const invoiced = accts.reduce((sum, a) => sum + paiseToRupees(a.totalPayablePaise), 0);
                const collected = accts.reduce((sum, a) => sum + paiseToRupees(a.totalPaidPaise), 0);
                const pending = Math.max(0, invoiced - collected);
                const rate = invoiced > 0 ? Math.round((collected / invoiced) * 100) : 0;

                return (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td>{accts.length} Students</td>
                    <td>{formatRupees(invoiced)}</td>
                    <td style={{ color: "#16a34a", fontWeight: "700" }}>{formatRupees(collected)}</td>
                    <td style={{ color: pending > 0 ? "#dc2626" : "#64748b" }}>{formatRupees(pending)}</td>
                    <td>
                      <span className={`badge ${rate >= 90 ? "badge-paid" : rate >= 50 ? "badge-partial" : "badge-unpaid"}`}>
                        {rate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {reportType === "pending" && (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>GR Number</th>
                <th>Student</th>
                <th>Class</th>
                <th>Total Billable</th>
                <th>Amount Paid</th>
                <th>Outstanding Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {studentFeeAccounts.filter(a => Number(a.remainingBalancePaise) > 0).map((a) => (
                <tr key={a.id}>
                  <td style={{ fontFamily: "monospace", fontWeight: "700" }}>{a.grNumber}</td>
                  <td><strong>{a.studentName}</strong></td>
                  <td>{a.className}</td>
                  <td>{formatRupees(paiseToRupees(a.totalPayablePaise))}</td>
                  <td style={{ color: "#16a34a" }}>{formatRupees(paiseToRupees(a.totalPaidPaise))}</td>
                  <td><strong style={{ color: "#dc2626" }}>{formatRupees(paiseToRupees(a.remainingBalancePaise))}</strong></td>
                  <td><span className="badge badge-unpaid">{a.paymentStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportType === "discounts" && (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>GR Number</th>
                <th>Student</th>
                <th>Class</th>
                <th>Applicable Base Fee</th>
                <th>Scholarship / Discount</th>
                <th>Net Payable</th>
              </tr>
            </thead>
            <tbody>
              {studentFeeAccounts.filter(a => Number(a.discountPaise || 0) > 0).map((a) => (
                <tr key={a.id}>
                  <td style={{ fontFamily: "monospace", fontWeight: "700" }}>{a.grNumber}</td>
                  <td><strong>{a.studentName}</strong></td>
                  <td>{a.className}</td>
                  <td>{formatRupees(paiseToRupees(a.totalApplicableFeePaise))}</td>
                  <td style={{ color: "#2563eb", fontWeight: "800" }}>
                    {formatRupees(paiseToRupees(a.discountPaise))}
                  </td>
                  <td><strong>{formatRupees(paiseToRupees(a.totalPayablePaise))}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportType === "transactions" && (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Date</th>
                <th>Student</th>
                <th>GR Number</th>
                <th>Mode</th>
                <th>Amount</th>
                <th>Recorded By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {feePayments.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: "monospace", fontWeight: "700" }}>{p.receiptNo}</td>
                  <td>{p.paymentDate}</td>
                  <td><strong>{p.studentName}</strong></td>
                  <td>{p.grNumber}</td>
                  <td>{p.paymentMode}</td>
                  <td><strong style={{ color: "#16a34a" }}>{formatRupees(paiseToRupees(p.amountPaise))}</strong></td>
                  <td>{p.recordedBy}</td>
                  <td><span className="badge badge-paid">{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
