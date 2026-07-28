import { useEffect, useState, useMemo } from "react";
import { Wrench, Plus, AlertTriangle, Clock, CheckCircle2, XCircle, Pencil, Trash2 } from "lucide-react";
import MainLayout   from "../layouts/MainLayout";
import RepairForm   from "../components/repair/RepairForm";
import RepairModal  from "../components/repair/RepairModal";
import DataTable    from "../components/DataTable/DataTable";
import SearchBar    from "../components/DataTable/SearchBar";
import api          from "../services/api";
import { toast }    from "../components/Toast";
import { confirm }  from "../components/ConfirmDialog";

// ── Config ───────────────────────────────────────────────────────
const STATUS_TABS = [
    { key: "all",         label: "All"         },
    { key: "open",        label: "Open"        },
    { key: "in-progress", label: "In Progress" },
    { key: "resolved",    label: "Resolved"    },
    { key: "closed",      label: "Closed"      },
];

const STATUS_STYLE = {
    open:          { bg: "#fff5f5",             color: "#dc2626",  border: "#fca5a5" },
    "in-progress": { bg: "rgba(230,126,34,0.12)",color: "#9a4a10", border: "#fed7aa" },
    resolved:      { bg: "rgba(25,64,94,0.08)", color: "#19405e",  border: "#b7d9cc" },
    closed:        { bg: "#f8fafc",             color: "#64748b",  border: "#e2e8f0" },
};

const PRIORITY_STYLE = {
    low:      { bg: "#f0f9ff", color: "#0369a1" },
    medium:   { bg: "#fffbeb", color: "#b45309" },
    high:     { bg: "#fff7ed", color: "#c2410c" },
    critical: { bg: "#fff5f5", color: "#dc2626" },
};

