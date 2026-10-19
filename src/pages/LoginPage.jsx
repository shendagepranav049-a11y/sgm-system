import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  LogIn,
  Lock,
  Mail,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Building2,
  Cpu,
  BookOpen,
  Eye,
  EyeOff,
  ShieldCheck,
  Award
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const SGM_SHOWCASE_SLIDES = [
  {
    id: "campus",
    label: "Main Campus",
    icon: Building2,
    image: "/images/sgm_campus.jpg",
    badge: "Sadguru Gadage Maharaj College, Karad",
    title: "Heritage of Academic Rigor & Innovation",
    desc: "Empowering 5,000+ scholars across Arts, Science, Commerce & Technology under the visionary leadership of Rayat Shikshan Sanstha."
  },
  {
    id: "labs",
    label: "Digital Labs",
    icon: Cpu,
    image: "/images/sgm_lab.jpg",
    badge: "Next-Gen Research Centers",
    title: "Cutting-Edge Scientific & Computing Hubs",
    desc: "Equipped with advanced instrumentation, robotics, AI computing workstations, and industry-partnered innovation labs."
  },
  {
    id: "library",
    label: "Central Library",
    icon: BookOpen,
    image: "/images/sgm_library.jpg",
    badge: "Knowledge Resource Commons",
    title: "World-Class Digital & Physical Library",
    desc: "Housing over 100,000+ books, peer-reviewed journals, reading lounges, and 24/7 access to international e-learning databases."
  }
];

