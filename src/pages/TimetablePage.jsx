import React, { useState } from "react";
import { Plus, Calendar, Clock, Trash2, BookOpen } from "lucide-react";
import { useSchool } from "../context/SchoolContext";
import Modal from "../components/common/Modal";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function TimetablePage() {
  const { timetable, classes, teachers, addTimetableSlot, deleteTimetableSlot } = useSchool();
  const [selectedClass, setSelectedClass] = useState(classes[0]?.name || "Grade 10");
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    day: "Monday",
    timeSlot: "08:30 - 09:30 AM",
    className: classes[0]?.name || "Grade 10",
    subject: "Mathematics",
    teacher: teachers[0]?.name || "Emily Watson",
    room: "Room 301"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addTimetableSlot(formData);
    setModalOpen(false);
  };

  const classSchedule = timetable.filter((t) => t.className === selectedClass);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div>
            <label className="form-label">Select Class Schedule</label>
            <select
              className="form-select"
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setFormData((prev) => ({ ...prev, className: e.target.value }));
              }}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.section})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          <span>+ Add Period / Class Slot</span>
        </button>
      </div>

      {/* Weekly Schedule Days Columns */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
        {DAYS.map((day) => {
          const daySlots = classSchedule.filter((s) => s.day === day);

          return (
            <div key={day} className="card" style={{ padding: "1.25rem" }}>
              <div
                style={{
                  paddingBottom: "0.75rem",
                  marginBottom: "1rem",
                  borderBottom: "2px solid var(--primary-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <h4 style={{ fontSize: "1.05rem", fontWeight: "700" }}>{day}</h4>
                <span className="badge badge-info">{daySlots.length} Classes</span>
              </div>

              {daySlots.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  No classes assigned
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      style={{
                        background: "#f8fafc",
                        border: "1px solid var(--border-color)",
                        borderRadius: "8px",
                        padding: "0.75rem",
                        position: "relative"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <strong style={{ fontSize: "0.95rem", color: "var(--primary)" }}>{slot.subject}</strong>
                        <button
                          style={{ background: "none", color: "#94a3b8", cursor: "pointer" }}
                          onClick={() => deleteTimetableSlot(slot.id)}
                          title="Remove period"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                        {slot.teacher}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                          <Clock size={12} /> {slot.timeSlot}
                        </span>
                        <span>{slot.room}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Slot Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Schedule Period">
        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Day of Week *</label>
              <select
                className="form-select"
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Time Slot *</label>
              <input
                type="text"
                className="form-input"
                value={formData.timeSlot}
                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                placeholder="e.g. 08:30 - 09:30 AM"
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Class</label>
              <select
                className="form-select"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subject *</label>
              <input
                type="text"
                className="form-input"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Chemistry"
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Assigned Teacher</label>
              <select
                className="form-select"
                value={formData.teacher}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name} ({t.subject})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Room / Lab</label>
              <input
                type="text"
                className="form-input"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="e.g. Room 301 or Physics Lab"
              />
            </div>
          </div>

          <div className="modal-footer" style={{ margin: "1.5rem -1.5rem -1.5rem", padding: "1rem 1.5rem" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Slot
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
