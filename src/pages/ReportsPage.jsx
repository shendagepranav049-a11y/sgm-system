import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Printer,
  Users,
  CreditCard,
  Download,
  CalendarCheck,
  Award,
  BookOpen,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet
} from "lucide-react";
import { useSchool } from "../context/SchoolContext";
import { formatRupees, paiseToRupees } from "../utils/currency";

export default function ReportsPage() {
  const {
    students = [],
    teachers = [],
    classes = [],
    feePayments = [],
    studentFeeAccounts = [],
    exams = [],
    results = [],
    attendance = [],
    totalFeesCollected = 0,
    totalPendingFees = 0,
    totalExpectedFees = 0,
    settings = {}
  } = useSchool();

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedClassFilter, setSelectedClassFilter] = useState("all");

  const currency = settings.currency || "₹";

  // Calculations with safe fallbacks
  const safeExpected = Number(totalExpectedFees) || 0;
  const safeCollected = Number(totalFeesCollected) || 0;
  const safePending = Number(totalPendingFees) || 0;
  const recoveryRate = safeExpected > 0 ? Math.round((safeCollected / safeExpected) * 100) : 0;

  const totalStudents = students.length;
  const boysCount = students.filter((s) => s.gender === "Male").length;
  const girlsCount = students.filter((s) => s.gender === "Female").length;
  const boysPct = totalStudents > 0 ? Math.round((boysCount / totalStudents) * 100) : 0;
  const girlsPct = totalStudents > 0 ? Math.round((girlsCount / totalStudents) * 100) : 0;

  // Filter students if class selected
  const filteredStudents = selectedClassFilter === "all"
    ? students
    : students.filter((s) => s.className === selectedClassFilter);

  // Overdue accounts
  const overdueAccounts = studentFeeAccounts.filter((a) => a.paymentStatus === "Overdue" || Number(a.remainingBalancePaise || 0) > 0);

  // Export to CSV helper
  const exportToCSV = (filename, rows) => {
    if (!rows || !rows.length) {
      alert("No data available to export.");
      return;
    }
    const separator = ",";
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      "\n" +
      rows
        .map((row) =>
          keys
            .map((k) => {
              let cell = row[k] === null || row[k] === undefined ? "" : row[k];
              cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
              return cell;
            })
            .join(separator)
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportStudents = () => {
    const data = filteredStudents.map((s) => ({
      GR_Number: s.grNumber || s.rollNo || "N/A",
      Name: s.name,
      Class: s.className,
      Gender: s.gender || "N/A",
      Parent_Phone: s.parentPhone || "N/A",
      Status: s.status || "Active"
    }));
    exportToCSV(`SGM_Students_Report_${new Date().toISOString().split("T")[0]}.csv`, data);
  };

  const handleExportFees = () => {
    const data = studentFeeAccounts.map((a) => ({
      GR_Number: a.grNumber || "N/A",
      Student_Name: a.studentName,
      Class: a.className,
      Total_Payable_Rs: paiseToRupees(a.totalPayablePaise),
      Paid_Rs: paiseToRupees(a.totalPaidPaise),
      Remaining_Due_Rs: paiseToRupees(a.remainingBalancePaise),
      Status: a.paymentStatus
    }));
    exportToCSV(`SGM_Fees_Ledger_${new Date().toISOString().split("T")[0]}.csv`, data);
  };

  return (
    <div className="reports-container">
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem"
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.4rem",
              fontWeight: "800",
              color: "#0f172a",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <BarChart3 size={24} style={{ color: "var(--primary)" }} />
            Institutional Reports & Analytics (अहवाल व आकडेवारी)
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "4px 0 0" }}>
            विद्यार्थी नोंदणी, आर्थिक संकलन, परीक्षा निकाल आणि उपस्थितीचे अधिकृत अहवाल
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => window.print()}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Printer size={15} />
            <span>Print Report</span>
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={activeTab === "fees" ? handleExportFees : handleExportStudents}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Modern Report Tab Bar */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          borderBottom: "1px solid var(--border-color)",
          paddingBottom: "0.75rem",
          marginBottom: "1.5rem",
          overflowX: "auto"
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`btn btn-sm ${activeTab === "overview" ? "btn-primary" : "btn-secondary"}`}
          style={{ borderRadius: "20px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <TrendingUp size={15} />
          <span>📊 Overview Summary</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("students")}
          className={`btn btn-sm ${activeTab === "students" ? "btn-primary" : "btn-secondary"}`}
          style={{ borderRadius: "20px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Users size={15} />
          <span>👥 Student Enrollment</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("fees")}
          className={`btn btn-sm ${activeTab === "fees" ? "btn-primary" : "btn-secondary"}`}
          style={{ borderRadius: "20px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <CreditCard size={15} />
          <span>💳 Fees & Financial Ledger</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("exams")}
          className={`btn btn-sm ${activeTab === "exams" ? "btn-primary" : "btn-secondary"}`}
          style={{ borderRadius: "20px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Award size={15} />
          <span>📝 Academic & Exams</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: EXECUTIVE OVERVIEW                                 */}
      {/* ======================================================== */}
      {activeTab === "overview" && (
        <div>
          {/* Top 4 KPI Metric Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1.25rem",
              marginBottom: "1.75rem"
            }}
          >
            <div className="card" style={{ padding: "1.25rem", borderLeft: "4px solid #4f46e5" }}>
              <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>
                Total Student Enrollment
              </div>
              <div style={{ fontSize: "1.85rem", fontWeight: "800", color: "#0f172a", margin: "0.35rem 0" }}>
                {totalStudents} Students
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                {boysCount} Boys ({boysPct}%) • {girlsCount} Girls ({girlsPct}%)
              </div>
            </div>

            <div className="card" style={{ padding: "1.25rem", borderLeft: "4px solid #0ea5e9" }}>
              <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>
                Faculty & Teacher Strength
              </div>
              <div style={{ fontSize: "1.85rem", fontWeight: "800", color: "#0ea5e9", margin: "0.35rem 0" }}>
                {teachers.length} Faculty
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                Student-Teacher Ratio: 1 : {teachers.length > 0 ? Math.round(totalStudents / teachers.length) : totalStudents || 0}
              </div>
            </div>

            <div className="card" style={{ padding: "1.25rem", borderLeft: "4px solid #10b981" }}>
              <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>
                Total Fee Realization
              </div>
              <div style={{ fontSize: "1.85rem", fontWeight: "800", color: "#10b981", margin: "0.35rem 0" }}>
                {formatRupees(safeCollected)}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                {recoveryRate}% recovered of {formatRupees(safeExpected)}
              </div>
            </div>

            <div className="card" style={{ padding: "1.25rem", borderLeft: "4px solid #ef4444" }}>
              <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>
                Outstanding Dues (एकूण बाकी)
              </div>
              <div style={{ fontSize: "1.85rem", fontWeight: "800", color: "#ef4444", margin: "0.35rem 0" }}>
                {formatRupees(safePending)}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                {overdueAccounts.length} accounts with pending dues
              </div>
            </div>
          </div>

          {/* Class-wise Enrollment Breakdown */}
          <div className="card" style={{ marginBottom: "1.75rem" }}>
            <div className="card-header">
              <h4 className="card-title">Class-Wise Enrollment & Capacity Distribution</h4>
            </div>
            <div className="card-body">
              {classes.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                  कोणताही वर्ग जोडलेला नाही.
                </div>
              ) : (
                classes.map((c) => {
                  const count = students.filter((s) => s.className === c.name || s.classId === c.id).length;
                  const capacity = c.capacity || 40;
                  const pct = Math.min(100, Math.round((count / capacity) * 100));

                  return (
                    <div key={c.id} style={{ marginBottom: "1.25rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", marginBottom: "6px" }}>
                        <span style={{ fontWeight: "700", color: "#0f172a" }}>
                          {c.name} {c.section ? `(${c.section})` : ""} {c.classTeacher ? `• Teacher: ${c.classTeacher}` : ""}
                        </span>
                        <span style={{ color: "var(--text-secondary)", fontWeight: "600" }}>
                          {count} / {capacity} Students ({pct}% Filled)
                        </span>
                      </div>
                      <div style={{ height: "10px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            background: pct > 85 ? "linear-gradient(90deg, #10b981, #059669)" : "linear-gradient(90deg, #4f46e5, #0ea5e9)",
                            borderRadius: "999px",
                            transition: "width 0.4s ease"
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: STUDENT ENROLLMENT REPORT                          */}
      {/* ======================================================== */}
      {activeTab === "students" && (
        <div className="card">
          <div
            className="card-header"
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}
          >
            <div>
              <h4 className="card-title">Student Directory & Demographic Report</h4>
              <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "2px 0 0" }}>
                नोंदणीकृत विद्यार्थ्यांची संपूर्ण यादी आणि तपशील
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <select
                className="form-select"
                style={{ width: "auto" }}
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
              >
                <option value="all">All Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-responsive" style={{ border: "none" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>GR Number</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Gender</th>
                  <th>Parent Phone</th>
                  <th>Admission Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "2.5rem", color: "#94a3b8" }}>
                      कोणताही विद्यार्थी सापडला नाही.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontFamily: "monospace", fontWeight: "700" }}>{s.grNumber || s.rollNo || "N/A"}</td>
                      <td>
                        <strong>{s.name}</strong>
                      </td>
                      <td>{s.className}</td>
                      <td>{s.gender || "Male"}</td>
                      <td>{s.parentPhone || "N/A"}</td>
                      <td>{s.admissionDate || "N/A"}</td>
                      <td>
                        <span className="badge badge-paid">{s.status || "Active"}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: FEES & FINANCIAL REPORT                            */}
      {/* ======================================================== */}
      {activeTab === "fees" && (
        <div className="card">
          <div
            className="card-header"
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}
          >
            <div>
              <h4 className="card-title">Student Fee Account Balances & Ledger</h4>
              <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "2px 0 0" }}>
                प्रत्येक विद्यार्थ्याचे एकूण बिल, जमा रक्कम आणि बाकी फी
              </p>
            </div>
          </div>

          <div className="table-responsive" style={{ border: "none" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>GR Number</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Total Billable</th>
                  <th>Amount Paid</th>
                  <th>Remaining Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {studentFeeAccounts.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "2.5rem", color: "#94a3b8" }}>
                      कोणतेही फी खाते उपलब्ध नाही.
                    </td>
                  </tr>
                ) : (
                  studentFeeAccounts.map((a) => {
                    const payable = paiseToRupees(a.totalPayablePaise);
                    const paid = paiseToRupees(a.totalPaidPaise);
                    const bal = paiseToRupees(a.remainingBalancePaise);

                    return (
                      <tr key={a.id}>
                        <td style={{ fontFamily: "monospace", fontWeight: "700" }}>{a.grNumber || "N/A"}</td>
                        <td>
                          <strong>{a.studentName}</strong>
                        </td>
                        <td>{a.className}</td>
                        <td>{formatRupees(payable)}</td>
                        <td style={{ color: "#16a34a", fontWeight: "600" }}>{formatRupees(paid)}</td>
                        <td>
                          <strong style={{ color: bal > 0 ? "#dc2626" : "#16a34a" }}>{formatRupees(bal)}</strong>
                        </td>
                        <td>
                          <span className={`badge ${bal === 0 ? "badge-paid" : "badge-urgent"}`}>
                            {a.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: ACADEMIC & EXAMS REPORT                            */}
      {/* ======================================================== */}
      {activeTab === "exams" && (
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Assessment Schedules & Student Results</h4>
          </div>
          <div className="table-responsive" style={{ border: "none" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Exam Title</th>
                  <th>Term</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Total Marks</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {exams.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "2.5rem", color: "#94a3b8" }}>
                      कोणतीही परीक्षा शेड्युल केलेली नाही.
                    </td>
                  </tr>
                ) : (
                  exams.map((ex) => (
                    <tr key={ex.id}>
                      <td>
                        <strong>{ex.title}</strong>
                      </td>
                      <td>{ex.term}</td>
                      <td>{ex.startDate}</td>
                      <td>{ex.endDate}</td>
                      <td>{ex.totalMarks || 100}</td>
                      <td>
                        <span className="badge badge-paid">{ex.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
