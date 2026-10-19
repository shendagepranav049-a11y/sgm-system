import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendType = "positive",
  trendLabel = "vs last month",
  accentColor = "#4f46e5",
  bgColor = "#eef2ff"
}) {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        <div
          className="metric-icon-box"
          style={{ backgroundColor: bgColor, color: accentColor }}
        >
          {Icon && <Icon size={22} />}
        </div>
      </div>
      <div className="metric-value">{value}</div>
      {(trend || trendLabel) && (
        <div className="metric-footer">
          {trend && (
            <span className={`trend-badge ${trendType}`}>
              {trendType === "positive" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {trend}
            </span>
          )}
          {trendLabel && <span>{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
