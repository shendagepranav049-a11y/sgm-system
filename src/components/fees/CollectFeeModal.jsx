import React, { useState, useEffect } from "react";
import { CheckCircle2, DollarSign, CreditCard } from "lucide-react";
import Modal from "../common/Modal";
import { useSchool } from "../../context/SchoolContext";

export default function CollectFeeModal({ isOpen, onClose, preselectedStudentId, onPaymentComplete }) {
  const { students, recordFeePayment, settings } = useSchool();

  const [studentId, setStudentId] = useState(preselectedStudentId || "");
  const [amount, setAmount] = useState("");
  const [feeType, setFeeType] = useState("Tuition Fee");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedStudentId) {
      setStudentId(preselectedStudentId);
    } else if (students.length > 0 && !studentId) {
      setStudentId(students[0].id);
    }
  }, [preselectedStudentId, students]);

  const selectedStudent = students.find((s) => s.id === studentId);

  useEffect(() => {
    if (selectedStudent && selectedStudent.pendingFee > 0 && !amount) {
      setAmount(selectedStudent.pendingFee);
    }
  }, [selectedStudent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    setSubmitting(true);
    try {
      const paymentData = {
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        rollNo: selectedStudent.rollNo,
        className: selectedStudent.className,
        amount: Number(amount),
        feeType,
        paymentMethod,
        transactionId: transactionId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        notes,
        paymentDate,
        collectedBy: "Admin Portal"
      };

      const result = await recordFeePayment(paymentData);
      onClose();
      if (onPaymentComplete) {
        onPaymentComplete(result);
      }
    } catch (err) {
      console.error("Error collecting fee:", err);
      alert("Failed to record payment: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const currency = settings.currency || "$";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Collect Student Fee">
      <form onSubmit={handleSubmit}>
        {/* Student Selection */}
        <div className="form-group">
          <label className="form-label">Select Student *</label>
          <select
            className="form-select"
            value={studentId}
            onChange={(e) => {
              setStudentId(e.target.value);
              const found = students.find((s) => s.id === e.target.value);
              if (found) setAmount(found.pendingFee > 0 ? found.pendingFee : "");
            }}
            required
          >
            <option value="">-- Choose Student --</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.rollNo}) - {s.className} (Pending: {currency}{s.pendingFee || 0})
              </option>
            ))}
          </select>
        </div>

        {/* Selected Student Info Banner */}
        {selectedStudent && (
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "8px",
              padding: "0.85rem",
              marginBottom: "1.25rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <div style={{ fontWeight: "700", color: "#166534", fontSize: "0.95rem" }}>
                {selectedStudent.name}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#15803d" }}>
                Class: {selectedStudent.className} | Roll: {selectedStudent.rollNo}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.75rem", color: "#65a30d", textTransform: "uppercase", fontWeight: "700" }}>
                Pending Due
              </div>
              <div style={{ fontSize: "1.15rem", fontWeight: "800", color: selectedStudent.pendingFee > 0 ? "#dc2626" : "#16a34a" }}>
                {currency}{Number(selectedStudent.pendingFee || 0).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Amount & Fee Type Grid */}
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Payment Amount ({currency}) *</label>
            <input
              type="number"
              className="form-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 1500"
              required
              min="1"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Fee Category / Description *</label>
            <select
              className="form-select"
              value={feeType}
              onChange={(e) => setFeeType(e.target.value)}
            >
              <option value="Tuition Fee">Tuition Fee</option>
              <option value="Admission Fee">Admission Fee</option>
              <option value="Annual Comprehensive Tuition">Annual Comprehensive Tuition</option>
              <option value="Term 1 Installment">Term 1 Installment</option>
              <option value="Term 2 Installment">Term 2 Installment</option>
              <option value="Laboratory & Library Fee">Laboratory & Library Fee</option>
              <option value="Examination Fee">Examination Fee</option>
              <option value="Sports & Activity Fee">Sports & Activity Fee</option>
              <option value="Transportation Fee">Transportation Fee</option>
              <option value="Late Fine / Re-registration">Late Fine / Re-registration</option>
            </select>
          </div>
        </div>

        {/* Payment Method & Reference Grid */}
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Payment Method *</label>
            <select
              className="form-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Cash">Cash</option>
              <option value="Online UPI">Online UPI / QR</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Bank Transfer">Direct Bank Transfer</option>
              <option value="Cheque">Bank Cheque</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Transaction / Cheque Ref ID</label>
            <input
              type="text"
              className="form-input"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Auto-generated if left empty"
            />
          </div>
        </div>

        {/* Date & Notes */}
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Payment Date</label>
            <input
              type="date"
              className="form-input"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes / Remarks</label>
            <input
              type="text"
              className="form-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Received via accounts counter"
            />
          </div>
        </div>

        {/* Modal Submit Footer */}
        <div className="modal-footer" style={{ margin: "1.5rem -1.5rem -1.5rem", padding: "1rem 1.5rem" }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            <CheckCircle2 size={16} />
            <span>{submitting ? "Processing Payment..." : "Record Payment & Print"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
