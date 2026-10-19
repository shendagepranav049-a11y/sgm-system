import React, { useState } from "react";
import { Plus, Bell, Trash2, Calendar, UserCheck } from "lucide-react";
import { useSchool } from "../context/SchoolContext";
import Modal from "../components/common/Modal";
import Badge from "../components/common/Badge";

export default function NoticesPage() {
  const { notices, addNotice, deleteNotice } = useSchool();
  const [modalOpen, setModalOpen] = useState(false);
  const [audienceFilter, setAudienceFilter] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetAudience: "All Students & Faculty",
    priority: "Normal",
    author: "Administration Office",
    date: new Date().toISOString().split("T")[0]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addNotice(formData);
    setModalOpen(false);
    setFormData({
      title: "",
      content: "",
      targetAudience: "All Students & Faculty",
      priority: "Normal",
      author: "Administration Office",
      date: new Date().toISOString().split("T")[0]
    });
  };

  const filtered = notices.filter((n) => {
    if (audienceFilter === "all") return true;
    return n.targetAudience.toLowerCase().includes(audienceFilter.toLowerCase());
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Notice Board & Official Circulars</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Publish school directives, academic announcements, and holiday bulletins
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          <span>+ Create Notice</span>
        </button>
      </div>

      {/* Grid of Notices */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
        {filtered.map((n) => (
          <div key={n.id} className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
              <Badge status={n.priority} />
              <button
                className="btn btn-danger btn-sm"
                style={{ padding: "0.25rem 0.4rem" }}
                onClick={() => {
                  if (confirm(`Delete notice "${n.title}"?`)) {
                    deleteNotice(n.id);
                  }
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>

            <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.5rem", color: "var(--text-main)" }}>
              {n.title}
            </h4>

            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6", flex: 1, marginBottom: "1rem" }}>
              {n.content}
            </p>

            <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "0.75rem", fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
              <span>Target: <strong>{n.targetAudience}</strong></span>
              <span>{n.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Notice Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Broadcast Official Notice">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Notice Title / Subject *</label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Schedule for Annual Science Olympiad"
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Target Audience</label>
              <select
                className="form-select"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              >
                <option value="All Students & Faculty">All Students & Faculty</option>
                <option value="Parents & Students">Parents & Students</option>
                <option value="Grade 8-10 Students">Grade 8-10 Students</option>
                <option value="Grade 11-12 Students">Grade 11-12 Students</option>
                <option value="Teaching Staff Only">Teaching Staff Only</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Urgency Priority</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notice Body / Message *</label>
            <textarea
              rows="4"
              className="form-textarea"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Provide complete circular details, deadlines, and contact information..."
              required
            ></textarea>
          </div>

          <div className="modal-footer" style={{ margin: "1.5rem -1.5rem -1.5rem", padding: "1rem 1.5rem" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Publish Notice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
