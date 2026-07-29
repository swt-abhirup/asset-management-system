import { useEffect, useState } from "react";
import {
    Users, Monitor, CheckCircle, ClipboardList, Wrench,
    AlertTriangle, ArrowRight, ShieldAlert, Building2,
    ShoppingCart, Hammer, IndianRupee, RotateCcw, Clock
} from "lucide-react";import MainLayout from "../layouts/MainLayout";
import KPI        from "../components/KPI";
import api        from "../services/api";
import { toast }  from "../components/Toast";
import { useNotifications } from "../context/NotificationContext";

// ── Section label ────────────────────────────────────────────────
function SectionLabel({ children }) {
    return (
        <p className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "#94a3b8" }}>
            {children}
        </p>
    );
}

// ── KPI skeleton ─────────────────────────────────────────────────
function KpiSkeleton() {
    return (
        <div className="rounded-lg px-4 py-3 animate-pulse"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded" style={{ backgroundColor: "#f1f5f9" }} />
                <div>
                    <div className="h-2.5 w-20 rounded mb-2" style={{ backgroundColor: "#f1f5f9" }} />
                    <div className="h-5 w-10 rounded"         style={{ backgroundColor: "#e2e8f0" }} />
                </div>
            </div>
        </div>
    );
}

// ── Quick link card ──────────────────────────────────────────────
function QuickLink({ label, path, icon: Icon, desc }) {
    return (
        <a href={path}
            className="group flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", textDecoration: "none" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#19405e"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(25,64,94,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"; }}>
            <div className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(25,64,94,0.08)" }}>
                <Icon size={16} style={{ color: "#19405e" }} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                    {label}
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color: "#94a3b8" }}>{desc}</p>
            </div>
            <ArrowRight size={13} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "#19405e" }} />
        </a>
    );
}

// ── Asset status bar ─────────────────────────────────────────────
function AssetBar({ assets }) {
    if (!assets?.total) return (
        <p className="text-xs text-center py-4" style={{ color: "#94a3b8" }}>No assets yet.</p>
    );
    const segments = [
        { key: "available",   color: "#19405e", label: "Available"    },
        { key: "assigned",    color: "#f5cba7", label: "Assigned"     },
        { key: "maintenance", color: "#e67e22", label: "Maintenance"  },
        { key: "retired",     color: "#b0bec5", label: "Retired"      },
    ];
    return (
        <>
            <div className="flex h-2.5 rounded-full overflow-hidden gap-px mb-3">
                {segments.map(({ key, color }) => {
                    const pct = (assets[key] / assets.total) * 100;
                    if (!pct) return null;
                    return <div key={key} style={{ width: `${pct}%`, backgroundColor: color }} />;
                })}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                {segments.map(({ key, color, label }) => (
                    <div key={key} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-xs" style={{ color: "#64748b" }}>{label}</span>
                        <span className="text-xs font-semibold" style={{ color: "#19405e" }}>{assets[key]}</span>
                    </div>
                ))}
            </div>
        </>
    );
}

// ── Recent activity row ──────────────────────────────────────────
function ActivityRow({ icon: Icon, iconBg, iconColor, title, sub, right }) {
    return (
        <div className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: "#f1f5f9" }}>
            <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: iconBg }}>
                <Icon size={13} style={{ color: iconColor }} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: "#1e293b" }}>{title}</p>
                <p className="text-xs truncate" style={{ color: "#94a3b8" }}>{sub}</p>
            </div>
            <span className="text-xs flex-shrink-0" style={{ color: "#64748b" }}>{right}</span>
        </div>
    );
}

