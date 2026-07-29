import { useEffect, useState, useMemo } from "react";
import { Building2, Plus, Pencil, Trash2, Phone, Mail, Globe, ShoppingCart } from "lucide-react";
import MainLayout   from "../layouts/MainLayout";
import VendorModal  from "../components/vendors/VendorModal";
import SearchBar    from "../components/DataTable/SearchBar";
import api          from "../services/api";
import { toast }    from "../components/Toast";
import { confirm }  from "../components/ConfirmDialog";

const CATEGORY_COLORS = {
    Hardware:        { bg: "rgba(25,64,94,0.08)",    color: "#19405e"  },
    Software:        { bg: "rgba(99,102,241,0.1)",   color: "#4338ca"  },
    Networking:      { bg: "rgba(20,184,166,0.1)",   color: "#0f766e"  },
    Peripherals:     { bg: "rgba(245,158,11,0.12)",  color: "#b45309"  },
    "Cloud Services":{ bg: "rgba(59,130,246,0.1)",   color: "#1d4ed8"  },
    Other:           { bg: "#f1f5f9",                color: "#64748b"  },
};

// ── Stat strip ───────────────────────────────────────────────────
function StatStrip({ vendors, purchases }) {
    const active   = vendors.filter(v => v.status === "active").length;
    const inactive = vendors.filter(v => v.status === "inactive").length;
    const totalSpend = purchases.reduce((s, p) => s + (Number(p.total_amount) || 0), 0);
    const pending    = purchases.filter(p => p.payment_status === "pending").length;

    const cards = [
        { label: "Total Vendors",  value: vendors.length,  accent: true  },
        { label: "Active",         value: active,          accent: false },
        { label: "Inactive",       value: inactive,        accent: false },
        { label: "Total Spend",    value: `₹ ${totalSpend.toLocaleString("en-IN")}`, accent: false },
        { label: "Pending Payments",value: pending,        accent: false, alert: pending > 0 },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 mb-4">
            {cards.map(({ label, value, accent, alert }) => (
                <div key={label}
                    className="rounded-lg px-3 py-2.5 relative overflow-hidden"
                    style={{
                        backgroundColor: accent ? "#19405e" : "#ffffff",
                        border: `1px solid ${alert ? "#fca5a5" : accent ? "transparent" : "#e2e8f0"}`,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                    }}>
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l"
                        style={{ backgroundColor: alert ? "#dc2626" : accent ? "#f5cba7" : "#19405e" }} />
                    <p className="text-xs leading-none mb-1 pl-1"
                        style={{ color: accent ? "#a8c4d8" : "#64748b" }}>{label}</p>
                    <p className="text-base font-bold leading-none pl-1"
                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: alert ? "#dc2626" : accent ? "#fff" : "#19405e" }}>
                        {value}
                    </p>
                </div>
            ))}
        </div>
    );
}

