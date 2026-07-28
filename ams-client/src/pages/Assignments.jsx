import { useEffect, useState, useMemo } from "react";
import {
    ClipboardList, CheckCircle, RotateCcw,
    PackagePlus, History
} from "lucide-react";
import MainLayout    from "../layouts/MainLayout";
import AssignForm    from "../components/assignments/AssignForm";
import ReturnModal   from "../components/assignments/ReturnModal";
import DataTable     from "../components/DataTable/DataTable";
import SearchBar     from "../components/DataTable/SearchBar";
import api           from "../services/api";
import { toast }     from "../components/Toast";

// ── Status tab config ────────────────────────────────────────
const STATUS_TABS = [
    { key: "all",      label: "All"      },
    { key: "active",   label: "Active"   },
    { key: "returned", label: "Returned" },
];

// ── Stat strip ───────────────────────────────────────────────
function StatStrip({ assignments }) {
    const total    = assignments.length;
    const active   = assignments.filter(a => a.status === "active").length;
    const returned = assignments.filter(a => a.status === "returned").length;

    const cards = [
        { label: "Total Assignments", value: total,    icon: ClipboardList, accent: true  },
        { label: "Active",            value: active,   icon: CheckCircle,   accent: false },
        { label: "Returned",          value: returned, icon: RotateCcw,     accent: false },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
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
                    <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: accent ? "rgba(245,203,167,0.2)" : "rgba(25,64,94,0.08)" }}>
                        <Icon size={14} style={{ color: accent ? "#f5cba7" : "#19405e" }} />
                    </div>
                    <div>
                        <p className="text-xs leading-none mb-0.5"
                            style={{ color: accent ? "#a8c4d8" : "#64748b" }}>{label}</p>
                        <p className="text-lg font-bold leading-none"
                            style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: accent ? "#fff" : "#19405e" }}>
                            {value}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Main page ────────────────────────────────────────────────
export default function Assignments() {

    const [assignments,   setAssignments]   = useState([]);
    const [assets,        setAssets]        = useState([]);
    const [employees,     setEmployees]     = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [search,        setSearch]        = useState("");
    const [activeTab,     setActiveTab]     = useState("all");
    const [showForm,      setShowForm]      = useState(false);
    const [returning,     setReturning]     = useState(null); // assignment to return

    // ── Fetch all ────────────────────────────────────────────
    const loadAll = async () => {
        try {
            setLoading(true);
            const [asRes, assetRes, empRes] = await Promise.all([
                api.get("/api/assignments"),
                api.get("/api/assets"),
                api.get("/api/employees"),
            ]);
            setAssignments(asRes.data.data    ?? []);
            setAssets(     assetRes.data.data ?? []);
            setEmployees(  empRes.data.data   ?? []);
        } catch (err) {
            console.error("Assignments load error:", err);
            toast.error("Failed to load assignments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAll(); }, []);

    // ── Lookup maps ──────────────────────────────────────────
    const assetMap = useMemo(() =>
        Object.fromEntries(assets.map(a => [a.asset_id, a])),
    [assets]);

    const employeeMap = useMemo(() =>
        Object.fromEntries(employees.map(e => [e.email, e])),
    [employees]);

    // ── Enrich assignments with denormalised display fields ──
    const enriched = useMemo(() =>
        assignments.map(a => ({
            ...a,
            asset_name:      assetMap[a.asset_id]?.name             ?? a.asset_id,
            asset_serial:    assetMap[a.asset_id]?.serial_number    ?? "—",
            asset_brand:     assetMap[a.asset_id]?.brand            ?? "—",
            employee_name:   employeeMap[a.employee_email]?.fullname ?? a.employee_email,
            department:      employeeMap[a.employee_email]?.department ?? "—",
            assigned_date_fmt: a.assigned_date
                ? new Date(a.assigned_date).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })
                : "—",
            return_date_fmt: a.return_date
                ? new Date(a.return_date).toLocaleDateString("en-IN",  { day:"2-digit", month:"short", year:"numeric" })
                : "—",
        })),
    [assignments, assetMap, employeeMap]);

    // ── Filter ───────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return enriched
            .filter(a => activeTab === "all" || a.status === activeTab)
            .filter(a =>
                !q ||
                a.asset_name?.toLowerCase().includes(q)    ||
                a.asset_serial?.toLowerCase().includes(q)  ||
                a.employee_name?.toLowerCase().includes(q) ||
                a.department?.toLowerCase().includes(q)    ||
                a.employee_email?.toLowerCase().includes(q)
            )
            // Sort: active first, then by assigned_date desc
            .sort((a, b) => {
                if (a.status !== b.status) return a.status === "active" ? -1 : 1;
                return new Date(b.assigned_date) - new Date(a.assigned_date);
            });
    }, [enriched, activeTab, search]);

    // ── Table columns ────────────────────────────────────────
    const columns = [
        { key: "asset_name",       label: "Asset"         },
        { key: "asset_brand",      label: "Brand"         },
        { key: "asset_serial",     label: "Serial No."    },
        { key: "employee_name",    label: "Employee"      },
        { key: "department",       label: "Department"    },
        { key: "assigned_date_fmt",label: "Assigned On"   },
        { key: "return_date_fmt",  label: "Returned On"   },
        { key: "status",           label: "Status"        },
    ];

    const tabCount = key =>
        key === "all" ? assignments.length : assignments.filter(a => a.status === key).length;

    return (
        <MainLayout>

            {/* ── Header ─────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                    <h2 className="text-base font-bold leading-tight"
                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                        Assignments
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                        {assignments.filter(a => a.status === "active").length} active assignment{assignments.filter(a => a.status === "active").length !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <SearchBar
                        value={search}
                        placeholder="Search assignments…"
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button
                        onClick={() => setShowForm(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold text-white"
                        style={{ backgroundColor: showForm ? "#1b4f72" : "#19405e" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#1b4f72"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = showForm ? "#1b4f72" : "#19405e"}>
                        <PackagePlus size={14} />
                        {showForm ? "Close" : "New Assignment"}
                    </button>
                </div>
            </div>

            {/* ── Stat strip ─────────────────────────────── */}
            <StatStrip assignments={assignments} />

            {/* ── Assign form ────────────────────────────── */}
            {showForm && (
                <AssignForm
                    assets={assets}
                    employees={employees}
                    onSaved={() => { loadAll(); setShowForm(false); }}
                />
            )}

            {/* ── Status tabs ────────────────────────────── */}
            <div className="flex gap-1 mb-3">
                {STATUS_TABS.map(tab => {
                    const active = activeTab === tab.key;
                    return (
                        <button key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
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
                renderActions={(row) => (
                    <div className="flex items-center gap-1.5">
                        {row.status === "active" ? (
                            <button
                                onClick={() => setReturning(row)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium border"
                                style={{ borderColor: "#19405e", color: "#19405e" }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#19405e"; e.currentTarget.style.color = "#fff"; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#19405e"; }}>
                                <RotateCcw size={11} />
                                Return
                            </button>
                        ) : (
                            <span className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium"
                                style={{ backgroundColor: "#f1f5f9", color: "#94a3b8" }}>
                                <History size={11} />
                                Closed
                            </span>
                        )}
                    </div>
                )}
            />

            {/* ── Return modal ───────────────────────────── */}
            {returning && (
                <ReturnModal
                    assignment={returning}
                    assetName={returning.asset_name}
                    employeeName={returning.employee_name}
                    onClose={() => setReturning(null)}
                    onReturned={loadAll}
                />
            )}

        </MainLayout>
    );
}
