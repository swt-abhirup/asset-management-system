import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
    Bell, PanelLeftClose, PanelLeftOpen, Menu,
    ShieldAlert, Hammer, ShoppingCart, AlertTriangle, X
} from "lucide-react";
import { useSidebar }        from "../context/SidebarContext";
import { useNotifications }  from "../context/NotificationContext";

const PAGE_META = {
    "/dashboard":       { title: "Dashboard",        sub: "Overview of your IT assets"         },
    "/assets":          { title: "Assets",            sub: "Manage all IT hardware & devices"   },
    "/employees":       { title: "Employees",         sub: "Manage staff accounts"              },
    "/assignments":     { title: "Assignments",       sub: "Track asset allocation"             },
    "/maintenance":     { title: "Maintenance",       sub: "Repair & service logs"              },
    "/repair-requests": { title: "Repair Requests",   sub: "Track and resolve hardware issues"  },
    "/warranty-expiry": { title: "Warranty Expiry",   sub: "Monitor asset warranty status"      },
    "/vendors":         { title: "Vendors",           sub: "Manage supplier directory"          },
    "/purchases":       { title: "Purchase Orders",   sub: "Track procurement & payments"       },
    "/categories":      { title: "Asset Categories",  sub: "Organise asset types"               },
    "/profile":         { title: "My Profile",        sub: "Manage your account & preferences"  },
};

const ICON_MAP = {
    ShieldAlert,
    Hammer,
    ShoppingCart,
    AlertTriangle,
};

const TYPE_STYLE = {
    danger: { bg: "#fdecea", border: "#f5b8b3", color: "#9b2c2c", dot: "#dc2626"  },
    warn:   { bg: "#fdf3e3", border: "#f5d9a0", color: "#78450f", dot: "#d97706"  },
};

const btnStyle = { color: "#64748b" };
const btnHover = e => { e.currentTarget.style.backgroundColor = "#f1f5f9"; e.currentTarget.style.color = "#19405e"; };
const btnLeave = e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#64748b"; };

