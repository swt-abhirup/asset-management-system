export default function KPI({ title, value, icon: Icon, accent = false }) {

    return (

        <div
            className="rounded-lg flex items-center gap-3 px-4 py-3 relative overflow-hidden"
            style={{
                backgroundColor: accent ? "#19405e" : "#ffffff",
                border: `1px solid ${accent ? "transparent" : "#e2e8f0"}`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
            }}
        >
            {/* Accent stripe */}
            <div
                className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l"
                style={{ backgroundColor: accent ? "#f5cba7" : "#19405e" }}
            />

            {/* Icon box */}
            {Icon && (
                <div
                    className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                        backgroundColor: accent ? "rgba(245,203,167,0.2)" : "rgba(25,64,94,0.08)"
                    }}
                >
                    <Icon
                        size={17}
                        style={{ color: accent ? "#f5cba7" : "#19405e" }}
                    />
                </div>
            )}

            {/* Text */}
            <div>
                <p
                    className="text-xs leading-tight mb-0.5"
                    style={{ color: accent ? "#a8c4d8" : "#64748b" }}
                >
                    {title}
                </p>
                <p
                    className="text-xl font-bold leading-tight"
                    style={{
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                        color: accent ? "#ffffff" : "#19405e"
                    }}
                >
                    {value ?? "—"}
                </p>
            </div>

        </div>

    );

}
