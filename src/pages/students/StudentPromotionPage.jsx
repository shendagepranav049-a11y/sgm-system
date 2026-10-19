import React, { useState } from "react";
import { ArrowUpRight, CheckSquare, Square, Users, CheckCircle2 } from "lucide-react";
import { useSchool } from "../../context/SchoolContext";

export default function StudentPromotionPage() {
  const { students, classes, academicYears, promoteStudents } = useSchool();
  const [sourceClass, setSourceClass] = useState("Grade 9");
  const [targetClass, setTargetClass] = useState("Grade 10");
  const [targetYear, setTargetYear] = useState("2026-2027");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isPromoting, setIsPromoting] = useState(false);

  const eligibleStudents = students.filter((s) => s.className === sourceClass);

  const toggleSelectAll = () => {
    if (selectedIds.length === eligibleStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(eligibleStudents.map((s) => s.id));
    }
  };

  const toggleStudent = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handlePromote = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one student to promote.");
      return;
    }

    if (
      confirm(
        `Are you sure you want to promote ${selectedIds.length} students from ${sourceClass} to ${targetClass} for ${targetYear}?`
      )
    ) {
      setIsPromoting(true);
      try {
        await promoteStudents(selectedIds, targetClass, targetYear);
        setSelectedIds([]);
      } finally {
        setIsPromoting(false);
      }
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Student Academic Promotion</h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Advance eligible students to the next grade level and assign new academic session records
        </p>
      </div>

      {/* Promotion Configuration Controls */}
      <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Promote From (Source Class)</label>
            <select
              className="form-select"
              value={sourceClass}
              onChange={(e) => {
                setSourceClass(e.target.value);
                setSelectedIds([]);
              }}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Promote To (Target Class)</label>
            <select
              className="form-select"
              value={targetClass}
              onChange={(e) => setTargetClass(e.target.value)}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Next Academic Year</label>
            <select
              className="form-select"
              value={targetYear}
              onChange={(e) => setTargetYear(e.target.value)}
            >
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.name}>
                  {ay.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
          <button className="btn btn-secondary btn-sm" onClick={toggleSelectAll}>
            {selectedIds.length === eligibleStudents.length ? <Square size={14} /> : <CheckSquare size={14} />}
            <span>Select All ({eligibleStudents.length})</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={handlePromote}
            disabled={isPromoting || selectedIds.length === 0}
          >
            <ArrowUpRight size={16} />
            <span>{isPromoting ? "Promoting..." : `Promote Selected (${selectedIds.length})`}</span>
          </button>
        </div>
      </div>

      {/* Eligible Students Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "40px" }}>Select</th>
              <th>GR Number</th>
              <th>Student Name</th>
              <th>Current Class</th>
              <th>Attendance Rate</th>
              <th>Target Class</th>
            </tr>
          </thead>
          <tbody>
            {eligibleStudents.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                  No students found in {sourceClass}.
                </td>
              </tr>
            ) : (
              eligibleStudents.map((s) => {
                const isSelected = selectedIds.includes(s.id);
                return (
                  <tr key={s.id} onClick={() => toggleStudent(s.id)} style={{ cursor: "pointer" }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Controlled by row click
                      />
                    </td>
                    <td>
                      <span style={{ fontFamily: "monospace", fontWeight: "700" }}>{s.grNumber}</span>
                    </td>
                    <td>
                      <strong>{s.name}</strong>
                    </td>
                    <td>{s.className}</td>
                    <td>
                      <span style={{ color: "#10b981", fontWeight: "700" }}>
                        {s.attendancePercentage || 95}%
                      </span>
                    </td>
                    <td>
                      <span style={{ color: "var(--primary)", fontWeight: "700" }}>{targetClass}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
