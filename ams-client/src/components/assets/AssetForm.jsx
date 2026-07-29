import { useState } from "react";
import { PackagePlus } from "lucide-react";
import api from "../../services/api";
import { toast } from "../Toast";

const INITIAL = {
    name: "", category_id: "", brand: "", model: "",
    serial_number: "", purchase_date: "", purchase_cost: "",
    warranty_expiry: "", notes: ""
};

const label    = { color: "#1b4f72", fontSize: "11px", fontWeight: 600, marginBottom: "4px", display: "block" };
const inputSt  = { width: "100%", padding: "6px 10px", fontSize: "12px", border: "1px solid #e2e8f0", borderRadius: "6px", outline: "none", color: "#1e293b", backgroundColor: "#fff" };
const focusIn  = e => { e.target.style.borderColor = "#19405e"; e.target.style.boxShadow = "0 0 0 2px rgba(25,64,94,0.1)"; };
const focusOut = e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; };

export default function AssetForm({ categories, onSaved }) {

    const [form,   setForm]   = useState(INITIAL);
    const [saving, setSaving] = useState(false);

    const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const save = async () => {
        if (!form.name || !form.category_id) {
            toast.warn("Asset name and category are required.");
            return;
        }
        try {
            setSaving(true);
            await api.post("/api/assets", {
                ...form,
                purchase_cost: form.purchase_cost ? Number(form.purchase_cost) : 0
            });
            setForm(INITIAL);
            onSaved();
            setTimeout(() => toast.success("Asset added successfully."), 0);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add asset.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rounded-lg p-4 mb-4"
            style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>

            <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: "rgba(25,64,94,0.08)" }}>
                    <PackagePlus size={13} style={{ color: "#19405e" }} />
                </div>
                <h3 className="text-sm font-bold"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                    Add New Asset
                </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div>
                    <label style={label}>Asset Name *</label>
                    <input name="name" value={form.name} onChange={set} placeholder="e.g. Dell Laptop"
                        style={inputSt} onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div>
                    <label style={label}>Category *</label>
                    <select name="category_id" value={form.category_id} onChange={set} style={inputSt}>
                        <option value="">Select category</option>
                        {categories.map(c => (
                            <option key={c.category_id} value={c.category_id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={label}>Brand</label>
                    <input name="brand" value={form.brand} onChange={set} placeholder="e.g. Dell"
                        style={inputSt} onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div>
                    <label style={label}>Model</label>
                    <input name="model" value={form.model} onChange={set} placeholder="e.g. Latitude 5540"
                        style={inputSt} onFocus={focusIn} onBlur={focusOut} />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div>
                    <label style={label}>Serial Number</label>
                    <input name="serial_number" value={form.serial_number} onChange={set} placeholder="SN-XXXXX"
                        style={inputSt} onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div>
                    <label style={label}>Purchase Date</label>
                    <input type="date" name="purchase_date" value={form.purchase_date} onChange={set}
                        style={inputSt} onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div>
                    <label style={label}>Purchase Cost (₹)</label>
                    <input type="number" name="purchase_cost" value={form.purchase_cost} onChange={set} placeholder="0.00"
                        style={inputSt} onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div>
                    <label style={label}>Warranty Expiry</label>
                    <input type="date" name="warranty_expiry" value={form.warranty_expiry} onChange={set}
                        style={inputSt} onFocus={focusIn} onBlur={focusOut} />
                </div>
            </div>

            <div className="mb-3">
                <label style={label}>Notes</label>
                <input name="notes" value={form.notes} onChange={set} placeholder="Any additional notes…"
                    style={inputSt} onFocus={focusIn} onBlur={focusOut} />
            </div>

            <div className="flex justify-end">
                <button onClick={save} disabled={saving}
                    className="px-4 py-2 rounded text-xs font-semibold text-white disabled:opacity-60"
                    style={{ backgroundColor: "#19405e" }}
                    onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = "#1b4f72"; }}
                    onMouseLeave={e => { if (!saving) e.currentTarget.style.backgroundColor = "#19405e"; }}>
                    {saving ? "Saving…" : "Save Asset"}
                </button>
            </div>
        </div>
    );
}
