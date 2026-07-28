import { useState } from "react";
import { X, RotateCcw } from "lucide-react";
import api from "../../services/api";
import { toast } from "../Toast";

const inputSt  = { width: "100%", padding: "7px 10px", fontSize: "12px", border: "1px solid #e2e8f0", borderRadius: "6px", outline: "none", color: "#1e293b", backgroundColor: "#fff" };
const focusIn  = e => { e.target.style.borderColor = "#19405e"; e.target.style.boxShadow = "0 0 0 2px rgba(25,64,94,0.1)"; };
const focusOut = e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; };

export default function ReturnModal({ assignment, assetName, employeeName, onClose, onReturned }) {

    const [notes,  setNotes]  = useState("");
    const [saving, setSaving] = useState(false);

    const confirm = async () => {
        try {
            setSaving(true);
            await api.put(`/api/assignments/${assignment.assignment_id}/return`, { notes });
            onClose();
            onReturned();
            setTimeout(() => toast.success(`${assetName} returned successfully.`), 0);
        } catch (err) {
            toast.error(err.response?.data?.message || "Return failed.");
        } finally {
            setSaving(false);
        }
    };

    if (!assignment) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>

            <div className="w-full max-w-sm rounded-xl shadow-2xl" style={{ backgroundColor: "#ffffff" }}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: "#f1f5f9" }}>
                    <div className="flex items-center gap-2">
                        <RotateCcw size={14} style={{ color: "#19405e" }} />
                        <h3 className="text-sm font-bold"
                            style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                            Return Asset
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
                    {/* Summary */}
                    <div className="rounded-lg p-3" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <div className="flex justify-between text-xs mb-1.5">
                            <span style={{ color: "#94a3b8" }}>Asset</span>
                            <span className="font-semibold" style={{ color: "#19405e" }}>{assetName}</span>
                        </div>
                        <div className="flex justify-between text-xs mb-1.5">
                            <span style={{ color: "#94a3b8" }}>Employee</span>
                            <span className="font-semibold" style={{ color: "#19405e" }}>{employeeName}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span style={{ color: "#94a3b8" }}>Assigned on</span>
                            <span style={{ color: "#1e293b" }}>
                                {new Date(assignment.assigned_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1b4f72" }}>Return Notes</label>
                        <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                            placeholder="Condition on return, any damage notes…"
                            style={{ ...inputSt, resize: "none" }} onFocus={focusIn} onBlur={focusOut} />
                    </div>

                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                        This will mark the asset as <strong>available</strong> and close the assignment.
                    </p>
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
                    <button onClick={confirm} disabled={saving}
                        className="px-4 py-2 rounded text-xs font-semibold text-white disabled:opacity-60 flex items-center gap-1.5"
                        style={{ backgroundColor: "#19405e" }}
                        onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = "#1b4f72"; }}
                        onMouseLeave={e => { if (!saving) e.currentTarget.style.backgroundColor = "#19405e"; }}>
                        <RotateCcw size={12} />
                        {saving ? "Processing…" : "Confirm Return"}
                    </button>
                </div>

            </div>
        </div>
    );
}
