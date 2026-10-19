import React, { useState } from "react";
import { GraduationCap, LogIn, Lock, Mail, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, isFirebaseLive } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Invalid credentials. Please verify your login details.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
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

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        padding: "1.5rem"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
            padding: "2.5rem 2rem 2rem",
            textAlign: "center",
            color: "#ffffff"
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)"
            }}
          >
            <GraduationCap size={36} />
          </div>
          <h2 style={{ fontSize: "1.65rem", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.02em" }}>
            SGM ACADEMY
          </h2>
          <p style={{ fontSize: "0.88rem", opacity: 0.9, marginTop: "4px" }}>
            School & Fees Management System
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: "2rem" }}>
          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
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

          {/* Admin Credentials Helper Badge */}
          <div
            onClick={() => {
              setEmail("admin@sgmacademy.edu");
              setPassword("admin123");
            }}
            style={{
              background: "#f0fdf4",
              border: "1px dashed #86efac",
              borderRadius: "10px",
              padding: "0.75rem 1rem",
              marginBottom: "1.25rem",
              fontSize: "0.82rem",
              color: "#166534",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
            title="Click to auto-fill admin credentials"
          >
            <div>
              <div style={{ fontWeight: "700" }}>🔑 Administrator Login</div>
              <div style={{ fontSize: "0.78rem", opacity: 0.85, marginTop: "2px" }}>
                admin@sgmacademy.edu / admin123
              </div>
            </div>
            <span
              style={{
                fontSize: "0.75rem",
                background: "#dcfce7",
                color: "#15803d",
                padding: "3px 8px",
                borderRadius: "6px",
                fontWeight: "600"
              }}
            >
              Auto-fill
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Administrator Email</label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={16}
                  style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
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
                  style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: "2.4rem" }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.75rem", marginTop: "0.5rem" }}
              disabled={loading}
            >
              <LogIn size={18} />
              <span>{loading ? "Authenticating..." : "Sign In to Portal"}</span>
            </button>
          </form>

          {/* Quick Demo Access Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "1.5rem 0",
              color: "var(--text-muted)",
              fontSize: "0.8rem"
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }}></div>
            <span style={{ padding: "0 0.75rem", textTransform: "uppercase", fontWeight: "700" }}>
              Quick Evaluation
            </span>
            <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }}></div>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: "100%", padding: "0.7rem", background: "#f8fafc" }}
            onClick={handleQuickDemoLogin}
            disabled={loading}
          >
            <Sparkles size={16} style={{ color: "#4f46e5" }} />
            <span>1-Click Admin Access</span>
          </button>

          <div style={{ marginTop: "1.25rem", textAlign: "center", fontSize: "0.78rem", color: "var(--text-muted)" }}>
            {isFirebaseLive ? (
              <span style={{ color: "#16a34a", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle2 size={13} /> Cloud Firebase Auth Active
              </span>
            ) : (
              <span>Local Offline-Ready Admin Mode</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
