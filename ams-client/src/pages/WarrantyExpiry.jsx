import { useEffect, useState, useMemo } from "react";
import { ShieldAlert, ShieldCheck, ShieldOff, ShieldQuestion, AlertTriangle, CalendarDays } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import DataTable  from "../components/DataTable/DataTable";
import SearchBar  from "../components/DataTable/SearchBar";
import api        from "../services/api";
import { toast }  from "../components/Toast";

// ── Expiry classification ────────────────────────────────────────
function classify(expiry_date) {
    if (!expiry_date) return "unknown";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp   = new Date(expiry_date);
    const diff  = Math.ceil((exp - today) / (1000 * 60 * 60 * 24)); // days
    if (diff < 0)    return "expired";
    if (diff <= 30)  return "expiring-soon";   // within 30 days
    if (diff <= 90)  return "expiring-3m";     // within 90 days
    return "valid";
}

function daysLabel(expiry_date) {
    if (!expiry_date) return "—";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((new Date(expiry_date) - today) / (1000 * 60 * 60 * 24));
    if (diff < 0)  return `Expired ${Math.abs(diff)}d ago`;
    if (diff === 0) return "Expires today";
    return `${diff} day${diff !== 1 ? "s" : ""} left`;
}

const STATUS_TABS = [
    { key: "all",           label: "All"            },
    { key: "expired",       label: "Expired"        },
    { key: "expiring-soon", label: "Expiring Soon"  },
    { key: "expiring-3m",   label: "Within 3 Months"},
    { key: "valid",         label: "Valid"          },
    { key: "unknown",       label: "No Data"        },
];

const CLASSIFY_STYLE = {
    expired:        { bg: "#fff5f5",             color: "#dc2626", border: "#fca5a5", icon: ShieldOff,      label: "Expired"        },
    "expiring-soon":{ bg: "#fff7ed",             color: "#c2410c", border: "#fed7aa", icon: ShieldAlert,    label: "Expiring Soon"  },
    "expiring-3m":  { bg: "#fffbeb",             color: "#b45309", border: "#fde68a", icon: AlertTriangle,  label: "Within 3 Months"},
    valid:          { bg: "rgba(25,64,94,0.07)", color: "#19405e", border: "#b7d9cc", icon: ShieldCheck,    label: "Valid"          },
    unknown:        { bg: "#f8fafc",             color: "#94a3b8", border: "#e2e8f0", icon: ShieldQuestion, label: "No Data"        },
};

