import { useEffect, useState, useMemo } from "react";
import { Wrench, CalendarClock, CheckCircle2, Loader2, Plus } from "lucide-react";
import MainLayout         from "../layouts/MainLayout";
import MaintenanceForm    from "../components/maintenance/MaintenanceForm";
import MaintenanceModal   from "../components/maintenance/MaintenanceModal";
import DataTable          from "../components/DataTable/DataTable";
import SearchBar          from "../components/DataTable/SearchBar";
import api                from "../services/api";
import { toast }          from "../components/Toast";

// ── Status config ────────────────────────────────────────────────
const STATUS_TABS = [
    { key: "all",         label: "All"          },
    { key: "scheduled",   label: "Scheduled"    },
    { key: "in-progress", label: "In Progress"  },
    { key: "completed",   label: "Completed"    },
];

const STATUS_STYLE = {
    scheduled:    { bg: "rgba(245,203,167,0.3)",   color: "#7a4a1e"  },
    "in-progress":{ bg: "rgba(230,126,34,0.15)",   color: "#9a4a10"  },
    completed:    { bg: "rgba(25,64,94,0.1)",       color: "#19405e"  },
};

// ── KPI strip ────────────────────────────────────────────────────
function StatStrip({ logs }) {
    const scheduled   = logs.filter(l => l.status === "scheduled").length;
    const inProgress  = logs.filter(l => l.status === "in-progress").length;
    const completed   = logs.filter(l => l.status === "completed").length;
    const totalCost   = logs.reduce((s, l) => s + (Number(l.cost) || 0), 0);

    const cards = [
        { label: "Total Logs",    value: logs.length,   icon: Wrench,        accent: true  },
        { label: "Scheduled",     value: scheduled,     icon: CalendarClock, accent: false },
        { label: "In Progress",   value: inProgress,    icon: Loader2,       accent: false },
        { label: "Completed",     value: completed,     icon: CheckCircle2,  accent: false },
        { label: "Total Cost",    value: `₹ ${totalCost.toLocaleString("en-IN")}`, icon: null, accent: false },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 mb-4">
            {cards.map(({ label, value, icon: Icon, accent }) => (
                <div key={label}
                    className="rounded-lg px-3 py-2.5 flex items-center gap-2.5 relative overflow-hidden"
                    style={{
                        backgroundColor: accent ? "#19405e" : "#ffffff",
                        border: `1px solid ${accent ? "transparent" : "#e2e8f0"}`,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                    }}>
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l"
                        style={{ backgroundColor: accent ? "#f5cba7" : "#19405e" }} />
                    {Icon && (
                        <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: accent ? "rgba(245,203,167,0.2)" : "rgba(25,64,94,0.08)" }}>
                            <Icon size={14} style={{ color: accent ? "#f5cba7" : "#19405e" }} />
                        </div>
                    )}
                    <div>
                        <p className="text-xs leading-none mb-0.5"
                            style={{ color: accent ? "#a8c4d8" : "#64748b" }}>{label}</p>
                        <p className="text-base font-bold leading-none"
                            style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: accent ? "#fff" : "#19405e" }}>
                            {value}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Status badge (used in custom column render) ──────────────────
function StatusBadge({ status }) {
    const s = STATUS_STYLE[status] ?? { bg: "#f1f5f9", color: "#64748b" };
    return (
        <span className="px-2 py-0.5 rounded text-xs font-medium capitalize"
            style={{ backgroundColor: s.bg, color: s.color }}>
            {status}
        </span>
    );
}

// ── Main page ────────────────────────────────────────────────────
export default function Maintenance() {

    const [logs,       setLogs]       = useState([]);
    const [assets,     setAssets]     = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [search,     setSearch]     = useState("");
    const [activeTab,  setActiveTab]  = useState("all");
    const [showForm,   setShowForm]   = useState(false);
    const [editingLog, setEditingLog] = useState(null);

    // ── Fetch ────────────────────────────────────────────────────
    const loadAll = async () => {
        try {
            setLoading(true);
            const [logRes, assetRes] = await Promise.all([
                api.get("/api/maintenance"),
                api.get("/api/assets"),
            ]);
            setLogs(  logRes.data.data   ?? []);
            setAssets(assetRes.data.data ?? []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load maintenance data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAll(); }, []);

    // ── Asset map ────────────────────────────────────────────────
    const assetMap = useMemo(() =>
        Object.fromEntries(assets.map(a => [a.asset_id, a])),
    [assets]);

    // ── Enrich logs ──────────────────────────────────────────────
    const enriched = useMemo(() =>
        logs.map(l => ({
            ...l,
            asset_name:   assetMap[l.asset_id]?.name          ?? "—",
            asset_serial: assetMap[l.asset_id]?.serial_number ?? "—",
            brand:        assetMap[l.asset_id]?.brand         ?? "—",
            scheduled_fmt: l.scheduled_date
                ? new Date(l.scheduled_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                : "—",
            completed_fmt: l.completed_date
                ? new Date(l.completed_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                : "—",
            cost_fmt: l.cost ? `₹ ${Number(l.cost).toLocaleString("en-IN")}` : "—",
        })),
    [logs, assetMap]);

    // ── Filter ───────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return enriched
            .filter(l => activeTab === "all" || l.status === activeTab)
            .filter(l =>
                !q ||
                l.asset_name?.toLowerCase().includes(q)   ||
                l.asset_serial?.toLowerCase().includes(q) ||
                l.type?.toLowerCase().includes(q)         ||
                l.vendor?.toLowerCase().includes(q)       ||
                l.description?.toLowerCase().includes(q)
            )
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [enriched, activeTab, search]);

    const tabCount = key =>
        key === "all" ? logs.length : logs.filter(l => l.status === key).length;

    // ── Custom column renderers ──────────────────────────────────
    const columns = [
        { key: "asset_name",    label: "Asset"        },
        { key: "brand",         label: "Brand"        },
        { key: "asset_serial",  label: "Serial No."   },
        { key: "type",          label: "Type"         },
        { key: "description",   label: "Description"  },
        { key: "vendor",        label: "Vendor"       },
        { key: "cost_fmt",      label: "Cost"         },
        { key: "scheduled_fmt", label: "Scheduled"    },
        { key: "completed_fmt", label: "Completed"    },
        { key: "status",        label: "Status"       },
    ];

    return (
        <MainLayout>

            {/* ── Header ─────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                    <h2 className="text-base font-bold leading-tight"
                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                        Maintenance
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                        {logs.filter(l => l.status !== "completed").length} open log{logs.filter(l => l.status !== "completed").length !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <SearchBar value={search} placeholder="Search logs…" onChange={e => setSearch(e.target.value)} />
                    <button onClick={() => setShowForm(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold text-white"
                        style={{ backgroundColor: showForm ? "#1b4f72" : "#19405e" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#1b4f72"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = showForm ? "#1b4f72" : "#19405e"}>
                        <Plus size={14} />
                        {showForm ? "Close" : "Log Maintenance"}
                    </button>
                </div>
            </div>

            {/* ── KPI strip ──────────────────────────────── */}
            <StatStrip logs={logs} />

            {/* ── Form ───────────────────────────────────── */}
            {showForm && (
                <MaintenanceForm
                    assets={assets}
                    onSaved={() => { loadAll(); setShowForm(false); }}
                />
            )}

            {/* ── Tabs ───────────────────────────────────── */}
            <div className="flex gap-1 mb-3">
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
                columns={columns}
                data={filtered}
                loading={loading}
                renderActions={log => (
                    <div className="flex items-center gap-1.5">
                        {log.status !== "completed" ? (
                            <button
                                onClick={() => setEditingLog(log)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium border"
                                style={{ borderColor: "#19405e", color: "#19405e" }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#19405e"; e.currentTarget.style.color = "#fff"; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#19405e"; }}>
                                <Wrench size={11} /> Update
                            </button>
                        ) : (
                            <span className="px-2.5 py-1.5 rounded text-xs font-medium"
                                style={{ backgroundColor: "#f1f5f9", color: "#94a3b8" }}>
                                Closed
                            </span>
                        )}
                    </div>
                )}
            />

            {/* ── Update modal ───────────────────────────── */}
            {editingLog && (
                <MaintenanceModal
                    log={editingLog}
                    assetName={assetMap[editingLog.asset_id]?.name ?? editingLog.asset_id}
                    onClose={() => setEditingLog(null)}
                    onSaved={loadAll}
                />
            )}

        </MainLayout>
    );
}