// ── Stat strip ───────────────────────────────────────────────────
function StatStrip({ requests }) {
    const open       = requests.filter(r => r.status === "open").length;
    const inProgress = requests.filter(r => r.status === "in-progress").length;
    const resolved   = requests.filter(r => r.status === "resolved").length;
    const critical   = requests.filter(r => r.priority === "critical" && r.status !== "closed").length;

    const cards = [
        { label: "Total",       value: requests.length, icon: Wrench,       accent: true  },
        { label: "Open",        value: open,            icon: XCircle,      accent: false },
        { label: "In Progress", value: inProgress,      icon: Clock,        accent: false },
        { label: "Resolved",    value: resolved,        icon: CheckCircle2, accent: false },
        { label: "Critical",    value: critical,        icon: AlertTriangle,accent: false, alert: critical > 0 },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
            {cards.map(({ label, value, icon: Icon, accent, alert }) => (
                <div key={label}
                    className="rounded-lg px-3 py-2.5 flex items-center gap-2.5 relative overflow-hidden"
                    style={{
                        backgroundColor: accent ? "#19405e" : "#ffffff",
                        border: `1px solid ${alert ? "#fca5a5" : accent ? "transparent" : "#e2e8f0"}`,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                    }}>
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l"
                        style={{ backgroundColor: alert ? "#dc2626" : accent ? "#f5cba7" : "#19405e" }} />
                    <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: alert ? "rgba(220,38,38,0.1)" : accent ? "rgba(245,203,167,0.2)" : "rgba(25,64,94,0.08)" }}>
                        <Icon size={14} style={{ color: alert ? "#dc2626" : accent ? "#f5cba7" : "#19405e" }} />
                    </div>
                    <div>
                        <p className="text-xs leading-none mb-0.5"
                            style={{ color: accent ? "#a8c4d8" : "#64748b" }}>{label}</p>
                        <p className="text-base font-bold leading-none"
                            style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: alert ? "#dc2626" : accent ? "#fff" : "#19405e" }}>
                            {value}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Main page ────────────────────────────────────────────────────
export default function RepairRequests() {

    const [requests,   setRequests]   = useState([]);
    const [assets,     setAssets]     = useState([]);
    const [employees,  setEmployees]  = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [search,     setSearch]     = useState("");
    const [activeTab,  setActiveTab]  = useState("all");
    const [showForm,   setShowForm]   = useState(false);
    const [editing,    setEditing]    = useState(null);

    const loadAll = async () => {
        try {
            setLoading(true);
            const [rRes, aRes, eRes] = await Promise.all([
                api.get("/api/repair-requests"),
                api.get("/api/assets"),
                api.get("/api/employees"),
            ]);
            setRequests( rRes.data.data ?? []);
            setAssets(   aRes.data.data ?? []);
            setEmployees(eRes.data.data ?? []);
        } catch (err) {
            toast.error("Failed to load repair requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAll(); }, []);

    const assetMap    = useMemo(() => Object.fromEntries(assets.map(a => [a.asset_id, a])),    [assets]);
    const employeeMap = useMemo(() => Object.fromEntries(employees.map(e => [e.email, e])),    [employees]);

    const deleteRequest = async (id) => {
        const ok = await confirm({ title: "Delete Repair Request?", message: "This will permanently remove the request.", confirmLabel: "Delete", danger: true });
        if (!ok) return;
        try {
            await api.delete(`/api/repair-requests/${id}`);
            loadAll();
            setTimeout(() => toast.success("Request deleted."), 0);
        } catch (err) {
            toast.error("Failed to delete request.");
        }
    };

    // Enrich with display fields
    const enriched = useMemo(() =>
        requests.map(r => ({
            ...r,
            asset_name:    assetMap[r.asset_id]?.name             ?? "—",
            asset_serial:  assetMap[r.asset_id]?.serial_number    ?? "—",
            assignee_name: r.assigned_to ? (employeeMap[r.assigned_to]?.fullname ?? r.assigned_to) : "Unassigned",
            created_fmt:   new Date(r.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        })),
    [requests, assetMap, employeeMap]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return enriched
            .filter(r => activeTab === "all" || r.status === activeTab)
            .filter(r =>
                !q ||
                r.title?.toLowerCase().includes(q)        ||
                r.asset_name?.toLowerCase().includes(q)   ||
                r.asset_serial?.toLowerCase().includes(q) ||
                r.reported_by?.toLowerCase().includes(q)  ||
                r.assignee_name?.toLowerCase().includes(q)
            )
            .sort((a, b) => {
                // Critical first, then by date
                const pOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                if (a.status !== "closed" && b.status !== "closed") {
                    const pd = (pOrder[a.priority] ?? 2) - (pOrder[b.priority] ?? 2);
                    if (pd !== 0) return pd;
                }
                return new Date(b.created_at) - new Date(a.created_at);
            });
    }, [enriched, activeTab, search]);

    const columns = [
        { key: "asset_name",   label: "Asset"       },
        { key: "asset_serial", label: "Serial No."  },
        { key: "title",        label: "Issue"       },
        { key: "reported_by",  label: "Reported By" },
        { key: "assignee_name",label: "Assigned To" },
        { key: "priority",     label: "Priority"    },
        { key: "status",       label: "Status"      },
        { key: "created_fmt",  label: "Raised On"   },
    ];

    const tabCount = key => key === "all" ? requests.length : requests.filter(r => r.status === key).length;

    return (
        <MainLayout>

            {/* ── Header ─────────────────────────────────── */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-base font-bold leading-tight"
                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                        Repair Requests
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                        {requests.filter(r => r.status === "open" || r.status === "in-progress").length} active request{requests.filter(r => r.status === "open" || r.status === "in-progress").length !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <SearchBar value={search} placeholder="Search requests…" onChange={e => setSearch(e.target.value)} />
                    <button onClick={() => setShowForm(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold text-white"
                        style={{ backgroundColor: showForm ? "#1b4f72" : "#19405e" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#1b4f72"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = showForm ? "#1b4f72" : "#19405e"}>
                        <Plus size={14} />
                        {showForm ? "Close" : "New Request"}
                    </button>
                </div>
            </div>

            {/* ── KPI strip ──────────────────────────────── */}
            <StatStrip requests={requests} />

            {/* ── Form ───────────────────────────────────── */}
            {showForm && (
                <RepairForm assets={assets} onSaved={() => { loadAll(); setShowForm(false); }} />
            )}

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
                columns={columns}
                data={filtered}
                loading={loading}
                renderActions={row => (
                    <div className="flex items-center gap-1.5">
                        {row.status !== "closed" && (
                            <button onClick={() => setEditing(row)}
                                className="p-1.5 rounded"
                                style={{ color: "#1b4f72" }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#eff6ff"}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                                <Pencil size={13} />
                            </button>
                        )}
                        <button onClick={() => deleteRequest(row.request_id)}
                            className="p-1.5 rounded"
                            style={{ color: "#dc2626" }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fff5f5"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                            <Trash2 size={13} />
                        </button>
                    </div>
                )}
            />

            {/* ── Modal ──────────────────────────────────── */}
            {editing && (
                <RepairModal
                    request={editing}
                    assetName={assetMap[editing.asset_id]?.name ?? editing.asset_id}
                    employees={employees}
                    onClose={() => setEditing(null)}
                    onSaved={loadAll}
                />
            )}

        </MainLayout>
    );
}
