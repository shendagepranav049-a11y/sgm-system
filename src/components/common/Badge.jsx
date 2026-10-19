import React from "react";

export default function Badge({ status, variant }) {
  if (!status) return null;

  const getVariant = () => {
    if (variant) return variant;
    const s = String(status).toLowerCase();
    if (["paid", "present", "completed", "active", "high"].includes(s)) return "paid";
    if (["partial", "late", "upcoming", "medium", "normal"].includes(s)) return "partial";
    if (["unpaid", "absent", "urgent", "failed", "critical"].includes(s)) return "unpaid";
    return "info";
  };

  return <span className={`badge badge-${getVariant()}`}>{status}</span>;
}