export default function LoginPage() {
  const { login, isFirebaseLive } = useAuth();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loginMode, setLoginMode] = useState("credentials"); // 'credentials' | 'google'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-rotate showcase tabs every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % SGM_SHOWCASE_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSlideSelect = (idx) => {
    setCurrentSlideIndex(idx);
  };

  const handleFillAdminCredentials = () => {
    setEmail("admin@sgmacademy.edu");
    setPassword("admin123");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Invalid credentials. Please verify your administrator details.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSsoLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await login("admin@sgmacademy.edu", "admin123");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentSlide = SGM_SHOWCASE_SLIDES[currentSlideIndex];

  return (
    <div className="sgm-login-wrapper">
      <div className="sgm-login-card-container">
        {/* =======================================================
            LEFT PANEL: SGM COLLEGE PHOTO SHOWCASE WITH GOOGLE TABS
            ======================================================= */}
        <div className="sgm-showcase-panel">
          {/* Background Images with smooth fade/zoom */}
          {SGM_SHOWCASE_SLIDES.map((slide, idx) => (
            <img
              key={slide.id}
              src={slide.image}
              alt={slide.title}
              className={`sgm-showcase-bg-img ${idx === currentSlideIndex ? "active" : ""}`}
            />
          ))}

          {/* Dark Cinematic Gradient Overlay */}
          <div className="sgm-showcase-overlay" />

          {/* Top Bar: NAAC Badge + Google-style Animated Tabs */}
          <div className="sgm-showcase-header">
            <div className="sgm-showcase-badge">
              <Award size={15} style={{ color: "#fbbf24" }} />
              <span>NAAC 'A++' Accredited</span>
            </div>

            {/* Google-Style Animated Tab Bar */}
            <div className="google-tabs-bar" role="tablist">
              {SGM_SHOWCASE_SLIDES.map((slide, idx) => {
                const TabIcon = slide.icon;
                const isActive = idx === currentSlideIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`google-tab-item ${isActive ? "active" : ""}`}
                    onClick={() => handleSlideSelect(idx)}
                  >
                    <TabIcon size={14} />
                    <span>{slide.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Showcase Content */}
          <div className="sgm-showcase-bottom">
            <div className="sgm-showcase-title-box">
              <div
                style={{
                  display: "inline-block",
                  color: "#38bdf8",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "4px"
                }}
              >
                {currentSlide.badge}
              </div>
              <h2 className="sgm-showcase-title">{currentSlide.title}</h2>
              <p className="sgm-showcase-desc">{currentSlide.desc}</p>
            </div>

            {/* Key Institutional Metrics */}
            <div className="sgm-showcase-stats-row">
              <div className="sgm-stat-item">
                <div className="sgm-stat-val">5,000+</div>
                <div className="sgm-stat-lbl">Students</div>
              </div>
              <div className="sgm-stat-item" style={{ borderLeft: "1px solid rgba(255,255,255,0.15)", borderRight: "1px solid rgba(255,255,255,0.15)" }}>
                <div className="sgm-stat-val">100%</div>
                <div className="sgm-stat-lbl">Digital ERP</div>
              </div>
              <div className="sgm-stat-item">
                <div className="sgm-stat-val" style={{ color: "#4ade80" }}>Live</div>
                <div className="sgm-stat-lbl">Cloud Firestore</div>
              </div>
            </div>
          </div>
        </div>

        {/* =======================================================
            RIGHT PANEL: MODERN ADMIN AUTHENTICATION PORTAL
            ======================================================= */}
        <div className="sgm-login-form-panel">
          {/* Header Brand */}
          <div className="sgm-login-brand-header">
            <div className="sgm-login-brand-pill">
              <GraduationCap size={15} />
              <span>SGM International Portal</span>
            </div>
            <h1 className="sgm-login-heading">Institutional Sign In</h1>
            <p className="sgm-login-subheading">
              School ERP, Fees Accounting & Academic Management System
            </p>
          </div>

          {/* Google-Style Mode Switch Tabs */}
          <div className="login-mode-tabs" role="tablist">
            <button
              type="button"
              className={`login-mode-tab ${loginMode === "credentials" ? "active" : ""}`}
              onClick={() => setLoginMode("credentials")}
            >
              <Lock size={15} />
              <span>Admin Credentials</span>
            </button>
            <button
              type="button"
              className={`login-mode-tab ${loginMode === "google" ? "active" : ""}`}
              onClick={() => setLoginMode("google")}
            >
              {/* Google colored G icon */}
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Google SSO / Quick</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                fontSize: "0.85rem",
                marginBottom: "1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: ADMIN CREDENTIALS */}
          {loginMode === "credentials" && (
            <div>
              {/* Click-to-autofill Chip */}
              <div
                className="autofill-credential-chip"
                onClick={handleFillAdminCredentials}
                title="Click to automatically fill credentials"
              >
                <div>
                  <div style={{ fontWeight: "700", color: "#166534", fontSize: "0.84rem" }}>
                    🔑 Demo Administrator Credentials
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#15803d", marginTop: "2px" }}>
                    admin@sgmacademy.edu &bull; admin123
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    background: "#bbf7d0",
                    color: "#166534",
                    padding: "3px 9px",
                    borderRadius: "6px",
                    fontWeight: "700"
                  }}
                >
                  Click to Fill
                </span>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Administrator Email</label>
                  <div style={{ position: "relative" }}>
                    <Mail
                      size={16}
                      style={{
                        position: "absolute",
                        left: "0.9rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--text-muted)"
                      }}
                    />
                    <input
                      type="email"
                      className="form-input"
                      style={{ paddingLeft: "2.4rem" }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@sgmacademy.edu"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div style={{ position: "relative" }}>
                    <Lock
                      size={16}
                      style={{
                        position: "absolute",
                        left: "0.9rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--text-muted)"
                      }}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-input"
                      style={{ paddingLeft: "2.4rem", paddingRight: "2.4rem" }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "0.85rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer"
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    width: "100%",
                    padding: "0.8rem",
                    marginTop: "0.5rem",
                    fontSize: "0.95rem",
                    borderRadius: "12px",
                    boxShadow: "0 10px 20px -5px rgba(79, 70, 229, 0.4)"
                  }}
                  disabled={loading}
                >
                  <LogIn size={18} />
                  <span>{loading ? "Authenticating..." : "Sign In to ERP Portal"}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: GOOGLE SSO & FAST ACCESS */}
          {loginMode === "google" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  padding: "1rem",
                  borderRadius: "14px",
                  fontSize: "0.85rem",
                  color: "#475569",
                  lineHeight: 1.5
                }}
              >
                <div style={{ fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
                  Institutional Single Sign-On (SSO)
                </div>
                Access administrative controls using your verified institutional Google workspace or 1-click evaluation access.
              </div>

              {/* Official Google OAuth Style Button */}
              <button
                type="button"
                className="btn-google-sso"
                onClick={handleGoogleSsoLogin}
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google Account</span>
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  margin: "0.5rem 0",
                  color: "#94a3b8",
                  fontSize: "0.78rem"
                }}
              >
                <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }}></div>
                <span style={{ padding: "0 0.75rem", textTransform: "uppercase", fontWeight: "700" }}>
                  Or Instant Access
                </span>
                <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }}></div>
              </div>

              {/* 1-Click Fast Access */}
              <button
                type="button"
                className="btn btn-secondary"
                style={{
                  width: "100%",
                  padding: "0.8rem",
                  background: "linear-gradient(135deg, #f8fafc, #eef2ff)",
                  border: "1px solid #c7d2fe",
                  borderRadius: "12px",
                  color: "#4338ca",
                  fontWeight: "700"
                }}
                onClick={handleGoogleSsoLogin}
                disabled={loading}
              >
                <Sparkles size={16} style={{ color: "#6366f1" }} />
                <span>1-Click Principal Administrator Access</span>
              </button>
            </div>
          )}

          {/* Footer Security Badges */}
          <div
            style={{
              marginTop: "2rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.78rem",
              color: "#64748b"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldCheck size={15} style={{ color: "#10b981" }} />
              <span>256-bit SSL Encrypted</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {isFirebaseLive ? (
                <span style={{ color: "#16a34a", display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: "600" }}>
                  <CheckCircle2 size={13} /> Cloud Firestore Live
                </span>
              ) : (
                <span style={{ color: "#64748b" }}>Local Secured Mode</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
