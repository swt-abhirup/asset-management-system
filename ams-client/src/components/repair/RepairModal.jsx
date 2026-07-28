import { useEffect, useState } from "react";
import { X, Wrench } from "lucide-react";
import api       from "../../services/api";
import { toast } from "../Toast";

const L  = { color: "#1b4f72", fontSize: "11px", fontWeight: 600, marginBottom: "4px", display: "block" };
const IS = { width: "100%", padding: "6px 10px", fontSize: "12px", border: "1px solid #e2e8f0", borderRadius: "6px", outline: "none", color: "#1e293b", backgroundColor: "#fff" };
const fi = e => { e.target.style.borderColor = "#19405e"; e.target.style.boxShadow = "0 0 0 2px rgba(25,64,94,0.1)"; };
const fo = e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; };

const PRIORITY_STYLE = {
    low:      { bg: "#f0f9ff", color: "#0369a1", border: "#bae6fd" },
    medium:   { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
    high:     { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
    critical: { bg: "#fff5f5", color: "#dc2626", border: "#fca5a5" },
};

export default function RepairModal({ request, assetName, employees, onClose, onSaved }) {

    const [form,   setForm]   = useState({ status: "open", assigned_to: "", resolution: "", priority: "medium" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (request) setForm({
            status:      request.status      ?? "open",
            assigned_to: request.assigned_to ?? "",
            resolution:  request.resolution  ?? "",
            priority:    request.priority    ?? "medium",
        });
    }, [request]);

    const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const update = async () => {
        try {
            setSaving(true);
            await api.put(`/api/repair-requests/${request.request_id}`, form);
            onClose();
            onSaved();
            setTimeout(() => toast.success("Repair request updated."), 0);
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed.");
        } finally {
            setSaving(false);
        }
    };

    if (!request) return null;

    const ps = PRIORITY_STYLE[request.priority] ?? PRIORITY_STYLE.medium;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>

            <div className="w-full max-w-lg rounded-xl shadow-2xl" style={{ backgroundColor: "#ffffff" }}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b"
                    style={{ borderColor: "#f1f5f9" }}>
                    <div className="flex items-center gap-2">
                        <Wrench size={14} style={{ color: "#19405e" }} />
                        <h3 className="text-sm font-bold"
                            style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                            Update Repair Request
                        </h3>
                    </div>
                    <button onClick={onClose}
                        className="w-6 h-6 rounded flex items-center justify-center"
                        style={{ color: "#94a3b8" }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#f1f5f9"; e.currentTarget.style.color = "#19405e"; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                        <X size={14} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-4 flex flex-col gap-3">

                    {/* Summary */}
                    <div className="rounded-lg p-3"
                        style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="text-xs font-bold" style={{ color: "#19405e" }}>{request.title}</p>
                                <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{assetName}</p>
                                <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{request.description}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded text-xs font-semibold capitalize flex-shrink-0"
                                style={{ backgroundColor: ps.bg, color: ps.color, border: `1px solid ${ps.border}` }}>
                                {request.priority}
                            </span>
                        </div>
                        <p className="text-xs mt-2" style={{ color: "#94a3b8" }}>
                            Reported by: <span style={{ color: "#64748b" }}>{request.reported_by}</span>
                            &nbsp;·&nbsp;
                            {new Date(request.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                    </div>

                    {/* Editable fields */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label style={L}>Status</label>
                            <select name="status" value={form.status} onChange={set} style={IS}>
                                <option value="open">Open</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                        <div>
                            <label style={L}>Priority</label>
                            <select name="priority" value={form.priority} onChange={set} style={IS}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={L}>Assign To Technician</label>
                        <select name="assigned_to" value={form.assigned_to} onChange={set} style={IS}>
                            <option value="">— Unassigned —</option>
                            {employees.map(e => (
                                <option key={e.email} value={e.email}>
                                    {e.fullname} · {e.department || e.role}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={L}>Resolution Notes</label>
                        <textarea name="resolution" rows={3} value={form.resolution} onChange={set}
                            placeholder="What was done to resolve the issue…"
                            style={{ ...IS, resize: "none" }} onFocus={fi} onBlur={fo} />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: "#f1f5f9" }}>
                    <button onClick={onClose}
                        className="px-4 py-2 rounded text-xs font-semibold border"
                        style={{ borderColor: "#e2e8f0", color: "#64748b" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f8fafc"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                        Cancel
                    </button>
                    <button onClick={update} disabled={saving}
                        className="px-4 py-2 rounded text-xs font-semibold text-white disabled:opacity-60"
                        style={{ backgroundColor: "#19405e" }}
                        onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = "#1b4f72"; }}
                        onMouseLeave={e => { if (!saving) e.currentTarget.style.backgroundColor = "#19405e"; }}>
                        {saving ? "Saving…" : "Update Request"}
                    </button>
                </div>
            </div>
        </div>
    );
}
