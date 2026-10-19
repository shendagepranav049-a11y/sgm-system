import React from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  CalendarCheck,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Bell
} from "lucide-react";
import StatCard from "../components/common/StatCard";
import Badge from "../components/common/Badge";
import { useSchool } from "../context/SchoolContext";
import { formatRupees, paiseToRupees } from "../utils/currency";
import {
  FeesOverviewChart,
  MonthlyCollectionChart,
  ClassWiseStudentChart
} from "../components/common/DashboardCharts";

export default function Dashboard({ onNavigate, onOpenCollectFee }) {
  const {
    students,
    teachers,
    classes,
    feePayments,
    studentFeeAccounts,
    totalExpectedPaise,
    totalCollectedPaise,
    totalRemainingPaise,
    timetable,
    notices
  } = useSchool();

  const totalCollectedRupees = paiseToRupees(totalCollectedPaise);
  const totalRemainingRupees = paiseToRupees(totalRemainingPaise);
  const totalExpectedRupees = paiseToRupees(totalExpectedPaise);

  // Present / Absent stats
  const totalStudentsCount = students.length;
  const presentCount = Math.round(totalStudentsCount * 0.94);
  const absentCount = totalStudentsCount - presentCount;

  const recentPayments = feePayments.slice(0, 5);
  const todaysClasses = timetable.filter((t) => t.day === "Monday" || !t.day).slice(0, 4);

  return (
    <div>
      {/* 8 Primary Dashboard Statistic KPI Cards */}
      <div className="metrics-grid">
        <StatCard
          title="Total Students"
          value={totalStudentsCount}
          icon={Users}
          trend="+14%"
          trendType="positive"
          trendLabel="enrolled AY 2025-26"
          accentColor="#4f46e5"
          bgColor="#eef2ff"
        />

        <StatCard
          title="Faculty & Teachers"
          value={teachers.length}
          icon={GraduationCap}
          trend="100%"
          trendType="positive"
          trendLabel="active faculty"
          accentColor="#0ea5e9"
          bgColor="#f0f9ff"
        />

        <StatCard
          title="Classes & Sections"
          value={classes.length}
          icon={BookOpen}
          trend="Active"
          trendType="positive"
          trendLabel="academic divisions"
          accentColor="#8b5cf6"
          bgColor="#f5f3ff"
        />

        <StatCard
          title="Present Students"
          value={presentCount}
          icon={CalendarCheck}
          trend="94%"
          trendType="positive"
          trendLabel="today's attendance"
          accentColor="#10b981"
          bgColor="#ecfdf5"
        />

        <StatCard
          title="Absent Students"
          value={absentCount}
          icon={AlertCircle}
          trend="6%"
          trendType="negative"
          trendLabel="unexcused absence"
          accentColor="#ef4444"
          bgColor="#fef2f2"
        />

        <StatCard
          title="Total Fees Collected"
          value={formatRupees(totalCollectedRupees)}
          icon={CreditCard}
          trend={`${totalExpectedRupees > 0 ? Math.round((totalCollectedRupees / totalExpectedRupees) * 100) : 0}%`}
          trendType="positive"
          trendLabel="realized revenue"
          accentColor="#10b981"
          bgColor="#ecfdf5"
        />

        <StatCard
          title="Outstanding Fees"
          value={formatRupees(totalRemainingRupees)}
          icon={AlertCircle}
          trend="Pending"
          trendType="negative"
          trendLabel="student fee dues"
          accentColor="#ef4444"
          bgColor="#fef2f2"
        />

        <StatCard
          title="Average Attendance"
          value="94.6%"
          icon={CalendarCheck}
          trend="+2.1%"
          trendType="positive"
          trendLabel="monthly average"
          accentColor="#f59e0b"
          bgColor="#fffbeb"
        />
      </div>

      {/* Main Charts & Analytics Row */}
      <div className="dashboard-grid-row dashboard-row-charts">
        {/* Realization Donut Gauge */}
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Fee Realization Ratio</h4>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate("fees-dashboard")}
            >
              <span>Fees Portal</span>
              <ArrowRight size={13} />
            </button>
          </div>
          <div className="card-body" style={{ padding: "1.5rem 1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FeesOverviewChart
              collectedRupees={totalCollectedRupees}
              remainingRupees={totalRemainingRupees}
            />
          </div>
        </div>

        {/* Monthly Collection Trend Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Monthly Fee Collection Timeline</h4>
            <span style={{ fontSize: "0.82rem", color: "#64748b" }}>Academic Session 2025-2026</span>
          </div>
          <div className="card-body">
            <MonthlyCollectionChart />
          </div>
        </div>
      </div>

      {/* Secondary Row: Recent Payments & Class Statistics */}
      <div className="dashboard-grid-row dashboard-row-tables">
        {/* Recent Fee Payments */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CreditCard size={18} style={{ color: "var(--primary)" }} />
              <h3 className="card-title">Recent Fee Payments</h3>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate("fees-history")}
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="table-responsive" style={{ border: "none" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Student</th>
                  <th>GR Number</th>
                  <th>Class</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: "monospace", fontWeight: "700", color: "var(--primary)" }}>
                      {p.receiptNo}
                    </td>
                    <td>
                      <strong>{p.studentName}</strong>
                    </td>
                    <td>{p.grNumber}</td>
                    <td>{p.className}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.78rem",
                          background: "#f1f5f9",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "4px"
                        }}
                      >
                        {p.paymentMode}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: "#16a34a" }}>
                        {formatRupees(paiseToRupees(p.amountPaise))}
                      </strong>
                    </td>
                    <td>
                      <Badge status={p.status || "Completed"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Class-wise Student Statistics */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Class-Wise Student Statistics</h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate("classes")}
            >
              <span>Classes</span>
              <ArrowRight size={13} />
            </button>
          </div>
          <div className="card-body">
            <ClassWiseStudentChart classes={classes} students={students} />
          </div>
        </div>
      </div>
    </div>
  );
}
