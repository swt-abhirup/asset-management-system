import { useEffect, useState, useMemo } from "react";
import { ShoppingCart, Plus, Pencil, Trash2, IndianRupee, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import MainLayout    from "../layouts/MainLayout";
import PurchaseModal from "../components/purchases/PurchaseModal";
import DataTable     from "../components/DataTable/DataTable";
import SearchBar     from "../components/DataTable/SearchBar";
import api           from "../services/api";
import { toast }     from "../components/Toast";
import { confirm }   from "../components/ConfirmDialog";

const STATUS_TABS = [
    { key: "all",     label: "All"     },
    { key: "pending", label: "Pending" },
    { key: "partial", label: "Partial" },
    { key: "paid",    label: "Paid"    },
];

const PAYMENT_STYLE = {
    pending: { bg: "#fff5f5",              color: "#dc2626", icon: AlertCircle  },
    partial: { bg: "rgba(245,158,11,0.1)", color: "#b45309", icon: Clock        },
    paid:    { bg: "rgba(25,64,94,0.08)",  color: "#19405e", icon: CheckCircle2 },
};

// ── Stat strip ───────────────────────────────────────────────────
function StatStrip({ purchases }) {
    const total   = purchases.length;
    const pending = purchases.filter(p => p.payment_status === "pending").length;
    const partial = purchases.filter(p => p.payment_status === "partial").length;
    const paid    = purchases.filter(p => p.payment_status === "paid").length;
    const totalAmt= purchases.reduce((s, p) => s + (Number(p.total_amount) || 0), 0);
    const pendingAmt= purchases
        .filter(p => p.payment_status !== "paid")
        .reduce((s, p) => s + (Number(p.total_amount) || 0), 0);

    const cards = [
        { label: "Total Orders",   value: total,   accent: true  },
        { label: "Pending Payment",value: pending, accent: false, alert: pending > 0 },
        { label: "Partial",        value: partial, accent: false },
        { label: "Paid",           value: paid,    accent: false },
        { label: "Total Spend",    value: `₹ ${totalAmt.toLocaleString("en-IN")}`, accent: false },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 mb-4">
            {cards.map(({ label, value, accent, alert }) => (
                <div key={label}
                    className="rounded-lg px-3 py-2.5 relative overflow-hidden"
                    style={{
                        backgroundColor: accent ? "#19405e" : "#eaf2f8",
                        border: `1px solid ${alert ? "#fca5a5" : accent ? "transparent" : "#c8dff0"}`,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                    }}>
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l"
                        style={{ backgroundColor: alert ? "#dc2626" : accent ? "#f5cba7" : "#19405e" }} />
                    <p className="text-xs leading-none mb-1 pl-1"
                        style={{ color: accent ? "#a8c4d8" : "#5a7a93" }}>{label}</p>
                    <p className="text-base font-bold leading-none pl-1"
                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: alert ? "#dc2626" : accent ? "#fff" : "#19405e" }}>
                        {value}
                    </p>
                </div>
            ))}
        </div>
    );
}

