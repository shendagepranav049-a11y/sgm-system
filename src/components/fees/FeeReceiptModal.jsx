import React from "react";
import { Printer, X, CheckCircle2, School } from "lucide-react";
import Modal from "../common/Modal";
import { useSchool } from "../../context/SchoolContext";

export default function FeeReceiptModal({ isOpen, onClose, payment }) {
  const { settings } = useSchool();

  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const currency = settings.currency || "$";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fee Payment Receipt" size="large">
      <div className="receipt-container" style={{ padding: "1rem" }}>
        {/* Action bar for screen only */}
        <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print Receipt</span>
          </button>
        </div>

        {/* Printable Receipt Paper */}
        <div
          className="receipt-printable"
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "2.5rem",
            color: "#0f172a",
            fontFamily: "inherit"
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #4f46e5", paddingBottom: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <School size={32} />
              </div>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#1e1b4b", margin: 0 }}>
                  {settings.schoolName || "SGM International Academy"}
                </h2>
                <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "2px 0 0" }}>
                  {settings.address || "Academic City, California"}
                </p>
                <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "2px 0 0" }}>
                  Phone: {settings.phone || "+1 555-0199"} | Email: {settings.email || "accounts@sgmacademy.edu"}
                </p>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  display: "inline-block",
                  padding: "0.25rem 0.75rem",
                  background: "#eef2ff",
                  color: "#4338ca",
                  fontWeight: "700",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  marginBottom: "0.5rem"
                }}
              >
                FEE PAYMENT RECEIPT
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#0f172a" }}>
                Receipt No: <span style={{ color: "#4f46e5" }}>{payment.receiptNo}</span>
              </div>
              <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                Date: {payment.paymentDate || new Date().toISOString().split("T")[0]}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                Academic Session: {settings.academicYear || "2025-2026"}
              </div>
            </div>
          </div>

          {/* Student & Payment Info Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.5rem",
              background: "#f8fafc",
              padding: "1.25rem",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              border: "1px solid #f1f5f9"
            }}
          >
            <div>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#64748b", fontWeight: "700", marginBottom: "4px" }}>
                Student Details
              </div>
              <div style={{ fontSize: "1.05rem", fontWeight: "700", color: "#0f172a" }}>
                {payment.studentName}
              </div>
              <div style={{ fontSize: "0.88rem", color: "#475569", marginTop: "2px" }}>
                Roll No: <strong>{payment.rollNo || "N/A"}</strong> | Class: <strong>{payment.className}</strong>
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#64748b", fontWeight: "700", marginBottom: "4px" }}>
                Payment Method & Ref
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#0f172a" }}>
                Method: <strong>{payment.paymentMethod || "Online / Cash"}</strong>
              </div>
              <div style={{ fontSize: "0.88rem", color: "#475569", marginTop: "2px" }}>
                Transaction Ref: <strong>{payment.transactionId || "N/A"}</strong>
              </div>
              <div style={{ fontSize: "0.85rem", color: "#10b981", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                <CheckCircle2 size={14} /> Payment Verified & Cleared
              </div>
            </div>
          </div>

          {/* Fee Itemization Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "1.5rem" }}>
            <thead>
              <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                <th style={{ padding: "0.75rem 1rem", borderBottom: "2px solid #cbd5e1", fontSize: "0.82rem", textTransform: "uppercase", color: "#475569" }}>
                  #
                </th>
                <th style={{ padding: "0.75rem 1rem", borderBottom: "2px solid #cbd5e1", fontSize: "0.82rem", textTransform: "uppercase", color: "#475569" }}>
                  Description / Fee Type
                </th>
                <th style={{ padding: "0.75rem 1rem", borderBottom: "2px solid #cbd5e1", fontSize: "0.82rem", textTransform: "uppercase", color: "#475569", textAlign: "right" }}>
                  Amount ({currency})
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "0.85rem 1rem", borderBottom: "1px solid #e2e8f0" }}>1</td>
                <td style={{ padding: "0.85rem 1rem", borderBottom: "1px solid #e2e8f0" }}>
                  <strong>{payment.feeType || "School Tuition & Academic Dues"}</strong>
                  {payment.notes && <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Note: {payment.notes}</div>}
                </td>
                <td style={{ padding: "0.85rem 1rem", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: "700" }}>
                  {currency}{Number(payment.amount).toLocaleString()}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="2" style={{ padding: "1rem", textAlign: "right", fontWeight: "700", fontSize: "1rem", borderTop: "2px solid #0f172a" }}>
                  Total Received:
                </td>
                <td style={{ padding: "1rem", textAlign: "right", fontWeight: "800", fontSize: "1.25rem", color: "#4f46e5", borderTop: "2px solid #0f172a" }}>
                  {currency}{Number(payment.amount).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Footer Signatures */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "3rem", paddingTop: "1.5rem" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                This is a computer-generated official receipt.
              </div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                Printed on: {new Date().toLocaleDateString()}
              </div>
            </div>

            <div style={{ textAlign: "center", minWidth: "180px" }}>
              <div style={{ borderBottom: "1px solid #0f172a", marginBottom: "0.5rem", height: "40px" }}></div>
              <div style={{ fontSize: "0.85rem", fontWeight: "700" }}>Authorized Cashier</div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Finance & Accounts Dept</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
