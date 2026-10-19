import React, { useState, useEffect } from "react";
import { CalendarCheck, Check, X, Clock, Save, Users } from "lucide-react";
import { useSchool } from "../context/SchoolContext";

export default function AttendancePage() {
  const { students, classes, attendance, markAttendance, showToast } = useSchool();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedClass, setSelectedClass] = useState(classes[0]?.name || "Grade 10");
  const [roster, setRoster] = useState({});
  const [saving, setSaving] = useState(false);

  // Filter students belonging to selected class
  const classStudents = students.filter(
    (s) => s.className === selectedClass
  );

  // Load existing records or default to Present
  useEffect(() => {
    const map = {};
    classStudents.forEach((s) => {
      // Find matching attendance record for this date and student
      const existing = attendance.find(
        (a) => a.date === selectedDate && (a.studentId === s.id || a.rollNo === s.rollNo)
      );
      map[s.id] = existing ? existing.status : "Present";
    });
    setRoster(map);
  }, [selectedDate, selectedClass, students, attendance]);

  const handleStatusChange = (studentId, status) => {
    setRoster((prev) => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    classStudents.forEach((s) => {
      updated[s.id] = status;
    });
    setRoster(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = classStudents.map((s) => ({
        date: selectedDate,
        classId: s.classId || "",
        className: selectedClass,
        studentId: s.id,
        studentName: s.name,
        rollNo: s.rollNo,
        status: roster[s.id] || "Present"
      }));

      await markAttendance(records);
    } catch (err) {
      console.error("Save attendance error:", err);
      showToast("Failed to save attendance: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(roster).filter((v) => v === "Present").length;
  const absentCount = Object.values(roster).filter((v) => v === "Absent").length;
  const lateCount = Object.values(roster).filter((v) => v === "Late").length;
  const total = classStudents.length;
  const rate = total > 0 ? Math.round(((presentCount + lateCount * 0.5) / total) * 100) : 0;

  return (
    <div>
      {/* Date & Class Controls */}
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
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <label className="form-label">Attendance Date</label>
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Select Class</label>
            <select
              className="form-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.section})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleMarkAll("Present")}
            title="Mark all present"
          >
            All Present
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleMarkAll("Absent")}
            title="Mark all absent"
          >
            All Absent
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={saving || classStudents.length === 0}
          >
            <Save size={16} />
            <span>{saving ? "Saving Sheet..." : "Save Attendance"}</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem"
        }}
      >
        <div style={{ background: "#ffffff", padding: "1rem", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase" }}>
            Total In Class
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "800" }}>{total}</div>
        </div>

        <div style={{ background: "#ecfdf5", padding: "1rem", borderRadius: "10px", border: "1px solid #a7f3d0" }}>
          <div style={{ fontSize: "0.78rem", color: "#065f46", fontWeight: "600", textTransform: "uppercase" }}>
            Present Count
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#065f46" }}>{presentCount}</div>
        </div>

        <div style={{ background: "#fef2f2", padding: "1rem", borderRadius: "10px", border: "1px solid #fecaca" }}>
          <div style={{ fontSize: "0.78rem", color: "#991b1b", fontWeight: "600", textTransform: "uppercase" }}>
            Absent Count
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#991b1b" }}>{absentCount}</div>
        </div>

        <div style={{ background: "#fffbeb", padding: "1rem", borderRadius: "10px", border: "1px solid #fde68a" }}>
          <div style={{ fontSize: "0.78rem", color: "#92400e", fontWeight: "600", textTransform: "uppercase" }}>
            Tardy / Late
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#92400e" }}>{lateCount}</div>
        </div>

        <div style={{ background: "#eef2ff", padding: "1rem", borderRadius: "10px", border: "1px solid #c7d2fe" }}>
          <div style={{ fontSize: "0.78rem", color: "#3730a3", fontWeight: "600", textTransform: "uppercase" }}>
            Attendance Rate
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#4f46e5" }}>{rate}%</div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Student Name</th>
              <th>Status Marker</th>
              <th style={{ textAlign: "right" }}>Current Value</th>
            </tr>
          </thead>
          <tbody>
            {classStudents.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                  No students enrolled in {selectedClass}. Add students to this class in the Student Directory.
                </td>
              </tr>
            ) : (
              classStudents.map((s) => {
                const currentStatus = roster[s.id] || "Present";
                return (
                  <tr key={s.id}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontWeight: "700" }}>{s.rollNo}</span>
                    </td>
                    <td>
                      <strong>{s.name}</strong>
                    </td>
                    <td>
                      <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                        <button
                          type="button"
                          className={`btn btn-sm ${currentStatus === "Present" ? "btn-success" : "btn-secondary"}`}
                          onClick={() => handleStatusChange(s.id, "Present")}
                        >
                          <Check size={14} />
                          <span>Present</span>
                        </button>

                        <button
                          type="button"
                          className={`btn btn-sm ${currentStatus === "Late" ? "btn-primary" : "btn-secondary"}`}
                          style={currentStatus === "Late" ? { background: "#f59e0b", borderColor: "#f59e0b" } : {}}
                          onClick={() => handleStatusChange(s.id, "Late")}
                        >
                          <Clock size={14} />
                          <span>Late</span>
                        </button>

                        <button
                          type="button"
                          className={`btn btn-sm ${currentStatus === "Absent" ? "btn-danger" : "btn-secondary"}`}
                          onClick={() => handleStatusChange(s.id, "Absent")}
                        >
                          <X size={14} />
                          <span>Absent</span>
                        </button>
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span
                        className={`badge ${
                          currentStatus === "Present"
                            ? "badge-present"
                            : currentStatus === "Late"
                            ? "badge-late"
                            : "badge-absent"
                        }`}
                      >
                        {currentStatus}
                      </span>
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
