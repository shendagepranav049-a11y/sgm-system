import React, { useState } from "react";
import { Search, Printer, FileText, CheckCircle2 } from "lucide-react";
import { useSchool } from "../../context/SchoolContext";
import FeeReceiptModal from "./FeeReceiptModal";
import Badge from "../common/Badge";

export default function PaymentHistoryTab() {
  const { feePayments, settings } = useSchool();
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const currency = settings.currency || "$";

  const filtered = feePayments.filter((p) => {
    const matchesSearch =
      (p.receiptNo && p.receiptNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.studentName && p.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.rollNo && p.rollNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.transactionId && p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMethod = methodFilter === "all" || p.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment);
    setReceiptOpen(true);
  };

  return (
    <div>
      {/* Search and Filters */}
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
            placeholder="Search by receipt no, student, ref..."
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
            <option value="all">All Payment Methods</option>
            <option value="Cash">Cash</option>
            <option value="Online UPI">Online UPI / QR</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
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
              <th>Receipt No</th>
              <th>Date</th>
              <th>Student Name</th>
              <th>Class</th>
              <th>Fee Category</th>
              <th>Method</th>
              <th>Txn Reference</th>
              <th>Amount Paid</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                  No transaction records found matching your filters.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span style={{ fontFamily: "monospace", fontWeight: "700", color: "var(--primary)" }}>
                      {p.receiptNo}
                    </span>
                  </td>
                  <td>{p.paymentDate}</td>
                  <td>
                    <strong>{p.studentName}</strong>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{p.rollNo}</div>
                  </td>
                  <td>{p.className}</td>
                  <td style={{ maxWidth: "200px" }}>{p.feeType}</td>
                  <td>
                    <span
                      style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        background: "#f1f5f9",
                        fontSize: "0.78rem",
                        fontWeight: "600"
                      }}
                    >
                      {p.paymentMethod}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      {p.transactionId || "N/A"}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: "#16a34a", fontSize: "0.95rem" }}>
                      {currency}{Number(p.amount || 0).toLocaleString()}
                    </strong>
                  </td>
                  <td>
                    <Badge status={p.status || "Completed"} />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleViewReceipt(p)}
                      title="View & Print Official Receipt"
                    >
                      <Printer size={14} />
                      <span>Print</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Printable Receipt Modal */}
      {selectedPayment && (
        <FeeReceiptModal
          isOpen={receiptOpen}
          onClose={() => setReceiptOpen(false)}
          payment={selectedPayment}
        />
      )}
    </div>
  );
}
