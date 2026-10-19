import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SchoolProvider, useSchool } from "./context/SchoolContext";
import Sidebar from "./components/common/Sidebar";
import Header from "./components/common/Header";
import Dashboard from "./pages/Dashboard";
import AcademicYearsPage from "./pages/academic/AcademicYearsPage";
import ClassesPage from "./pages/ClassesPage";
import DivisionsPage from "./pages/academic/DivisionsPage";
import SubjectsPage from "./pages/academic/SubjectsPage";
import TimetablePage from "./pages/TimetablePage";
import StudentsPage from "./pages/StudentsPage";
import StudentDetailsPage from "./pages/students/StudentDetailsPage";
import StudentPromotionPage from "./pages/students/StudentPromotionPage";
import TeachersPage from "./pages/TeachersPage";
import AttendancePage from "./pages/AttendancePage";
import ExamsPage from "./pages/ExamsPage";
import ResultsPage from "./pages/ResultsPage";
import ReportCardsPage from "./pages/examination/ReportCardsPage";
import FeesDashboardPage from "./pages/fees/FeesDashboardPage";
import FeeStructurePage from "./pages/fees/FeeStructurePage";
import CollectFeesPage from "./pages/fees/CollectFeesPage";
import StudentFeeDetailsPage from "./pages/fees/StudentFeeDetailsPage";
import PendingFeesPage from "./pages/fees/PendingFeesPage";
import PaymentHistoryPage from "./pages/fees/PaymentHistoryPage";
import FeeReceiptsPage from "./pages/fees/FeeReceiptsPage";
import FeeReportsPage from "./pages/fees/FeeReportsPage";
import HomeworkPage from "./pages/homework/HomeworkPage";
import NoticesPage from "./pages/NoticesPage";
import ReportsPage from "./pages/ReportsPage";
import UsersRolesPage from "./pages/users/UsersRolesPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import CollectFeeModal from "./components/fees/CollectFeeModal";
import FeeReceiptModal from "./components/fees/FeeReceiptModal";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

