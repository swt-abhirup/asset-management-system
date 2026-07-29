import { useEffect, useState } from "react";
import { X } from "lucide-react";
import api from "../../services/api";
import { toast } from "../Toast";

const label    = { color: "#1b4f72", fontSize: "11px", fontWeight: 600, marginBottom: "4px", display: "block" };
const inputSt  = { width: "100%", padding: "6px 10px", fontSize: "12px", border: "1px solid #e2e8f0", borderRadius: "6px", outline: "none", color: "#1e293b", backgroundColor: "#fff" };
const focusIn  = e => { e.target.style.borderColor = "#19405e"; e.target.style.boxShadow = "0 0 0 2px rgba(25,64,94,0.1)"; };
const focusOut = e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; };

export default function AssetModal({ asset, categories, onClose, onSaved }) {

    const [form,   setForm]   = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => { if (asset) setForm({ ...asset }); }, [asset]);

    const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const update = async () => {
        try {
            setSaving(true);
            await api.put(`/api/assets/${form.asset_id}`, {
                name:            form.name,
                brand:           form.brand,
                model:           form.model,
                serial_number:   form.serial_number,
                purchase_date:   form.purchase_date,
                purchase_cost:   form.purchase_cost ? Number(form.purchase_cost) : 0,
                warranty_expiry: form.warranty_expiry,
                status:          form.status,
                notes:           form.notes
            });
            onClose();
            onSaved();
            setTimeout(() => toast.success("Asset updated successfully."), 0);
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed.");
        } finally {
            setSaving(false);
        }
    };

    if (!asset) return null;

    const categoryName = categories.find(c => c.category_id === form.category_id)?.name ?? "—";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>

            <div className="w-full max-w-xl mx-4 sm:mx-auto rounded-xl shadow-2xl" style={{ backgroundColor: "#ffffff" }}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: "#f1f5f9" }}>
                    <h3 className="text-sm font-bold"
                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                        Edit Asset
                    </h3>
                    <button onClick={onClose} className="w-6 h-6 rounded flex items-center justify-center"
                        style={{ color: "#94a3b8" }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#f1f5f9"; e.currentTarget.style.color = "#19405e"; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                        <X size={14} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-4 flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label style={label}>Asset Name</label>
                            <input name="name" value={form.name ?? ""} onChange={set}
                                style={inputSt} onFocus={focusIn} onBlur={focusOut} />
                        </div>
                        <div>
                            <label style={label}>Category</label>
                            <input value={categoryName} disabled
                                style={{ ...inputSt, backgroundColor: "#f8fafc", color: "#94a3b8" }} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label style={label}>Brand</label>
                            <input name="brand" value={form.brand ?? ""} onChange={set}
                                style={inputSt} onFocus={focusIn} onBlur={focusOut} />
                        </div>
                        <div>
                            <label style={label}>Model</label>
                            <input name="model" value={form.model ?? ""} onChange={set}
                                style={inputSt} onFocus={focusIn} onBlur={focusOut} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label style={label}>Serial Number</label>
                            <input name="serial_number" value={form.serial_number ?? ""} onChange={set}
                                style={inputSt} onFocus={focusIn} onBlur={focusOut} />
                        </div>
                        <div>
                            <label style={label}>Status</label>
                            <select name="status" value={form.status ?? "available"} onChange={set} style={inputSt}>
                                <option value="available">Available</option>
                                <option value="assigned">Assigned</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="retired">Retired</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label style={label}>Purchase Date</label>
                            <input type="date" name="purchase_date" value={form.purchase_date ?? ""} onChange={set}
                                style={inputSt} onFocus={focusIn} onBlur={focusOut} />
                        </div>
                        <div>
                            <label style={label}>Purchase Cost (₹)</label>
                            <input type="number" name="purchase_cost" value={form.purchase_cost ?? ""} onChange={set}
                                style={inputSt} onFocus={focusIn} onBlur={focusOut} />
                        </div>
                        <div>
                            <label style={label}>Warranty Expiry</label>
                            <input type="date" name="warranty_expiry" value={form.warranty_expiry ?? ""} onChange={set}
                                style={inputSt} onFocus={focusIn} onBlur={focusOut} />
                        </div>
                    </div>
                    <div>
                        <label style={label}>Notes</label>
                        <input name="notes" value={form.notes ?? ""} onChange={set}
                            style={inputSt} onFocus={focusIn} onBlur={focusOut} />
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
                        {saving ? "Saving…" : "Update Asset"}
                    </button>
                </div>

            </div>
        </div>
    );
}
