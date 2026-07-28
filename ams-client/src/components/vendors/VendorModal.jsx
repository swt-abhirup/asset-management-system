import { useEffect, useState } from "react";
import { X, Building2 } from "lucide-react";
import api       from "../../services/api";
import { toast } from "../Toast";

const CATEGORIES = ["Hardware", "Software", "Networking", "Peripherals", "Cloud Services", "Other"];

const L  = { color: "#1b4f72", fontSize: "11px", fontWeight: 600, marginBottom: "4px", display: "block" };
const IS = { width: "100%", padding: "6px 10px", fontSize: "12px", border: "1px solid #e2e8f0", borderRadius: "6px", outline: "none", color: "#1e293b", backgroundColor: "#fff" };
const fi = e => { e.target.style.borderColor = "#19405e"; e.target.style.boxShadow = "0 0 0 2px rgba(25,64,94,0.1)"; };
const fo = e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; };

const BLANK = { name: "", contact_person: "", email: "", phone: "", address: "", website: "", category: "", notes: "", status: "active" };

export default function VendorModal({ vendor, onClose, onSaved }) {

    const [form,   setForm]   = useState(BLANK);
    const [saving, setSaving] = useState(false);
    const isEdit = !!vendor;

    useEffect(() => {
        setForm(vendor ? { ...BLANK, ...vendor } : BLANK);
    }, [vendor]);

    const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const save = async () => {
        if (!form.name.trim()) { toast.warn("Vendor name is required."); return; }
        try {
            setSaving(true);
            if (isEdit) {
                await api.put(`/api/vendors/${vendor.vendor_id}`, form);
            } else {
                await api.post("/api/vendors", form);
            }
            onClose();
            onSaved();
            setTimeout(() => toast.success(isEdit ? "Vendor updated." : "Vendor created."), 0);
        } catch (err) {
            toast.error(err.response?.data?.message || "Save failed.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>

            <div className="w-full max-w-2xl rounded-xl shadow-2xl" style={{ backgroundColor: "#fff" }}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b"
                    style={{ borderColor: "#f1f5f9" }}>
                    <div className="flex items-center gap-2">
                        <Building2 size={14} style={{ color: "#19405e" }} />
                        <h3 className="text-sm font-bold"
                            style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                            {isEdit ? "Edit Vendor" : "Add Vendor"}
                        </h3>
                    </div>
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
                        <div className="col-span-2 md:col-span-1">
                            <label style={L}>Vendor Name *</label>
                            <input name="name" value={form.name} onChange={set}
                                placeholder="e.g. Dell Technologies" style={IS} onFocus={fi} onBlur={fo} />
                        </div>
                        <div>
                            <label style={L}>Category</label>
                            <select name="category" value={form.category} onChange={set} style={IS}>
                                <option value="">— Select —</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label style={L}>Contact Person</label>
                            <input name="contact_person" value={form.contact_person} onChange={set}
                                placeholder="Full name" style={IS} onFocus={fi} onBlur={fo} />
                        </div>
                        <div>
                            <label style={L}>Email</label>
                            <input name="email" value={form.email} onChange={set}
                                placeholder="sales@vendor.com" style={IS} onFocus={fi} onBlur={fo} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label style={L}>Phone</label>
                            <input name="phone" value={form.phone} onChange={set}
                                placeholder="+91 98765 43210" style={IS} onFocus={fi} onBlur={fo} />
                        </div>
                        <div>
                            <label style={L}>Website</label>
                            <input name="website" value={form.website} onChange={set}
                                placeholder="https://vendor.com" style={IS} onFocus={fi} onBlur={fo} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label style={L}>Address</label>
                            <input name="address" value={form.address} onChange={set}
                                placeholder="City, State" style={IS} onFocus={fi} onBlur={fo} />
                        </div>
                        <div>
                            <label style={L}>Status</label>
                            <select name="status" value={form.status} onChange={set} style={IS}>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={L}>Notes</label>
                        <input name="notes" value={form.notes} onChange={set}
                            placeholder="Contract terms, SLA, etc." style={IS} onFocus={fi} onBlur={fo} />
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
                    <button onClick={save} disabled={saving}
                        className="px-4 py-2 rounded text-xs font-semibold text-white disabled:opacity-60"
                        style={{ backgroundColor: "#19405e" }}
                        onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = "#1b4f72"; }}
                        onMouseLeave={e => { if (!saving) e.currentTarget.style.backgroundColor = "#19405e"; }}>
                        {saving ? "Saving…" : isEdit ? "Update Vendor" : "Save Vendor"}
                    </button>
                </div>
            </div>
        </div>
    );
}
