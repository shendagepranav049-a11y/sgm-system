import React from "react";
import { BarChart3, TrendingUp, PieChart, Printer, Users, CreditCard } from "lucide-react";
import { useSchool } from "../context/SchoolContext";

export default function ReportsPage() {
  const { students, teachers, classes, feePayments, totalFeesCollected, totalPendingFees, totalExpectedFees, settings } = useSchool();
  const currency = settings.currency || "$";

  const recoveryRate = totalExpectedFees > 0 ? Math.round((totalFeesCollected / totalExpectedFees) * 100) : 0;
  const boysCount = students.filter((s) => s.gender === "Male").length;
  const girlsCount = students.filter((s) => s.gender === "Female").length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Comprehensive Institutional Analytics</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            High-level performance, demographic distributions, and financial metrics
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
          <Printer size={15} />
          <span>Print Analytics Report</span>
        </button>
      </div>

      {/* Top 3 Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginBottom: "1.75rem" }}>
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase" }}>
            Total Student Enrollment
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-main)", margin: "0.5rem 0" }}>
            {students.length} Students
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Ratio: {boysCount} Boys ({Math.round((boysCount / (students.length || 1)) * 100)}%) • {girlsCount} Girls ({Math.round((girlsCount / (students.length || 1)) * 100)}%)
          </div>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase" }}>
            Faculty & Student Ratio
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "800", color: "var(--primary)", margin: "0.5rem 0" }}>
            1 : {teachers.length > 0 ? Math.round(students.length / teachers.length) : students.length}
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            {teachers.length} certified teachers across {classes.length} classroom divisions
          </div>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase" }}>
            Fee Realization Rate
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "800", color: "#10b981", margin: "0.5rem 0" }}>
            {recoveryRate}%
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            {currency}{totalFeesCollected.toLocaleString()} collected of {currency}{totalExpectedFees.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Classwise Student Distribution */}
      <div className="card" style={{ marginBottom: "1.75rem" }}>
        <div className="card-header">
          <h4 className="card-title">Enrolled Students By Class Level</h4>
        </div>
        <div className="card-body">
          {classes.map((c) => {
            const count = students.filter((s) => s.className === c.name || s.classId === c.id).length;
            const pct = students.length > 0 ? Math.round((count / students.length) * 100) : 0;
            return (
              <div key={c.id} style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", marginBottom: "4px" }}>
                  <span style={{ fontWeight: "700" }}>{c.name} ({c.section}) - Teacher: {c.classTeacher}</span>
                  <span style={{ color: "var(--text-secondary)" }}>{count} Students ({pct}%)</span>
                </div>
                <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #4f46e5, #0ea5e9)",
                      borderRadius: "999px"
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
