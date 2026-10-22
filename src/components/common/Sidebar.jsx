import React, { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  CalendarCheck,
  CreditCard,
  FileSpreadsheet,
  Award,
  Calendar,
  BookMarked,
  Bell,
  BarChart3,
  ShieldCheck,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Sparkles,
  School,
  Clock,
  Layers,
  ArrowRight,
  X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const SIDEBAR_MODULES = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    route: "dashboard"
  },
  {
    id: "academic",
    label: "Academic Management",
    icon: BookOpen,
    submenus: [
      { id: "academic-years", label: "Academic Year", route: "academic-years" },
      { id: "classes", label: "Classes", route: "classes" },
      { id: "divisions", label: "Divisions", route: "divisions" },
      { id: "subjects", label: "Subjects", route: "subjects" },
      { id: "timetable", label: "Timetable", route: "timetable" }
    ]
  },
  {
    id: "students",
    label: "Students",
    icon: Users,
    submenus: [
      { id: "all-students", label: "All Students", route: "students" },
      { id: "add-student", label: "Add Student", route: "students-add" },
      { id: "student-details", label: "Student Details", route: "student-details" },
      { id: "student-promotion", label: "Student Promotion", route: "student-promotion" }
    ]
  },
  {
    id: "teachers",
    label: "Teachers",
    icon: GraduationCap,
    submenus: [
      { id: "all-teachers", label: "All Teachers", route: "teachers" },
      { id: "add-teacher", label: "Add Teacher", route: "teachers-add" },
      { id: "teacher-details", label: "Teacher Details", route: "teacher-details" }
    ]
  },
  {
    id: "attendance",
    label: "Attendance",
    icon: CalendarCheck,
    submenus: [
      { id: "student-attendance", label: "Student Attendance", route: "attendance-student" },
      { id: "teacher-attendance", label: "Teacher Attendance", route: "attendance-teacher" },
      { id: "attendance-reports", label: "Attendance Reports", route: "attendance-reports" }
    ]
  },
  {
    id: "examination",
    label: "Examination",
    icon: Award,
    submenus: [
      { id: "create-exam", label: "Create Exam", route: "exams" },
      { id: "marks-entry", label: "Marks Entry", route: "results" },
      { id: "results-overview", label: "Results", route: "results" },
      { id: "report-cards", label: "Report Cards", route: "report-cards" }
    ]
  },
  {
    id: "fees",
    label: "FEES MANAGEMENT",
    icon: CreditCard,
    highlight: true,
    submenus: [
      { id: "fees-dashboard", label: "Fees Dashboard", route: "fees-dashboard" },
      { id: "fees-structure", label: "Fee Structure", route: "fees-structure" },
      { id: "fees-collect", label: "Collect Fees", route: "fees-collect" },
      { id: "fees-students", label: "Student Fee Details", route: "fees-students" },
      { id: "fees-receipts", label: "Fee Receipts", route: "fees-receipts" }
    ]
  },
  {
    id: "homework",
    label: "Homework",
    icon: BookMarked,
    route: "homework"
  },
  {
    id: "notices",
    label: "Notice Board",
    icon: Bell,
    route: "notices"
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    route: "reports"
  },
  {
    id: "users-roles",
    label: "Users & Roles",
    icon: ShieldCheck,
    route: "users-roles"
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    route: "settings"
  }
];

