import { useState } from "react";
import { ClipboardList } from "lucide-react";
import api from "../../services/api";
import { toast } from "../Toast";

const label    = { color: "#1b4f72", fontSize: "11px", fontWeight: 600, marginBottom: "4px", display: "block" };
const inputSt  = { width: "100%", padding: "6px 10px", fontSize: "12px", border: "1px solid #e2e8f0", borderRadius: "6px", outline: "none", color: "#1e293b", backgroundColor: "#fff" };
const focusIn  = e => { e.target.style.borderColor = "#19405e"; e.target.style.boxShadow = "0 0 0 2px rgba(25,64,94,0.1)"; };
const focusOut = e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; };

export default function AssignForm({ assets, employees, onSaved }) {

    const [form,   setForm]   = useState({ asset_id: "", employee_email: "", notes: "" });
    const [saving, setSaving] = useState(false);

    const availableAssets    = assets.filter(a => a.status === "available");
    const activeEmployees    = employees.filter(e => e.status === "active");

    const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const save = async () => {
        if (!form.asset_id || !form.employee_email) {
            toast.warn("Please select both an asset and an employee.");
            return;
        }
        try {
            setSaving(true);
            await api.post("/api/assignments", form);
            setForm({ asset_id: "", employee_email: "", notes: "" });
            onSaved();
            setTimeout(() => toast.success("Asset assigned successfully."), 0);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create assignment.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rounded-lg p-4 mb-4"
            style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>

            <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: "rgba(25,64,94,0.08)" }}>
                    <ClipboardList size={13} style={{ color: "#19405e" }} />
                </div>
                <h3 className="text-sm font-bold"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                    Assign Asset
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                    <label style={label}>Asset (Available only) *</label>
                    <select name="asset_id" value={form.asset_id} onChange={set} style={inputSt}>
                        <option value="">— Select asset —</option>
                        {availableAssets.map(a => (
                            <option key={a.asset_id} value={a.asset_id}>
                                {a.name} · {a.serial_number}
                            </option>
                        ))}
                    </select>
                    {availableAssets.length === 0 && (
                        <p className="text-xs mt-1" style={{ color: "#d97706" }}>No available assets at the moment.</p>
                    )}
                </div>
                <div>
                    <label style={label}>Assign To *</label>
                    <select name="employee_email" value={form.employee_email} onChange={set} style={inputSt}>
                        <option value="">— Select employee —</option>
                        {activeEmployees.map(e => (
                            <option key={e.email} value={e.email}>
                                {e.fullname} · {e.department || e.role}
                            </option>
                        ))}
                    </select>
                    {activeEmployees.length === 0 && (
                        <p className="text-xs mt-1" style={{ color: "#d97706" }}>No active employees found.</p>
                    )}
                </div>
                <div>
                    <label style={label}>Notes</label>
                    <input name="notes" value={form.notes} onChange={set}
                        placeholder="Optional notes…" style={inputSt} onFocus={focusIn} onBlur={focusOut} />
                </div>
            </div>

            <div className="flex justify-end">
                <button onClick={save} disabled={saving}
                    className="px-4 py-2 rounded text-xs font-semibold text-white disabled:opacity-60"
                    style={{ backgroundColor: "#19405e" }}
                    onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = "#1b4f72"; }}
                    onMouseLeave={e => { if (!saving) e.currentTarget.style.backgroundColor = "#19405e"; }}>
                    {saving ? "Assigning…" : "Assign Asset"}
                </button>
            </div>
        </div>
    );
}
