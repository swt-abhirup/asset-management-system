import { useEffect, useState } from "react";
import { X } from "lucide-react";
import api from "../services/api";
import { toast } from "./Toast";

const labelStyle = { color: "#1b4f72", fontSize: "11px", fontWeight: 600, marginBottom: "4px", display: "block" };
const inputStyle = {
    width: "100%", padding: "7px 10px", fontSize: "12px",
    border: "1px solid #e2e8f0", borderRadius: "6px",
    outline: "none", color: "#1e293b", backgroundColor: "#fff"
};
const disabledStyle = { ...inputStyle, backgroundColor: "#f8fafc", color: "#94a3b8" };
const focusIn  = e => { e.target.style.borderColor = "#19405e"; e.target.style.boxShadow = "0 0 0 2px rgba(25,64,94,0.1)"; };
const focusOut = e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; };

export default function EmployeeModal({ employee, onClose, refreshEmployees }) {

    const [form,   setForm]   = useState({ fullname: "", email: "", role: "", status: "", department: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => { if (employee) setForm(employee); }, [employee]);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const update = async () => {
        try {
            setSaving(true);
            await api.put(`/api/employees/${form.email}`, {
                fullname:   form.fullname,
                role:       form.role,
                status:     form.status,
                department: form.department ?? ""
            });
            onClose();
            refreshEmployees();
            setTimeout(() => toast.success("Employee updated successfully."), 0);
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed.");
        } finally {
            setSaving(false);
        }
    };

    if (!employee) return null;

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>

            <div className="w-full max-w-md mx-4 sm:mx-auto rounded-xl shadow-2xl" style={{ backgroundColor: "#ffffff" }}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#f1f5f9" }}>
                    <h3 className="text-sm font-bold"
                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                        Edit Employee
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
                    <div>
                        <label style={labelStyle}>Full Name</label>
                        <input name="fullname" value={form.fullname} onChange={handleChange}
                            style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                    </div>
                    <div>
                        <label style={labelStyle}>Email</label>
                        <input value={form.email} disabled style={disabledStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Department</label>
                        <input name="department" value={form.department ?? ""} onChange={handleChange}
                            style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label style={labelStyle}>Role</label>
                            <select name="role" value={form.role} onChange={handleChange} style={inputStyle}>
                                <option value="admin">Admin</option>
                                <option value="manager">Manager</option>
                                <option value="hr">HR</option>
                                <option value="employee">Employee</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Status</label>
                            <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
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
                        {saving ? "Saving…" : "Update"}
                    </button>
                </div>

            </div>
        </div>

    );

}
