import { useEffect, useState, useMemo } from "react";
import {
    PackagePlus, Monitor, CheckCircle,
    ClipboardList, Wrench, Archive, Pencil, Trash2
} from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import AssetForm   from "../components/assets/AssetForm";
import AssetModal  from "../components/assets/AssetModal";
import AssetDrawer from "../components/assets/AssetDrawer";
import DataTable   from "../components/DataTable/DataTable";
import SearchBar   from "../components/DataTable/SearchBar";
import api from "../services/api";
import { toast } from "../components/Toast";
import { confirm } from "../components/ConfirmDialog";

// ── Status tab config ────────────────────────────────────────
const STATUS_TABS = [
    { key: "all",         label: "All"         },
    { key: "available",   label: "Available"   },
    { key: "assigned",    label: "Assigned"    },
    { key: "maintenance", label: "Maintenance" },
    { key: "retired",     label: "Retired"     },
];

// ── Mini KPI strip ───────────────────────────────────────────
const STAT_ICONS = {
    total:       Monitor,
    available:   CheckCircle,
    assigned:    ClipboardList,
    maintenance: Wrench,
    retired:     Archive,
};
const STAT_LABELS = {
    total: "Total", available: "Available",
    assigned: "Assigned", maintenance: "Maintenance", retired: "Retired"
};

