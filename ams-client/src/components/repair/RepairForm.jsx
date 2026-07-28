import { useState } from "react";
import { Wrench } from "lucide-react";
import api        from "../../services/api";
import { toast }  from "../Toast";

const PRIORITIES = ["low", "medium", "high", "critical"];

const L  = { color: "#1b4f72", fontSize: "11px", fontWeight: 600, marginBottom: "4px", display: "block" };
const IS = { width: "100%", padding: "6px 10px", fontSize: "12px", border: "1px solid #e2e8f0", borderRadius: "6px", outline: "none", color: "#1e293b", backgroundColor: "#fff" };
const fi = e => { e.target.style.borderColor = "#19405e"; e.target.style.boxShadow = "0 0 0 2px rgba(25,64,94,0.1)"; };
const fo = e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; };

const INIT = { asset_id: "", title: "", description: "", priority: "medium", reported_by: "" };

export default function RepairForm({ assets, onSaved }) {

    const [form,   setForm]   = useState(INIT);
    const [saving, setSaving] = useState(false);

    const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const save = async () => {
        if (!form.asset_id || !form.title || !form.description) {
            toast.warn("Asset, title and description are required.");
            return;
        }
        try {
            setSaving(true);
            await api.post("/api/repair-requests", form);
            setForm(INIT);
            onSaved();
            setTimeout(() => toast.success("Repair request submitted."), 0);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit request.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rounded-lg p-4 mb-4"
            style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>

            <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ backgroundColor: "rgba(25,64,94,0.08)" }}>
                    <Wrench size={13} style={{ color: "#19405e" }} />
                </div>
                <h3 className="text-sm font-bold"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                    New Repair Request
                </h3>
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="md:col-span-2">
                    <label style={L}>Asset *</label>
                    <select name="asset_id" value={form.asset_id} onChange={set} style={IS}>
                        <option value="">— Select asset —</option>
                        {assets.map(a => (
                            <option key={a.asset_id} value={a.asset_id}>
                                {a.name} · {a.serial_number}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={L}>Priority</label>
                    <select name="priority" value={form.priority} onChange={set} style={IS}>
                        {PRIORITIES.map(p => (
                            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={L}>Reported By</label>
                    <input name="reported_by" value={form.reported_by} onChange={set}
                        placeholder="email or name" style={IS} onFocus={fi} onBlur={fo} />
                </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                    <label style={L}>Title *</label>
                    <input name="title" value={form.title} onChange={set}
                        placeholder="e.g. Screen flickering on laptop" style={IS} onFocus={fi} onBlur={fo} />
                </div>
                <div>
                    <label style={L}>Description *</label>
                    <input name="description" value={form.description} onChange={set}
                        placeholder="Detailed description of the issue…" style={IS} onFocus={fi} onBlur={fo} />
                </div>
            </div>

            <div className="flex justify-end">
                <button onClick={save} disabled={saving}
                    className="px-4 py-2 rounded text-xs font-semibold text-white disabled:opacity-60"
                    style={{ backgroundColor: "#19405e" }}
                    onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = "#1b4f72"; }}
                    onMouseLeave={e => { if (!saving) e.currentTarget.style.backgroundColor = "#19405e"; }}>
                    {saving ? "Submitting…" : "Submit Request"}
                </button>
            </div>
        </div>
    );
}
