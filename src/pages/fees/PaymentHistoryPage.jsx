import React, { useState } from "react";
import { Search, Printer, RotateCcw, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";
import { useSchool } from "../../context/SchoolContext";
import { formatRupees, paiseToRupees } from "../../utils/currency";
import FeeReceiptModal from "../../components/fees/FeeReceiptModal";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";

export default function PaymentHistoryPage() {
  const { feePayments, reversePayment } = useSchool();
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  // Reversal dialog state
  const [reversalModalOpen, setReversalModalOpen] = useState(false);
  const [paymentToReverse, setPaymentToReverse] = useState(null);
  const [reversalReason, setReversalReason] = useState("Bank cheque bounce / clerical entry error");
  const [isReversing, setIsReversing] = useState(false);

  const filtered = feePayments.filter((p) => {
    const matchSearch =
      p.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.grNumber && p.grNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.transactionReference && p.transactionReference.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchMethod = methodFilter === "all" || p.paymentMode === methodFilter;
    return matchSearch && matchMethod;
  });

  const handleOpenReceipt = (payment) => {
    // Adapt payment object for printable modal
    const adapted = {
      receiptNo: payment.receiptNo,
      studentName: payment.studentName,
      rollNo: payment.grNumber,
      className: payment.className,
      paymentMethod: payment.paymentMode,
      transactionId: payment.transactionReference,
      feeType: payment.feeComponent,
      paymentDate: payment.paymentDate,
      amount: paiseToRupees(payment.amountPaise),
      notes: payment.remarks
    };
    setSelectedReceipt(adapted);
    setReceiptModalOpen(true);
  };

  const handleOpenReverse = (payment) => {
    setPaymentToReverse(payment);
    setReversalModalOpen(true);
  };

  const handleConfirmReverse = async () => {
    if (!paymentToReverse) return;
    setIsReversing(true);
    try {
      await reversePayment(paymentToReverse.id, reversalReason, "Senior Admin / Auditor");
      setReversalModalOpen(false);
    } catch (err) {
      alert("Reversal failed: " + err.message);
    } finally {
      setIsReversing(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Payment History & Transaction Audit Trail</h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Official ledger of all processed transactions, receipt references, and auditable correction reversals
        </p>
      </div>

      {/* Filter and Search */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.25rem"
        }}
      >
        <div className="search-box" style={{ flex: 1, maxWidth: "340px" }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by receipt no, student, GR, or ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <select
            className="form-select"
            style={{ width: "auto" }}
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="all">All Payment Channels</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI / QR</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cheque">Bank Cheque</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Receipt #</th>
              <th>Date</th>
              <th>Student Name</th>
              <th>GR Number</th>
              <th>Class</th>
              <th>Payment Mode</th>
              <th>Txn Reference</th>
              <th>Amount</th>
              <th>Recorded By</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="11" style={{ textAlign: "center", padding: "2.5rem", color: "#94a3b8" }}>
                  No transaction records matched your search query.
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const isReversed = p.status === "Reversed";
                return (
                  <tr key={p.id} style={isReversed ? { opacity: 0.6, background: "#fff1f2" } : {}}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontWeight: "700", color: isReversed ? "#dc2626" : "var(--primary)" }}>
                        {p.receiptNo}
                      </span>
                    </td>
                    <td>{p.paymentDate}</td>
                    <td>
                      <strong>{p.studentName}</strong>
                    </td>
                    <td>{p.grNumber}</td>
                    <td>{p.className}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: "600",
                          background: "#f1f5f9",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "4px"
                        }}
                      >
                        {p.paymentMode}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#64748b" }}>
                        {p.transactionReference}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: isReversed ? "#dc2626" : "#16a34a", fontSize: "0.95rem" }}>
                        {formatRupees(paiseToRupees(p.amountPaise))}
                      </strong>
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "#64748b" }}>{p.recordedBy}</td>
                    <td>
                      <span className={`badge ${isReversed ? "badge-urgent" : "badge-paid"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "0.3rem 0.5rem" }}
                          onClick={() => handleOpenReceipt(p)}
                          title="Reprint Official Receipt"
                        >
                          <Printer size={13} />
                          <span>Reprint</span>
                        </button>

                        {!isReversed && (
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ padding: "0.3rem 0.5rem" }}
                            onClick={() => handleOpenReverse(p)}
                            title="Reverse Payment (Audited)"
                          >
                            <RotateCcw size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <FeeReceiptModal
          isOpen={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          payment={selectedReceipt}
        />
      )}

      {/* Reversal Confirmation Modal */}
      <Modal
        isOpen={reversalModalOpen}
        onClose={() => setReversalModalOpen(false)}
        title="Audited Payment Reversal"
      >
        <div style={{ padding: "0.5rem" }}>
          <div
            style={{
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              color: "#9f1239"
            }}
          >
            <AlertTriangle size={24} />
            <div style={{ fontSize: "0.85rem", lineHeight: "1.5" }}>
              Reversing payment <strong>#{paymentToReverse?.receiptNo}</strong> will deduct{" "}
              <strong>{formatRupees(paiseToRupees(paymentToReverse?.amountPaise || 0))}</strong> from the student's paid total and restore their outstanding balance.
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Official Justification / Reason *</label>
            <input
              type="text"
              className="form-input"
              value={reversalReason}
              onChange={(e) => setReversalReason(e.target.value)}
              placeholder="e.g. Bank cheque dishonored, accidental duplicate entry"
              required
            />
          </div>

          <div className="modal-footer" style={{ margin: "1.5rem -1.5rem -1.5rem", padding: "1rem 1.5rem" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setReversalModalOpen(false)}
              disabled={isReversing}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleConfirmReverse}
              disabled={isReversing}
            >
              {isReversing ? "Reversing..." : "Authorize Reversal"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