// ── KPI strip ────────────────────────────────────────────────────
function StatStrip({ assets }) {
    const counts = useMemo(() => {
        const c = { expired: 0, "expiring-soon": 0, "expiring-3m": 0, valid: 0, unknown: 0 };
        assets.forEach(a => { const k = classify(a.warranty_expiry); c[k] = (c[k] || 0) + 1; });
        return c;
    }, [assets]);

    const cards = [
        { key: "expired",        label: "Expired",         icon: ShieldOff      },
        { key: "expiring-soon",  label: "Expiring ≤30d",   icon: ShieldAlert    },
        { key: "expiring-3m",    label: "Expiring ≤90d",   icon: AlertTriangle  },
        { key: "valid",          label: "Valid",            icon: ShieldCheck    },
        { key: "unknown",        label: "No Warranty Data", icon: ShieldQuestion },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
            {cards.map(({ key, label, icon: Icon }) => {
                const s   = CLASSIFY_STYLE[key];
                const val = counts[key] ?? 0;
                const alert = (key === "expired" || key === "expiring-soon") && val > 0;
                return (
                    <div key={key}
                        className="rounded-lg px-3 py-2.5 flex items-center gap-2.5 relative overflow-hidden"
                        style={{
                            backgroundColor: "#ffffff",
                            border: `1px solid ${alert ? s.border : "#e2e8f0"}`,
                            boxShadow: alert ? `0 0 0 1px ${s.border}` : "0 1px 3px rgba(0,0,0,0.05)"
                        }}>
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l"
                            style={{ backgroundColor: s.color }} />
                        <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: s.bg }}>
                            <Icon size={14} style={{ color: s.color }} />
                        </div>
                        <div>
                            <p className="text-xs leading-none mb-0.5" style={{ color: "#64748b" }}>{label}</p>
                            <p className="text-base font-bold leading-none"
                                style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: alert ? s.color : "#19405e" }}>
                                {val}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ── Expiry badge ─────────────────────────────────────────────────
function ExpiryBadge({ expiry_date }) {
    const key = classify(expiry_date);
    const s   = CLASSIFY_STYLE[key];
    return (
        <div className="flex flex-col gap-0.5">
            <span className="px-2 py-0.5 rounded text-xs font-medium w-fit"
                style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                {s.label}
            </span>
            <span className="text-xs" style={{ color: "#94a3b8" }}>{daysLabel(expiry_date)}</span>
        </div>
    );
}

// ── Main page ────────────────────────────────────────────────────
export default function WarrantyExpiry() {

    const [assets,      setAssets]      = useState([]);
    const [categories,  setCategories]  = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [search,      setSearch]      = useState("");
    const [activeTab,   setActiveTab]   = useState("all");

    const loadAll = async () => {
        try {
            setLoading(true);
            const [aRes, cRes] = await Promise.all([
                api.get("/api/assets"),
                api.get("/api/categories"),
            ]);
            setAssets(     aRes.data.data ?? []);
            setCategories( cRes.data.data ?? []);
        } catch (err) {
            toast.error("Failed to load warranty data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAll(); }, []);

    const catMap = useMemo(() => Object.fromEntries(categories.map(c => [c.category_id, c.name])), [categories]);

    // Enrich assets
    const enriched = useMemo(() =>
        assets
            .filter(a => a.status !== "retired")   // retired assets don't need tracking
            .map(a => ({
                ...a,
                category_name:   catMap[a.category_id] ?? "—",
                expiry_class:    classify(a.warranty_expiry),
                days_label:      daysLabel(a.warranty_expiry),
                purchase_fmt:    a.purchase_date
                    ? new Date(a.purchase_date).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })
                    : "—",
                warranty_fmt:    a.warranty_expiry
                    ? new Date(a.warranty_expiry).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })
                    : "—",
            })),
    [assets, catMap]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return enriched
            .filter(a => activeTab === "all" || a.expiry_class === activeTab)
            .filter(a =>
                !q ||
                a.name?.toLowerCase().includes(q)          ||
                a.brand?.toLowerCase().includes(q)         ||
                a.model?.toLowerCase().includes(q)         ||
                a.serial_number?.toLowerCase().includes(q) ||
                a.category_name?.toLowerCase().includes(q)
            )
            // Sort: expired first → expiring-soon → expiring-3m → valid → unknown
            .sort((a, b) => {
                const order = { expired: 0, "expiring-soon": 1, "expiring-3m": 2, valid: 3, unknown: 4 };
                const od = (order[a.expiry_class] ?? 4) - (order[b.expiry_class] ?? 4);
                if (od !== 0) return od;
                // Within same class, sort by expiry date ascending
                if (!a.warranty_expiry) return 1;
                if (!b.warranty_expiry) return -1;
                return new Date(a.warranty_expiry) - new Date(b.warranty_expiry);
            });
    }, [enriched, activeTab, search]);

    const tabCount = key => key === "all"
        ? enriched.length
        : enriched.filter(a => a.expiry_class === key).length;

    const columns = [
        { key: "name",          label: "Asset"        },
        { key: "category_name", label: "Category"     },
        { key: "brand",         label: "Brand"        },
        { key: "model",         label: "Model"        },
        { key: "serial_number", label: "Serial No."   },
        { key: "status",        label: "Asset Status" },
        { key: "purchase_fmt",  label: "Purchased"    },
        { key: "warranty_fmt",  label: "Warranty Expiry" },
        { key: "days_label",    label: "Time Left"    },
    ];

    return (
        <MainLayout>

            {/* ── Header ─────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                    <h2 className="text-base font-bold leading-tight"
                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                        Warranty Expiry
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                        {enriched.filter(a => a.expiry_class === "expired" || a.expiry_class === "expiring-soon").length} asset{enriched.filter(a => a.expiry_class === "expired" || a.expiry_class === "expiring-soon").length !== 1 ? "s" : ""} require attention
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <SearchBar value={search} placeholder="Search assets…" onChange={e => setSearch(e.target.value)} />
                    <button onClick={loadAll}
                        className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold border"
                        style={{ borderColor: "#e2e8f0", color: "#19405e", backgroundColor: "#fff" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f8fafc"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#fff"}>
                        <CalendarDays size={14} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* ── Alert banner if expired/expiring-soon ──── */}
            {!loading && enriched.filter(a => a.expiry_class === "expired").length > 0 && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg mb-4"
                    style={{ backgroundColor: "#fff5f5", border: "1px solid #fca5a5" }}>
                    <ShieldOff size={16} style={{ color: "#dc2626", flexShrink: 0 }} />
                    <p className="text-xs" style={{ color: "#991b1b" }}>
                        <strong>{enriched.filter(a => a.expiry_class === "expired").length} asset{enriched.filter(a => a.expiry_class === "expired").length !== 1 ? "s" : ""}</strong> have expired warranties. Contact your vendor to arrange renewal or replacement.
                    </p>
                </div>
            )}

            {!loading && enriched.filter(a => a.expiry_class === "expiring-soon").length > 0 && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg mb-4"
                    style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa" }}>
                    <ShieldAlert size={16} style={{ color: "#c2410c", flexShrink: 0 }} />
                    <p className="text-xs" style={{ color: "#9a3412" }}>
                        <strong>{enriched.filter(a => a.expiry_class === "expiring-soon").length} asset{enriched.filter(a => a.expiry_class === "expiring-soon").length !== 1 ? "s" : ""}</strong> expire within 30 days. Plan renewals promptly.
                    </p>
                </div>
            )}

            {/* ── KPI strip ──────────────────────────────── */}
            <StatStrip assets={enriched} />

            {/* ── Tabs ───────────────────────────────────── */}
            <div className="flex gap-1 mb-3 flex-wrap">
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
                    // Show a badge for warranty status instead of action buttons
                    <ExpiryBadge expiry_date={row.warranty_expiry} />
                )}
            />

        </MainLayout>
    );
}
