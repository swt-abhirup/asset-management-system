import { useEffect, useState, useMemo } from "react";
import { Tag, Plus, Pencil, Trash2, X, Check, Monitor, Package } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import api        from "../services/api";
import { toast }  from "../components/Toast";
import { confirm } from "../components/ConfirmDialog";

const I = { width: "100%", padding: "6px 10px", fontSize: "12px", border: "1px solid #e2e8f0", borderRadius: "6px", outline: "none", color: "#1e293b", backgroundColor: "#fff" };
const fi = e => { e.target.style.borderColor = "#19405e"; e.target.style.boxShadow = "0 0 0 2px rgba(25,64,94,0.1)"; };
const fo = e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; };

// ── Inline edit row inside a card ────────────────────────────────
function EditRow({ category, onSave, onCancel }) {
    const [name, setName]   = useState(category.name);
    const [desc, setDesc]   = useState(category.description ?? "");
    const [busy, setBusy]   = useState(false);

    const save = async () => {
        if (!name.trim()) { toast.warn("Category name is required."); return; }
        setBusy(true);
        try {
            await api.put(`/api/categories/${category.category_id}`, { name: name.trim(), description: desc.trim() });
            onSave();
            setTimeout(() => toast.success("Category updated."), 0);
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex flex-col gap-2 mt-2">
            <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Category name" style={I} onFocus={fi} onBlur={fo} />
            <input value={desc} onChange={e => setDesc(e.target.value)}
                placeholder="Description (optional)" style={I} onFocus={fi} onBlur={fo} />
            <div className="flex gap-1.5 justify-end">
                <button onClick={onCancel}
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ border: "1px solid #e2e8f0", color: "#64748b" }}>
                    <X size={12} />
                </button>
                <button onClick={save} disabled={busy}
                    className="w-6 h-6 rounded flex items-center justify-center disabled:opacity-50"
                    style={{ backgroundColor: "#19405e", color: "#fff" }}>
                    <Check size={12} />
                </button>
            </div>
        </div>
    );
}

// ── Add new category form ────────────────────────────────────────
function AddForm({ onSaved }) {
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [busy, setBusy] = useState(false);

    const save = async () => {
        if (!name.trim()) { toast.warn("Category name is required."); return; }
        setBusy(true);
        try {
            await api.post("/api/categories", { name: name.trim(), description: desc.trim() });
            setName(""); setDesc("");
            onSaved();
            setTimeout(() => toast.success("Category created."), 0);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create category.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="rounded-lg p-4 mb-6"
            style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ backgroundColor: "rgba(25,64,94,0.08)" }}>
                    <Tag size={13} style={{ color: "#19405e" }} />
                </div>
                <h3 className="text-sm font-bold"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                    Add Category
                </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                    <label style={{ color: "#1b4f72", fontSize: "11px", fontWeight: 600, marginBottom: "4px", display: "block" }}>
                        Name *
                    </label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Laptop"
                        style={I} onFocus={fi} onBlur={fo} />
                </div>
                <div>
                    <label style={{ color: "#1b4f72", fontSize: "11px", fontWeight: 600, marginBottom: "4px", display: "block" }}>
                        Description
                    </label>
                    <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Short description…"
                        style={I} onFocus={fi} onBlur={fo} />
                </div>
            </div>
            <div className="flex justify-end">
                <button onClick={save} disabled={busy}
                    className="px-4 py-2 rounded text-xs font-semibold text-white disabled:opacity-60"
                    style={{ backgroundColor: "#19405e" }}
                    onMouseEnter={e => { if (!busy) e.currentTarget.style.backgroundColor = "#1b4f72"; }}
                    onMouseLeave={e => { if (!busy) e.currentTarget.style.backgroundColor = "#19405e"; }}>
                    {busy ? "Saving…" : "Save Category"}
                </button>
            </div>
        </div>
    );
}

