/**
 * KPI card — pastel theme variants
 *
 * accent=false  (default) → pastel navy tint  #e8f1f8 bg, #19405e text
 * accent=true             → dark navy #19405e bg, peach #f5cba7 text  (hero/primary stat)
 * accent="warn"           → pastel amber tint  (open repairs, pending etc.)
 * accent="danger"         → pastel red tint    (critical, expired warranty)
 */

const VARIANTS = {
    false: {
        bg:       "#eaf2f8",
        border:   "#c8dff0",
        stripe:   "#19405e",
        iconBg:   "rgba(25,64,94,0.12)",
        iconColor:"#19405e",
        label:    "#5a7a93",
        value:    "#19405e",
    },
    true: {
        bg:       "#19405e",
        border:   "transparent",
        stripe:   "#f5cba7",
        iconBg:   "rgba(245,203,167,0.2)",
        iconColor:"#f5cba7",
        label:    "#a8c4d8",
        value:    "#ffffff",
    },
    warn: {
        bg:       "#fdf3e3",
        border:   "#f5d9a0",
        stripe:   "#d97706",
        iconBg:   "rgba(217,119,6,0.12)",
        iconColor:"#b45309",
        label:    "#92632a",
        value:    "#78450f",
    },
    danger: {
        bg:       "#fdecea",
        border:   "#f5b8b3",
        stripe:   "#dc2626",
        iconBg:   "rgba(220,38,38,0.1)",
        iconColor:"#dc2626",
        label:    "#9b2c2c",
        value:    "#7f1d1d",
    },
};

export default function KPI({ title, value, icon: Icon, accent = false }) {

    // accent can be boolean or "warn"/"danger"
    const key = accent === true ? true : accent === "warn" ? "warn" : accent === "danger" ? "danger" : false;
    const v   = VARIANTS[key];

    return (
        <div
            className="rounded-lg flex items-center gap-3 px-4 py-3 relative overflow-hidden"
            style={{
                backgroundColor: v.bg,
                border: `1px solid ${v.border}`,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
        >
            {/* Left accent stripe */}
            <div
                className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l"
                style={{ backgroundColor: v.stripe }}
            />

            {/* Icon */}
            {Icon && (
                <div
                    className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: v.iconBg }}
                >
                    <Icon size={17} style={{ color: v.iconColor }} />
                </div>
            )}

            {/* Text */}
            <div>
                <p className="text-xs leading-tight mb-0.5" style={{ color: v.label }}>
                    {title}
                </p>
                <p className="text-xl font-bold leading-tight"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: v.value }}>
                    {value ?? "—"}
                </p>
            </div>
        </div>
    );
}