// ── Purchase detail drawer ───────────────────────────────────────
function PurchaseDrawer({ purchase, vendorName, onClose, onEdit, onDelete }) {
    if (!purchase) return null;

    const ps = PAYMENT_STYLE[purchase.payment_status] ?? PAYMENT_STYLE.pending;
    const Icon = ps.icon;

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose}
                style={{ backgroundColor: "rgba(0,0,0,0.25)" }} />

            <div className="fixed right-0 top-0 bottom-0 z-50 w-80 flex flex-col shadow-2xl"
                style={{ backgroundColor: "#fff" }}>

                {/* Header */}
                <div className="px-4 py-3 border-b" style={{ backgroundColor: "#19405e", borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-white" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                                {purchase.po_number || "No PO Number"}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: "#a8c4d8" }}>{vendorName}</p>
                        </div>
                        <button onClick={onClose} className="text-xs px-2 py-1 rounded" style={{ color: "#a8c4d8" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                            onMouseLeave={e => e.currentTarget.style.color = "#a8c4d8"}>✕</button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold capitalize"
                            style={{ backgroundColor: ps.bg, color: ps.color }}>
                            {purchase.payment_status}
                        </span>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-4 py-3">
                    {[
                        ["Purchase Date", purchase.purchase_date],
                        ["Delivery Date", purchase.delivery_date || "—"],
                        ["Invoice No.",   purchase.invoice_number || "—"],
                        ["Payment Date",  purchase.payment_date || "—"],
                        ["Total Amount",  `₹ ${Number(purchase.total_amount).toLocaleString("en-IN")}`],
                        ["Created By",    purchase.created_by],
                    ].map(([k, v]) => (
                        <div key={k} className="flex justify-between py-2 border-b text-xs"
                            style={{ borderColor: "#f1f5f9" }}>
                            <span style={{ color: "#94a3b8" }}>{k}</span>
                            <span className="font-medium" style={{ color: "#1e293b" }}>{v}</span>
                        </div>
                    ))}

                    {purchase.items?.length > 0 && (
                        <div className="mt-3">
                            <p className="text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: "#94a3b8" }}>Items</p>
                            {purchase.items.map((it, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b text-xs"
                                    style={{ borderColor: "#f1f5f9" }}>
                                    <div>
                                        <p className="font-medium" style={{ color: "#1e293b" }}>{it.name}</p>
                                        <p style={{ color: "#94a3b8" }}>Qty {it.qty} × ₹ {Number(it.unit_price).toLocaleString("en-IN")}</p>
                                    </div>
                                    <span className="font-semibold" style={{ color: "#19405e" }}>
                                        ₹ {(Number(it.qty) * Number(it.unit_price)).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {purchase.notes && (
                        <div className="mt-3">
                            <p className="text-xs font-bold mb-1 uppercase tracking-widest" style={{ color: "#94a3b8" }}>Notes</p>
                            <p className="text-xs p-2 rounded" style={{ backgroundColor: "#f8fafc", color: "#64748b" }}>
                                {purchase.notes}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-2 px-4 py-3 border-t" style={{ borderColor: "#f1f5f9" }}>
                    <button onClick={onEdit}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-semibold text-white"
                        style={{ backgroundColor: "#19405e" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#1b4f72"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#19405e"}>
                        <Pencil size={12} /> Edit
                    </button>
                    <button onClick={onDelete}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-semibold border"
                        style={{ borderColor: "#fca5a5", color: "#dc2626" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fff5f5"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>
        </>
    );
}

// ── Main page ────────────────────────────────────────────────────
export default function Purchases() {

    const [purchases, setPurchases] = useState([]);
    const [vendors,   setVendors]   = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [search,    setSearch]    = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [editing,   setEditing]   = useState(null);
    const [drawer,    setDrawer]    = useState(null);

    const loadAll = async () => {
        try {
            setLoading(true);
            const [pRes, vRes] = await Promise.all([
                api.get("/api/purchases"),
                api.get("/api/vendors"),
            ]);
            setPurchases(pRes.data.data ?? []);
            setVendors(  vRes.data.data ?? []);
        } catch (err) {
            toast.error("Failed to load purchases.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAll(); }, []);

    const vendorMap = useMemo(() => Object.fromEntries(vendors.map(v => [v.vendor_id, v])), [vendors]);

    const deletePurchase = async (id) => {
        const ok = await confirm({ title: "Delete Purchase Order?", message: "This will permanently remove the purchase record.", confirmLabel: "Delete", danger: true });
        if (!ok) return;
        try {
            await api.delete(`/api/purchases/${id}`);
            setDrawer(null);
            loadAll();
            setTimeout(() => toast.success("Purchase deleted."), 0);
        } catch (err) {
            toast.error("Failed to delete purchase.");
        }
    };

    const enriched = useMemo(() =>
        purchases.map(p => ({
            ...p,
            vendor_name:    vendorMap[p.vendor_id]?.name ?? "—",
            item_count:     p.items?.length ?? 0,
            purchase_fmt:   p.purchase_date
                ? new Date(p.purchase_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                : "—",
            delivery_fmt:   p.delivery_date
                ? new Date(p.delivery_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                : "—",
            total_fmt:      `₹ ${Number(p.total_amount).toLocaleString("en-IN")}`,
        })),
    [purchases, vendorMap]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return enriched
            .filter(p => activeTab === "all" || p.payment_status === activeTab)
            .filter(p =>
                !q ||
                p.vendor_name?.toLowerCase().includes(q)     ||
                p.po_number?.toLowerCase().includes(q)       ||
                p.invoice_number?.toLowerCase().includes(q)
            )
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [enriched, activeTab, search]);

    const tabCount = key => key === "all" ? purchases.length : purchases.filter(p => p.payment_status === key).length;

    const columns = [
        { key: "po_number",      label: "PO Number"   },
        { key: "vendor_name",    label: "Vendor"       },
        { key: "item_count",     label: "Items"        },
        { key: "total_fmt",      label: "Total (₹)"    },
        { key: "purchase_fmt",   label: "Order Date"   },
        { key: "delivery_fmt",   label: "Delivery"     },
        { key: "invoice_number", label: "Invoice No."  },
        { key: "payment_status", label: "Payment"      },
    ];

    return (
        <MainLayout>

            {/* ── Header ─────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                    <h2 className="text-base font-bold leading-tight"
                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                        Purchase Orders
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                        {purchases.filter(p => p.payment_status !== "paid").length} order{purchases.filter(p => p.payment_status !== "paid").length !== 1 ? "s" : ""} awaiting payment
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <SearchBar value={search} placeholder="Search orders…" onChange={e => setSearch(e.target.value)} />
                    <button onClick={() => { setEditing(null); setShowModal(true); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold text-white"
                        style={{ backgroundColor: "#19405e" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#1b4f72"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#19405e"}>
                        <Plus size={14} /> New Order
                    </button>
                </div>
            </div>

            {/* ── Stats ──────────────────────────────────── */}
            <StatStrip purchases={purchases} />

            {/* ── Tabs ───────────────────────────────────── */}
            <div className="flex flex-wrap gap-1 mb-3">
                {STATUS_TABS.map(tab => {
                    const active = activeTab === tab.key;
                    return (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border"
                            style={{
                                backgroundColor: active ? "#19405e" : "#ffffff",
                                borderColor:     active ? "#19405e" : "#e2e8f0",
                                color:           active ? "#ffffff"  : "#64748b",
                            }}>
                            {tab.label}
                            <span className="px-1.5 py-0.5 rounded text-xs font-bold leading-none"
                                style={{
                                    backgroundColor: active ? "rgba(245,203,167,0.25)" : "#f1f5f9",
                                    color:           active ? "#f5cba7" : "#94a3b8"
                                }}>
                                {tabCount(tab.key)}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ── Table ──────────────────────────────────── */}
            <DataTable
                key={activeTab}
                columns={columns}
                data={filtered}
                loading={loading}
                renderActions={row => (
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => setDrawer(row)}
                            className="px-2.5 py-1.5 rounded text-xs font-medium border"
                            style={{ borderColor: "#e2e8f0", color: "#19405e" }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f8fafc"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                            View
                        </button>
                        <button onClick={() => { setEditing(row); setShowModal(true); }}
                            className="p-1.5 rounded" style={{ color: "#1b4f72" }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#eff6ff"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                            <Pencil size={13} />
                        </button>
                        <button onClick={() => deletePurchase(row.purchase_id)}
                            className="p-1.5 rounded" style={{ color: "#dc2626" }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fff5f5"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                            <Trash2 size={13} />
                        </button>
                    </div>
                )}
            />

            {/* ── Modals / Drawer ────────────────────────── */}
            {showModal && (
                <PurchaseModal
                    purchase={editing}
                    vendors={vendors}
                    onClose={() => { setShowModal(false); setEditing(null); }}
                    onSaved={loadAll}
                />
            )}

            {drawer && (
                <PurchaseDrawer
                    purchase={drawer}
                    vendorName={vendorMap[drawer.vendor_id]?.name ?? "—"}
                    onClose={() => setDrawer(null)}
                    onEdit={() => { setEditing(drawer); setDrawer(null); setShowModal(true); }}
                    onDelete={() => deletePurchase(drawer.purchase_id)}
                />
            )}

        </MainLayout>
    );
}