// ── Category card ────────────────────────────────────────────────
function CategoryCard({ category, assetCount, onEdit, onDelete }) {

    // Icon cycling by index for visual variety
    const icons = [Monitor, Package, Tag];
    const Icon = icons[assetCount % icons.length];

    return (
        <div className="rounded-lg p-4 flex flex-col gap-2 relative group"
            style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
            }}>

            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "rgba(25,64,94,0.08)" }}>
                        <Icon size={15} style={{ color: "#19405e" }} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold truncate"
                            style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                            {category.name}
                        </p>
                        {category.description && (
                            <p className="text-xs truncate" style={{ color: "#94a3b8" }}>
                                {category.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Action buttons — visible on hover */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={onEdit}
                        className="w-6 h-6 rounded flex items-center justify-center"
                        style={{ color: "#1b4f72" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#eff6ff"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                        <Pencil size={12} />
                    </button>
                    <button onClick={onDelete}
                        className="w-6 h-6 rounded flex items-center justify-center"
                        style={{ color: "#dc2626" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fff5f5"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            {/* Asset count badge */}
            <div className="flex items-center justify-between mt-1">
                <span className="text-xs px-2 py-0.5 rounded font-medium"
                    style={{
                        backgroundColor: assetCount > 0 ? "rgba(25,64,94,0.08)" : "#f8fafc",
                        color:           assetCount > 0 ? "#19405e" : "#94a3b8"
                    }}>
                    {assetCount} asset{assetCount !== 1 ? "s" : ""}
                </span>
                <span className="text-xs" style={{ color: "#cbd5e1" }}>
                    {new Date(category.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
            </div>
        </div>
    );
}

// ── Main page ────────────────────────────────────────────────────
export default function Categories() {

    const [categories, setCategories] = useState([]);
    const [assets,     setAssets]     = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [showForm,   setShowForm]   = useState(false);
    const [editingId,  setEditingId]  = useState(null);
    const [search,     setSearch]     = useState("");

    const loadAll = async () => {
        try {
            setLoading(true);
            const [catRes, assetRes] = await Promise.all([
                api.get("/api/categories"),
                api.get("/api/assets"),
            ]);
            setCategories(catRes.data.data   ?? []);
            setAssets(    assetRes.data.data ?? []);
        } catch (err) {
            toast.error("Failed to load categories.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAll(); }, []);

    // Asset count per category
    const assetCountMap = useMemo(() => {
        const m = {};
        assets.forEach(a => { m[a.category_id] = (m[a.category_id] || 0) + 1; });
        return m;
    }, [assets]);

    const deleteCategory = async (id) => {
        if (assetCountMap[id] > 0) {
            toast.warn("Cannot delete a category that has assets assigned to it.");
            return;
        }
        const ok = await confirm({ title: "Delete Category?", message: "This will permanently remove the category.", confirmLabel: "Delete", danger: true });
        if (!ok) return;
        try {
            await api.delete(`/api/categories/${id}`);
            loadAll();
            setTimeout(() => toast.success("Category deleted."), 0);
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete failed.");
        }
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return categories.filter(c =>
            !q || c.name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
        ).sort((a, b) => a.name.localeCompare(b.name));
    }, [categories, search]);

    return (
        <MainLayout>

            {/* ── Header ─────────────────────────────────── */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-base font-bold leading-tight"
                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                        Asset Categories
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                        {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative">
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search categories…"
                            className="pl-3 pr-3 py-2 text-xs rounded border outline-none w-48"
                            style={{ borderColor: "#e2e8f0", color: "#1e293b" }}
                            onFocus={fi} onBlur={fo} />
                    </div>
                    <button onClick={() => setShowForm(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold text-white"
                        style={{ backgroundColor: showForm ? "#1b4f72" : "#19405e" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#1b4f72"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = showForm ? "#1b4f72" : "#19405e"}>
                        <Plus size={14} />
                        {showForm ? "Close" : "Add Category"}
                    </button>
                </div>
            </div>

            {/* ── Add form ───────────────────────────────── */}
            {showForm && (
                <AddForm onSaved={() => { loadAll(); setShowForm(false); }} />
            )}

            {/* ── Summary bar ────────────────────────────── */}
            <div className="flex items-center gap-4 mb-4 px-4 py-2.5 rounded-lg"
                style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0" }}>
                <div className="text-xs" style={{ color: "#64748b" }}>
                    <span className="font-bold" style={{ color: "#19405e" }}>{categories.length}</span> categories
                </div>
                <div className="w-px h-4" style={{ backgroundColor: "#e2e8f0" }} />
                <div className="text-xs" style={{ color: "#64748b" }}>
                    <span className="font-bold" style={{ color: "#19405e" }}>{assets.length}</span> total assets
                </div>
                <div className="w-px h-4" style={{ backgroundColor: "#e2e8f0" }} />
                <div className="text-xs" style={{ color: "#64748b" }}>
                    <span className="font-bold" style={{ color: "#19405e" }}>
                        {categories.filter(c => (assetCountMap[c.category_id] || 0) > 0).length}
                    </span> categories in use
                </div>
            </div>

            {/* ── Cards grid ─────────────────────────────── */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {Array(8).fill(0).map((_, i) => (
                        <div key={i} className="rounded-lg p-4 animate-pulse"
                            style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", height: "96px" }}>
                            <div className="flex gap-2 mb-2">
                                <div className="w-8 h-8 rounded" style={{ backgroundColor: "#f1f5f9" }} />
                                <div className="flex-1">
                                    <div className="h-3 rounded mb-1.5" style={{ backgroundColor: "#f1f5f9", width: "60%" }} />
                                    <div className="h-2.5 rounded" style={{ backgroundColor: "#f8fafc", width: "80%" }} />
                                </div>
                            </div>
                            <div className="h-5 rounded" style={{ backgroundColor: "#f8fafc", width: "40%" }} />
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16"
                    style={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                        style={{ backgroundColor: "rgba(25,64,94,0.07)" }}>
                        <Tag size={18} style={{ color: "#19405e" }} />
                    </div>
                    <p className="text-sm font-semibold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                        No categories found
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                        {search ? "Try a different search term." : "Add your first category to get started."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filtered.map(cat => (
                        editingId === cat.category_id ? (
                            // Inline edit card
                            <div key={cat.category_id} className="rounded-lg p-4"
                                style={{ backgroundColor: "#fff", border: "1px solid #1b4f72", boxShadow: "0 0 0 2px rgba(27,79,114,0.1)" }}>
                                <p className="text-xs font-semibold mb-2" style={{ color: "#19405e" }}>Editing</p>
                                <EditRow
                                    category={cat}
                                    onSave={() => { loadAll(); setEditingId(null); }}
                                    onCancel={() => setEditingId(null)}
                                />
                            </div>
                        ) : (
                            <CategoryCard
                                key={cat.category_id}
                                category={cat}
                                assetCount={assetCountMap[cat.category_id] || 0}
                                onEdit={() => setEditingId(cat.category_id)}
                                onDelete={() => deleteCategory(cat.category_id)}
                            />
                        )
                    ))}
                </div>
            )}

        </MainLayout>
    );
}
