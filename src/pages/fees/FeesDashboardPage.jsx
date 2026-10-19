import React, { useState } from "react";
import {
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  PlusCircle,
  Search,
  Filter,
  Calendar,
  FileSpreadsheet,
  ArrowRight
} from "lucide-react";
import { useSchool } from "../../context/SchoolContext";
import { formatRupees, paiseToRupees } from "../../utils/currency";
import { FeesOverviewChart, MonthlyCollectionChart } from "../../components/common/DashboardCharts";
import StatCard from "../../components/common/StatCard";
import Badge from "../../components/common/Badge";

export default function FeesDashboardPage({ onOpenCollectFee, onNavigate }) {
  const {
    studentFeeAccounts,
    feePayments,
    totalExpectedPaise,
    totalCollectedPaise,
    totalRemainingPaise,
    fullyPaidCount,
    partiallyPaidCount,
    unpaidCount,
    overdueCount
  } = useSchool();

  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");

  const totalCollectedRupees = paiseToRupees(totalCollectedPaise);
  const totalRemainingRupees = paiseToRupees(totalRemainingPaise);
  const totalExpectedRupees = paiseToRupees(totalExpectedPaise);

  // Compute Today's Collection
  const todayStr = new Date().toISOString().split("T")[0];
  const todaysPayments = feePayments.filter((p) => p.paymentDate === todayStr);
  const todayTotalRupees = todaysPayments.reduce((acc, p) => acc + paiseToRupees(p.amountPaise), 0);

  // Payment Mode Distribution
  const modeCounts = {};
  feePayments.forEach((p) => {
    const m = p.paymentMode || "Cash";
    modeCounts[m] = (modeCounts[m] || 0) + paiseToRupees(p.amountPaise);
  });

  const filteredPayments = feePayments.filter((p) => {
    const matchSearch =
      p.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.grNumber && p.grNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchMethod = methodFilter === "all" || p.paymentMode === methodFilter;
    return matchSearch && matchMethod;
  });

  return (
    <div>
      {/* Top Banner & Quick Action */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.75rem"
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
            Fees & Revenue Intelligence
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "2px 0 0" }}>
            Real-time cash flow, collection targets, overdue analysis, and institutional ledger
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => onOpenCollectFee("")}>
          <PlusCircle size={17} />
          <span>+ Record Fee Payment</span>
        </button>
      </div>

      {/* 8 Metric KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
          marginBottom: "1.75rem"
        }}
      >
        <StatCard
          title="Total Expected Fees"
          value={formatRupees(totalExpectedRupees)}
          icon={CreditCard}
          trendLabel="total billable"
          accentColor="#4f46e5"
          bgColor="#eef2ff"
        />

        <StatCard
          title="Total Collected"
          value={formatRupees(totalCollectedRupees)}
          icon={CheckCircle2}
          trend={`${totalExpectedRupees > 0 ? Math.round((totalCollectedRupees / totalExpectedRupees) * 100) : 0}%`}
          trendType="positive"
          trendLabel="realized revenue"
          accentColor="#10b981"
          bgColor="#ecfdf5"
        />

        <StatCard
          title="Remaining Balance"
          value={formatRupees(totalRemainingRupees)}
          icon={AlertCircle}
          trend={`${totalExpectedRupees > 0 ? Math.round((totalRemainingRupees / totalExpectedRupees) * 100) : 0}%`}
          trendType="negative"
          trendLabel="receivable dues"
          accentColor="#ef4444"
          bgColor="#fef2f2"
        />

        <StatCard
          title="Today's Collection"
          value={formatRupees(todayTotalRupees)}
          icon={Clock}
          trendLabel="real-time transactions"
          accentColor="#0ea5e9"
          bgColor="#f0f9ff"
        />

        <StatCard
          title="Fully Paid Students"
          value={fullyPaidCount}
          icon={CheckCircle2}
          trend="Cleared"
          trendType="positive"
          accentColor="#10b981"
          bgColor="#ecfdf5"
        />

        <StatCard
          title="Partially Paid"
          value={partiallyPaidCount}
          icon={TrendingUp}
          trend="In Progress"
          accentColor="#f59e0b"
          bgColor="#fffbeb"
        />

        <StatCard
          title="Unpaid Accounts"
          value={unpaidCount}
          icon={CreditCard}
          trend="No Payments"
          trendType="negative"
          accentColor="#64748b"
          bgColor="#f1f5f9"
        />

        <StatCard
          title="Overdue Accounts"
          value={overdueCount}
          icon={AlertCircle}
          trend="Urgent Notice"
          trendType="negative"
          accentColor="#dc2626"
          bgColor="#fee2e2"
        />
      </div>

      {/* Visual Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "1.5rem", marginBottom: "1.75rem" }}>
        {/* Realization Donut Gauge */}
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Realized vs Outstanding Revenue</h4>
          </div>
          <div className="card-body" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
            <FeesOverviewChart
              collectedRupees={totalCollectedRupees}
              remainingRupees={totalRemainingRupees}
            />
          </div>
        </div>

        {/* Monthly Collection Trend */}
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Monthly Collection Breakdown</h4>
            <span style={{ fontSize: "0.82rem", color: "#64748b" }}>AY 2025-2026</span>
          </div>
          <div className="card-body">
            <MonthlyCollectionChart />
          </div>
        </div>
      </div>

      {/* Payment Channel Distribution Grid */}
      <div className="card" style={{ marginBottom: "1.75rem" }}>
        <div className="card-header">
          <h4 className="card-title">Payment Mode Distribution</h4>
        </div>
        <div className="card-body" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
          {Object.entries(modeCounts).map(([mode, amt]) => {
            const pct = totalCollectedRupees > 0 ? Math.round((amt / totalCollectedRupees) * 100) : 0;
            return (
              <div key={mode} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#0f172a" }}>{mode}</div>
                <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "#4f46e5", margin: "4px 0" }}>
                  {formatRupees(amt)}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{pct}% of collected</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="card">
        <div className="card-header">
          <h4 className="card-title">Recent Fee Transactions</h4>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <div className="search-box" style={{ maxWidth: "240px" }}>
              <Search size={15} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              style={{ width: "auto" }}
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
            >
              <option value="all">All Modes</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
        </div>

        <div className="table-responsive" style={{ border: "none" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Student</th>
                <th>GR Number</th>
                <th>Class</th>
                <th>Fee Component</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.slice(0, 7).map((p) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: "monospace", fontWeight: "700", color: "var(--primary)" }}>
                    {p.receiptNo}
                  </td>
                  <td>
                    <strong>{p.studentName}</strong>
                  </td>
                  <td>{p.grNumber}</td>
                  <td>{p.className}</td>
                  <td>{p.feeComponent}</td>
                  <td>{p.paymentMode}</td>
                  <td>
                    <strong style={{ color: "#16a34a" }}>
                      {formatRupees(paiseToRupees(p.amountPaise))}
                    </strong>
                  </td>
                  <td>{p.paymentDate}</td>
                  <td>
                    <Badge status={p.status || "Completed"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
