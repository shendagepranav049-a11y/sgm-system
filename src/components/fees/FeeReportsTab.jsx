import React from "react";
import { TrendingUp, PieChart, BarChart2, DollarSign } from "lucide-react";
import { useSchool } from "../../context/SchoolContext";

export default function FeeReportsTab() {
  const { students, feePayments, classes, settings, totalFeesCollected, totalPendingFees, totalExpectedFees } = useSchool();

  const currency = settings.currency || "$";
  const collectionRate = totalExpectedFees > 0 ? Math.round((totalFeesCollected / totalExpectedFees) * 100) : 0;

  // Breakdown by class
  const classBreakdown = classes.map((c) => {
    const classStudents = students.filter((s) => s.className === c.name || s.classId === c.id);
    const expected = classStudents.reduce((acc, s) => acc + (Number(s.totalFee) || 0), 0);
    const collected = classStudents.reduce((acc, s) => acc + (Number(s.paidFee) || 0), 0);
    const pending = Math.max(0, expected - collected);
    const rate = expected > 0 ? Math.round((collected / expected) * 100) : 0;

    return {
      className: `${c.name} (${c.section})`,
      studentCount: classStudents.length,
      expected,
      collected,
      pending,
      rate
    };
  });

  // Breakdown by payment method
  const methodMap = {};
  feePayments.forEach((p) => {
    const m = p.paymentMethod || "Other";
    methodMap[m] = (methodMap[m] || 0) + Number(p.amount || 0);
  });

  const methodList = Object.entries(methodMap).map(([method, total]) => ({
    method,
    total,
    percentage: totalFeesCollected > 0 ? Math.round((total / totalFeesCollected) * 100) : 0
  }));

  return (
    <div>
      {/* Top Level Financial Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
          marginBottom: "1.75rem"
        }}
      >
        <div style={{ background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase" }}>
            Total Revenue Invoiced
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-main)", marginTop: "4px" }}>
            {currency}{totalExpectedFees.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Based on student enrolled fee allocations
          </div>
        </div>

        <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "12px", padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", color: "#065f46", fontWeight: "600", textTransform: "uppercase" }}>
            Total Fees Collected
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#065f46", marginTop: "4px" }}>
            {currency}{totalFeesCollected.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#047857", marginTop: "4px", fontWeight: "600" }}>
            {collectionRate}% Overall Recovery Rate
          </div>
        </div>

        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", color: "#991b1b", fontWeight: "600", textTransform: "uppercase" }}>
            Pending Accounts Receivable
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#991b1b", marginTop: "4px" }}>
            {currency}{totalPendingFees.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#b91c1c", marginTop: "4px" }}>
            Awaiting student clearing
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card" style={{ padding: "1.5rem", marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <h4 style={{ fontSize: "1rem", fontWeight: "700" }}>Total Annual Collection Progress</h4>
          <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--primary)" }}>{collectionRate}%</span>
        </div>
        <div style={{ height: "12px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
          <div
            style={{
              width: `${collectionRate}%`,
              height: "100%",
              background: "linear-gradient(90deg, #4f46e5, #10b981)",
              borderRadius: "999px"
            }}
          ></div>
        </div>
      </div>

      {/* Grid: Class Breakdown and Payment Methods */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
        {/* Class-wise Financial Collection */}
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Class-Wise Fee Collection Breakdown</h4>
          </div>
          <div className="table-responsive" style={{ border: "none" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Students</th>
                  <th>Invoiced</th>
                  <th>Collected</th>
                  <th>Pending</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {classBreakdown.map((c, i) => (
                  <tr key={i}>
                    <td><strong>{c.className}</strong></td>
                    <td>{c.studentCount}</td>
                    <td>{currency}{c.expected.toLocaleString()}</td>
                    <td style={{ color: "#16a34a", fontWeight: "600" }}>{currency}{c.collected.toLocaleString()}</td>
                    <td style={{ color: c.pending > 0 ? "#dc2626" : "var(--text-muted)" }}>{currency}{c.pending.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${c.rate >= 90 ? "badge-paid" : c.rate >= 50 ? "badge-partial" : "badge-unpaid"}`}>
                        {c.rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Channels Share */}
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Payment Channels</h4>
          </div>
          <div className="card-body">
            {methodList.map((m, i) => (
              <div key={i} style={{ marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", marginBottom: "4px" }}>
                  <span style={{ fontWeight: "600" }}>{m.method}</span>
                  <span style={{ color: "var(--text-secondary)" }}>{currency}{m.total.toLocaleString()} ({m.percentage}%)</span>
                </div>
                <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${m.percentage}%`,
                      height: "100%",
                      background: "#4f46e5",
                      borderRadius: "999px"
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
