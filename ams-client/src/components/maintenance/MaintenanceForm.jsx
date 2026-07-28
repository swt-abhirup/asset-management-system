import { useState } from "react";
import { Wrench } from "lucide-react";
import api from "../../services/api";
import { toast } from "../Toast";

const TYPES = ["repair", "service", "inspection", "upgrade"];

const L = { color: "#1b4f72", fontSize: "11px", fontWeight: 600, marginBottom: "4px", display: "block" };
const I = { width: "100%", padding: "6px 10px", fontSize: "12px", border: "1px solid #e2e8f0", borderRadius: "6px", outline: "none", color: "#1e293b", backgroundColor: "#fff" };
const fi = e => { e.target.style.borderColor = "#19405e"; e.target.style.boxShadow = "0 0 0 2px rgba(25,64,94,0.1)"; };
const fo = e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; };

const INIT = { asset_id: "", type: "repair", description: "", vendor: "", cost: "", scheduled_date: "", status: "scheduled" };

export default function MaintenanceForm({ assets, onSaved }) {

    const [form,   setForm]   = useState(INIT);
    const [saving, setSaving] = useState(false);

    const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const save = async () => {
        if (!form.asset_id || !form.description) {
            toast.warn("Asset and description are required.");
            return;
        }
        try {
            setSaving(true);
            await api.post("/api/maintenance", {
                ...form,
                cost: form.cost ? Number(form.cost) : 0,
                scheduled_date: form.scheduled_date || new Date().toISOString()
            });
            setForm(INIT);
            onSaved();
            setTimeout(() => toast.success("Maintenance log created."), 0);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create log.");
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
                    Log Maintenance
                </h3>
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="md:col-span-2">
                    <label style={L}>Asset *</label>
                    <select name="asset_id" value={form.asset_id} onChange={set} style={I}>
                        <option value="">— Select asset —</option>
                        {assets.map(a => (
                            <option key={a.asset_id} value={a.asset_id}>
                                {a.name} · {a.serial_number}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={L}>Type</label>
                    <select name="type" value={form.type} onChange={set} style={I}>
                        {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                </div>
                <div>
                    <label style={L}>Status</label>
                    <select name="status" value={form.status} onChange={set} style={I}>
                        <option value="scheduled">Scheduled</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="md:col-span-2">
                    <label style={L}>Description *</label>
                    <input name="description" value={form.description} onChange={set}
                        placeholder="Describe the issue or work…" style={I} onFocus={fi} onBlur={fo} />
                </div>
                <div>
                    <label style={L}>Vendor / Technician</label>
                    <input name="vendor" value={form.vendor} onChange={set}
                        placeholder="e.g. Dell Support" style={I} onFocus={fi} onBlur={fo} />
                </div>
                <div>
                    <label style={L}>Cost (₹)</label>
                    <input type="number" name="cost" value={form.cost} onChange={set}
                        placeholder="0" style={I} onFocus={fi} onBlur={fo} />
                </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div>
                    <label style={L}>Scheduled Date</label>
                    <input type="date" name="scheduled_date" value={form.scheduled_date} onChange={set}
                        style={I} onFocus={fi} onBlur={fo} />
                </div>
            </div>

            <div className="flex justify-end">
                <button onClick={save} disabled={saving}
                    className="px-4 py-2 rounded text-xs font-semibold text-white disabled:opacity-60"
                    style={{ backgroundColor: "#19405e" }}
                    onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = "#1b4f72"; }}
                    onMouseLeave={e => { if (!saving) e.currentTarget.style.backgroundColor = "#19405e"; }}>
                    {saving ? "Saving…" : "Save Log"}
                </button>
            </div>
        </div>
    );
}
