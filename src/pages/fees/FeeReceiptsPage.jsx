import React, { useState } from "react";
import { Search, Printer, FileText, CheckCircle2 } from "lucide-react";
import { useSchool } from "../../context/SchoolContext";
import { formatRupees, paiseToRupees } from "../../utils/currency";
import FeeReceiptModal from "../../components/fees/FeeReceiptModal";

export default function FeeReceiptsPage() {
  const { feeReceipts } = useSchool();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = feeReceipts.filter(
    (r) =>
      r.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.grNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrintReceipt = (rec) => {
    const adapted = {
      receiptNo: rec.receiptNo,
      studentName: rec.studentName,
      rollNo: rec.grNumber,
      className: rec.className,
      paymentMethod: rec.paymentMode,
      transactionId: rec.transactionReference,
      feeType: rec.feeComponent,
      paymentDate: rec.paymentDate,
      amount: paiseToRupees(rec.currentPaymentPaise || rec.amountPaise),
      notes: rec.remarks || ""
    };
    setSelectedReceipt(adapted);
    setModalOpen(true);
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Official Fee Receipts Repository</h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Immutable historical receipt documents preserved for audits, parent copies, and tax verification
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div className="search-box" style={{ maxWidth: "340px", flex: 1 }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search receipt #, student name, GR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Receipt Number</th>
              <th>Issue Date</th>
              <th>Student Name</th>
              <th>GR Number</th>
              <th>Class & Div</th>
              <th>Fee Component</th>
              <th>Payment Channel</th>
              <th>Amount Received</th>
              <th>Authorized Signee</th>
              <th style={{ textAlign: "right" }}>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: "center", padding: "2.5rem", color: "#94a3b8" }}>
                  No fee receipts found.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span style={{ fontFamily: "monospace", fontWeight: "700", color: "var(--primary)" }}>
                      {r.receiptNo}
                    </span>
                  </td>
                  <td>{r.paymentDate}</td>
                  <td>
                    <strong>{r.studentName}</strong>
                  </td>
                  <td>{r.grNumber}</td>
                  <td>{r.className} - {r.division || "A"}</td>
                  <td>{r.feeComponent}</td>
                  <td>{r.paymentMode}</td>
                  <td>
                    <strong style={{ color: "#16a34a" }}>
                      {formatRupees(paiseToRupees(r.currentPaymentPaise || r.amountPaise))}
                    </strong>
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "#64748b" }}>{r.authorizedBy}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handlePrintReceipt(r)}
                    >
                      <Printer size={13} />
                      <span>Print</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedReceipt && (
        <FeeReceiptModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          payment={selectedReceipt}
        />
      )}
    </div>
  );
}
