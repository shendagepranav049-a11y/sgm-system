import React, { useState } from "react";
import { Settings, Database, Sparkles, CheckCircle2, AlertTriangle, Key, Save } from "lucide-react";
import { useSchool } from "../context/SchoolContext";

export default function SettingsPage() {
  const { settings, updateSettings, firebaseActive, seedFirestore, showToast } = useSchool();
  const [formData, setFormData] = useState({ ...settings });
  const [seeding, setSeeding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateSettings(formData);
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedFirestore();
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div>
      {/* Firebase Diagnostics & Setup Guide Banner */}
      <div
        className="card"
        style={{
          borderLeft: `5px solid ${firebaseActive ? "#10b981" : "#f59e0b"}`,
          background: firebaseActive ? "#f0fdf4" : "#fffbeb",
          marginBottom: "2rem"
        }}
      >
        <div className="card-body">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", gap: "1rem" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: firebaseActive ? "#10b981" : "#f59e0b",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <Database size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: "1.15rem", fontWeight: "700", color: firebaseActive ? "#065f46" : "#92400e" }}>
                  {firebaseActive ? "Cloud Firestore & Authentication: CONNECTED" : "Firebase Mode: Local Persistence Active"}
                </h4>
                <p style={{ fontSize: "0.88rem", color: firebaseActive ? "#047857" : "#78350f", marginTop: "4px", lineHeight: "1.5" }}>
                  {firebaseActive
                    ? "Your application is securely connected to your live Google Firebase Cloud Firestore database. All records are synchronizing in real time."
                    : "The system is currently running with client-side persistence. To connect to your live Google Firebase database, provide your credentials in the .env file."}
                </p>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleSeed}
              disabled={seeding}
              style={{ background: "#4f46e5" }}
            >
              <Sparkles size={16} />
              <span>{seeding ? "Syncing..." : "Seed Cloud Firestore Data"}</span>
            </button>
          </div>

          {/* Quick Setup Checklist */}
          <div
            style={{
              marginTop: "1.25rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid rgba(0,0,0,0.08)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
              fontSize: "0.82rem"
            }}
          >
            <div>
              <strong>Step 1: Firebase Project</strong>
              <div style={{ color: "var(--text-secondary)", marginTop: "2px" }}>
                Visit <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer">console.firebase.google.com</a> and create a project.
              </div>
            </div>

            <div>
              <strong>Step 2: Enable Services</strong>
              <div style={{ color: "var(--text-secondary)", marginTop: "2px" }}>
                Enable <strong>Authentication</strong> (Email/Password) & <strong>Cloud Firestore Database</strong>.
              </div>
            </div>

            <div>
              <strong>Step 3: Update .env</strong>
              <div style={{ color: "var(--text-secondary)", marginTop: "2px" }}>
                Paste <code>VITE_FIREBASE_API_KEY</code>, <code>PROJECT_ID</code>, etc. into <code>.env</code> in the <code>sgm system</code> folder.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* School Profile Settings Form */}
      <div className="card">
        <div className="card-header">
          <h4 className="card-title">School Profile & Institutional Configuration</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">School / Institution Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.schoolName || ""}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">School Tagline / Motto</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.tagline || ""}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Contact Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tax / Registration ID</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.taxId || ""}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Campus Physical Address</label>
              <input
                type="text"
                className="form-input"
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Active Academic Session</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.academicYear || "2025-2026"}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Currency Symbol</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.currency || "$"}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  placeholder="$ or ₹ or € or £"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Receipt Prefix</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.receiptPrefix || "SGM-REC-"}
                  onChange={(e) => setFormData({ ...formData, receiptPrefix: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Principal / Head of Institution Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.principalName || ""}
                onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
              />
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="btn btn-primary">
                <Save size={16} />
                <span>Save School Profile</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
