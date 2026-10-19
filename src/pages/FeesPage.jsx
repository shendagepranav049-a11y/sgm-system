import React, { useState } from "react";
import {
  CreditCard,
  FileSpreadsheet,
  AlertCircle,
  History,
  BarChart2,
  PlusCircle,
  DollarSign
} from "lucide-react";
import FeeStructureTab from "../components/fees/FeeStructureTab";
import StudentFeeDetailsTab from "../components/fees/StudentFeeDetailsTab";
import PendingFeesTab from "../components/fees/PendingFeesTab";
import PaymentHistoryTab from "../components/fees/PaymentHistoryTab";
import FeeReportsTab from "../components/fees/FeeReportsTab";
import CollectFeeModal from "../components/fees/CollectFeeModal";
import FeeReceiptModal from "../components/fees/FeeReceiptModal";
import { useSchool } from "../context/SchoolContext";

export default function FeesPage({ initialSubTab = "students", onOpenCollectModal }) {
  const [activeTab, setActiveTab] = useState(initialSubTab);
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [preselectedStudent, setPreselectedStudent] = useState("");
  const [createdPayment, setCreatedPayment] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const { totalFeesCollected, totalPendingFees, settings } = useSchool();
  const currency = settings.currency || "$";

  const handleOpenCollect = (studentId = "") => {
    setPreselectedStudent(studentId);
    setCollectModalOpen(true);
  };

  const handlePaymentFinished = (payment) => {
    setCreatedPayment(payment);
    setReceiptOpen(true);
  };

  return (
    <div>
      {/* Top Action Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>
              Total Realized Collections
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "#16a34a" }}>
              {currency}{totalFeesCollected.toLocaleString()}
            </div>
          </div>
          <div style={{ height: "30px", width: "1px", background: "var(--border-color)" }}></div>
          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>
              Outstanding Balance
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "#dc2626" }}>
              {currency}{totalPendingFees.toLocaleString()}
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => handleOpenCollect("")}>
          <PlusCircle size={18} />
          <span>+ Record Fee Payment</span>
        </button>
      </div>

      {/* Fees Sub Navigation Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === "students" ? "active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          <CreditCard size={17} />
          <span>Student Fee Balances</span>
        </button>

        <button
          className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          <AlertCircle size={17} />
          <span>Pending & Overdue Dues</span>
        </button>

        <button
          className={`tab-btn ${activeTab === "structures" ? "active" : ""}`}
          onClick={() => setActiveTab("structures")}
        >
          <FileSpreadsheet size={17} />
          <span>Class Fee Structures</span>
        </button>

        <button
          className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <History size={17} />
          <span>Payment History & Receipts</span>
        </button>

        <button
          className={`tab-btn ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          <BarChart2 size={17} />
          <span>Financial Reports</span>
        </button>
      </div>

      {/* Subtab Contents */}
      <div className="card" style={{ padding: "1.5rem" }}>
        {activeTab === "students" && (
          <StudentFeeDetailsTab onCollectFeeForStudent={(id) => handleOpenCollect(id)} />
        )}

        {activeTab === "pending" && (
          <PendingFeesTab onCollectFeeForStudent={(id) => handleOpenCollect(id)} />
        )}

        {activeTab === "structures" && <FeeStructureTab />}

        {activeTab === "history" && <PaymentHistoryTab />}

        {activeTab === "reports" && <FeeReportsTab />}
      </div>

      {/* Modals */}
      <CollectFeeModal
        isOpen={collectModalOpen}
        onClose={() => setCollectModalOpen(false)}
        preselectedStudentId={preselectedStudent}
        onPaymentComplete={handlePaymentFinished}
      />

      {createdPayment && (
        <FeeReceiptModal
          isOpen={receiptOpen}
          onClose={() => setReceiptOpen(false)}
          payment={createdPayment}
        />
      )}
    </div>
  );
}
