import { useState } from "react";
import { UserPlus } from "lucide-react";
import api from "../services/api";
import { toast } from "./Toast";

const INITIAL = { fullname: "", email: "", role: "employee", status: "active", department: "" };

const labelStyle = { color: "#1b4f72", fontSize: "11px", fontWeight: 600, marginBottom: "4px", display: "block" };
const inputStyle = {
    width: "100%", padding: "6px 10px", fontSize: "12px",
    border: "1px solid #e2e8f0", borderRadius: "6px",
    outline: "none", color: "#1e293b", backgroundColor: "#fff"
};
const focusIn  = e => { e.target.style.borderColor = "#19405e"; e.target.style.boxShadow = "0 0 0 2px rgba(25,64,94,0.1)"; };
const focusOut = e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; };

export default function EmployeeForm({ refreshEmployees }) {

    const [form,   setForm]   = useState(INITIAL);
    const [saving, setSaving] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const save = async () => {
        if (!form.fullname || !form.email) {
            toast.warn("Full name and email are required.");
            return;
        }
        try {
            setSaving(true);
            await api.post("/api/employees", form);
            setForm(INITIAL);
            refreshEmployees();
            setTimeout(() => toast.success("Employee added successfully."), 0);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add employee.");
        } finally {
            setSaving(false);
        }
    };

    return (

        <div className="rounded-lg p-4 mb-4"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>

            <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: "rgba(25,64,94,0.08)" }}>
                    <UserPlus size={13} style={{ color: "#19405e" }} />
                </div>
                <h3 className="text-sm font-bold"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                    Add Employee
                </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                    <label style={labelStyle}>Full Name</label>
                    <input name="fullname" value={form.fullname} onChange={handleChange}
                        placeholder="John Doe" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div>
                    <label style={labelStyle}>Email</label>
                    <input name="email" value={form.email} onChange={handleChange}
                        placeholder="john@company.com" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div>
                    <label style={labelStyle}>Department</label>
                    <input name="department" value={form.department} onChange={handleChange}
                        placeholder="Engineering" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div>
                    <label style={labelStyle}>Role</label>
                    <select name="role" value={form.role} onChange={handleChange} style={inputStyle}>
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="hr">HR</option>
                        <option value="admin">Admin</option>
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

            <div className="flex justify-end mt-3">
                <button onClick={save} disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold text-white disabled:opacity-60"
                    style={{ backgroundColor: "#19405e" }}
                    onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = "#1b4f72"; }}
                    onMouseLeave={e => { if (!saving) e.currentTarget.style.backgroundColor = "#19405e"; }}>
                    {saving ? "Saving…" : "Save Employee"}
                </button>
            </div>

        </div>

    );

}
