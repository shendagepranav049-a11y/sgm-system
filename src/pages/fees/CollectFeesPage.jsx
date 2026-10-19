import React, { useState, useEffect } from "react";
import { Search, CheckCircle2, CreditCard, ShieldAlert, AlertTriangle, Printer, ArrowRight } from "lucide-react";
import { useSchool } from "../../context/SchoolContext";
import { formatRupees, paiseToRupees, rupeesToPaise } from "../../utils/currency";
import FeeReceiptModal from "../../components/fees/FeeReceiptModal";

export default function CollectFeesPage({ preselectedStudentId, onCollectComplete }) {
  const { students, studentFeeAccounts, recordFeePayment } = useSchool();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(preselectedStudentId || "");
  const [amountRupees, setAmountRupees] = useState("");
  const [feeComponent, setFeeComponent] = useState("Tuition & Academic Term Installment");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [transactionReference, setTransactionReference] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdReceipt, setCreatedReceipt] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (preselectedStudentId) {
      setSelectedStudentId(preselectedStudentId);
    } else if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [preselectedStudentId, students]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const selectedAccount = studentFeeAccounts.find((a) => a.studentId === selectedStudentId);

  // Auto populate pending balance if empty
  useEffect(() => {
    if (selectedAccount && Number(selectedAccount.remainingBalancePaise) > 0 && !amountRupees) {
      setAmountRupees(paiseToRupees(selectedAccount.remainingBalancePaise));
    }
  }, [selectedAccount]);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.grNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.admissionNumber && s.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedStudent || !selectedAccount) {
      setErrorMsg("Please select a valid student.");
      return;
    }

    const enteredAmount = Number(amountRupees);
    if (!enteredAmount || enteredAmount <= 0) {
      setErrorMsg("Please enter a valid payment amount greater than zero.");
      return;
    }

    const remainingBalRupees = paiseToRupees(selectedAccount.remainingBalancePaise);
    if (enteredAmount > remainingBalRupees) {
      setErrorMsg(
        `Payment amount (₹${enteredAmount.toLocaleString()}) cannot exceed outstanding balance of ₹${remainingBalRupees.toLocaleString()}.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        studentId: selectedStudent.id,
        amountPaise: rupeesToPaise(enteredAmount),
        paymentMode,
        transactionReference: transactionReference || `TXN-REF-${Math.floor(100000 + Math.random() * 900000)}`,
        feeComponent,
        paymentDate,
        remarks,
        recordedBy: "Chief Accountant",
        idempotencyKey: `pay-${selectedStudent.id}-${Date.now()}`
      };

      const result = await recordFeePayment(payload);
      setCreatedReceipt(result.payment);
      setReceiptModalOpen(true);
      setAmountRupees("");
      setTransactionReference("");
      setRemarks("");
      if (onCollectComplete) onCollectComplete(result);
    } catch (err) {
      console.error("Fee payment failed:", err);
      setErrorMsg(err.message || "Failed to record payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
          Collect Student Fees & Issue Official Receipt
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "2px 0 0" }}>
          Step-by-step verified fee collection with instant receipt generation
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "1.5rem" }}>
        {/* Step 1 & 2: Student Selection & Search */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h4 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1rem" }}>
            Step 1: Locate Student
          </h4>

          <div className="search-box" style={{ marginBottom: "1rem" }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by student name, GR No, or Admission No..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ maxHeight: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {filteredStudents.map((s) => {
              const acct = studentFeeAccounts.find((a) => a.studentId === s.id);
              const isSelected = s.id === selectedStudentId;

              return (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedStudentId(s.id);
                    if (acct) setAmountRupees(paiseToRupees(acct.remainingBalancePaise));
                  }}
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid",
                    borderColor: isSelected ? "var(--primary)" : "var(--border-color)",
                    background: isSelected ? "#eef2ff" : "#ffffff",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "700", color: "#0f172a" }}>{s.name}</div>
                    <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                      GR: <strong>{s.grNumber}</strong> • {s.className} ({s.division || "A"})
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Pending Due</div>
                    <div
                      style={{
                        fontWeight: "800",
                        fontSize: "0.95rem",
                        color: acct && Number(acct.remainingBalancePaise) > 0 ? "#dc2626" : "#16a34a"
                      }}
                    >
                      {acct ? formatRupees(paiseToRupees(acct.remainingBalancePaise)) : "₹0.00"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Fee Collection Form */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h4 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1rem" }}>
            Step 2: Payment Verification & Collection
          </h4>

          {selectedAccount && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.75rem",
                background: "#f8fafc",
                border: "1px solid var(--border-color)",
                padding: "1rem",
                borderRadius: "10px",
                marginBottom: "1.25rem"
              }}
            >
              <div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Total Payable</div>
                <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>
                  {formatRupees(paiseToRupees(selectedAccount.totalPayablePaise))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.75rem", color: "#065f46", textTransform: "uppercase" }}>Previously Paid</div>
                <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#059669" }}>
                  {formatRupees(paiseToRupees(selectedAccount.totalPaidPaise))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.75rem", color: "#991b1b", textTransform: "uppercase" }}>Remaining Balance</div>
                <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#dc2626" }}>
                  {formatRupees(paiseToRupees(selectedAccount.remainingBalancePaise))}
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                fontSize: "0.85rem",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <AlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Amount to Collect (₹) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={amountRupees}
                  onChange={(e) => setAmountRupees(e.target.value)}
                  placeholder="Enter amount"
                  required
                  min="1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fee Component / Term *</label>
                <select
                  className="form-select"
                  value={feeComponent}
                  onChange={(e) => setFeeComponent(e.target.value)}
                >
                  <option value="Tuition & Academic Term Installment">Tuition & Academic Term Installment</option>
                  <option value="Admission & Registration Fee">Admission & Registration Fee</option>
                  <option value="Laboratory & Computer Science Fee">Laboratory & Computer Science Fee</option>
                  <option value="Examination & Evaluation Fee">Examination & Evaluation Fee</option>
                  <option value="Transportation & Bus Fee">Transportation & Bus Fee</option>
                  <option value="Comprehensive Annual Clearance">Comprehensive Annual Clearance</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Payment Mode *</label>
                <select
                  className="form-select"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                  <option value="Cheque">Bank Cheque</option>
                  <option value="Online Payment">Online Payment Gateway</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Transaction Ref / Cheque No.</label>
                <input
                  type="text"
                  className="form-input"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  placeholder="Auto-generated if left empty"
                />
              </div>
            </div>

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
                <label className="form-label">Remarks / Ledger Note</label>
                <input
                  type="text"
                  className="form-input"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Cleared at accounts counter"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.75rem", marginTop: "0.5rem" }}
              disabled={isSubmitting || !selectedAccount || Number(selectedAccount.remainingBalancePaise) === 0}
            >
              <CheckCircle2 size={18} />
              <span>
                {isSubmitting
                  ? "Recording Payment..."
                  : Number(selectedAccount?.remainingBalancePaise || 0) === 0
                  ? "Account Fully Paid"
                  : "Confirm Payment & Generate Receipt"}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {createdReceipt && (
        <FeeReceiptModal
          isOpen={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          payment={createdReceipt}
        />
      )}
    </div>
  );
}
