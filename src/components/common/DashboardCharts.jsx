import React from "react";
import { formatRupees } from "../../utils/currency";

export function FeesOverviewChart({ collectedRupees, remainingRupees }) {
  const total = collectedRupees + remainingRupees;
  const collectedPct = total > 0 ? Math.round((collectedRupees / total) * 100) : 0;
  const remainingPct = 100 - collectedPct;

  // SVG Donut calculation
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const collectedOffset = circumference - (collectedPct / 100) * circumference;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#fecdd3"
            strokeWidth={strokeWidth}
          />
          {/* Collected Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#10b981"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={collectedOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <span style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0f172a" }}>
            {collectedPct}%
          </span>
          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>
            REALIZED
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: "#64748b" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981" }}></span>
            <span>Collected Revenue</span>
          </div>
          <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "#059669", marginLeft: "1.25rem" }}>
            {formatRupees(collectedRupees)}
          </div>
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: "#64748b" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }}></span>
            <span>Outstanding Balance</span>
          </div>
          <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "#dc2626", marginLeft: "1.25rem" }}>
            {formatRupees(remainingRupees)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MonthlyCollectionChart({ data }) {
  const months = [
    { label: "Jun", amount: 185000 },
    { label: "Jul", amount: 240000 },
    { label: "Aug", amount: 620000 },
    { label: "Sep", amount: 980000 },
    { label: "Oct", amount: 450000 },
    { label: "Nov", amount: 310000 }
  ];

  const maxAmount = Math.max(...months.map((m) => m.amount));

  return (
    <div style={{ width: "100%", height: "200px", display: "flex", alignItems: "flex-end", gap: "1.5rem", paddingTop: "2rem" }}>
      {months.map((item, idx) => {
        const heightPct = Math.round((item.amount / maxAmount) * 100);
        return (
          <div
            key={idx}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              height: "100%",
              justifyContent: "flex-end"
            }}
          >
            <div style={{ fontSize: "0.72rem", color: "#4f46e5", fontWeight: "700", marginBottom: "4px" }}>
              ₹{(item.amount / 1000).toFixed(0)}k
            </div>
            <div
              style={{
                width: "100%",
                maxWidth: "38px",
                height: `${heightPct}%`,
                background: "linear-gradient(180deg, #4f46e5 0%, #818cf8 100%)",
                borderRadius: "6px 6px 0 0",
                transition: "height 0.3s ease"
              }}
            ></div>
            <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "6px", fontWeight: "600" }}>
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ClassWiseStudentChart({ classes, students }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      {classes.map((cls) => {
        const enrolled = students.filter((s) => s.className === cls.name || s.classId === cls.id).length;
        const capacity = cls.capacity || 35;
        const pct = Math.min(100, Math.round((enrolled / capacity) * 100));

        return (
          <div key={cls.id}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
              <span style={{ fontWeight: "700" }}>{cls.name}</span>
              <span style={{ color: "#64748b" }}>{enrolled} / {capacity} Students</span>
            </div>
            <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: pct > 85 ? "#f59e0b" : "#4f46e5",
                  borderRadius: "999px"
                }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
