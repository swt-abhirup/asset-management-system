import {
    LayoutDashboard, Monitor, Users, ClipboardList,
    Wrench, Tag, LogOut, ChevronRight,
    Hammer, ShieldAlert, Building2, ShoppingCart,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";

const NAV_GROUPS = [
    {
        label: "Core",
        links: [
            { path: "/dashboard",   label: "Dashboard",      icon: LayoutDashboard },
            { path: "/assets",      label: "Assets",          icon: Monitor         },
            { path: "/employees",   label: "Employees",       icon: Users           },
            { path: "/assignments", label: "Assignments",     icon: ClipboardList   },
            { path: "/categories",  label: "Categories",      icon: Tag             },
        ]
    },
    {
        label: "Operations",
        links: [
            { path: "/maintenance",     label: "Maintenance",     icon: Wrench      },
            { path: "/repair-requests", label: "Repair Requests", icon: Hammer      },
            { path: "/warranty-expiry", label: "Warranty Expiry", icon: ShieldAlert },
        ]
    },
    {
        label: "Procurement",
        links: [
            { path: "/vendors",   label: "Vendors",   icon: Building2    },
            { path: "/purchases", label: "Purchases", icon: ShoppingCart },
        ]
    },
];

export default function Sidebar() {

    const navigate   = useNavigate();
    const location   = useLocation();
    const { collapsed } = useSidebar();
    const user       = JSON.parse(localStorage.getItem("user") ?? "{}");
    const initials   = user?.fullname?.charAt(0)?.toUpperCase() ?? "U";

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    return (
        <aside
            className="flex flex-col flex-shrink-0 sticky top-0"
            style={{
                backgroundColor: "#19405e",
                height: "100vh",
                width: collapsed ? "56px" : "224px",
                transition: "width 0.22s ease",
                overflow: "hidden",
                zIndex: 20,
            }}
        >
            {/* ── Logo ──────────────────────────────────────── */}
            <div className="flex items-center px-3 border-b flex-shrink-0"
                style={{ borderColor: "rgba(255,255,255,0.08)", height: "56px", minHeight: "56px" }}>
                <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#f5cba7" }}>
                    <Monitor size={14} style={{ color: "#19405e" }} />
                </div>
                {!collapsed && (
                    <div className="ml-2.5 overflow-hidden whitespace-nowrap">
                        <p className="text-white text-xs font-bold leading-tight tracking-wide"
                            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                            IT Asset
                        </p>
                        <p className="text-xs leading-tight" style={{ color: "#a8c4d8" }}>
                            Manager
                        </p>
                    </div>
                )}
            </div>

            {/* ── Navigation ────────────────────────────────── */}
            <nav className="flex-1 min-h-0 px-1.5 py-3 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.12) transparent" }}>

                {NAV_GROUPS.map(group => (
                    <div key={group.label} className="mb-2">

                        {/* Group label — hide when collapsed */}
                        {!collapsed && (
                            <p className="px-3 mb-1 font-semibold uppercase tracking-widest"
                                style={{ color: "rgba(168,196,216,0.5)", fontSize: "9px" }}>
                                {group.label}
                            </p>
                        )}

                        {/* Divider line when collapsed */}
                        {collapsed && (
                            <div className="mx-2 mb-1.5 h-px" style={{ backgroundColor: "rgba(255,255,255,0.07)" }} />
                        )}

                        {group.links.map(({ path, label, icon: Icon }) => {
                            const active = location.pathname === path;
                            return (
                                <a
                                    key={path}
                                    href={path}
                                    title={collapsed ? label : undefined}
                                    className="flex items-center rounded text-xs font-medium relative"
                                    style={{
                                        gap: collapsed ? 0 : "10px",
                                        padding: collapsed ? "8px 0" : "8px 12px",
                                        justifyContent: collapsed ? "center" : "flex-start",
                                        backgroundColor: active ? "rgba(245,203,167,0.15)" : "transparent",
                                        color: active ? "#f5cba7" : "#a8c4d8",
                                        textDecoration: "none",
                                        transition: "background-color 0.12s, color 0.12s",
                                    }}
                                    onMouseEnter={e => {
                                        if (!active) {
                                            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
                                            e.currentTarget.style.color = "#ffffff";
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (!active) {
                                            e.currentTarget.style.backgroundColor = "transparent";
                                            e.currentTarget.style.color = "#a8c4d8";
                                        }
                                    }}
                                >
                                    {/* Active left bar */}
                                    {active && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r"
                                            style={{ backgroundColor: "#f5cba7" }} />
                                    )}

                                    <Icon size={15} style={{ flexShrink: 0 }} />

                                    {!collapsed && (
                                        <>
                                            <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                                                {label}
                                            </span>
                                            {active && (
                                                <ChevronRight size={12} style={{ color: "#f5cba7", flexShrink: 0 }} />
                                            )}
                                        </>
                                    )}
                                </a>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* ── User + Logout ──────────────────────────────── */}
            <div className="flex-shrink-0 px-1.5 py-3 border-t"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}>

                {/* Avatar / profile link */}
                <a
                    href="/profile"
                    title={collapsed ? `${user?.fullname} — View Profile` : undefined}
                    className="flex items-center rounded mb-1"
                    style={{
                        gap: collapsed ? 0 : "8px",
                        padding: collapsed ? "8px 0" : "8px 12px",
                        justifyContent: collapsed ? "center" : "flex-start",
                        textDecoration: "none",
                        transition: "background-color 0.12s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                >
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: "#f5cba7", color: "#19405e" }}>
                        {initials}
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <p className="text-white text-xs font-medium truncate leading-tight">
                                {user?.fullname}
                            </p>
                            <p className="text-xs truncate leading-tight capitalize" style={{ color: "#a8c4d8" }}>
                                {user?.role} · View Profile
                            </p>
                        </div>
                    )}
                </a>

                {/* Logout */}
                <button
                    onClick={logout}
                    title={collapsed ? "Sign Out" : undefined}
                    className="flex items-center rounded w-full text-xs font-medium"
                    style={{
                        gap: collapsed ? 0 : "10px",
                        padding: collapsed ? "8px 0" : "8px 12px",
                        justifyContent: collapsed ? "center" : "flex-start",
                        color: "#a8c4d8",
                        transition: "background-color 0.12s, color 0.12s",
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
                        e.currentTarget.style.color = "#ffffff";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#a8c4d8";
                    }}
                >
                    <LogOut size={15} style={{ flexShrink: 0 }} />
                    {!collapsed && <span className="whitespace-nowrap">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
}