export default function Navbar() {

    const location              = useLocation();
    const { collapsed, toggle } = useSidebar();
    const { alerts }            = useNotifications();
    const user                  = JSON.parse(localStorage.getItem("user") ?? "{}");
    const meta                  = PAGE_META[location.pathname] ?? { title: "IT Asset Manager", sub: "" };
    const ToggleIcon            = collapsed ? PanelLeftOpen : PanelLeftClose;

    const [open, setOpen]   = useState(false);
    const panelRef          = useRef(null);
    const bellRef           = useRef(null);

    // Close panel on outside click
    useEffect(() => {
        const handler = (e) => {
            if (
                open &&
                panelRef.current && !panelRef.current.contains(e.target) &&
                bellRef.current  && !bellRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    // Close on route change
    useEffect(() => { setOpen(false); }, [location.pathname]);

    const openMobileDrawer = () => {
        if (typeof window.__sidebarToggle === "function") window.__sidebarToggle();
    };

    const hasAlerts = alerts.length > 0;

    return (
        <header className="flex items-center justify-between px-3 sm:px-4 border-b flex-shrink-0 relative"
            style={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", minHeight: "56px", height: "56px", zIndex: 30 }}>

            {/* ── Left ──────────────────────────────────────── */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">

                {/* Mobile hamburger */}
                <button onClick={openMobileDrawer}
                    className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 md:hidden"
                    style={btnStyle} onMouseEnter={btnHover} onMouseLeave={btnLeave}>
                    <Menu size={18} />
                </button>

                {/* Desktop collapse toggle */}
                <button onClick={toggle}
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    className="w-8 h-8 rounded items-center justify-center flex-shrink-0 hidden md:flex"
                    style={btnStyle} onMouseEnter={btnHover} onMouseLeave={btnLeave}>
                    <ToggleIcon size={17} />
                </button>

                <div className="h-5 w-px flex-shrink-0" style={{ backgroundColor: "#e2e8f0" }} />

                <div className="min-w-0">
                    <h1 className="text-sm font-bold leading-tight truncate"
                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                        {meta.title}
                    </h1>
                    {meta.sub && (
                        <p className="text-xs leading-tight mt-0.5 truncate hidden sm:block"
                            style={{ color: "#94a3b8" }}>
                            {meta.sub}
                        </p>
                    )}
                </div>
            </div>

            {/* ── Right ─────────────────────────────────────── */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

                {/* Bell button */}
                <div className="relative">
                    <button
                        ref={bellRef}
                        onClick={() => setOpen(v => !v)}
                        className="w-8 h-8 rounded flex items-center justify-center relative"
                        style={{
                            ...btnStyle,
                            backgroundColor: open ? "#f1f5f9" : "transparent",
                            color: open ? "#19405e" : "#64748b",
                        }}
                        onMouseEnter={btnHover}
                        onMouseLeave={e => {
                            if (!open) btnLeave(e);
                        }}
                    >
                        <Bell size={16} />
                        {/* Badge */}
                        {hasAlerts && (
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full"
                                style={{ backgroundColor: "#dc2626", boxShadow: "0 0 0 2px #fff" }} />
                        )}
                    </button>

                    {/* ── Notification panel ────────────────────── */}
                    {open && (
                        <div
                            ref={panelRef}
                            className="absolute right-0 top-full mt-2 rounded-xl shadow-2xl overflow-hidden"
                            style={{
                                width: "320px",
                                backgroundColor: "#ffffff",
                                border: "1px solid #e2e8f0",
                                zIndex: 999,
                            }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b"
                                style={{ borderColor: "#f1f5f9" }}>
                                <div className="flex items-center gap-2">
                                    <Bell size={13} style={{ color: "#19405e" }} />
                                    <p className="text-xs font-bold"
                                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                                        Notifications
                                    </p>
                                    {hasAlerts && (
                                        <span className="px-1.5 py-0.5 rounded text-xs font-bold leading-none"
                                            style={{ backgroundColor: "#dc2626", color: "#fff" }}>
                                            {alerts.length}
                                        </span>
                                    )}
                                </div>
                                <button onClick={() => setOpen(false)}
                                    className="w-5 h-5 rounded flex items-center justify-center"
                                    style={{ color: "#94a3b8" }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#f1f5f9"; e.currentTarget.style.color = "#19405e"; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                                    <X size={12} />
                                </button>
                            </div>

                            {/* Alert list */}
                            {hasAlerts ? (
                                <div className="flex flex-col">
                                    {alerts.map((alert) => {
                                        const ts = TYPE_STYLE[alert.type] ?? TYPE_STYLE.warn;
                                        const Icon = ICON_MAP[alert.icon] ?? AlertTriangle;
                                        return (
                                            <a
                                                key={alert.id}
                                                href={alert.href}
                                                onClick={() => setOpen(false)}
                                                className="flex items-start gap-3 px-4 py-3 border-b last:border-0"
                                                style={{
                                                    textDecoration: "none",
                                                    borderColor: "#f8fafc",
                                                    transition: "background-color 0.12s",
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f8fafc"}
                                                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                                            >
                                                {/* Icon */}
                                                <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                                                    style={{ backgroundColor: ts.bg }}>
                                                    <Icon size={13} style={{ color: ts.dot }} />
                                                </div>

                                                {/* Text */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs leading-snug" style={{ color: ts.color }}>
                                                        {alert.message}
                                                    </p>
                                                    <p className="text-xs mt-1 font-semibold"
                                                        style={{ color: "#1b4f72" }}>
                                                        {alert.linkText} →
                                                    </p>
                                                </div>

                                                {/* Dot */}
                                                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2"
                                                    style={{ backgroundColor: ts.dot }} />
                                            </a>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                                        style={{ backgroundColor: "rgba(25,64,94,0.07)" }}>
                                        <Bell size={18} style={{ color: "#19405e" }} />
                                    </div>
                                    <p className="text-xs font-semibold" style={{ color: "#19405e" }}>
                                        All clear
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                                        No alerts at the moment.
                                    </p>
                                </div>
                            )}

                            {/* Footer */}
                            {hasAlerts && (
                                <div className="px-4 py-2.5 border-t" style={{ borderColor: "#f1f5f9" }}>
                                    <p className="text-xs text-center" style={{ color: "#94a3b8" }}>
                                        {alerts.length} active alert{alerts.length !== 1 ? "s" : ""} — visit each page to resolve
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="w-px h-5" style={{ backgroundColor: "#e2e8f0" }} />

                {/* User chip */}
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: "#19405e", color: "#f5cba7" }}>
                        {user?.fullname?.charAt(0)?.toUpperCase() ?? "U"}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-xs font-semibold leading-tight" style={{ color: "#19405e" }}>{user?.fullname}</p>
                        <p className="text-xs leading-tight capitalize" style={{ color: "#94a3b8" }}>{user?.role}</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