// ── Main ─────────────────────────────────────────────────────────
export default function Dashboard() {

    const [stats,   setStats]   = useState(null);
    const [loading, setLoading] = useState(true);
    const { setAlerts } = useNotifications();

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/api/dashboard");
                const s   = res.data.data;
                setStats(s);

                // Build alerts and push to notification context (bell icon)
                const alerts = [];
                if (s.warranty?.expired > 0)
                    alerts.push({ id: "warranty-expired", type: "danger", icon: "ShieldAlert", message: `${s.warranty.expired} asset${s.warranty.expired !== 1 ? "s" : ""} with expired warranty.`, href: "/warranty-expiry", linkText: "Review" });
                if (s.warranty?.expiring_soon > 0)
                    alerts.push({ id: "warranty-soon",    type: "warn",   icon: "ShieldAlert", message: `${s.warranty.expiring_soon} asset${s.warranty.expiring_soon !== 1 ? "s" : ""} warranty expiring within 30 days.`, href: "/warranty-expiry", linkText: "Review" });
                if (s.repairs?.critical > 0)
                    alerts.push({ id: "repairs-critical", type: "danger", icon: "Hammer",      message: `${s.repairs.critical} critical repair request${s.repairs.critical !== 1 ? "s" : ""} open.`, href: "/repair-requests", linkText: "View" });
                if (s.procurement?.pending_payment > 0)
                    alerts.push({ id: "pending-payment",  type: "warn",   icon: "ShoppingCart",message: `${s.procurement.pending_payment} purchase order${s.procurement.pending_payment !== 1 ? "s" : ""} awaiting payment.`, href: "/purchases", linkText: "View" });
                setAlerts(alerts);

            } catch {
                toast.error("Failed to load dashboard.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const s = stats;

    return (
        <MainLayout mainClassName="flex flex-col gap-5">

                    {/* ── Assets & People ───────────────────────── */}
                    <section>
                        <SectionLabel>Assets & People</SectionLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                            {loading ? Array(6).fill(0).map((_, i) => <KpiSkeleton key={i} />) : [
                                { title: "Employees",        value: s?.totalEmployees,        icon: Users,         accent: true  },
                                { title: "Total Assets",     value: s?.assets?.total,         icon: Monitor,       accent: false },
                                { title: "Available",        value: s?.assets?.available,     icon: CheckCircle,   accent: false },
                                { title: "Assigned",         value: s?.assets?.assigned,      icon: ClipboardList, accent: false },
                                { title: "In Maintenance",   value: s?.assets?.maintenance,   icon: Wrench,        accent: false },
                                { title: "Active Assignments",value:s?.assignments?.active,   icon: RotateCcw,     accent: false },
                            ].map(k => <KPI key={k.title} {...k} />)}
                        </div>
                    </section>

                    {/* ── Two column: asset bar + procurement ───── */}
                    <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">

                        {/* Asset status bar */}
                        <div className="rounded-lg px-5 py-4"
                            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#94a3b8" }}>
                                Asset Status Breakdown
                            </p>
                            {loading ? (
                                <div className="animate-pulse">
                                    <div className="h-2.5 rounded-full mb-3" style={{ backgroundColor: "#f1f5f9" }} />
                                    <div className="flex gap-4">
                                        {Array(4).fill(0).map((_, i) => <div key={i} className="h-3 w-16 rounded" style={{ backgroundColor: "#f1f5f9" }} />)}
                                    </div>
                                </div>
                            ) : <AssetBar assets={s?.assets} />}
                        </div>

                        {/* Procurement snapshot */}
                        <div className="rounded-lg px-5 py-4"
                            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#94a3b8" }}>
                                Procurement Snapshot
                            </p>
                            {loading ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {Array(4).fill(0).map((_, i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="h-2.5 w-16 rounded mb-1" style={{ backgroundColor: "#f1f5f9" }} />
                                            <div className="h-5 w-12 rounded" style={{ backgroundColor: "#e2e8f0" }} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: "Active Vendors",    value: s?.procurement?.active_vendors,                                                       icon: Building2     },
                                        { label: "Total Orders",      value: s?.procurement?.total_orders,                                                         icon: ShoppingCart  },
                                        { label: "Pending Payment",   value: s?.procurement?.pending_payment,                                                      icon: Clock         },
                                        { label: "Total Spend",       value: `₹ ${(s?.procurement?.total_spend ?? 0).toLocaleString("en-IN")}`,                    icon: IndianRupee   },
                                    ].map(({ label, value, icon: Icon }) => (
                                        <div key={label} className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                                                style={{ backgroundColor: "rgba(25,64,94,0.08)" }}>
                                                <Icon size={13} style={{ color: "#19405e" }} />
                                            </div>
                                            <div>
                                                <p className="text-xs" style={{ color: "#64748b" }}>{label}</p>
                                                <p className="text-sm font-bold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>{value ?? "—"}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ── Operations KPIs ───────────────────────── */}
                    <section>
                        <SectionLabel>Operations</SectionLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                            {loading ? Array(6).fill(0).map((_, i) => <KpiSkeleton key={i} />) : [
                                { title: "Open Repairs",      value: s?.repairs?.open,              icon: Hammer,        accent: s?.repairs?.open > 0 ? "danger" : false },
                                { title: "Critical Repairs",  value: s?.repairs?.critical,          icon: AlertTriangle, accent: s?.repairs?.critical > 0 ? "danger" : false },
                                { title: "In Progress",       value: s?.repairs?.in_progress,       icon: Wrench,        accent: s?.repairs?.in_progress > 0 ? "warn" : false },
                                { title: "Maintenance Open",  value: (s?.maintenance?.scheduled ?? 0) + (s?.maintenance?.in_progress ?? 0), icon: Clock, accent: false },
                                { title: "Expired Warranty",  value: s?.warranty?.expired,          icon: ShieldAlert,   accent: s?.warranty?.expired > 0 ? "danger" : false },
                                { title: "Expiring ≤30d",     value: s?.warranty?.expiring_soon,    icon: ShieldAlert,   accent: s?.warranty?.expiring_soon > 0 ? "warn" : false },
                            ].map(k => <KPI key={k.title} {...k} />)}
                        </div>
                    </section>

                    {/* ── Recent activity + Quick links ─────────── */}
                    <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">

                        {/* Recent assignments */}
                        <div className="rounded-lg px-5 py-4"
                            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#94a3b8" }}>
                                    Recent Assignments
                                </p>
                                <a href="/assignments" className="text-xs font-semibold"
                                    style={{ color: "#1b4f72", textDecoration: "none" }}>
                                    View all →
                                </a>
                            </div>
                            {loading ? (
                                Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 py-2 border-b animate-pulse" style={{ borderColor: "#f1f5f9" }}>
                                        <div className="w-7 h-7 rounded" style={{ backgroundColor: "#f1f5f9" }} />
                                        <div className="flex-1">
                                            <div className="h-2.5 rounded mb-1" style={{ backgroundColor: "#f1f5f9", width: "60%" }} />
                                            <div className="h-2 rounded" style={{ backgroundColor: "#f8fafc", width: "40%" }} />
                                        </div>
                                    </div>
                                ))
                            ) : s?.recentAssignments?.length > 0 ? (
                                s.recentAssignments.map((a, i) => (
                                    <ActivityRow key={i}
                                        icon={ClipboardList}
                                        iconBg="rgba(25,64,94,0.08)" iconColor="#19405e"
                                        title={a.asset_id}
                                        sub={`→ ${a.employee_email}`}
                                        right={new Date(a.assigned_date).toLocaleDateString("en-IN", { day:"2-digit", month:"short" })}
                                    />
                                ))
                            ) : (
                                <p className="text-xs py-4 text-center" style={{ color: "#94a3b8" }}>No active assignments.</p>
                            )}
                        </div>

                        {/* Quick links */}
                        <div className="flex flex-col gap-3">
                            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#94a3b8" }}>
                                Quick Actions
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {[
                                    { label: "Add Asset",        path: "/assets",         icon: Monitor,       desc: "Register new IT hardware"   },
                                    { label: "Assign Asset",     path: "/assignments",    icon: ClipboardList, desc: "Allocate to an employee"    },
                                    { label: "Log Repair",       path: "/repair-requests",icon: Hammer,        desc: "Raise a repair request"     },
                                    { label: "New Purchase",     path: "/purchases",      icon: ShoppingCart,  desc: "Create a purchase order"    },
                                    { label: "Add Vendor",       path: "/vendors",        icon: Building2,     desc: "Register a new supplier"    },
                                    { label: "Warranty Report",  path: "/warranty-expiry",icon: ShieldAlert,   desc: "Check expiring warranties"  },
                                ].map(l => <QuickLink key={l.path} {...l} />)}
                            </div>
                        </div>
                    </section>

        </MainLayout>
    );
}