function StatStrip({ assets }) {
    const counts = useMemo(() => ({
        total:       assets.length,
        available:   assets.filter(a => a.status === "available").length,
        assigned:    assets.filter(a => a.status === "assigned").length,
        maintenance: assets.filter(a => a.status === "maintenance").length,
        retired:     assets.filter(a => a.status === "retired").length,
    }), [assets]);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2 mb-4">
            {Object.entries(counts).map(([key, val]) => {
                const Icon = STAT_ICONS[key];
                const accent = key === "total";
                return (
                    <div key={key}
                        className="rounded-lg px-3 py-2.5 flex items-center gap-2.5 relative overflow-hidden"
                        style={{
                            backgroundColor: accent ? "#19405e" : "#ffffff",
                            border: `1px solid ${accent ? "transparent" : "#e2e8f0"}`,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                        }}>
                        {/* left accent bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l"
                            style={{ backgroundColor: accent ? "#f5cba7" : "#19405e" }} />
                        <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: accent ? "rgba(245,203,167,0.2)" : "rgba(25,64,94,0.08)" }}>
                            <Icon size={14} style={{ color: accent ? "#f5cba7" : "#19405e" }} />
                        </div>
                        <div>
                            <p className="text-xs leading-none mb-0.5"
                                style={{ color: accent ? "#a8c4d8" : "#64748b" }}>
                                {STAT_LABELS[key]}
                            </p>
                            <p className="text-lg font-bold leading-none"
                                style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: accent ? "#fff" : "#19405e" }}>
                                {val}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ── Main page ────────────────────────────────────────────────
export default function Assets() {

    const [assets,         setAssets]         = useState([]);
    const [categories,     setCategories]     = useState([]);
    const [loading,        setLoading]        = useState(true);
    const [search,         setSearch]         = useState("");
    const [activeTab,      setActiveTab]      = useState("all");
    const [showForm,       setShowForm]       = useState(false);
    const [editingAsset,   setEditingAsset]   = useState(null);
    const [drawerAsset,    setDrawerAsset]    = useState(null);

    // ── Fetch ────────────────────────────────────────────────
    const loadAll = async () => {
        try {
            setLoading(true);
            const [aRes, cRes] = await Promise.all([
                api.get("/api/assets"),
                api.get("/api/categories"),
            ]);
            setAssets(aRes.data.data     ?? []);
            setCategories(cRes.data.data ?? []);
        } catch (err) {
            toast.error("Failed to load assets.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAll(); }, []);

    // ── Delete ───────────────────────────────────────────────
    const deleteAsset = async (asset_id) => {
        const ok = await confirm({ title: "Delete Asset?", message: "This cannot be undone.", confirmLabel: "Delete", danger: true });
        if (!ok) return;
        try {
            await api.delete(`/api/assets/${asset_id}`);
            toast.success("Asset deleted.");
            setDrawerAsset(null);
            loadAll();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete asset.");
        }
    };

    // ── Filtered + searched data ─────────────────────────────
    const categoryMap = useMemo(() =>
        Object.fromEntries(categories.map(c => [c.category_id, c.name])),
    [categories]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return assets
            .filter(a => activeTab === "all" || a.status === activeTab)
            .filter(a =>
                !q ||
                a.name?.toLowerCase().includes(q)         ||
                a.brand?.toLowerCase().includes(q)        ||
                a.model?.toLowerCase().includes(q)        ||
                a.serial_number?.toLowerCase().includes(q)||
                categoryMap[a.category_id]?.toLowerCase().includes(q)
            )
            // add resolved category_name for display
            .map(a => ({ ...a, category_name: categoryMap[a.category_id] ?? "—" }));
    }, [assets, activeTab, search, categoryMap]);

    // ── Table columns ────────────────────────────────────────
    const columns = [
        { key: "name",          label: "Asset Name"  },
        { key: "category_name", label: "Category"    },
        { key: "brand",         label: "Brand"       },
        { key: "model",         label: "Model"       },
        { key: "serial_number", label: "Serial No."  },
        { key: "purchase_date", label: "Purchased"   },
        { key: "status",        label: "Status"      },
    ];

    // ── Tab counts ───────────────────────────────────────────
    const tabCount = (key) =>
        key === "all" ? assets.length : assets.filter(a => a.status === key).length;

    return (
        <MainLayout>

            {/* ── Header ─────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                    <h2 className="text-base font-bold leading-tight"
                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                        Assets
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                        {assets.length} asset{assets.length !== 1 ? "s" : ""} registered
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <SearchBar
                        value={search}
                        placeholder="Search assets…"
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button
                        onClick={() => setShowForm(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold text-white"
                        style={{ backgroundColor: showForm ? "#1b4f72" : "#19405e" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#1b4f72"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = showForm ? "#1b4f72" : "#19405e"}>
                        <PackagePlus size={14} />
                        {showForm ? "Close Form" : "Add Asset"}
                    </button>
                </div>
            </div>

            {/* ── KPI strip ──────────────────────────────── */}
            <StatStrip assets={assets} />

            {/* ── Add form ───────────────────────────────── */}
            {showForm && (
                <AssetForm
                    categories={categories}
                    onSaved={() => { loadAll(); setShowForm(false); }}
                />
            )}

            {/* ── Status filter tabs ──────────────────────── */}
            <div className="flex flex-wrap gap-1 mb-3">
                {STATUS_TABS.map(tab => {
                    const active = activeTab === tab.key;
                    const count  = tabCount(tab.key);
                    return (
                        <button key={tab.key}
                            onClick={() => { setActiveTab(tab.key); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-all"
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
                                {count}
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
                renderActions={(asset) => (
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={e => { e.stopPropagation(); setDrawerAsset(asset); }}
                            className="px-2 py-1 rounded text-xs font-medium border"
                            style={{ borderColor: "#e2e8f0", color: "#19405e" }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f8fafc"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                            View
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); setEditingAsset(asset); }}
                            className="p-1.5 rounded"
                            style={{ color: "#1b4f72" }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#eff6ff"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                            <Pencil size={13} />
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); deleteAsset(asset.asset_id); }}
                            className="p-1.5 rounded"
                            style={{ color: "#dc2626" }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fff5f5"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                            <Trash2 size={13} />
                        </button>
                    </div>
                )}
            />

            {/* ── Edit modal ─────────────────────────────── */}
            {editingAsset && (
                <AssetModal
                    asset={editingAsset}
                    categories={categories}
                    onClose={() => setEditingAsset(null)}
                    onSaved={() => { loadAll(); setEditingAsset(null); }}
                />
            )}

            {/* ── Detail drawer ──────────────────────────── */}
            {drawerAsset && (
                <AssetDrawer
                    asset={drawerAsset}
                    categoryName={categoryMap[drawerAsset.category_id] ?? "—"}
                    onClose={() => setDrawerAsset(null)}
                    onEdit={() => { setEditingAsset(drawerAsset); setDrawerAsset(null); }}
                    onDelete={() => deleteAsset(drawerAsset.asset_id)}
                />
            )}

        </MainLayout>
    );
}
