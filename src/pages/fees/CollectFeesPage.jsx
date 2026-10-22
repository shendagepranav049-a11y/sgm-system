import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  CheckCircle2,
  CreditCard,
  AlertTriangle,
  Printer,
  History,
  Send,
  PlusCircle,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Filter,
  DollarSign
} from "lucide-react";
import { useSchool } from "../../context/SchoolContext";
import { formatRupees, paiseToRupees, rupeesToPaise } from "../../utils/currency";
import FeeReceiptModal from "../../components/fees/FeeReceiptModal";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";

export default function CollectFeesPage({
  preselectedStudentId,
  initialTab = "collect",
  onCollectComplete
}) {
  const {
    students,
    studentFeeAccounts,
    feePayments,
    recordFeePayment,
    reversePayment,
    showToast
  } = useSchool();

  // Active view tab: "collect" | "pending" | "history"
  const [activeTab, setActiveTab] = useState(initialTab || "collect");

  // Keep activeTab in sync if initialTab prop changes from parent
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Form ref for smooth scroll
  const formRef = useRef(null);

  // ----------------------------------------------------
  // 1. COLLECT FEE FORM STATE
  // ----------------------------------------------------
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

  // ----------------------------------------------------
  // 2. PENDING FEES STATE & COMPUTATIONS
  // ----------------------------------------------------
  const [pendingSearch, setPendingSearch] = useState("");

  const pendingAccounts = studentFeeAccounts.filter(
    (a) => Number(a.remainingBalancePaise || 0) > 0
  );

  const totalOutstandingRupees = pendingAccounts.reduce(
    (acc, a) => acc + paiseToRupees(a.remainingBalancePaise),
    0
  );

  const overdueAccounts = pendingAccounts.filter((a) => a.paymentStatus === "Overdue");

  const filteredPendingAccounts = pendingAccounts.filter(
    (a) =>
      a.studentName.toLowerCase().includes(pendingSearch.toLowerCase()) ||
      a.grNumber.toLowerCase().includes(pendingSearch.toLowerCase()) ||
      a.className.toLowerCase().includes(pendingSearch.toLowerCase())
  );

  // ----------------------------------------------------
  // 3. PAYMENT HISTORY STATE
  // ----------------------------------------------------
  const [historySearch, setHistorySearch] = useState("");
  const [historyMethodFilter, setHistoryMethodFilter] = useState("all");
  const [selectedHistoryReceipt, setSelectedHistoryReceipt] = useState(null);
  const [historyReceiptModalOpen, setHistoryReceiptModalOpen] = useState(false);

  // Reversal dialog state
  const [reversalModalOpen, setReversalModalOpen] = useState(false);
  const [paymentToReverse, setPaymentToReverse] = useState(null);
  const [reversalReason, setReversalReason] = useState("Bank cheque bounce / clerical entry error");
  const [isReversing, setIsReversing] = useState(false);

  const filteredHistory = feePayments.filter((p) => {
    const matchSearch =
      p.receiptNo.toLowerCase().includes(historySearch.toLowerCase()) ||
      p.studentName.toLowerCase().includes(historySearch.toLowerCase()) ||
      (p.grNumber && p.grNumber.toLowerCase().includes(historySearch.toLowerCase())) ||
      (p.transactionReference && p.transactionReference.toLowerCase().includes(historySearch.toLowerCase()));
    const matchMethod = historyMethodFilter === "all" || p.paymentMode === historyMethodFilter;
    return matchSearch && matchMethod;
  });

  // Sync preselected student
  useEffect(() => {
    if (preselectedStudentId) {
      setSelectedStudentId(preselectedStudentId);
    } else if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [preselectedStudentId, students]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const selectedAccount = studentFeeAccounts.find((a) => a.studentId === selectedStudentId);

  // Auto populate pending balance if empty when switching student
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

  // 1-Click Select and switch to collect form from pending list
  const handleSelectStudentForCollect = (studentId) => {
    setSelectedStudentId(studentId);
    const acct = studentFeeAccounts.find((a) => a.studentId === studentId);
    if (acct) {
      setAmountRupees(paiseToRupees(acct.remainingBalancePaise));
    }
    setActiveTab("collect");
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Reminders
  const handleSendReminder = (account) => {
    const student = students.find((s) => s.id === account.studentId);
    const phone = student?.parentPhone || "+91 98200 00000";
    showToast(`Payment reminder SMS dispatched to ${phone} for ${account.studentName}`, "info");
  };

  const handleBroadcastReminders = () => {
    showToast(
      `Dispatched urgent payment notices to all ${pendingAccounts.length} pending student guardians via SMS and Email.`,
      "success"
    );
  };

  // Handle Fee Collection Submit
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

  // History modal handlers
  const handleOpenReceiptFromHistory = (payment) => {
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
    setSelectedHistoryReceipt(adapted);
    setHistoryReceiptModalOpen(true);
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
      {/* ----------------- TOP HEADER WITH INTEGRATED FEES HISTORY BUTTON ----------------- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.25rem"
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.35rem",
              fontWeight: "800",
              color: "#0f172a",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <CreditCard size={22} style={{ color: "var(--primary)" }} />
            Fee Collection & Dues Management
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "4px 0 0" }}>
            झटपट फी संकलन, बाकी फी (Pending Fees) आणि संपूर्ण व्यवहार इतिहास (Fees History)
          </p>
        </div>

        {/* Dedicated "Fees History" action button on top */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "history" ? "collect" : "history")}
            className={activeTab === "history" ? "btn btn-secondary" : "btn btn-primary"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontWeight: "600",
              boxShadow: activeTab !== "history" ? "0 4px 12px rgba(79, 70, 229, 0.25)" : "none"
            }}
          >
            <History size={16} />
            <span>
              {activeTab === "history" ? "← Back to Collect Fee" : "📜 Fees History (व्यवहार इतिहास)"}
            </span>
          </button>
        </div>
      </div>

      {/* ----------------- MODERN TAB PILL SWITCHER ----------------- */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          borderBottom: "1px solid var(--border-color)",
          paddingBottom: "0.75rem",
          marginBottom: "1.5rem",
          overflowX: "auto"
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("collect")}
          className={`btn btn-sm ${activeTab === "collect" ? "btn-primary" : "btn-secondary"}`}
          style={{
            borderRadius: "20px",
            padding: "0.45rem 1.1rem",
            fontWeight: "600",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem"
          }}
        >
          <CreditCard size={15} />
          <span>💳 Collect Fee Form</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={`btn btn-sm ${activeTab === "pending" ? "btn-primary" : "btn-secondary"}`}
          style={{
            borderRadius: "20px",
            padding: "0.45rem 1.1rem",
            fontWeight: "600",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem"
          }}
        >
          <AlertTriangle size={15} />
          <span>⚠️ Pending Fees (थकीत बाकी)</span>
          <span
            style={{
              background: activeTab === "pending" ? "#ffffff" : "#ef4444",
              color: activeTab === "pending" ? "#4f46e5" : "#ffffff",
              padding: "0.1rem 0.5rem",
              borderRadius: "10px",
              fontSize: "0.75rem",
              fontWeight: "800"
            }}
          >
            {pendingAccounts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`btn btn-sm ${activeTab === "history" ? "btn-primary" : "btn-secondary"}`}
          style={{
            borderRadius: "20px",
            padding: "0.45rem 1.1rem",
            fontWeight: "600",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem"
          }}
        >
          <History size={15} />
          <span>📜 Fees History ({feePayments.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: COLLECT FEE (WITH PENDING DUES VISIBLE IMMEDIATELY ON SCREEN)   */}
      {/* ========================================================================= */}
      {activeTab === "collect" && (
        <div ref={formRef}>
          {/* Top Pending Fees Stat Banner — Visible Immediately When Clicking Collect Fee */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem"
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
                border: "1px solid #fecdd3",
                borderRadius: "12px",
                padding: "1.1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: "#ef4444",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#9f1239", fontWeight: "700", textTransform: "uppercase" }}>
                    Total Pending Fees (एकूण बाकी)
                  </div>
                  <div style={{ fontSize: "1.45rem", fontWeight: "800", color: "#9f1239" }}>
                    {formatRupees(totalOutstandingRupees)}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab("pending")}
                style={{ fontSize: "0.78rem" }}
              >
                View All ({pendingAccounts.length})
              </button>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                border: "1px solid #fde68a",
                borderRadius: "12px",
                padding: "1.1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: "#f59e0b",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  <Clock size={22} />
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#92400e", fontWeight: "700", textTransform: "uppercase" }}>
                    Overdue Defaulters
                  </div>
                  <div style={{ fontSize: "1.45rem", fontWeight: "800", color: "#92400e" }}>
                    {overdueAccounts.length} Accounts Overdue
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleBroadcastReminders}
                style={{ fontSize: "0.78rem" }}
              >
                <Send size={13} />
                <span>Notify All</span>
              </button>
            </div>
          </div>

          {/* Form & Selection Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2rem"
            }}
          >
            {/* Step 1: Student Selection */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h4 style={{ fontSize: "1rem", fontWeight: "700", margin: 0 }}>
                  Step 1: Select Student
                </h4>
                <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                  {filteredStudents.length} Students
                </span>
              </div>

              <div className="search-box" style={{ marginBottom: "1rem" }}>
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by student name, GR No, admission..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div
                style={{
                  maxHeight: "380px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem"
                }}
              >
                {filteredStudents.map((s) => {
                  const acct = studentFeeAccounts.find((a) => a.studentId === s.id);
                  const isSelected = s.id === selectedStudentId;
                  const isPending = acct && Number(acct.remainingBalancePaise || 0) > 0;

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
                        alignItems: "center",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: "700", color: "#0f172a" }}>{s.name}</div>
                        <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                          GR: <strong>{s.grNumber}</strong> • {s.className} ({s.division || "A"})
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase" }}>
                          Pending Due
                        </div>
                        <div
                          style={{
                            fontWeight: "800",
                            fontSize: "0.95rem",
                            color: isPending ? "#dc2626" : "#16a34a"
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

            {/* Step 2: Payment Details */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <h4 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1rem" }}>
                Step 2: Payment Details & Receipt
              </h4>

              {selectedAccount && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "0.75rem",
                    background: "#f8fafc",
                    border: "1px solid var(--border-color)",
                    padding: "0.85rem",
                    borderRadius: "10px",
                    marginBottom: "1.25rem"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase" }}>
                      Total Billable
                    </div>
                    <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "#0f172a" }}>
                      {formatRupees(paiseToRupees(selectedAccount.totalPayablePaise))}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "0.72rem", color: "#065f46", textTransform: "uppercase" }}>
                      Paid
                    </div>
                    <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "#059669" }}>
                      {formatRupees(paiseToRupees(selectedAccount.totalPaidPaise))}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "0.72rem", color: "#991b1b", textTransform: "uppercase" }}>
                      Remaining Due
                    </div>
                    <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "#dc2626" }}>
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
                      placeholder="Auto-generated if blank"
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
                      placeholder="e.g. Cleared at accounts desk"
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

          {/* Quick Pending Dues Table (Visible right here on Collect Fees) */}
          <div className="card">
            <div
              className="card-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "0.75rem"
              }}
            >
              <div>
                <h4 className="card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <AlertTriangle size={17} style={{ color: "#ef4444" }} />
                  Pending Fee Defaulters (बाकी फी असणारे विद्यार्थी)
                </h4>
                <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "2px 0 0" }}>
                  ज्या विद्यार्थ्यांची फी बाकी आहे त्यांची यादी. एका क्लिकवर फी जमा करा.
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <div className="search-box" style={{ maxWidth: "260px" }}>
                  <Search size={14} className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search pending..."
                    value={pendingSearch}
                    onChange={(e) => setPendingSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="table-responsive" style={{ border: "none" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>GR Number</th>
                    <th>Student Name</th>
                    <th>Class</th>
                    <th>Total Billable</th>
                    <th>Amount Paid</th>
                    <th>Remaining Due</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPendingAccounts.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                        🎉 All student fee accounts are fully settled!
                      </td>
                    </tr>
                  ) : (
                    filteredPendingAccounts.slice(0, 10).map((a) => {
                      const payable = paiseToRupees(a.totalPayablePaise);
                      const paid = paiseToRupees(a.totalPaidPaise);
                      const bal = paiseToRupees(a.remainingBalancePaise);
                      const isSelected = a.studentId === selectedStudentId;

                      return (
                        <tr key={a.id} style={isSelected ? { background: "#f0fdf4" } : {}}>
                          <td>
                            <span style={{ fontFamily: "monospace", fontWeight: "700" }}>{a.grNumber}</span>
                          </td>
                          <td>
                            <strong>{a.studentName}</strong>
                          </td>
                          <td>{a.className}</td>
                          <td>{formatRupees(payable)}</td>
                          <td style={{ color: "#16a34a" }}>{formatRupees(paid)}</td>
                          <td>
                            <strong style={{ color: "#dc2626", fontSize: "0.95rem" }}>
                              {formatRupees(bal)}
                            </strong>
                          </td>
                          <td>
                            <span style={{ fontSize: "0.8rem", color: a.paymentStatus === "Overdue" ? "#dc2626" : "#64748b" }}>
                              {a.dueDate || "2025-11-30"}
                            </span>
                          </td>
                          <td>
                            <Badge status={a.paymentStatus} />
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => handleSelectStudentForCollect(a.studentId)}
                              style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                            >
                              <PlusCircle size={13} />
                              <span>Collect Fee</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: FULL PENDING FEES VIEW                                           */}
      {/* ========================================================================= */}
      {activeTab === "pending" && (
        <div>
          <div style={{ marginBottom: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Pending & Overdue Student Fee Accounts
              </h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: "2px 0 0" }}>
                थकीत फी खाती, मुदत संपलेले विद्यार्थी आणि पालकांना मेसेज पाठवण्याची सोय
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn btn-secondary btn-sm" onClick={handleBroadcastReminders}>
                <Send size={14} />
                <span>Notify All Guardians</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ marginBottom: "1rem" }}>
            <div className="search-box" style={{ maxWidth: "360px" }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search pending student, GR, or class..."
                value={pendingSearch}
                onChange={(e) => setPendingSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Full Pending Table */}
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>GR Number</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Academic Session</th>
                  <th>Total Billable</th>
                  <th>Amount Paid</th>
                  <th>Remaining Due</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPendingAccounts.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center", padding: "2.5rem", color: "#94a3b8" }}>
                      🎉 Outstanding! All student fee accounts are fully settled.
                    </td>
                  </tr>
                ) : (
                  filteredPendingAccounts.map((a) => {
                    const payable = paiseToRupees(a.totalPayablePaise);
                    const paid = paiseToRupees(a.totalPaidPaise);
                    const bal = paiseToRupees(a.remainingBalancePaise);

                    return (
                      <tr key={a.id}>
                        <td>
                          <span style={{ fontFamily: "monospace", fontWeight: "700" }}>{a.grNumber}</span>
                        </td>
                        <td>
                          <strong>{a.studentName}</strong>
                        </td>
                        <td>{a.className}</td>
                        <td>{a.academicYear}</td>
                        <td>{formatRupees(payable)}</td>
                        <td style={{ color: "#16a34a" }}>{formatRupees(paid)}</td>
                        <td>
                          <strong style={{ color: "#dc2626", fontSize: "1rem" }}>
                            {formatRupees(bal)}
                          </strong>
                        </td>
                        <td>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.82rem", color: a.paymentStatus === "Overdue" ? "#dc2626" : "#64748b" }}>
                            <Clock size={13} /> {a.dueDate || "2025-11-30"}
                          </span>
                        </td>
                        <td>
                          <Badge status={a.paymentStatus} />
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleSendReminder(a)}
                              title="Send SMS/Email Reminder"
                            >
                              <Send size={13} />
                              <span>Remind</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => handleSelectStudentForCollect(a.studentId)}
                            >
                              <PlusCircle size={13} />
                              <span>Collect</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: FEES PAYMENT HISTORY (TRIGGERED VIA TOP BUTTON OR TAB)           */}
      {/* ========================================================================= */}
      {activeTab === "history" && (
        <div>
          <div style={{ marginBottom: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Payment History & Transaction Audit Trail
              </h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: "2px 0 0" }}>
                जमा केलेल्या फीचा संपूर्ण इतिहास, पावती पुनर्छाप (Reprint) आणि दुरुस्ती नोंद
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setActiveTab("collect")}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              <PlusCircle size={15} />
              <span>+ New Fee Payment</span>
            </button>
          </div>

          {/* Filter & Search Bar */}
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
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
              />
            </div>

            <div>
              <select
                className="form-select"
                style={{ width: "auto" }}
                value={historyMethodFilter}
                onChange={(e) => setHistoryMethodFilter(e.target.value)}
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

          {/* Transaction Ledger Table */}
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
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan="11" style={{ textAlign: "center", padding: "2.5rem", color: "#94a3b8" }}>
                      No transaction records matched your search query.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((p) => {
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
                              type="button"
                              className="btn btn-secondary btn-sm"
                              style={{ padding: "0.3rem 0.5rem" }}
                              onClick={() => handleOpenReceiptFromHistory(p)}
                              title="Reprint Official Receipt"
                            >
                              <Printer size={13} />
                              <span>Reprint</span>
                            </button>

                            {!isReversed && (
                              <button
                                type="button"
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
        </div>
      )}

      {/* ----------------- MODALS ----------------- */}

      {/* Printable Receipt Modal (for newly collected fee) */}
      {createdReceipt && (
        <FeeReceiptModal
          isOpen={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          payment={createdReceipt}
        />
      )}

      {/* Printable Receipt Modal (from payment history reprint) */}
      {selectedHistoryReceipt && (
        <FeeReceiptModal
          isOpen={historyReceiptModalOpen}
          onClose={() => setHistoryReceiptModalOpen(false)}
          payment={selectedHistoryReceipt}
        />
      )}

      {/* Audited Payment Reversal Modal */}
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