// ── Vendor card ──────────────────────────────────────────────────
function VendorCard({ vendor, purchaseCount, totalSpend, onEdit, onDelete }) {
    const cs = CATEGORY_COLORS[vendor.category] ?? CATEGORY_COLORS.Other;

    return (
        <div className="rounded-lg p-4 flex flex-col gap-3 group"
            style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#19405e"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}>

            {/* Top */}
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: "rgba(25,64,94,0.08)" }}>
                            <Building2 size={15} style={{ color: "#19405e" }} />
                        </div>
                        <p className="text-sm font-bold truncate"
                            style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                            {vendor.name}
                        </p>
                    </div>
                    {vendor.category && (
                        <span className="text-xs px-2 py-0.5 rounded font-medium ml-10"
                            style={{ backgroundColor: cs.bg, color: cs.color }}>
                            {vendor.category}
                        </span>
                    )}
                </div>

                {/* Status + actions */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded font-medium capitalize"
                        style={{
                            backgroundColor: vendor.status === "active" ? "rgba(25,64,94,0.08)" : "#f8fafc",
                            color:           vendor.status === "active" ? "#19405e" : "#94a3b8"
                        }}>
                        {vendor.status}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={onEdit}
                            className="w-6 h-6 rounded flex items-center justify-center"
                            style={{ color: "#1b4f72" }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#eff6ff"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                            <Pencil size={11} />
                        </button>
                        <button onClick={onDelete}
                            className="w-6 h-6 rounded flex items-center justify-center"
                            style={{ color: "#dc2626" }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fff5f5"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                            <Trash2 size={11} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Contact info */}
            <div className="flex flex-col gap-1.5">
                {vendor.contact_person && (
                    <p className="text-xs" style={{ color: "#64748b" }}>
                        👤 {vendor.contact_person}
                    </p>
                )}
                {vendor.email && (
                    <div className="flex items-center gap-1.5">
                        <Mail size={11} style={{ color: "#94a3b8", flexShrink: 0 }} />
                        <a href={`mailto:${vendor.email}`}
                            className="text-xs truncate"
                            style={{ color: "#1b4f72", textDecoration: "none" }}>
                            {vendor.email}
                        </a>
                    </div>
                )}
                {vendor.phone && (
                    <div className="flex items-center gap-1.5">
                        <Phone size={11} style={{ color: "#94a3b8", flexShrink: 0 }} />
                        <span className="text-xs" style={{ color: "#64748b" }}>{vendor.phone}</span>
                    </div>
                )}
                {vendor.website && (
                    <div className="flex items-center gap-1.5">
                        <Globe size={11} style={{ color: "#94a3b8", flexShrink: 0 }} />
                        <a href={vendor.website} target="_blank" rel="noreferrer"
                            className="text-xs truncate"
                            style={{ color: "#1b4f72", textDecoration: "none" }}>
                            {vendor.website.replace(/^https?:\/\//, "")}
                        </a>
                    </div>
                )}
            </div>

            {/* Footer stats */}
            <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "#f1f5f9" }}>
                <div className="flex items-center gap-1">
                    <ShoppingCart size={11} style={{ color: "#94a3b8" }} />
                    <span className="text-xs" style={{ color: "#64748b" }}>
                        {purchaseCount} order{purchaseCount !== 1 ? "s" : ""}
                    </span>
                </div>
                {totalSpend > 0 && (
                    <span className="text-xs font-semibold" style={{ color: "#19405e" }}>
                        ₹ {totalSpend.toLocaleString("en-IN")}
                    </span>
                )}
            </div>
        </div>
    );
}

// ── Main page ────────────────────────────────────────────────────
export default function Vendors() {

    const [vendors,   setVendors]   = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [search,    setSearch]    = useState("");
    const [catFilter, setCatFilter] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [editing,   setEditing]   = useState(null);

    const loadAll = async () => {
        try {
            setLoading(true);
            const [vRes, pRes] = await Promise.all([
                api.get("/api/vendors"),
                api.get("/api/purchases"),
            ]);
            setVendors(  vRes.data.data ?? []);
            setPurchases(pRes.data.data ?? []);
        } catch (err) {
            toast.error("Failed to load vendors.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAll(); }, []);

    const deleteVendor = async (id) => {
        const ok = await confirm({ title: "Delete Vendor?", message: "This will permanently remove the vendor record.", confirmLabel: "Delete", danger: true });
        if (!ok) return;
        try {
            await api.delete(`/api/vendors/${id}`);
            loadAll();
            setTimeout(() => toast.success("Vendor deleted."), 0);
        } catch (err) {
            toast.error("Failed to delete vendor.");
        }
    };

    // Per-vendor aggregates
    const vendorStats = useMemo(() => {
        const m = {};
        purchases.forEach(p => {
            if (!m[p.vendor_id]) m[p.vendor_id] = { count: 0, spend: 0 };
            m[p.vendor_id].count++;
            m[p.vendor_id].spend += Number(p.total_amount) || 0;
        });
        return m;
    }, [purchases]);

    const categories = useMemo(() => {
        const s = new Set(vendors.map(v => v.category).filter(Boolean));
        return ["all", ...s];
    }, [vendors]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return vendors
            .filter(v => catFilter === "all" || v.category === catFilter)
            .filter(v =>
                !q ||
                v.name?.toLowerCase().includes(q)           ||
                v.contact_person?.toLowerCase().includes(q) ||
                v.email?.toLowerCase().includes(q)          ||
                v.category?.toLowerCase().includes(q)
            )
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [vendors, catFilter, search]);

    return (
        <MainLayout>

            {/* ── Header ─────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                    <h2 className="text-base font-bold leading-tight"
                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                        Vendors
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                        {vendors.filter(v => v.status === "active").length} active vendor{vendors.filter(v => v.status === "active").length !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <SearchBar value={search} placeholder="Search vendors…" onChange={e => setSearch(e.target.value)} />
                    <button onClick={() => { setEditing(null); setShowModal(true); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold text-white"
                        style={{ backgroundColor: "#19405e" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#1b4f72"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#19405e"}>
                        <Plus size={14} /> Add Vendor
                    </button>
                </div>
            </div>

            {/* ── Stats ──────────────────────────────────── */}
            <StatStrip vendors={vendors} purchases={purchases} />

            {/* ── Category filter pills ───────────────────── */}
            <div className="flex flex-wrap gap-1 mb-4">
                {categories.map(cat => {
                    const active = catFilter === cat;
                    return (
                        <button key={cat} onClick={() => setCatFilter(cat)}
                            className="px-3 py-1.5 rounded text-xs font-medium border capitalize"
                            style={{
                                backgroundColor: active ? "#19405e" : "#ffffff",
                                borderColor:     active ? "#19405e" : "#e2e8f0",
                                color:           active ? "#ffffff"  : "#64748b",
                            }}>
                            {cat === "all" ? `All (${vendors.length})` : cat}
                        </button>
                    );
                })}
            </div>

            {/* ── Vendor cards grid ───────────────────────── */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {Array(6).fill(0).map((_, i) => (
                        <div key={i} className="rounded-lg p-4 animate-pulse"
                            style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", height: "160px" }}>
                            <div className="flex gap-2 mb-3">
                                <div className="w-8 h-8 rounded" style={{ backgroundColor: "#f1f5f9" }} />
                                <div className="flex-1">
                                    <div className="h-3 rounded mb-1.5" style={{ backgroundColor: "#f1f5f9", width: "50%" }} />
                                    <div className="h-2.5 rounded" style={{ backgroundColor: "#f8fafc", width: "30%" }} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-2.5 rounded" style={{ backgroundColor: "#f8fafc" }} />
                                <div className="h-2.5 rounded" style={{ backgroundColor: "#f8fafc", width: "70%" }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 rounded-lg"
                    style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0" }}>
                    <Building2 size={28} style={{ color: "#cbd5e1", marginBottom: "12px" }} />
                    <p className="text-sm font-semibold" style={{ color: "#19405e" }}>No vendors found</p>
                    <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                        {search ? "Try a different search." : "Add your first vendor to get started."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {filtered.map(v => (
                        <VendorCard
                            key={v.vendor_id}
                            vendor={v}
                            purchaseCount={vendorStats[v.vendor_id]?.count ?? 0}
                            totalSpend={vendorStats[v.vendor_id]?.spend ?? 0}
                            onEdit={() => { setEditing(v); setShowModal(true); }}
                            onDelete={() => deleteVendor(v.vendor_id)}
                        />
                    ))}
                </div>
            )}

            {/* ── Modal ──────────────────────────────────── */}
            {showModal && (
                <VendorModal
                    vendor={editing}
                    onClose={() => { setShowModal(false); setEditing(null); }}
                    onSaved={loadAll}
                />
            )}

        </MainLayout>
    );
}