function MainPortal() {
  const { currentUser, loading: authLoading } = useAuth();
  const { toast } = useSchool();
  const [activeRoute, setActiveRoute] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Quick Action Modal States
  const [globalCollectFeeOpen, setGlobalCollectFeeOpen] = useState(false);
  const [selectedStudentForFee, setSelectedStudentForFee] = useState("");
  const [latestPayment, setLatestPayment] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-app)",
          flexDirection: "column",
          gap: "1rem"
        }}
      >
        <div className="brand-icon-box" style={{ width: "56px", height: "56px" }}>
          SGM
        </div>
        <div style={{ color: "var(--text-secondary)", fontWeight: "600" }}>
          Loading SGM School ERP System...
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  const handleOpenGlobalFee = (studentId = "") => {
    setSelectedStudentForFee(studentId);
    setGlobalCollectFeeOpen(true);
  };

  const handlePaymentCompleted = (result) => {
    const payment = result.payment || result;
    setLatestPayment(payment);
    setReceiptModalOpen(true);
  };

  return (
    <div className="app-container">
      {/* Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          className="sidebar-mobile-overlay no-print"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar with Accordion Submenus */}
      <Sidebar
        activeRoute={activeRoute}
        onNavigate={(route) => {
          setActiveRoute(route);
          setMobileSidebarOpen(false);
        }}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Wrapper */}
      <div className="main-wrapper">
        <Header
          activeRoute={activeRoute}
          onOpenCollectFee={() => handleOpenGlobalFee("")}
          onToggleMobileMenu={() => setMobileSidebarOpen((prev) => !prev)}
        />

        <main className="content-area">
          {/* 1. Dashboard */}
          {activeRoute === "dashboard" && (
            <Dashboard
              onNavigate={(route) => setActiveRoute(route)}
              onOpenCollectFee={() => handleOpenGlobalFee("")}
            />
          )}

          {/* 2. Academic Management */}
          {activeRoute === "academic-years" && <AcademicYearsPage />}
          {activeRoute === "classes" && (
            <ClassesPage onNavigateToStudents={() => setActiveRoute("students")} />
          )}
          {activeRoute === "divisions" && <DivisionsPage />}
          {activeRoute === "subjects" && <SubjectsPage />}
          {activeRoute === "timetable" && <TimetablePage />}

          {/* 3. Students */}
          {activeRoute === "students" && (
            <StudentsPage onOpenCollectFee={(stdId) => handleOpenGlobalFee(stdId)} />
          )}
          {activeRoute === "students-add" && (
            <StudentsPage onOpenCollectFee={(stdId) => handleOpenGlobalFee(stdId)} />
          )}
          {activeRoute === "student-details" && (
            <StudentDetailsPage onOpenCollectFee={(stdId) => handleOpenGlobalFee(stdId)} />
          )}
          {activeRoute === "student-promotion" && <StudentPromotionPage />}

          {/* 4. Teachers */}
          {(activeRoute === "teachers" || activeRoute === "teachers-add" || activeRoute === "teacher-details") && (
            <TeachersPage />
          )}

          {/* 5. Attendance */}
          {(activeRoute === "attendance-student" || activeRoute === "attendance-teacher" || activeRoute === "attendance-reports") && (
            <AttendancePage />
          )}

          {/* 6. Examination */}
          {activeRoute === "exams" && (
            <ExamsPage onNavigateToResults={() => setActiveRoute("results")} />
          )}
          {activeRoute === "results" && <ResultsPage />}
          {activeRoute === "report-cards" && <ReportCardsPage />}

          {/* 7. Fees Management Submenus */}
          {activeRoute === "fees-dashboard" && (
            <FeesDashboardPage
              onOpenCollectFee={(id) => handleOpenGlobalFee(id)}
              onNavigate={(r) => setActiveRoute(r)}
            />
          )}
          {activeRoute === "fees-structure" && <FeeStructurePage />}
          {activeRoute === "fees-collect" && (
            <CollectFeesPage
              preselectedStudentId={selectedStudentForFee}
              onCollectComplete={handlePaymentCompleted}
            />
          )}
          {activeRoute === "fees-students" && (
            <StudentFeeDetailsPage
              onCollectFeeForStudent={(id) => handleOpenGlobalFee(id)}
            />
          )}
          {activeRoute === "fees-pending" && (
            <PendingFeesPage
              onCollectFeeForStudent={(id) => handleOpenGlobalFee(id)}
            />
          )}
          {activeRoute === "fees-history" && <PaymentHistoryPage />}
          {activeRoute === "fees-receipts" && <FeeReceiptsPage />}
          {activeRoute === "fees-reports" && <FeeReportsPage />}

          {/* 8. Homework */}
          {activeRoute === "homework" && <HomeworkPage />}

          {/* 9. Notice Board */}
          {activeRoute === "notices" && <NoticesPage />}

          {/* 10. Reports */}
          {activeRoute === "reports" && <ReportsPage />}

          {/* 11. Users & Roles */}
          {activeRoute === "users-roles" && <UsersRolesPage />}

          {/* 12. Settings */}
          {activeRoute === "settings" && <SettingsPage />}
        </main>
      </div>

      {/* Global Quick Action Modals */}
      <CollectFeeModal
        isOpen={globalCollectFeeOpen}
        onClose={() => setGlobalCollectFeeOpen(false)}
        preselectedStudentId={selectedStudentForFee}
        onPaymentComplete={handlePaymentCompleted}
      />

      {latestPayment && (
        <FeeReceiptModal
          isOpen={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          payment={latestPayment}
        />
      )}

      {/* Global Toasts */}
      {toast && (
        <div className="toast-container no-print">
          <div className={`toast ${toast.type}`}>
            {toast.type === "success" && <CheckCircle2 size={18} style={{ color: "#10b981" }} />}
            {toast.type === "error" && <AlertCircle size={18} style={{ color: "#ef4444" }} />}
            {toast.type === "info" && <Info size={18} style={{ color: "#3b82f6" }} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SchoolProvider>
        <MainPortal />
      </SchoolProvider>
    </AuthProvider>
  );
}
