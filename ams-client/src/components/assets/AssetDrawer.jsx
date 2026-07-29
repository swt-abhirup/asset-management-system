import { X, Pencil, Trash2, Monitor } from "lucide-react";

const STATUS_STYLE = {
    available:   { bg: "rgba(25,64,94,0.1)",    color: "#19405e" },
    assigned:    { bg: "rgba(245,203,167,0.45)", color: "#7a4a1e" },
    maintenance: { bg: "rgba(230,126,34,0.15)",  color: "#9a4a10" },
    retired:     { bg: "rgba(148,163,184,0.2)",  color: "#64748b" },
};

function Row({ label, value }) {
    if (!value && value !== 0) return null;
    return (
        <div className="flex justify-between items-start py-2 border-b" style={{ borderColor: "#f1f5f9" }}>
            <span className="text-xs" style={{ color: "#94a3b8", minWidth: "120px" }}>{label}</span>
            <span className="text-xs font-medium text-right" style={{ color: "#1e293b", maxWidth: "200px", wordBreak: "break-all" }}>{value}</span>
        </div>
    );
}

export default function AssetDrawer({ asset, categoryName, onClose, onEdit, onDelete }) {

    if (!asset) return null;

    const st = STATUS_STYLE[asset.status] ?? STATUS_STYLE.retired;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={onClose}
                style={{ backgroundColor: "rgba(0,0,0,0.25)" }} />

            {/* Panel */}
            <div className="fixed right-0 top-0 bottom-0 z-50 flex flex-col shadow-2xl"
                style={{ backgroundColor: "#ffffff", width: "min(320px, 100vw)" }}>

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b"
                    style={{ backgroundColor: "#19405e", borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded flex items-center justify-center"
                            style={{ backgroundColor: "rgba(245,203,167,0.2)" }}>
                            <Monitor size={14} style={{ color: "#f5cba7" }} />
                        </div>
                        <div>
                            <p className="text-xs font-bold leading-tight text-white"
                                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                                {asset.name}
                            </p>
                            <p className="text-xs leading-tight" style={{ color: "#a8c4d8" }}>
                                {categoryName}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-6 h-6 rounded flex items-center justify-center"
                        style={{ color: "#a8c4d8" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#ffffff"}
                        onMouseLeave={e => e.currentTarget.style.color = "#a8c4d8"}>
                        <X size={14} />
                    </button>
                </div>

                {/* Status badge */}
                <div className="px-4 py-3 border-b" style={{ borderColor: "#f1f5f9" }}>
                    <span className="px-2.5 py-1 rounded text-xs font-semibold capitalize"
                        style={{ backgroundColor: st.bg, color: st.color }}>
                        {asset.status}
                    </span>
                </div>

                {/* Details */}
                <div className="flex-1 overflow-y-auto px-4 py-2">
                    <Row label="Asset ID"        value={asset.asset_id} />
                    <Row label="Brand"            value={asset.brand} />
                    <Row label="Model"            value={asset.model} />
                    <Row label="Serial Number"    value={asset.serial_number} />
                    <Row label="Purchase Date"    value={asset.purchase_date} />
                    <Row label="Purchase Cost"    value={asset.purchase_cost ? `₹ ${Number(asset.purchase_cost).toLocaleString()}` : null} />
                    <Row label="Warranty Expiry"  value={asset.warranty_expiry} />
                    <Row label="Assigned To"      value={asset.assigned_to} />
                    <Row label="Created"          value={asset.created_at ? new Date(asset.created_at).toLocaleDateString() : null} />
                    {asset.notes && (
                        <div className="py-2">
                            <p className="text-xs mb-1" style={{ color: "#94a3b8" }}>Notes</p>
                            <p className="text-xs p-2 rounded" style={{ backgroundColor: "#f8fafc", color: "#1e293b" }}>
                                {asset.notes}
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
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
                        <Trash2 size={12} /> Delete
                    </button>
                </div>

            </div>
        </>
    );
}
