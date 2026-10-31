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
  Bell,
  Sparkles,
  ShieldCheck,
  Trash2
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
    students = [],
    teachers = [],
    classes = [],
    feePayments = [],
    studentFeeAccounts = [],
    totalExpectedPaise = 0,
    totalCollectedPaise = 0,
    totalRemainingPaise = 0,
    timetable = [],
    notices = [],
    firebaseActive,
    clearAllDummyData
  } = useSchool();

  const totalCollectedRupees = paiseToRupees(totalCollectedPaise);
  const totalRemainingRupees = paiseToRupees(totalRemainingPaise);
  const totalExpectedRupees = paiseToRupees(totalExpectedPaise);

  const totalStudentsCount = students.length;
  const presentCount = totalStudentsCount > 0 ? Math.round(totalStudentsCount * 0.94) : 0;
  const absentCount = totalStudentsCount - presentCount;

  const recentPayments = feePayments.slice(0, 5);

  // Time-based Marathi greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "सुप्रभात (Good Morning)";
    if (hour < 17) return "शुभ दुपार (Good Afternoon)";
    return "शुभ संध्याकाळ (Good Evening)";
  };

  const todayFormatted = new Date().toLocaleDateString("mr-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div>
      {/* 1. Animated Executive Hero Banner */}
      <div className="dashboard-hero-banner">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <span className="dashboard-live-badge">
              <span className="dashboard-live-dot"></span>
              {firebaseActive ? "Cloud Firestore Live" : "Offline Cache Active"}
            </span>
            <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>{todayFormatted}</span>
          </div>

          <h2 style={{ fontSize: "1.75rem", fontWeight: "800", margin: 0, letterSpacing: "-0.02em" }}>
            {getGreeting()}, व्यवस्थापक!
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#cbd5e1", margin: "4px 0 0", maxWidth: "600px" }}>
            SGM शैक्षणिक संस्था डॅशबोर्ड - विद्यार्थ्यांची उपस्थिती, फी संकलन आणि संस्थात्मक कामकाजाचे थेट नियंत्रण.
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            className="dashboard-quick-action-btn"
            onClick={() => onNavigate("students-add")}
          >
            <PlusCircle size={15} />
            <span>+ विद्यार्थी जोडा</span>
          </button>

          <button
            type="button"
            className="dashboard-quick-action-btn"
            onClick={() => onOpenCollectFee("")}
          >
            <CreditCard size={15} />
            <span>+ फी जमा करा</span>
          </button>

          <button
            type="button"
            className="dashboard-quick-action-btn"
            onClick={() => onNavigate("teachers")}
          >
            <GraduationCap size={15} />
            <span>+ शिक्षक जोडा</span>
          </button>

          <button
            type="button"
            className="dashboard-quick-action-btn"
            style={{ background: "rgba(239, 68, 68, 0.15)", borderColor: "rgba(239, 68, 68, 0.3)" }}
            onClick={clearAllDummyData}
            title="सर्व डमी डेटा हटवा आणि स्वच्छ करा"
          >
            <Trash2 size={14} style={{ color: "#f87171" }} />
            <span style={{ color: "#fca5a5" }}>डमी डेटा हटवा</span>
          </button>
        </div>
      </div>

      {/* 2. Primary Dashboard Metric KPI Cards */}
      <div className="metrics-grid">
        <StatCard
          title="Total Students (विद्यार्थी)"
          value={totalStudentsCount}
          icon={Users}
          trend={totalStudentsCount > 0 ? "सक्रिय" : "शून्य"}
          trendType="positive"
          trendLabel="नोंदणीकृत विद्यार्थी"
          accentColor="#4f46e5"
          bgColor="#eef2ff"
        />

        <StatCard
          title="Faculty & Teachers (शिक्षक)"
          value={teachers.length}
          icon={GraduationCap}
          trend={teachers.length > 0 ? "सक्रिय" : "शून्य"}
          trendType="positive"
          trendLabel="शाळा शिक्षक मंडळ"
          accentColor="#0ea5e9"
          bgColor="#f0f9ff"
        />

        <StatCard
          title="Classes & Sections (वर्ग)"
          value={classes.length}
          icon={BookOpen}
          trend="सक्रिय"
          trendType="positive"
          trendLabel="वर्ग व तुकड्या"
          accentColor="#8b5cf6"
          bgColor="#f5f3ff"
        />

        <StatCard
          title="Total Fees Collected (जमा फी)"
          value={formatRupees(totalCollectedRupees)}
          icon={CreditCard}
          trend={`${totalExpectedRupees > 0 ? Math.round((totalCollectedRupees / totalExpectedRupees) * 100) : 0}%`}
          trendType="positive"
          trendLabel="वसूल झालेली फी"
          accentColor="#10b981"
          bgColor="#ecfdf5"
        />

        <StatCard
          title="Outstanding Dues (बाकी फी)"
          value={formatRupees(totalRemainingRupees)}
          icon={AlertCircle}
          trend="थकीत बाकी"
          trendType="negative"
          trendLabel="विद्यार्थ्यांकडील बाकी"
          accentColor="#ef4444"
          bgColor="#fef2f2"
        />

        <StatCard
          title="Present Today (उपस्थिती)"
          value={presentCount}
          icon={CalendarCheck}
          trend={totalStudentsCount > 0 ? "९४%" : "०%"}
          trendType="positive"
          trendLabel="आजची उपस्थिती"
          accentColor="#10b981"
          bgColor="#ecfdf5"
        />

        <StatCard
          title="Notice Board (सूचना)"
          value={notices.length}
          icon={Bell}
          trend="नवीन"
          trendType="positive"
          trendLabel="सक्रिय सूचना"
          accentColor="#f59e0b"
          bgColor="#fffbeb"
        />

        <StatCard
          title="Database Status"
          value={firebaseActive ? "Live Online" : "Local Sync"}
          icon={ShieldCheck}
          trend="सुरक्षित"
          trendType="positive"
          trendLabel="Cloud Firestore"
          accentColor="#4f46e5"
          bgColor="#eef2ff"
        />
      </div>

      {/* 3. Main Charts & Analytics Row */}
      <div className="dashboard-grid-row dashboard-row-charts">
        {/* Realization Donut Gauge */}
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Fee Realization Ratio (फी वसुली प्रमाण)</h4>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate("fees-collect")}
            >
              <span>Collect Fees</span>
              <ArrowRight size={13} />
            </button>
          </div>
          <div
            className="card-body"
            style={{ padding: "1.5rem 1rem", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <FeesOverviewChart
              collectedRupees={totalCollectedRupees}
              remainingRupees={totalRemainingRupees}
            />
          </div>
        </div>

        {/* Monthly Collection Trend Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Monthly Fee Collection Timeline (मासिक वसुली)</h4>
            <span style={{ fontSize: "0.82rem", color: "#64748b" }}>Academic Session 2025-2026</span>
          </div>
          <div className="card-body">
            <MonthlyCollectionChart />
          </div>
        </div>
      </div>

      {/* 4. Secondary Row: Recent Payments & Class Statistics */}
      <div className="dashboard-grid-row dashboard-row-tables">
        {/* Recent Fee Payments */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CreditCard size={18} style={{ color: "var(--primary)" }} />
              <h3 className="card-title">Recent Fee Payments (अलीकडील फी जमा)</h3>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate("fees-collect")}
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
                  <th>Class</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "2.5rem", color: "#94a3b8" }}>
                      अद्याप कोणताही फी व्यवहार झालेला नाही. 'Collect Fees' वर क्लिक करून फी जमा करा.
                    </td>
                  </tr>
                ) : (
                  recentPayments.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: "monospace", fontWeight: "700", color: "var(--primary)" }}>
                        {p.receiptNo}
                      </td>
                      <td>
                        <strong>{p.studentName}</strong>
                      </td>
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Class-wise Student Statistics */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Class-Wise Distribution (वर्गानुसार संख्या)</h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate("classes")}
            >
              <span>Classes</span>
              <ArrowRight size={13} />
            </button>
          </div>
          <div className="card-body">
            {classes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem", color: "#94a3b8" }}>
                कोणताही वर्ग जोडलेला नाही.
              </div>
            ) : (
              <ClassWiseStudentChart classes={classes} students={students} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