export default function Sidebar({
  activeRoute,
  onNavigate,
  collapsed,
  setCollapsed,
  mobileOpen,
  onCloseMobile
}) {
  const { currentUser, logout } = useAuth();
  // Expanded menus tracking
  const [openMenus, setOpenMenus] = useState({
    fees: true,
    academic: false,
    students: false,
    teachers: false,
    attendance: false,
    examination: false
  });

  const toggleSubmenu = (menuId) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleItemClick = (route) => {
    onNavigate(route);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-wrapper">
          <div className="brand-icon-box">
            <School size={24} />
          </div>
          {!collapsed && (
            <div className="brand-titles">
              <span className="brand-name">SGM ACADEMY</span>
              <span className="brand-subtitle">School ERP & Finance</span>
            </div>
          )}
        </div>
        
        {/* Desktop Collapse Toggle */}
        <button
          className="collapse-btn desktop-only no-print"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          className="mobile-close-btn no-print"
          onClick={onCloseMobile}
          title="Close Navigation Menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav Menu with Submenus */}
      <nav className="sidebar-nav">
        {!collapsed && <div className="sidebar-section-label">Admin Navigation</div>}

        {SIDEBAR_MODULES.map((mod) => {
          const Icon = mod.icon;
          const hasSubmenus = Boolean(mod.submenus && mod.submenus.length > 0);
          const isMenuOpen = openMenus[mod.id];
          const isDirectActive = activeRoute === mod.route;
          const isChildActive = hasSubmenus && mod.submenus.some((sub) => sub.route === activeRoute);

          if (!hasSubmenus) {
            return (
              <button
                key={mod.id}
                className={`nav-item ${isDirectActive ? "active" : ""}`}
                onClick={() => handleItemClick(mod.route)}
                title={collapsed ? mod.label : undefined}
              >
                <Icon size={19} className="nav-icon" />
                {!collapsed && <span>{mod.label}</span>}
              </button>
            );
          }

          return (
            <div key={mod.id} style={{ display: "flex", flexDirection: "column" }}>
              <button
                className={`nav-item ${isChildActive ? "active" : ""} ${mod.highlight ? "highlight-item" : ""}`}
                style={
                  mod.highlight && !isChildActive
                    ? { background: "rgba(79, 70, 229, 0.15)", color: "#818cf8" }
                    : {}
                }
                onClick={() => {
                  if (collapsed) {
                    setCollapsed(false);
                    setOpenMenus((prev) => ({ ...prev, [mod.id]: true }));
                  } else {
                    toggleSubmenu(mod.id);
                  }
                }}
                title={collapsed ? mod.label : undefined}
              >
                <Icon size={19} className="nav-icon" />
                {!collapsed && <span style={{ fontWeight: mod.highlight ? "700" : "500" }}>{mod.label}</span>}

                {!collapsed && (
                  <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px" }}>
                    {mod.highlight && (
                      <span
                        style={{
                          fontSize: "0.65rem",
                          background: "#4f46e5",
                          color: "#ffffff",
                          padding: "0.15rem 0.4rem",
                          borderRadius: "4px",
                          fontWeight: "700"
                        }}
                      >
                        CORE
                      </span>
                    )}
                    {isMenuOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  </span>
                )}
              </button>

              {/* Nested Submenu Items */}
              {!collapsed && isMenuOpen && (
                <div
                  style={{
                    paddingLeft: "2.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.2rem",
                    margin: "0.2rem 0 0.5rem"
                  }}
                >
                  {mod.submenus.map((sub) => {
                    const isSubActive = activeRoute === sub.route;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleItemClick(sub.route)}
                        style={{
                          background: isSubActive ? "#4f46e5" : "transparent",
                          color: isSubActive ? "#ffffff" : "#94a3b8",
                          border: "none",
                          textAlign: "left",
                          padding: "0.45rem 0.75rem",
                          borderRadius: "6px",
                          fontSize: "0.85rem",
                          fontWeight: isSubActive ? "700" : "500",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <span
                          style={{
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            background: isSubActive ? "#ffffff" : "#64748b"
                          }}
                        ></span>
                        <span>{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Profile & Logout */}
      <div className="sidebar-footer">
        <div className="user-profile-card">
          <div className="user-avatar">
            {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : "A"}
          </div>
          {!collapsed && (
            <div className="user-info">
              <div className="user-name">
                {currentUser?.displayName || currentUser?.email || "Admin Portal"}
              </div>
              <div className="user-role" style={{ color: "#38bdf8" }}>
                Super Admin
              </div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              className="collapse-btn"
              title="Sign Out"
              style={{ color: "#ef4444" }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
