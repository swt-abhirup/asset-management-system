import { useEffect, useState } from "react";
import { X, ShoppingCart, Plus, Trash2 } from "lucide-react";
import api       from "../../services/api";
import { toast } from "../Toast";

const L  = { color: "#1b4f72", fontSize: "11px", fontWeight: 600, marginBottom: "4px", display: "block" };
const IS = { width: "100%", padding: "6px 10px", fontSize: "12px", border: "1px solid #e2e8f0", borderRadius: "6px", outline: "none", color: "#1e293b", backgroundColor: "#fff" };
const fi = e => { e.target.style.borderColor = "#19405e"; e.target.style.boxShadow = "0 0 0 2px rgba(25,64,94,0.1)"; };
const fo = e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; };

const BLANK_ITEM = { name: "", qty: 1, unit_price: "" };
const BLANK = {
    vendor_id: "", po_number: "", purchase_date: "", delivery_date: "",
    invoice_number: "", payment_status: "pending", payment_date: "",
    notes: "", items: [{ ...BLANK_ITEM }]
};

export default function PurchaseModal({ purchase, vendors, onClose, onSaved }) {

    const [form,   setForm]   = useState(BLANK);
    const [saving, setSaving] = useState(false);
    const isEdit = !!purchase;

    useEffect(() => {
        if (purchase) {
            setForm({
                ...BLANK,
                ...purchase,
                items: purchase.items?.length ? purchase.items : [{ ...BLANK_ITEM }]
            });
        } else {
            setForm({ ...BLANK, items: [{ ...BLANK_ITEM }] });
        }
    }, [purchase]);

    const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    // Line item helpers
    const setItem = (idx, field, val) =>
        setForm(f => ({ ...f, items: f.items.map((it, i) => i === idx ? { ...it, [field]: val } : it) }));
    const addItem    = () => setForm(f => ({ ...f, items: [...f.items, { ...BLANK_ITEM }] }));
    const removeItem = idx => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

    const total = form.items.reduce((s, it) => s + (Number(it.qty) * Number(it.unit_price) || 0), 0);

    const save = async () => {
        if (!form.vendor_id || !form.purchase_date) {
            toast.warn("Vendor and purchase date are required.");
            return;
        }
        const validItems = form.items.filter(it => it.name.trim());
        if (validItems.length === 0) {
            toast.warn("Add at least one line item.");
            return;
        }
        try {
            setSaving(true);
            const payload = { ...form, items: validItems, total_amount: total };
            if (isEdit) {
                await api.put(`/api/purchases/${purchase.purchase_id}`, payload);
            } else {
                await api.post("/api/purchases", payload);
            }
            onClose();
            onSaved();
            setTimeout(() => toast.success(isEdit ? "Purchase updated." : "Purchase order created."), 0);
        } catch (err) {
            toast.error(err.response?.data?.message || "Save failed.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>

            <div className="w-full max-w-3xl mx-4 sm:mx-auto rounded-xl shadow-2xl flex flex-col max-h-[90vh]"
                style={{ backgroundColor: "#fff" }}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b flex-shrink-0"
                    style={{ borderColor: "#f1f5f9" }}>
                    <div className="flex items-center gap-2">
                        <ShoppingCart size={14} style={{ color: "#19405e" }} />
                        <h3 className="text-sm font-bold"
                            style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                            {isEdit ? "Edit Purchase Order" : "New Purchase Order"}
                        </h3>
                    </div>
                    <button onClick={onClose} className="w-6 h-6 rounded flex items-center justify-center"
                        style={{ color: "#94a3b8" }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#f1f5f9"; e.currentTarget.style.color = "#19405e"; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                        <X size={14} />
                    </button>
                </div>

                {/* Body — scrollable */}
                <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4">

                    {/* PO Details */}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-2"
                            style={{ color: "#94a3b8" }}>Order Details</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div className="col-span-2 md:col-span-1">
                                <label style={L}>Vendor *</label>
                                <select name="vendor_id" value={form.vendor_id} onChange={set} style={IS}>
                                    <option value="">— Select vendor —</option>
                                    {vendors.filter(v => v.status === "active").map(v => (
                                        <option key={v.vendor_id} value={v.vendor_id}>{v.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={L}>PO Number</label>
                                <input name="po_number" value={form.po_number} onChange={set}
                                    placeholder="PO-2024-001" style={IS} onFocus={fi} onBlur={fo} />
                            </div>
                            <div>
                                <label style={L}>Invoice Number</label>
                                <input name="invoice_number" value={form.invoice_number} onChange={set}
                                    placeholder="INV-XXXX" style={IS} onFocus={fi} onBlur={fo} />
                            </div>
                            <div>
                                <label style={L}>Purchase Date *</label>
                                <input type="date" name="purchase_date" value={form.purchase_date} onChange={set}
                                    style={IS} onFocus={fi} onBlur={fo} />
                            </div>
                            <div>
                                <label style={L}>Expected Delivery</label>
                                <input type="date" name="delivery_date" value={form.delivery_date ?? ""} onChange={set}
                                    style={IS} onFocus={fi} onBlur={fo} />
                            </div>
                            <div>
                                <label style={L}>Payment Status</label>
                                <select name="payment_status" value={form.payment_status} onChange={set} style={IS}>
                                    <option value="pending">Pending</option>
                                    <option value="partial">Partial</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </div>
                            {form.payment_status === "paid" && (
                                <div>
                                    <label style={L}>Payment Date</label>
                                    <input type="date" name="payment_date" value={form.payment_date ?? ""} onChange={set}
                                        style={IS} onFocus={fi} onBlur={fo} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Line Items */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold uppercase tracking-widest"
                                style={{ color: "#94a3b8" }}>Line Items</p>
                            <button onClick={addItem}
                                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                                style={{ backgroundColor: "rgba(25,64,94,0.08)", color: "#19405e" }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(25,64,94,0.15)"}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(25,64,94,0.08)"}>
                                <Plus size={11} /> Add Item
                            </button>
                        </div>

                        {/* Header row */}
                        <div className="overflow-x-auto">
                        <div className="grid gap-2 mb-1 min-w-[480px]"
                            style={{ gridTemplateColumns: "1fr 80px 100px 100px 28px" }}>
                            {["Item / Description", "Qty", "Unit Price (₹)", "Subtotal", ""].map(h => (
                                <p key={h} className="text-xs font-semibold px-1" style={{ color: "#94a3b8" }}>{h}</p>
                            ))}
                        </div>

                        {form.items.map((item, idx) => (
                            <div key={idx} className="grid gap-2 mb-2 items-center min-w-[480px]"
                                style={{ gridTemplateColumns: "1fr 80px 100px 100px 28px" }}>
                                <input value={item.name}
                                    onChange={e => setItem(idx, "name", e.target.value)}
                                    placeholder="e.g. Dell Latitude 5540"
                                    style={IS} onFocus={fi} onBlur={fo} />
                                <input type="number" value={item.qty} min="1"
                                    onChange={e => setItem(idx, "qty", e.target.value)}
                                    style={IS} onFocus={fi} onBlur={fo} />
                                <input type="number" value={item.unit_price}
                                    onChange={e => setItem(idx, "unit_price", e.target.value)}
                                    placeholder="0"
                                    style={IS} onFocus={fi} onBlur={fo} />
                                <div className="px-2 py-1.5 rounded text-xs font-semibold text-right"
                                    style={{ backgroundColor: "#f8fafc", color: "#19405e" }}>
                                    ₹ {((Number(item.qty) * Number(item.unit_price)) || 0).toLocaleString("en-IN")}
                                </div>
                                {form.items.length > 1 ? (
                                    <button onClick={() => removeItem(idx)}
                                        className="w-6 h-6 flex items-center justify-center rounded"
                                        style={{ color: "#dc2626" }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fff5f5"}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                                        <Trash2 size={12} />
                                    </button>
                                ) : <div />}
                            </div>
                        ))}
                        </div>

                        {/* Total */}
                        <div className="flex justify-end mt-2 pt-2 border-t" style={{ borderColor: "#f1f5f9" }}>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold" style={{ color: "#64748b" }}>Total Amount</span>
                                <span className="text-base font-bold"
                                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                                    ₹ {total.toLocaleString("en-IN")}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label style={L}>Notes</label>
                        <input name="notes" value={form.notes} onChange={set}
                            placeholder="Delivery instructions, terms…" style={IS} onFocus={fi} onBlur={fo} />
                    </div>

                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 px-5 py-3 border-t flex-shrink-0"
                    style={{ borderColor: "#f1f5f9" }}>
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
                        {saving ? "Saving…" : isEdit ? "Update Order" : "Create Order"}
                    </button>
                </div>
            </div>
        </div>
    );
}
