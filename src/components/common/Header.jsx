import React from "react";
import { PlusCircle, RefreshCw, Sparkles, Menu } from "lucide-react";
import { useSchool } from "../../context/SchoolContext";

export default function Header({ activeRoute, onOpenCollectFee, onToggleMobileMenu }) {
  const { firebaseActive, loadAllData, seedFirestore, loading } = useSchool();

  const getPageMeta = (route) => {
    switch (route) {
      case "dashboard":
        return { title: "Executive Overview", subtitle: "Real-time institutional metrics, performance & revenue insights" };
      case "academic-years":
        return { title: "Academic Sessions", subtitle: "Academic calendars, enrollment cycles, and active session config" };
      case "classes":
        return { title: "Classes & Classrooms", subtitle: "Grade divisions, seating capacity, and class teacher allocations" };
      case "divisions":
        return { title: "Class Divisions & Sections", subtitle: "Section management (A, B, C), room assignments and supervisors" };
      case "subjects":
        return { title: "Course Subjects & Syllabus", subtitle: "Academic subject directory, course codes, and departments" };
      case "timetable":
        return { title: "Master Class Timetable", subtitle: "Weekly schedule grid, period allocation, and laboratory bookings" };
      case "students":
      case "students-add":
        return { title: "Student Directory", subtitle: "Student profiles, GR numbers, admissions, and academic standing" };
      case "student-details":
        return { title: "Student Profile & Financial Ledger", subtitle: "Detailed student record, guardian details, and payment ledger" };
      case "student-promotion":
        return { title: "Student Academic Promotion", subtitle: "Advance students to next grade levels for upcoming academic years" };
      case "teachers":
      case "teachers-add":
      case "teacher-details":
        return { title: "Faculty & Staff Directory", subtitle: "Teacher profiles, departmental assignments, and qualifications" };
      case "attendance-student":
      case "attendance-teacher":
      case "attendance-reports":
        return { title: "Daily Attendance Tracker", subtitle: "Monitor presence, absenteeism, and generate attendance sheets" };
      case "exams":
        return { title: "Examinations & Assessments", subtitle: "Exam schedules, evaluation terms, and assessment timelines" };
      case "results":
        return { title: "Student Score & Grade Entry", subtitle: "Marks entry, grading formulas, and score performance" };
      case "report-cards":
        return { title: "Student Academic Report Cards", subtitle: "Official printable term evaluation and grade report cards" };
      case "fees-dashboard":
        return { title: "Fees & Revenue Dashboard", subtitle: "Comprehensive collections, pending dues, cash flow, and analytics" };
      case "fees-structure":
        return { title: "Class Fee Structures", subtitle: "Tuition, lab, sports, and transport components with installments" };
      case "fees-collect":
        return { title: "Collect Student Fees", subtitle: "Process payments, verify balances, and issue verified receipts" };
      case "fees-students":
        return { title: "Student Fee Ledger Balances", subtitle: "Individual student accounts, discounts, and payment status" };
      case "fees-pending":
        return { title: "Pending & Overdue Accounts", subtitle: "Defaulter tracking, overdue dues, and guardian reminder alerts" };
      case "fees-history":
        return { title: "Payment History & Transactions", subtitle: "Complete transaction log, receipt reprints, and audited reversals" };
      case "fees-receipts":
        return { title: "Fee Receipts Repository", subtitle: "Legal historical receipt records and printable document copies" };
      case "fees-reports":
        return { title: "Financial Reports & Exports", subtitle: "Classwise collections, payment channels, and CSV data export" };
      case "homework":
        return { title: "Daily Homework & Assignments", subtitle: "Coursework tasks, submission dates, and teacher directives" };
      case "notices":
        return { title: "Notice Board & Circulars", subtitle: "Broadcast school directives, announcements, and bulletins" };
      case "reports":
        return { title: "Institutional Reports & Analytics", subtitle: "Demographic ratios, enrollment statistics, and performance" };
      case "users-roles":
        return { title: "Users, Roles & Security Permissions", subtitle: "Role-based access control, credentials, and Firestore security" };
      case "settings":
        return { title: "System & School Configuration", subtitle: "School details, currency symbol, and Cloud Firestore setup" };
      default:
        return { title: "SGM Academy ERP", subtitle: "School Management System" };
    }
  };

  const meta = getPageMeta(activeRoute);

  return (
    <header className="top-header no-print">
      <div className="header-left">
        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="mobile-menu-btn no-print"
          onClick={onToggleMobileMenu}
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu size={22} />
        </button>

        <div className="page-title-box">
          <h1 className="page-title">{meta.title}</h1>
          <span className="page-subtitle">{meta.subtitle}</span>
        </div>
      </div>

      <div className="header-right">
        {/* Firebase Live Status Indicator */}
        <div
          className={`status-pill ${firebaseActive ? "live" : "offline"}`}
          title={
            firebaseActive
              ? "Connected to live Google Cloud Firestore"
              : "Running in local storage fallback. Enter your Firebase project credentials in .env to connect."
          }
        >
          <span className={`pulse-dot ${firebaseActive ? "green" : "amber"}`}></span>
          <span>{firebaseActive ? "Cloud Firestore Live" : "Local Mode (No .env keys)"}</span>
        </div>

        {/* Refresh Data */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={loadAllData}
          disabled={loading}
          title="Refresh dataset"
        >
          <RefreshCw size={14} className={loading ? "spin" : ""} />
          <span>Refresh</span>
        </button>

        {/* Quick Action: Seed Cloud Data */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={seedFirestore}
          title="Seed realistic school data to Firestore / Local DB"
        >
          <Sparkles size={14} style={{ color: "#8b5cf6" }} />
          <span>Seed Data</span>
        </button>

        {/* Quick Action: Collect Fee */}
        <button
          className="btn btn-primary btn-sm"
          onClick={onOpenCollectFee}
        >
          <PlusCircle size={15} />
          <span>Collect Fee</span>
        </button>
      </div>
    </header>
  );
}
